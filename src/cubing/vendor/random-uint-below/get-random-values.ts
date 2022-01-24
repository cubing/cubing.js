export type GetRandomValuesFunction = (arr: Uint32Array) => void;

// This is a workaround for a `node` segfault.
// In theory, imports are cached and safe to import multiple times: https://nodejs.org/api/esm.html#esm_urls
// In practice, a rapid series of inline imports inside a worker causes a segfault(!) in `node`.
// So we cache a single import reference. We avoid populating it until we first need it, so that we don't attempt to perform the import in environments that don't need or have it (e.g. browsers, `deno`).
let cryptoPromise: Promise<typeof import("crypto")> | null = null;

// `@types/node` is... lacking. This type may cause an error in the future, at which point we can hopefully use `@types/node` directly.
type NodeWebCrypto = typeof import("crypto").webcrypto & {
  getRandomValues: GetRandomValuesFunction;
};

// Mangled so that bundlers don't try to inline the source.
const cryptoMangled = "cr-yp-to";
const cryptoUnmangled = () => cryptoMangled.replace(/-/g, "");

// We could use top-level await to define this more statically, but that has limited transpilation support.
export async function getRandomValuesFactory(): Promise<GetRandomValuesFunction> {
  if (!globalThis?.crypto?.getRandomValues) {
    const nodeWebcrypto = (await (cryptoPromise ??= import(cryptoUnmangled())))
      .webcrypto as NodeWebCrypto;
    return nodeWebcrypto.getRandomValues;
  } else {
    return crypto.getRandomValues.bind(crypto) as GetRandomValuesFunction;
  }
}
