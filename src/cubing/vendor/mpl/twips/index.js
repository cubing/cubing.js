// Generated from `twips` v0.11.3

// @ts-nocheck

import "./chunks/chunk-4VODYKQX.js";

// src/wasm-package/index.ts
import { Alg } from "../../../alg";

// .temp/rust-wasm/twips_wasm.js
var wasm;
function debugString(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}
${val.stack}`;
  }
  return className;
}
var WASM_VECTOR_LEN = 0;
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
function isLikeNone(x) {
  return x === void 0 || x === null;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
function wasmTwips(kpuzzle_json, search_pattern_json, options_json) {
  let deferred5_0;
  let deferred5_1;
  try {
    const ptr0 = passStringToWasm0(kpuzzle_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(search_pattern_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(options_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.wasmTwips(ptr0, len0, ptr1, len1, ptr2, len2);
    var ptr4 = ret[0];
    var len4 = ret[1];
    if (ret[3]) {
      ptr4 = 0;
      len4 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred5_0 = ptr4;
    deferred5_1 = len4;
    return getStringFromWasm0(ptr4, len4);
  } finally {
    wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
  }
}
function wasmRandomScrambleForEvent(event_str) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passStringToWasm0(event_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.wasmRandomScrambleForEvent(ptr0, len0);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}
function wasmDeriveScrambleForEvent(hex_derivation_seed_str, derivation_salt_hierarchy_str, subevent_str) {
  let deferred5_0;
  let deferred5_1;
  try {
    const ptr0 = passStringToWasm0(hex_derivation_seed_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(derivation_salt_hierarchy_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(subevent_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.wasmDeriveScrambleForEvent(ptr0, len0, ptr1, len1, ptr2, len2);
    var ptr4 = ret[0];
    var len4 = ret[1];
    if (ret[3]) {
      ptr4 = 0;
      len4 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred5_0 = ptr4;
    deferred5_1 = len4;
    return getStringFromWasm0(ptr4, len4);
  } finally {
    wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
  }
}
function wasmFreeMemoryForAllScrambleFinders() {
  const ret = wasm.wasmFreeMemoryForAllScrambleFinders();
  return ret >>> 0;
}
var EXPECTED_RESPONSE_TYPES = /* @__PURE__ */ new Set(["basic", "cors", "default"]);
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg___wbindgen_debug_string_df47ffb5e35e6763 = function(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg___wbindgen_is_undefined_2d472862bd29a478 = function(arg0) {
    const ret = arg0 === void 0;
    return ret;
  };
  imports.wbg.__wbg___wbindgen_throw_b855445ff6a94295 = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbg_call_e762c39fa8ea36bf = function() {
    return handleError(function(arg0, arg1) {
      const ret = arg0.call(arg1);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
      deferred0_0 = arg0;
      deferred0_1 = arg1;
      console.error(getStringFromWasm0(arg0, arg1));
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
  };
  imports.wbg.__wbg_getRandomValues_1c61fac11405ffdc = function() {
    return handleError(function(arg0, arg1) {
      globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
    }, arguments);
  };
  imports.wbg.__wbg_get_efcb449f58ec27c2 = function() {
    return handleError(function(arg0, arg1) {
      const ret = Reflect.get(arg0, arg1);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
    const ret = new Error();
    return ret;
  };
  imports.wbg.__wbg_new_no_args_ee98eee5275000a4 = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
  };
  imports.wbg.__wbg_now_f5ba683d8ce2c571 = function(arg0) {
    const ret = arg0.now();
    return ret;
  };
  imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_static_accessor_GLOBAL_89e1d9ac6a1b250e = function() {
    const ret = typeof global === "undefined" ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_GLOBAL_THIS_8b530f326a9e48ac = function() {
    const ret = typeof globalThis === "undefined" ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_SELF_6fdf4b64710cc91b = function() {
    const ret = typeof self === "undefined" ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_WINDOW_b45bfc5a37f6cfa2 = function() {
    const ret = typeof window === "undefined" ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
  };
  imports.wbg.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, void 0);
    table.set(offset + 0, void 0);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
  };
  return imports;
}
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (typeof module_or_path !== "undefined") {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (typeof module_or_path === "undefined") {
    throw new Error("Only base 64 WASM loading is supported at the moment.")
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}
var twips_wasm_default = __wbg_init;

// src/wasm-package/index.ts
var cachedInitWrapper;
async function initWrapper() {
  await (cachedInitWrapper ??= (async () => {
    const wasmUint8Array = (await import("./chunks/twips_wasm_bg-RWVQBVBA.js")).default;
    await twips_wasm_default({ module_or_path: wasmUint8Array.buffer });
  })());
}
async function wasmRandomScrambleForEvent2(eventID) {
  await initWrapper();
  return new Alg(wasmRandomScrambleForEvent(eventID));
}
async function wasmDeriveScrambleForEvent2(hexDerivationSeed, derivationSaltHierarchy, eventId) {
  for (const derivationSalt of derivationSaltHierarchy) {
    if (derivationSalt.includes("/")) {
      throw new Error("Derivation salts cannot contain slashes.");
    }
  }
  await initWrapper();
  return new Alg(
    wasmDeriveScrambleForEvent(
      hexDerivationSeed,
      derivationSaltHierarchy.join("/"),
      eventId
    )
  );
}
async function wasmTwips2(kpuzzleDefinition, searchPattern, options) {
  await initWrapper();
  return new Alg(
    wasmTwips(
      JSON.stringify(kpuzzleDefinition),
      // biome-ignore lint/complexity/useLiteralKeys: JSON field access
      JSON.stringify(searchPattern.toJSON()["patternData"]),
      JSON.stringify(options)
    )
  );
}
function wasmFreeMemoryForAllScrambleFinders2() {
  return wasmFreeMemoryForAllScrambleFinders();
}
export {
  wasmDeriveScrambleForEvent2 as wasmDeriveScrambleForEvent,
  wasmFreeMemoryForAllScrambleFinders2 as wasmFreeMemoryForAllScrambleFinders,
  wasmRandomScrambleForEvent2 as wasmRandomScrambleForEvent,
  wasmTwips2 as wasmTwips
};
//# sourceMappingURL=index.js.map
