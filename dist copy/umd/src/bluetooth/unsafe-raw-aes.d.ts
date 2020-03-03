export declare function importKey(keyBytes: ArrayBuffer): Promise<CryptoKey>;
export declare function unsafeEncryptBlock(key: CryptoKey, plaintextBlock: ArrayBuffer): Promise<ArrayBuffer>;
export declare function unsafeDecryptBlock(key: CryptoKey, ciphertextBlock: ArrayBuffer): Promise<ArrayBuffer>;
//# sourceMappingURL=unsafe-raw-aes.d.ts.map