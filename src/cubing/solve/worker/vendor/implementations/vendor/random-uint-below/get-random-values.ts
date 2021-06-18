export type GetRandomValuesFunction = (arr: Uint32Array) => void;

// We could use top-level await to define this more statically, but that has limited transpilation support.
export async function getRandomValuesFactory(): Promise<GetRandomValuesFunction> {
  const hasWebCrypto =
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues !== "undefined";

  if (hasWebCrypto) {
    return crypto.getRandomValues.bind(crypto);
  } else {
    // @ts-ignore
    const nodeCrypto = await import("crypto");
    return (arr: Uint32Array) => {
      if (!(arr instanceof Uint32Array)) {
        throw new Error(
          "The getRandomValues() shim only takes unsigned 32-bit int arrays"
        );
      }
      var bytes = nodeCrypto.randomBytes(arr.length * 4);
      var uint32_list = [];
      for (var i = 0; i < arr.length; i++) {
        uint32_list.push(
          (bytes[i * 4 + 0] << 24) +
            (bytes[i * 4 + 1] << 16) +
            (bytes[i * 4 + 2] << 8) +
            (bytes[i * 4 + 3] << 0)
        );
      }
      arr.set(uint32_list);
    };
  }
}
