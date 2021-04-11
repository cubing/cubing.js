// src/cubing/bluetooth/transformer.ts
import {Quaternion, Vector3} from "three";
function maxAxis(v) {
  const maxVal = Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
  switch (maxVal) {
    case v.x:
      return "x";
    case -v.x:
      return "-x";
    case v.y:
      return "y";
    case -v.y:
      return "-y";
    case v.z:
      return "z";
    case -v.z:
      return "-z";
    default:
      throw new Error("Uh-oh.");
  }
}
var s2 = Math.sqrt(0.5);
var m = {
  "y z": new Quaternion(0, 0, 0, 1),
  "-z y": new Quaternion(s2, 0, 0, s2),
  "x z": new Quaternion(0, 0, -s2, s2),
  "-x z": new Quaternion(0, 0, s2, s2)
};
var BasicRotationTransformer = class {
  transformMove(_moveEvent) {
  }
  transformOrientation(orientationEvent) {
    const {x, y, z, w} = orientationEvent.quaternion;
    const quat = new Quaternion(x, y, z, w);
    const U = new Vector3(0, 1, 0);
    const F = new Vector3(0, 0, 1);
    const maxU = maxAxis(U.applyQuaternion(quat));
    const maxF = maxAxis(F.applyQuaternion(quat));
    const oriQuat = m[`${maxU} ${maxF}`] || m["y z"];
    console.log(quat);
    console.log(oriQuat);
    const q2 = quat.premultiply(oriQuat);
    console.log(q2);
    orientationEvent.quaternion = quat;
    console.log(orientationEvent.quaternion);
  }
};

// src/cubing/bluetooth/smart-puzzle/bluetooth-puzzle.ts
var BluetoothPuzzle = class {
  constructor() {
    this.transformers = [];
    this.listeners = [];
    this.orientationListeners = [];
  }
  async getState() {
    throw new Error("cannot get state");
  }
  addMoveListener(listener) {
    this.listeners.push(listener);
  }
  addOrientationListener(listener) {
    this.orientationListeners.push(listener);
  }
  experimentalAddBasicRotationTransformer() {
    this.transformers.push(new BasicRotationTransformer());
  }
  dispatchMove(moveEvent) {
    for (const transformer of this.transformers) {
      transformer.transformMove(moveEvent);
    }
    for (const l of this.listeners) {
      l(moveEvent);
    }
  }
  dispatchOrientation(orientationEvent) {
    for (const transformer of this.transformers) {
      transformer.transformOrientation(orientationEvent);
    }
    const {x, y, z, w} = orientationEvent.quaternion;
    orientationEvent.quaternion = {
      x,
      y,
      z,
      w
    };
    for (const l of this.orientationListeners) {
      l(orientationEvent);
    }
  }
};

// src/cubing/bluetooth/debug.ts
var DEBUG_LOGGING_ENABLED = false;
function enableDebugLogging(enable) {
  DEBUG_LOGGING_ENABLED = enable;
}
function debugLog(...args) {
  if (!DEBUG_LOGGING_ENABLED) {
    return;
  }
  if (console.info) {
    console.info(...args);
  } else {
    console.log(...args);
  }
}

// src/cubing/bluetooth/smart-puzzle/gan.ts
import {Quaternion as Quaternion2} from "three";
import {Move} from "cubing/alg";
import {KPuzzle} from "cubing/kpuzzle";
import {puzzles} from "cubing/puzzles";

