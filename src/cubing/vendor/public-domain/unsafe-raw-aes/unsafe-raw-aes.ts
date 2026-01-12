// Note: we could use the `unsafe-raw-aes` npm package instead. But:
//
// 1. This is a rather small amount of code, thanks to a clever hack of the Web Crypto API.
// 2. This code is used (and therefore loaded) only for smart cube decoding, and unlikely to be needed directly by projects using `cubing.js`.
// 3. A dependency called `unsafe-raw-aes` would (rightfully) raise some eyebrows.
//
// So we just vendor the entire file instead.

const blockSize = 16;
const zeros = new Uint8Array(blockSize);
const paddingBlockPlaintext = new Uint8Array(
  new Array(blockSize).fill(blockSize),
);
const AES_CBC = "AES-CBC";

export async function importKey(
  keyBytes: BufferSource | Uint8Array,
): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    AES_CBC,
    true,
    ["encrypt", "decrypt"],
  );
}

async function unsafeEncryptBlockWithIV(
  key: CryptoKey,
  plaintextBlock: BufferSource | Uint8Array,
  iv: BufferSource | Uint8Array,
): Promise<ArrayBuffer> {
  const cryptoResult: ArrayBuffer = await globalThis.crypto.subtle.encrypt(
    {
      name: AES_CBC,
      iv: iv as BufferSource,
    },
    key,
    plaintextBlock as BufferSource,
  );
  return cryptoResult.slice(0, blockSize);
}

export async function unsafeEncryptBlock(
  key: CryptoKey,
  plaintextBlock: BufferSource | Uint8Array,
): Promise<ArrayBuffer> {
  return (await unsafeEncryptBlockWithIV(key, plaintextBlock, zeros)).slice(
    0,
    blockSize,
  );
}

export async function unsafeDecryptBlock(
  key: CryptoKey,
  ciphertextBlock: BufferSource | Uint8Array,
): Promise<ArrayBuffer> {
  const paddingBlock = await unsafeEncryptBlockWithIV(
    key,
    paddingBlockPlaintext,
    ciphertextBlock as BufferSource,
  );

  const cbcCiphertext = new Uint8Array(2 * blockSize);
  cbcCiphertext.set(new Uint8Array(ciphertextBlock as Uint8Array), 0);
  cbcCiphertext.set(new Uint8Array(paddingBlock), blockSize);

  const cryptoResult: ArrayBuffer = await globalThis.crypto.subtle.decrypt(
    {
      name: AES_CBC,
      iv: zeros,
    },
    key,
    cbcCiphertext,
  );
  return cryptoResult.slice(0, blockSize);
}
