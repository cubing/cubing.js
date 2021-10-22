export type GetRandomValuesFunction = (arr: Uint32Array) => void;

// This is a workaround for a `node` segfault.
// In theory, imports are cached and safe to import multiple times: https://nodejs.org/api/esm.html#esm_urls
// In practice, a rapid series of inline imports inside a worker causes a segfault(!) in `node`.
// So we cach a single import reference. We avoid populating it until we first need it, so that we don't attempt to perform the import in environments that don't need or have it (e.g. browsers, `deno`).
let cryptoPromise: Promise<typeof import("crypto")> | null = null;

// We could use top-level await to define this more statically, but that has limited transpilation support.
export async function getRandomValuesFactory(): Promise<GetRandomValuesFunction> {
  const hasWebCrypto =
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues !== "undefined";

  if (hasWebCrypto) {
    return crypto.getRandomValues.bind(crypto);
  } else {
    // @ts-ignore
    const nodeCrypto = await (cryptoPromise ??= import("crypto"));
    return (arr: Uint32Array) => {
      if (!(arr instanceof Uint32Array)) {
        throw new Error(
          "The getRandomValues() shim only takes unsigned 32-bit int arrays",
        );
      }
      const bytes = nodeCrypto.randomBytes(arr.length * 4);
      const uint32_list = [];
      for (let i = 0; i < arr.length; i++) {
        uint32_list.push(
          (bytes[i * 4 + 0] << 24) +
            (bytes[i * 4 + 1] << 16) +
            (bytes[i * 4 + 2] << 8) +
            (bytes[i * 4 + 3] << 0),
        );
      }
      arr.set(uint32_list);
    };
  }
}