// src/cubing/bluetooth/smart-puzzle/unsafe-raw-aes.ts
var blockSize = 16;
var zeros = new Uint8Array(blockSize);
var paddingBlockPlaintext = new Uint8Array(new Array(blockSize).fill(blockSize));
var AES_CBC = "AES-CBC";
async function importKey(keyBytes) {
  return await crypto.subtle.importKey("raw", keyBytes, AES_CBC, true, [
    "encrypt",
    "decrypt"
  ]);
}
async function unsafeEncryptBlockWithIV(key, plaintextBlock, iv) {
  return (await window.crypto.subtle.encrypt({
    name: AES_CBC,
    iv
  }, key, plaintextBlock)).slice(0, blockSize);
}
async function unsafeDecryptBlock(key, ciphertextBlock) {
  const paddingBlock = await unsafeEncryptBlockWithIV(key, paddingBlockPlaintext, ciphertextBlock);
  const cbcCiphertext = new Uint8Array(2 * blockSize);
  cbcCiphertext.set(new Uint8Array(ciphertextBlock), 0);
  cbcCiphertext.set(new Uint8Array(paddingBlock), blockSize);
  return (await window.crypto.subtle.decrypt({
    name: AES_CBC,
    iv: zeros
  }, key, cbcCiphertext)).slice(0, blockSize);
}

