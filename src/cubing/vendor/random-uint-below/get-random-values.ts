export type GetRandomValuesFunction = (arr: Uint32Array) => void;

// This is a workaround for a `node` segfault.
// In theory, imports are cached and safe to import multiple times: https://nodejs.org/api/esm.html#esm_urls
// In practice, a rapid series of inline imports inside a worker causes a segfault(!) in `node`.
// So we cach a single import reference. We avoid populating it until we first need it, so that we don't attempt to perform the import in environments that don't need or have it (e.g. browsers, `deno`).
let cryptoPromise: Promise<typeof import("crypto")> | null = null;

// `@types/node` is... lacking. This type may cause an error in the future, at which point we can hopefully use `@types/node` directly.
type NodeWebCrypto = typeof import("crypto").webcrypto & {
  getRandomValues: GetRandomValuesFunction;
};

// We could use top-level await to define this more statically, but that has limited transpilation support.
export async function getRandomValuesFactory(): Promise<GetRandomValuesFunction> {
  const hasWebCrypto =
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues !== "undefined";

  if (hasWebCrypto) {
    return crypto.getRandomValues.bind(crypto) as GetRandomValuesFunction;
  } else {
    const nodeWebcrypto = (await (cryptoPromise ??= import("crypto")))
      .webcrypto as NodeWebCrypto;
    return nodeWebcrypto.getRandomValues;
  }
}