// src/cubing/bluetooth/smart-puzzle/gan.ts
var DEFAULT_INTERVAL_MS = 150;
var MAX_LATEST_MOVES = 6;
var ganMoveToBlockMove = {
  0: new Move("U"),
  2: new Move("U", -1),
  3: new Move("R"),
  5: new Move("R", -1),
  6: new Move("F"),
  8: new Move("F", -1),
  9: new Move("D"),
  11: new Move("D", -1),
  12: new Move("L"),
  14: new Move("L", -1),
  15: new Move("B"),
  17: new Move("B", -1)
};
var homeQuatInverse = null;
function probablyDecodedCorrectly(data) {
  return data[13] < 18 && data[14] < 18 && data[15] < 18 && data[16] < 18 && data[17] < 18 && data[18] < 18;
}
var key10 = new Uint8Array([
  198,
  202,
  21,
  223,
  79,
  110,
  19,
  182,
  119,
  13,
  230,
  89,
  58,
  175,
  186,
  162
]);
var key11 = new Uint8Array([
  67,
  226,
  91,
  214,
  125,
  220,
  120,
  216,
  7,
  96,
  163,
  218,
  130,
  60,
  1,
  241
]);
async function decryptState(data, aesKey) {
  if (aesKey === null) {
    return data;
  }
  const copy = new Uint8Array(data);
  copy.set(new Uint8Array(await unsafeDecryptBlock(aesKey, copy.slice(3))), 3);
  copy.set(new Uint8Array(await unsafeDecryptBlock(aesKey, copy.slice(0, 16))), 0);
  if (probablyDecodedCorrectly(copy)) {
    return copy;
  }
  throw new Error("Invalid Gan cube state");
}
var PhysicalState = class {
  constructor(dataView, timeStamp) {
    this.dataView = dataView;
    this.timeStamp = timeStamp;
    this.arrLen = 19;
    this.arr = new Uint8Array(dataView.buffer);
    if (this.arr.length !== this.arrLen) {
      throw new Error("Unexpected array length");
    }
  }
  static async read(characteristic, aesKey) {
    const value = await decryptState(new Uint8Array((await characteristic.readValue()).buffer), aesKey);
    const timeStamp = Date.now();
    return new PhysicalState(new DataView(value.buffer), timeStamp);
  }
  rotQuat() {
    let x = this.dataView.getInt16(0, true) / 16384;
    let y = this.dataView.getInt16(2, true) / 16384;
    let z = this.dataView.getInt16(4, true) / 16384;
    [x, y, z] = [-y, z, -x];
    const wSquared = 1 - (x * x + y * y + z * z);
    const w = wSquared > 0 ? Math.sqrt(wSquared) : 0;
    const quat = new Quaternion2(x, y, z, w);
    if (!homeQuatInverse) {
      homeQuatInverse = quat.clone().inverse();
    }
    return quat.clone().multiply(homeQuatInverse.clone());
  }
  moveCounter() {
    return this.arr[12];
  }
  numMovesSince(previousMoveCounter) {
    return this.moveCounter() - previousMoveCounter & 255;
  }
  latestMoves(n) {
    if (n < 0 || n > MAX_LATEST_MOVES) {
      throw new Error(`Must ask for 0 to 6 latest moves. (Asked for ${n})`);
    }
    return Array.from(this.arr.slice(19 - n, 19)).map((i) => ganMoveToBlockMove[i]);
  }
  debugInfo() {
    return {
      arr: this.arr
    };
  }
};
var UUIDs = {
  ganCubeService: "0000fff0-0000-1000-8000-00805f9b34fb",
  physicalStateCharacteristic: "0000fff5-0000-1000-8000-00805f9b34fb",
  actualAngleAndBatteryCharacteristic: "0000fff7-0000-1000-8000-00805f9b34fb",
  faceletStatus1Characteristic: "0000fff2-0000-1000-8000-00805f9b34fb",
  faceletStatus2Characteristic: "0000fff3-0000-1000-8000-00805f9b34fb",
  infoService: "0000180a-0000-1000-8000-00805f9b34fb",
  systemIDCharacteristic: "00002a23-0000-1000-8000-00805f9b34fb",
  versionCharacteristic: "00002a28-0000-1000-8000-00805f9b34fb"
};
var commands = {
  reset: new Uint8Array([
    0,
    0,
    36,
    0,
    73,
    146,
    36,
    73,
    109,
    146,
    219,
    182,
    73,
    146,
    182,
    36,
    109,
    219
  ])
};
var ganConfig = {
  filters: [{namePrefix: "GAN"}],
  optionalServices: [UUIDs.ganCubeService, UUIDs.infoService]
};
function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join(" ");
}
var reidEdgeOrder = "UF UR UB UL DF DR DB DL FR FL BR BL".split(" ");
var reidCornerOrder = "UFR URB UBL ULF DRF DFL DLB DBR".split(" ");
function rotateLeft(s, i) {
  return s.slice(i) + s.slice(0, i);
}
var pieceMap = {};
reidEdgeOrder.forEach((edge, idx) => {
  for (let i = 0; i < 2; i++) {
    pieceMap[rotateLeft(edge, i)] = {piece: idx, orientation: i};
  }
});
reidCornerOrder.forEach((corner, idx) => {
  for (let i = 0; i < 3; i++) {
    pieceMap[rotateLeft(corner, i)] = {piece: idx, orientation: i};
  }
});
var gan356iCornerMappings = [
  [0, 21, 15],
  [5, 13, 47],
  [7, 45, 39],
  [2, 37, 23],
  [29, 10, 16],
  [31, 18, 32],
  [26, 34, 40],
  [24, 42, 8]
];
var gan356iEdgeMappings = [
  [1, 22],
  [3, 14],
  [6, 46],
  [4, 38],
  [30, 17],
  [27, 9],
  [25, 41],
  [28, 33],
  [19, 12],
  [20, 35],
  [44, 11],
  [43, 36]
];
var faceOrder = "URFDLB";
async function getKey(server) {
  const infoService = await server.getPrimaryService(UUIDs.infoService);
  const versionCharacteristic = await infoService.getCharacteristic(UUIDs.versionCharacteristic);
  const versionBuffer = new Uint8Array((await versionCharacteristic.readValue()).buffer);
  const versionValue = ((versionBuffer[0] << 8) + versionBuffer[1] << 8) + versionBuffer[2];
  if (versionValue < 65544) {
    return null;
  }
  const keyXor = versionValue < 65792 ? key10 : key11;
  const systemIDCharacteristic = await infoService.getCharacteristic(UUIDs.systemIDCharacteristic);
  const systemID = new Uint8Array((await systemIDCharacteristic.readValue()).buffer).reverse();
  const key = new Uint8Array(keyXor);
  for (let i = 0; i < systemID.length; i++) {
    key[i] = (key[i] + systemID[i]) % 256;
  }
  return importKey(key);
}
var GanCube = class extends BluetoothPuzzle {
  constructor(def, service, server, physicalStateCharacteristic, lastMoveCounter, aesKey) {
    super();
    this.service = service;
    this.server = server;
    this.physicalStateCharacteristic = physicalStateCharacteristic;
    this.lastMoveCounter = lastMoveCounter;
    this.aesKey = aesKey;
    this.INTERVAL_MS = DEFAULT_INTERVAL_MS;
    this.intervalHandle = null;
    this.kpuzzle = new KPuzzle(def);
    this.startTrackingMoves();
  }
  static async connect(server) {
    const ganCubeService = await server.getPrimaryService(UUIDs.ganCubeService);
    debugLog("Service:", ganCubeService);
    const physicalStateCharacteristic = await ganCubeService.getCharacteristic(UUIDs.physicalStateCharacteristic);
    debugLog("Characteristic:", physicalStateCharacteristic);
    const aesKey = await getKey(server);
    const initialMoveCounter = (await PhysicalState.read(physicalStateCharacteristic, aesKey)).moveCounter();
    debugLog("Initial Move Counter:", initialMoveCounter);
    const cube = new GanCube(await puzzles["3x3x3"].def(), ganCubeService, server, physicalStateCharacteristic, initialMoveCounter, aesKey);
    return cube;
  }
  name() {
    return this.server.device.name;
  }
  startTrackingMoves() {
    this.intervalHandle = window.setInterval(this.intervalHandler.bind(this), this.INTERVAL_MS);
  }
  stopTrackingMoves() {
    if (!this.intervalHandle) {
      throw new Error("Not tracking moves!");
    }
    clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }
  async intervalHandler() {
    const physicalState = await PhysicalState.read(this.physicalStateCharacteristic, this.aesKey);
    let numInterveningMoves = physicalState.numMovesSince(this.lastMoveCounter);
    if (numInterveningMoves > MAX_LATEST_MOVES) {
      debugLog(`Too many moves! Dropping ${numInterveningMoves - MAX_LATEST_MOVES} moves`);
      numInterveningMoves = MAX_LATEST_MOVES;
    }
    for (const move of physicalState.latestMoves(numInterveningMoves)) {
      this.kpuzzle.applyMove(move);
      this.dispatchMove({
        latestMove: move,
        timeStamp: physicalState.timeStamp,
        debug: physicalState.debugInfo(),
        state: this.kpuzzle.state
      });
    }
    this.dispatchOrientation({
      timeStamp: physicalState.timeStamp,
      quaternion: physicalState.rotQuat()
    });
    this.lastMoveCounter = physicalState.moveCounter();
  }
  async getBattery() {
    return new Uint8Array(await this.readActualAngleAndBatteryCharacteristic())[7];
  }
  async getState() {
    const arr = await decryptState(new Uint8Array(await this.readFaceletStatus1Characteristic()), this.aesKey);
    const stickers = [];
    for (let i = 0; i < 18; i += 3) {
      let v = ((arr[i ^ 1] << 8) + arr[i + 1 ^ 1] << 8) + arr[i + 2 ^ 1];
      for (let j = 0; j < 8; j++) {
        stickers.push(v & 7);
        v >>= 3;
      }
    }
    const state = {
      CORNERS: {
        permutation: [],
        orientation: []
      },
      EDGES: {
        permutation: [],
        orientation: []
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 0, 0, 0, 0]
      }
    };
    for (const cornerMapping of gan356iCornerMappings) {
      const pieceInfo = pieceMap[cornerMapping.map((i) => faceOrder[stickers[i]]).join("")];
      state.CORNERS.permutation.push(pieceInfo.piece);
      state.CORNERS.orientation.push(pieceInfo.orientation);
    }
    for (const edgeMapping of gan356iEdgeMappings) {
      const pieceInfo = pieceMap[edgeMapping.map((i) => faceOrder[stickers[i]]).join("")];
      state.EDGES.permutation.push(pieceInfo.piece);
      state.EDGES.orientation.push(pieceInfo.orientation);
    }
    return state;
  }
  async faceletStatus1Characteristic() {
    this.cachedFaceletStatus1Characteristic = this.cachedFaceletStatus1Characteristic || this.service.getCharacteristic(UUIDs.faceletStatus1Characteristic);
    return this.cachedFaceletStatus1Characteristic;
  }
  async faceletStatus2Characteristic() {
    this.cachedFaceletStatus2Characteristic = this.cachedFaceletStatus2Characteristic || this.service.getCharacteristic(UUIDs.faceletStatus2Characteristic);
    return this.cachedFaceletStatus2Characteristic;
  }
  async actualAngleAndBatteryCharacteristic() {
    this.cachedActualAngleAndBatteryCharacteristic = this.cachedActualAngleAndBatteryCharacteristic || this.service.getCharacteristic(UUIDs.actualAngleAndBatteryCharacteristic);
    return this.cachedActualAngleAndBatteryCharacteristic;
  }
  async reset() {
    const faceletStatus1Characteristic = await this.faceletStatus1Characteristic();
    await faceletStatus1Characteristic.writeValue(commands.reset);
  }
  async readFaceletStatus1Characteristic() {
    const faceletStatus1Characteristic = await this.faceletStatus1Characteristic();
    return (await faceletStatus1Characteristic.readValue()).buffer;
  }
  async readFaceletStatus2Characteristic() {
    const faceletStatus2Characteristic = await this.faceletStatus2Characteristic();
    return buf2hex((await faceletStatus2Characteristic.readValue()).buffer);
  }
  async readActualAngleAndBatteryCharacteristic() {
    const actualAngleAndBatteryCharacteristic = await this.actualAngleAndBatteryCharacteristic();
    return (await actualAngleAndBatteryCharacteristic.readValue()).buffer;
  }
};

// src/cubing/bluetooth/smart-puzzle/giiker.ts
import {Move as Move2} from "cubing/alg";
var MESSAGE_LENGTH = 20;
var UUIDs2 = {
  cubeService: "0000aadb-0000-1000-8000-00805f9b34fb",
  cubeCharacteristic: "0000aadc-0000-1000-8000-00805f9b34fb"
};
var giiKERConfig = {
  filters: [
    {namePrefix: "Gi"},
    {services: ["0000aadb-0000-1000-8000-00805f9b34fb"]},
    {services: ["0000aaaa-0000-1000-8000-00805f9b34fb"]},
    {services: ["0000fe95-0000-1000-8000-00805f9b34fb"]}
  ],
  optionalServices: [
    UUIDs2.cubeService
  ]
};
function giikerMoveToAlgMove(face, amount) {
  switch (amount) {
    case 3:
      amount = -1;
      break;
    case 9:
      debugLog("Encountered 9", face, amount);
      amount = -2;
      break;
  }
  const family = ["?", "B", "D", "L", "U", "R", "F"][face];
  return new Move2(family, amount);
}
function giikerStateStr(giikerState) {
  let str = "";
  str += giikerState.slice(0, 8).join(".");
  str += "\n";
  str += giikerState.slice(8, 16).join(".");
  str += "\n";
  str += giikerState.slice(16, 28).join(".");
  str += "\n";
  str += giikerState.slice(28, 32).join(".");
  str += "\n";
  str += giikerState.slice(32, 40).join(".");
  return str;
}
var Reid333SolvedCenters = {
  permutation: [0, 1, 2, 3, 4, 5],
  orientation: [0, 0, 0, 0, 0, 0]
};
var epGiiKERtoReid333 = [4, 8, 0, 9, 5, 1, 3, 7, 6, 10, 2, 11];
var epReid333toGiiKER = [2, 5, 10, 6, 0, 4, 8, 7, 1, 3, 9, 11];
var preEO = [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0];
var postEO = [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0];
var cpGiiKERtoReid333 = [4, 0, 3, 5, 7, 1, 2, 6];
var cpReid333toGiiKER = [1, 5, 6, 2, 0, 3, 7, 4];
var preCO = [1, 2, 1, 2, 2, 1, 2, 1];
var postCO = [2, 1, 2, 1, 1, 2, 1, 2];
var coFlip = [-1, 1, -1, 1, 1, -1, 1, -1];
function getNibble(val, i) {
  if (i % 2 === 1) {
    return val[i / 2 | 0] % 16;
  }
  return 0 | val[i / 2 | 0] / 16;
}
function probablyEncrypted(data) {
  return data[18] === 167;
}
var lookup = [
  176,
  81,
  104,
  224,
  86,
  137,
  237,
  119,
  38,
  26,
  193,
  161,
  210,
  126,
  150,
  81,
  93,
  13,
  236,
  249,
  89,
  235,
  88,
  24,
  113,
  81,
  214,
  131,
  130,
  199,
  2,
  169,
  39,
  165,
  171,
  41
];
function decryptState2(data) {
  const offset1 = getNibble(data, 38);
  const offset2 = getNibble(data, 39);
  const output = new Uint8Array(MESSAGE_LENGTH);
  for (let i = 0; i < MESSAGE_LENGTH; i++) {
    output[i] = data[i] + lookup[offset1 + i] + lookup[offset2 + i];
  }
  return output;
}
async function decodeState(data) {
  if (!probablyEncrypted(data)) {
    return data;
  }
  return await decryptState2(data);
}
var GiiKERCube = class extends BluetoothPuzzle {
  constructor(server, cubeCharacteristic, originalValue) {
    super();
    this.server = server;
    this.cubeCharacteristic = cubeCharacteristic;
    this.originalValue = originalValue;
  }
  static async connect(server) {
    const cubeService = await server.getPrimaryService(UUIDs2.cubeService);
    debugLog("Service:", cubeService);
    const cubeCharacteristic = await cubeService.getCharacteristic(UUIDs2.cubeCharacteristic);
    debugLog("Characteristic:", cubeCharacteristic);
    const originalValue = await decodeState(new Uint8Array((await cubeCharacteristic.readValue()).buffer));
    debugLog("Original value:", originalValue);
    const cube = new GiiKERCube(server, cubeCharacteristic, originalValue);
    await cubeCharacteristic.startNotifications();
    cubeCharacteristic.addEventListener("characteristicvaluechanged", cube.onCubeCharacteristicChanged.bind(cube));
    return cube;
  }
  name() {
    return this.server.device.name;
  }
  async getState() {
    return this.toReid333(new Uint8Array((await this.cubeCharacteristic.readValue()).buffer));
  }
  getBit(val, i) {
    const n = i / 8 | 0;
    const shift = 7 - i % 8;
    return val[n] >> shift & 1;
  }
  toReid333(val) {
    const state = {
      EDGES: {
        permutation: new Array(12),
        orientation: new Array(12)
      },
      CORNERS: {
        permutation: new Array(8),
        orientation: new Array(8)
      },
      CENTERS: Reid333SolvedCenters
    };
    for (let i = 0; i < 12; i++) {
      const gi = epReid333toGiiKER[i];
      state.EDGES.permutation[i] = epGiiKERtoReid333[getNibble(val, gi + 16) - 1];
      state.EDGES.orientation[i] = this.getBit(val, gi + 112) ^ preEO[state.EDGES.permutation[i]] ^ postEO[i];
    }
    for (let i = 0; i < 8; i++) {
      const gi = cpReid333toGiiKER[i];
      state.CORNERS.permutation[i] = cpGiiKERtoReid333[getNibble(val, gi) - 1];
      state.CORNERS.orientation[i] = (getNibble(val, gi + 8) * coFlip[gi] + preCO[state.CORNERS.permutation[i]] + postCO[i]) % 3;
    }
    return state;
  }
  async onCubeCharacteristicChanged(event) {
    const val = await decodeState(new Uint8Array(event.target.value.buffer));
    debugLog(val);
    debugLog(val);
    if (this.isRepeatedInitialValue(val)) {
      debugLog("Skipping repeated initial value.");
      return;
    }
    const giikerState = [];
    for (let i = 0; i < MESSAGE_LENGTH; i++) {
      giikerState.push(Math.floor(val[i] / 16));
      giikerState.push(val[i] % 16);
    }
    debugLog(giikerState);
    const str = giikerStateStr(giikerState);
    debugLog(str);
    this.dispatchMove({
      latestMove: giikerMoveToAlgMove(giikerState[32], giikerState[33]),
      timeStamp: event.timeStamp,
      debug: {
        stateStr: str
      },
      state: this.toReid333(val)
    });
  }
  isRepeatedInitialValue(val) {
    if (typeof this.originalValue === "undefined") {
      throw new Error("GiiKERCube has uninitialized original value.");
    }
    if (this.originalValue === null) {
      return false;
    }
    const originalValue = this.originalValue;
    this.originalValue = null;
    debugLog("Comparing against original value.");
    for (let i = 0; i < MESSAGE_LENGTH - 2; i++) {
      if (originalValue[i] !== val[i]) {
        debugLog("Different at index ", i);
        return false;
      }
    }
    return true;
  }
};

// src/cubing/bluetooth/smart-puzzle/gocube.ts
import {Quaternion as Quaternion3} from "three";
import {Alg, experimentalAppendMove, Move as Move3} from "cubing/alg";
var UUIDs3 = {
  goCubeService: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  goCubeStateCharacteristic: "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
};
var goCubeConfig = {
  filters: [{namePrefix: "GoCube"}, {namePrefix: "Rubik"}],
  optionalServices: [UUIDs3.goCubeService]
};
function buf2hex2(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join(" ");
}
function bufferToString(buffer) {
  const byteView = new Uint8Array(buffer);
  let str = "";
  for (const charCode of byteView) {
    str += String.fromCharCode(charCode);
  }
  return str;
}
var moveMap = [
  new Move3("B", 1),
  new Move3("B", -1),
  new Move3("F", 1),
  new Move3("F", -1),
  new Move3("U", 1),
  new Move3("U", -1),
  new Move3("D", 1),
  new Move3("D", -1),
  new Move3("R", 1),
  new Move3("R", -1),
  new Move3("L", 1),
  new Move3("L", -1)
];
var GoCube = class extends BluetoothPuzzle {
  constructor(server, goCubeStateCharacteristic) {
    super();
    this.server = server;
    this.goCubeStateCharacteristic = goCubeStateCharacteristic;
    this.recorded = [];
    this.homeQuatInverse = null;
    this.lastRawQuat = new Quaternion3(0, 0, 0, 1);
    this.currentQuat = new Quaternion3(0, 0, 0, 1);
    this.lastTarget = new Quaternion3(0, 0, 0, 1);
    this.alg = new Alg();
  }
  static async connect(server) {
    const service = await server.getPrimaryService(UUIDs3.goCubeService);
    debugLog({service});
    const goCubeStateCharacteristic = await service.getCharacteristic(UUIDs3.goCubeStateCharacteristic);
    debugLog({goCubeStateCharacteristic});
    const cube = new GoCube(server, goCubeStateCharacteristic);
    await goCubeStateCharacteristic.startNotifications();
    goCubeStateCharacteristic.addEventListener("characteristicvaluechanged", cube.onCubeCharacteristicChanged.bind(cube));
    return cube;
  }
  reset() {
    this.resetAlg();
    this.resetOrientation();
  }
  resetAlg(alg) {
    this.alg = alg || new Alg();
  }
  resetOrientation() {
    this.homeQuatInverse = this.lastRawQuat.clone().inverse();
    this.currentQuat = new Quaternion3(0, 0, 0, 1);
    this.lastTarget = new Quaternion3(0, 0, 0, 1);
  }
  name() {
    return this.server.device.name;
  }
  onCubeCharacteristicChanged(event) {
    const buffer = event.target.value;
    this.recorded.push([event.timeStamp, buf2hex2(buffer.buffer)]);
    if (buffer.byteLength < 16) {
      for (let i = 3; i < buffer.byteLength - 4; i += 2) {
        const move = moveMap[buffer.getUint8(i)];
        this.alg = experimentalAppendMove(this.alg, move);
        this.dispatchMove({
          latestMove: moveMap[buffer.getUint8(i)],
          timeStamp: event.timeStamp,
          debug: {
            stateStr: buf2hex2(buffer.buffer)
          }
        });
      }
    } else {
      const coords = bufferToString(buffer.buffer.slice(3, buffer.byteLength - 3)).split("#").map((s) => parseInt(s, 10) / 16384);
      const quat = new Quaternion3(coords[0], coords[1], coords[2], coords[3]);
      this.lastRawQuat = quat.clone();
      if (!this.homeQuatInverse) {
        this.homeQuatInverse = quat.clone().inverse();
      }
      const targetQuat = quat.clone().multiply(this.homeQuatInverse.clone());
      targetQuat.y = -targetQuat.y;
      this.lastTarget.slerp(targetQuat, 0.5);
      this.currentQuat.rotateTowards(this.lastTarget, rotateTowardsRate);
      this.dispatchOrientation({
        quaternion: this.currentQuat,
        timeStamp: event.timeStamp
      });
    }
  }
};
var rotateTowardsRate = 0.5;

// src/cubing/bluetooth/smart-puzzle/connect.ts
function requestOptions(acceptAllDevices = false) {
  const options = acceptAllDevices ? {
    acceptAllDevices: true,
    optionalServices: []
  } : {
    filters: [],
    optionalServices: []
  };
  for (const config of [ganConfig, giiKERConfig, goCubeConfig]) {
    if (!acceptAllDevices) {
      options.filters = options.filters.concat(config.filters);
    }
    options.optionalServices = options.optionalServices.concat(config.optionalServices);
  }
  debugLog({requestOptions: options});
  return options;
}
var consecutiveFailures = 0;
var MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK = 2;
async function connect(options = {}) {
  debugLog("Attempting to pair.");
  let device;
  try {
    let acceptAllDevices = options.acceptAllDevices;
    if (!acceptAllDevices && consecutiveFailures >= MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK) {
      console.info(`The last ${MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK} Bluetooth puzzle connection attempts failed. This time, the Bluetooth prompt will show all possible devices.`);
      acceptAllDevices = true;
    }
    device = await navigator.bluetooth.requestDevice(requestOptions(acceptAllDevices));
    consecutiveFailures = 0;
  } catch (e) {
    consecutiveFailures++;
    throw new Error(e);
  }
  debugLog("Device:", device);
  if (typeof device.gatt === "undefined") {
    return Promise.reject("Device did not have a GATT server.");
  }
  const server = await device.gatt.connect();
  debugLog("Server:", server);
  const name = server.device?.name || "";
  if (name && name.startsWith("GAN")) {
    return await GanCube.connect(server);
  } else if (name && name.startsWith("GoCube") || name.startsWith("Rubik")) {
    return await GoCube.connect(server);
  } else {
    return await GiiKERCube.connect(server);
  }
}

// src/cubing/bluetooth/keyboard.ts
import {keyToMove} from "cubing/alg";
import {KPuzzle as KPuzzle2} from "cubing/kpuzzle";
import {puzzles as puzzles2} from "cubing/puzzles";
var KeyboardPuzzle = class extends BluetoothPuzzle {
  constructor(target) {
    super();
    this.puzzle = (async () => new KPuzzle2(await puzzles2["3x3x3"].def()))();
    target.addEventListener("keydown", this.onKeyDown.bind(this));
  }
  name() {
    return "Keyboard Input";
  }
  async getState() {
    return (await this.puzzle).state;
  }
  async onKeyDown(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    const move = keyToMove(e);
    if (move) {
      (await this.puzzle).applyMove(move);
      this.dispatchMove({
        latestMove: move,
        timeStamp: e.timeStamp,
        state: (await this.puzzle).state
      });
      e.preventDefault();
    }
  }
};
async function debugKeyboardConnect(target = window) {
  return new KeyboardPuzzle(target);
}
export {
  BluetoothPuzzle,
  GanCube,
  GiiKERCube,
  GoCube,
  KeyboardPuzzle,
  connect,
  debugKeyboardConnect,
  enableDebugLogging,
  giikerMoveToAlgMove as giikerMoveToAlgMoveForTesting
};
