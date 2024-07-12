// @ts-nocheck

import { Alg } from "../../../../../../../alg";
import { rawRandom333Scramble } from "../../../../../../../search/cubing-private";
import { circle, Cnk, set8Perm } from "../lib/mathlib";
import { randomUIntBelow } from "random-uint-below";

function createArray(length1: number, length2?: number) {
  const result = new Array<number[]>(length1);
  if (length2 !== undefined) {
    for (let i = 0; i < length1; i++) {
      result[i] = new Array(length2);
    }
  }
  return result;
}

let _: any;
const seedTable: Record<number, any> = {};
const CM$ = {};
const Q$Object = 0;
const Q$Serializable = 30;
const Q$Center1 = 21;
const Q$CornerCube = 22;
const Q$Edge3 = 23;
const Q$FullCube_0 = 24;
const Q$FullCube_$1 = 25;
const Q$Comparable = 34;
const Q$Search_0 = 26;
const Q$Object_$1 = 40;

function newSeed(id: number) {
  return new seedTable[id]();
}

function defineSeed(
  id: number,
  superSeed: number,
  castableTypeMap: any, // TODO
  ...moreArgs: any[]
) {
  let seed = seedTable[id];
  if (seed && !seed.___clazz$) {
    _ = seed.prototype;
  } else {
    !seed && (seed = seedTable[id] = function () {});
    _ = seed.prototype = superSeed < 0 ? {} : newSeed(superSeed);
    _.castableTypeMap$ = castableTypeMap;
  }
  for (const arg of moreArgs) {
    arg.prototype = _;
  }
  if (seed.___clazz$) {
    _.___clazz$ = seed.___clazz$;
    seed.___clazz$ = null;
  }
}

function makeCastMap(a: number[]) {
  const result: Record<number, number> = {};
  for (let i_0 = 0, c = a.length; i_0 < c; ++i_0) {
    result[a[i_0]] = 1;
  }
  return result;
}

defineSeed(1, -1, CM$);

_.value = null;

function Array_0() {}

function createFrom(a: any, length_0: number) {
  const result = createFromSeed(0, length_0);
  initValues(a.___clazz$, a.castableTypeMap$, a.queryId$, result);
  return result;
}

function createFromSeed(seedType: number, length_0: number) {
  const array = new Array(length_0);
  if (seedType === 3) {
    for (let i_0 = 0; i_0 < length_0; ++i_0) {
      const value = {
        m: 0,
        l: 0,
        h: 0,
      };
      value.l = value.m = value.h = 0;
      array[i_0] = value;
    }
  } else if (seedType > 0) {
    const value = [null, 0, false][seedType];
    for (let i_0 = 0; i_0 < length_0; ++i_0) {
      array[i_0] = value;
    }
  }
  return array;
}

function initDim(arrayClass, castableTypeMap, queryId, length_0, seedType) {
  const result = createFromSeed(seedType, length_0);
  initValues(arrayClass, castableTypeMap, queryId, result);
  return result;
}

function initValues(arrayClass, castableTypeMap, queryId, array) {
  $clinit_Array$ExpandoWrapper();
  wrapArray(array, expandoNames_0, expandoValues_0);
  array.___clazz$ = arrayClass;
  array.castableTypeMap$ = castableTypeMap;
  array.queryId$ = queryId;
  return array;
}

function setCheck(array, index, value) {
  return (array[index] = value);
}

defineSeed(73, 1, {}, Array_0);
_.queryId$ = 0;

let ran$clinit_Array$ExpandoWrapper = false;
function $clinit_Array$ExpandoWrapper() {
  if (ran$clinit_Array$ExpandoWrapper) {
    return;
  }
  ran$clinit_Array$ExpandoWrapper = true;
  expandoNames_0 = [];
  expandoValues_0 = [];
  initExpandos(new Array_0(), expandoNames_0, expandoValues_0);
}

function initExpandos(protoType, expandoNames, expandoValues) {
  let i_0 = 0;
  let value;
  for (const name_0 in protoType) {
    if ((value = protoType[name_0])) {
      expandoNames[i_0] = name_0;
      expandoValues[i_0] = value;
      ++i_0;
    }
  }
}

function wrapArray(array, expandoNames, expandoValues) {
  $clinit_Array$ExpandoWrapper();
  for (let i_0 = 0, c = expandoNames.length; i_0 < c; ++i_0) {
    array[expandoNames[i_0]] = expandoValues[i_0];
  }
}

let expandoNames_0;
let expandoValues_0;

function canCast(src, dstId) {
  return src.castableTypeMap$ && !!src.castableTypeMap$[dstId];
}

function instanceOf(src, dstId) {
  return src !== null && canCast(src, dstId);
}

let ran$clinit_Center1 = false;
function $clinit_Center1() {
  if (ran$clinit_Center1) {
    return false;
  }
  ran$clinit_Center1 = true;
  ctsmv = createArray(15582, 36);
  sym2raw = createArray(15582);
  csprun = createArray(15582);
  symmult = createArray(48, 48);
  symmove = createArray(48, 36);
  syminv = createArray(48);
  finish_0 = createArray(48);
}

function $$init_1(this$static) {
  this$static.ct = createArray(24);
}

function $equals(this$static, obj) {
  let c;
  let i_0;
  if (instanceOf(obj, Q$Center1)) {
    c = obj;
    for (i_0 = 0; i_0 < 24; ++i_0) {
      if (this$static.ct[i_0] !== c.ct[i_0]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function $get_1(this$static) {
  let i_0;
  let idx;
  let r;
  idx = 0;
  r = 8;
  for (i_0 = 23; i_0 >= 0; --i_0) {
    this$static.ct[i_0] === 1 && (idx += Cnk[i_0][r--]);
  }
  return idx;
}

function $getsym(this$static) {
  let cord;
  let j;
  if (raw2sym !== null) {
    return raw2sym[$get_1(this$static)];
  }
  for (j = 0; j < 48; ++j) {
    cord = raw2sym_0($get_1(this$static));
    if (cord !== -1) {
      return cord * 64 + j;
    }
    $rot(this$static, 0);
    j % 2 === 1 && $rot(this$static, 1);
    j % 8 === 7 && $rot(this$static, 2);
    j % 16 === 15 && $rot(this$static, 3);
  }
}

function $move(this$static, m_0) {
  const key = m_0 % 3;
  m_0 = ~~(m_0 / 3);
  switch (m_0) {
    case 0: {
      swap(this$static.ct, 0, 1, 2, 3, key);
      break;
    }
    case 1: {
      swap(this$static.ct, 16, 17, 18, 19, key);
      break;
    }
    case 2: {
      swap(this$static.ct, 8, 9, 10, 11, key);
      break;
    }
    case 3: {
      swap(this$static.ct, 4, 5, 6, 7, key);
      break;
    }
    case 4: {
      swap(this$static.ct, 20, 21, 22, 23, key);
      break;
    }
    case 5: {
      swap(this$static.ct, 12, 13, 14, 15, key);
      break;
    }
    case 6: {
      swap(this$static.ct, 0, 1, 2, 3, key);
      swap(this$static.ct, 8, 20, 12, 16, key);
      swap(this$static.ct, 9, 21, 13, 17, key);
      break;
    }
    case 7: {
      swap(this$static.ct, 16, 17, 18, 19, key);
      swap(this$static.ct, 1, 15, 5, 9, key);
      swap(this$static.ct, 2, 12, 6, 10, key);
      break;
    }
    case 8: {
      swap(this$static.ct, 8, 9, 10, 11, key);
      swap(this$static.ct, 2, 19, 4, 21, key);
      swap(this$static.ct, 3, 16, 5, 22, key);
      break;
    }
    case 9: {
      swap(this$static.ct, 4, 5, 6, 7, key);
      swap(this$static.ct, 10, 18, 14, 22, key);
      swap(this$static.ct, 11, 19, 15, 23, key);
      break;
    }
    case 10: {
      swap(this$static.ct, 20, 21, 22, 23, key);
      swap(this$static.ct, 0, 8, 4, 14, key);
      swap(this$static.ct, 3, 11, 7, 13, key);
      break;
    }
    case 11: {
      swap(this$static.ct, 12, 13, 14, 15, key);
      swap(this$static.ct, 1, 20, 7, 18, key);
      swap(this$static.ct, 0, 23, 6, 17, key);
    }
  }
}

function $rot(this$static, r) {
  switch (r) {
    case 0: {
      $move(this$static, 19);
      $move(this$static, 28);
      break;
    }
    case 1: {
      $move(this$static, 21);
      $move(this$static, 32);
      break;
    }
    case 2: {
      swap(this$static.ct, 0, 3, 1, 2, 1);
      swap(this$static.ct, 8, 11, 9, 10, 1);
      swap(this$static.ct, 4, 7, 5, 6, 1);
      swap(this$static.ct, 12, 15, 13, 14, 1);
      swap(this$static.ct, 16, 19, 21, 22, 1);
      swap(this$static.ct, 17, 18, 20, 23, 1);
      break;
    }
    case 3: {
      $move(this$static, 18);
      $move(this$static, 29);
      $move(this$static, 24);
      $move(this$static, 35);
    }
  }
}

function $rotate(this$static, r) {
  let j;
  for (j = 0; j < r; ++j) {
    $rot(this$static, 0);
    j % 2 === 1 && $rot(this$static, 1);
    j % 8 === 7 && $rot(this$static, 2);
    j % 16 === 15 && $rot(this$static, 3);
  }
}

function $set_0(this$static, idx) {
  let i_0;
  let r;
  r = 8;
  for (i_0 = 23; i_0 >= 0; --i_0) {
    this$static.ct[i_0] = 0;
    if (idx >= Cnk[i_0][r]) {
      idx -= Cnk[i_0][r--];
      this$static.ct[i_0] = 1;
    }
  }
}

function $set_1(this$static, c) {
  let i_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this$static.ct[i_0] = c.ct[i_0];
  }
}

function Center1_0() {
  let i_0;
  $$init_1(this);
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this.ct[i_0] = 1;
  }
  for (i_0 = 8; i_0 < 24; ++i_0) {
    this.ct[i_0] = 0;
  }
}

function Center1_1(c, urf) {
  let i_0;
  $$init_1(this);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this.ct[i_0] = ~~(c.ct[i_0] / 2) === urf ? 1 : 0;
  }
}

function Center1_2(ct) {
  let i_0;
  $$init_1(this);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this.ct[i_0] = ct[i_0];
  }
}

function createMoveTable() {
  let i_0;
  let m_0;
  const c = new Center1_0();
  const d = new Center1_0();
  for (i_0 = 0; i_0 < 15582; ++i_0) {
    $set_0(d, sym2raw[i_0]);
    for (m_0 = 0; m_0 < 36; ++m_0) {
      $set_1(c, d);
      $move(c, m_0);
      ctsmv[i_0][m_0] = $getsym(c);
    }
  }
}

function createPrun() {
  let check;
  let depth;
  let done;
  let i_0;
  let idx;
  let inv;
  let m_0;
  let select;
  fill_0(csprun);
  csprun[0] = 0;
  depth = 0;
  done = 1;
  while (done !== 15582) {
    inv = depth > 4;
    select = inv ? -1 : depth;
    check = inv ? depth : -1;
    ++depth;
    for (i_0 = 0; i_0 < 15582; ++i_0) {
      if (csprun[i_0] !== select) {
        continue;
      }
      for (m_0 = 0; m_0 < 27; ++m_0) {
        idx = ~~ctsmv[i_0][m_0] >>> 6;
        if (csprun[idx] !== check) {
          continue;
        }
        ++done;
        if (inv) {
          csprun[i_0] = depth;
          break;
        } else {
          csprun[idx] = depth;
        }
      }
    }
  }
}

function getSolvedSym(cube) {
  let check;
  let i_0;
  let j;
  const c = new Center1_2(cube.ct);
  for (j = 0; j < 48; ++j) {
    check = true;
    for (i_0 = 0; i_0 < 24; ++i_0) {
      if (c.ct[i_0] !== ~~(i_0 / 4)) {
        check = false;
        break;
      }
    }
    if (check) {
      return j;
    }
    $rot(c, 0);
    j % 2 === 1 && $rot(c, 1);
    j % 8 === 7 && $rot(c, 2);
    j % 16 === 15 && $rot(c, 3);
  }
  return -1;
}

function initSym_0() {
  let i_0;
  let j;
  let k_0;
  const c = new Center1_0();
  for (i_0 = 0; i_0 < 24; ++i_0) {
    c.ct[i_0] = i_0;
  }
  const d = new Center1_2(c.ct);
  const e = new Center1_2(c.ct);
  const f = new Center1_2(c.ct);
  for (i_0 = 0; i_0 < 48; ++i_0) {
    for (j = 0; j < 48; ++j) {
      for (k_0 = 0; k_0 < 48; ++k_0) {
        if ($equals(c, d)) {
          symmult[i_0][j] = k_0;
          k_0 === 0 && (syminv[i_0] = j);
        }
        $rot(d, 0);
        k_0 % 2 === 1 && $rot(d, 1);
        k_0 % 8 === 7 && $rot(d, 2);
        k_0 % 16 === 15 && $rot(d, 3);
      }
      $rot(c, 0);
      j % 2 === 1 && $rot(c, 1);
      j % 8 === 7 && $rot(c, 2);
      j % 16 === 15 && $rot(c, 3);
    }
    $rot(c, 0);
    i_0 % 2 === 1 && $rot(c, 1);
    i_0 % 8 === 7 && $rot(c, 2);
    i_0 % 16 === 15 && $rot(c, 3);
  }
  for (i_0 = 0; i_0 < 48; ++i_0) {
    $set_1(c, e);
    $rotate(c, syminv[i_0]);
    for (j = 0; j < 36; ++j) {
      $set_1(d, c);
      $move(d, j);
      $rotate(d, i_0);
      for (k_0 = 0; k_0 < 36; ++k_0) {
        $set_1(f, e);
        $move(f, k_0);
        if ($equals(f, d)) {
          symmove[i_0][j] = k_0;
          break;
        }
      }
    }
  }
  $set_0(c, 0);
  for (i_0 = 0; i_0 < 48; ++i_0) {
    finish_0[syminv[i_0]] = $get_1(c);
    $rot(c, 0);
    i_0 % 2 === 1 && $rot(c, 1);
    i_0 % 8 === 7 && $rot(c, 2);
    i_0 % 16 === 15 && $rot(c, 3);
  }
}

function initSym2Raw() {
  let count;
  let i_0;
  let idx;
  let j;
  const c = new Center1_0();
  const occ = createArray(22984);
  for (i_0 = 0; i_0 < 22984; i_0++) {
    occ[i_0] = 0;
  }
  count = 0;
  for (i_0 = 0; i_0 < 735471; ++i_0) {
    if ((occ[~~i_0 >>> 5] & (1 << (i_0 & 31))) === 0) {
      $set_0(c, i_0);
      for (j = 0; j < 48; ++j) {
        idx = $get_1(c);
        occ[~~idx >>> 5] |= 1 << (idx & 31);
        raw2sym !== null && (raw2sym[idx] = (count << 6) | syminv[j]);
        $rot(c, 0);
        j % 2 === 1 && $rot(c, 1);
        j % 8 === 7 && $rot(c, 2);
        j % 16 === 15 && $rot(c, 3);
      }
      sym2raw[count++] = i_0;
    }
  }
}

function raw2sym_0(n) {
  const m_0 = binarySearch_0(sym2raw, n);
  return m_0 >= 0 ? m_0 : -1;
}

defineSeed(153, 1, makeCastMap([Q$Center1]), Center1_0, Center1_1, Center1_2);

let csprun;
let ctsmv;
let finish_0;
let raw2sym = null;
let sym2raw;
let syminv;
let symmove;
let symmult;

let ran$clinit_Center2 = false;
function $clinit_Center2() {
  if (ran$clinit_Center2) {
    return;
  }
  ran$clinit_Center2 = true;
  rlmv = createArray(70, 28);
  ctmv = createArray(6435, 28);
  rlrot = createArray(70, 16);
  ctrot = createArray(6435, 16);
  ctprun = createArray(450450);
  pmv = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0,
    0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0,
  ];
}

function $getct(this$static) {
  let i_0;
  let idx;
  let r;
  idx = 0;
  r = 8;
  for (i_0 = 14; i_0 >= 0; --i_0) {
    this$static.ct[i_0] !== this$static.ct[15] && (idx += Cnk[i_0][r--]);
  }
  return idx;
}

function $getrl(this$static) {
  let i_0;
  let idx;
  let r;
  idx = 0;
  r = 4;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    this$static.rl[i_0] !== this$static.rl[7] && (idx += Cnk[i_0][r--]);
  }
  return idx * 2 + this$static.parity;
}

function $move_0(this$static, m_0) {
  this$static.parity ^= pmv[m_0];
  const key = m_0 % 3;
  m_0 = ~~(m_0 / 3);
  switch (m_0) {
    case 0: {
      swap(this$static.ct, 0, 1, 2, 3, key);
      break;
    }
    case 1: {
      swap(this$static.rl, 0, 1, 2, 3, key);
      break;
    }
    case 2: {
      swap(this$static.ct, 8, 9, 10, 11, key);
      break;
    }
    case 3: {
      swap(this$static.ct, 4, 5, 6, 7, key);
      break;
    }
    case 4: {
      swap(this$static.rl, 4, 5, 6, 7, key);
      break;
    }
    case 5: {
      swap(this$static.ct, 12, 13, 14, 15, key);
      break;
    }
    case 6: {
      swap(this$static.ct, 0, 1, 2, 3, key);
      swap(this$static.rl, 0, 5, 4, 1, key);
      swap(this$static.ct, 8, 9, 12, 13, key);
      break;
    }
    case 7: {
      swap(this$static.rl, 0, 1, 2, 3, key);
      swap(this$static.ct, 1, 15, 5, 9, key);
      swap(this$static.ct, 2, 12, 6, 10, key);
      break;
    }
    case 8: {
      swap(this$static.ct, 8, 9, 10, 11, key);
      swap(this$static.rl, 0, 3, 6, 5, key);
      swap(this$static.ct, 3, 2, 5, 4, key);
      break;
    }
    case 9: {
      swap(this$static.ct, 4, 5, 6, 7, key);
      swap(this$static.rl, 3, 2, 7, 6, key);
      swap(this$static.ct, 11, 10, 15, 14, key);
      break;
    }
    case 10: {
      swap(this$static.rl, 4, 5, 6, 7, key);
      swap(this$static.ct, 0, 8, 4, 14, key);
      swap(this$static.ct, 3, 11, 7, 13, key);
      break;
    }
    case 11: {
      swap(this$static.ct, 12, 13, 14, 15, key);
      swap(this$static.rl, 1, 4, 7, 2, key);
      swap(this$static.ct, 1, 0, 7, 6, key);
    }
  }
}

function $rot_0(this$static, r) {
  switch (r) {
    case 0: {
      $move_0(this$static, 19);
      $move_0(this$static, 28);
      break;
    }
    case 1: {
      $move_0(this$static, 21);
      $move_0(this$static, 32);
      break;
    }
    case 2: {
      swap(this$static.ct, 0, 3, 1, 2, 1);
      swap(this$static.ct, 8, 11, 9, 10, 1);
      swap(this$static.ct, 4, 7, 5, 6, 1);
      swap(this$static.ct, 12, 15, 13, 14, 1);
      swap(this$static.rl, 0, 3, 5, 6, 1);
      swap(this$static.rl, 1, 2, 4, 7, 1);
    }
  }
}

function $set_2(this$static, c, edgeParity) {
  let i_0;
  for (i_0 = 0; i_0 < 16; ++i_0) {
    this$static.ct[i_0] = ~~(c.ct[i_0] / 2);
  }
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this$static.rl[i_0] = c.ct[i_0 + 16];
  }
  this$static.parity = edgeParity;
}

function $setct(this$static, idx) {
  let i_0;
  let r;
  r = 8;
  this$static.ct[15] = 0;
  for (i_0 = 14; i_0 >= 0; --i_0) {
    if (idx >= Cnk[i_0][r]) {
      idx -= Cnk[i_0][r--];
      this$static.ct[i_0] = 1;
    } else {
      this$static.ct[i_0] = 0;
    }
  }
}

function $setrl(this$static, idx) {
  let i_0;
  let r;
  this$static.parity = idx & 1;
  idx >>>= 1;
  r = 4;
  this$static.rl[7] = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    if (idx >= Cnk[i_0][r]) {
      idx -= Cnk[i_0][r--];
      this$static.rl[i_0] = 1;
    } else {
      this$static.rl[i_0] = 0;
    }
  }
}

function Center2_0() {
  this.rl = createArray(8);
  this.ct = createArray(16);
}

function init_3() {
  let ct;
  let ctx;
  let depth;
  let done;
  let i_0;
  let idx;
  let j;
  let m_0;
  let rl;
  let rlx;
  const c = new Center2_0();
  for (i_0 = 0; i_0 < 70; ++i_0) {
    for (m_0 = 0; m_0 < 28; ++m_0) {
      $setrl(c, i_0);
      $move_0(c, move2std[m_0]);
      rlmv[i_0][m_0] = $getrl(c);
    }
  }
  for (i_0 = 0; i_0 < 70; ++i_0) {
    $setrl(c, i_0);
    for (j = 0; j < 16; ++j) {
      rlrot[i_0][j] = $getrl(c);
      $rot_0(c, 0);
      j % 2 === 1 && $rot_0(c, 1);
      j % 8 === 7 && $rot_0(c, 2);
    }
  }
  for (i_0 = 0; i_0 < 6435; ++i_0) {
    $setct(c, i_0);
    for (j = 0; j < 16; ++j) {
      ctrot[i_0][j] = $getct(c) & 65535;
      $rot_0(c, 0);
      j % 2 === 1 && $rot_0(c, 1);
      j % 8 === 7 && $rot_0(c, 2);
    }
  }
  for (i_0 = 0; i_0 < 6435; ++i_0) {
    for (m_0 = 0; m_0 < 28; ++m_0) {
      $setct(c, i_0);
      $move_0(c, move2std[m_0]);
      ctmv[i_0][m_0] = $getct(c) & 65535;
    }
  }
  fill_0(ctprun);
  ctprun[0] =
    ctprun[18] =
    ctprun[28] =
    ctprun[46] =
    ctprun[54] =
    ctprun[56] =
      0;
  depth = 0;
  done = 6;

  while (done !== 450450) {
    const inv = depth > 6;
    const select = inv ? -1 : depth;
    const check = inv ? depth : -1;
    ++depth;
    for (i_0 = 0; i_0 < 450450; ++i_0) {
      if (ctprun[i_0] !== select) {
        continue;
      }
      ct = ~~(i_0 / 70);
      rl = i_0 % 70;
      for (m_0 = 0; m_0 < 23; ++m_0) {
        ctx = ctmv[ct][m_0];
        rlx = rlmv[rl][m_0];
        idx = ctx * 70 + rlx;
        if (ctprun[idx] !== check) {
          continue;
        }
        ++done;
        if (inv) {
          ctprun[i_0] = depth;
          break;
        } else {
          ctprun[idx] = depth;
        }
      }
    }
  }
}

defineSeed(154, 1, {}, Center2_0);
_.parity = 0;
let ctmv;
let ctprun;
let ctrot;
let pmv;
let rlmv;
let rlrot;

let ran$clinit_Center3 = false;
function $clinit_Center3() {
  if (ran$clinit_Center3) {
    return;
  }
  ran$clinit_Center3 = true;
  ctmove = createArray(29400, 20);
  pmove = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1];
  prun_0 = createArray(29400);
  rl2std = [0, 9, 14, 23, 27, 28, 41, 42, 46, 55, 60, 69];
  std2rl = createArray(70);
}

function $getct_0(this$static) {
  let i_0;
  let idx;
  let idxrl;
  let r;
  idx = 0;
  r = 4;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    this$static.ud[i_0] !== this$static.ud[7] && (idx += Cnk[i_0][r--]);
  }
  idx *= 35;
  r = 4;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    this$static.fb[i_0] !== this$static.fb[7] && (idx += Cnk[i_0][r--]);
  }
  idx *= 12;
  const check = this$static.fb[7] ^ this$static.ud[7];
  idxrl = 0;
  r = 4;
  for (i_0 = 7; i_0 >= 0; --i_0) {
    this$static.rl[i_0] !== check && (idxrl += Cnk[i_0][r--]);
  }
  return this$static.parity + 2 * (idx + std2rl[idxrl]);
}

function $move_1(this$static, i_0) {
  this$static.parity ^= pmove[i_0];
  switch (i_0) {
    case 0:
    case 1:
    case 2: {
      swap(this$static.ud, 0, 1, 2, 3, i_0 % 3);
      break;
    }
    case 3: {
      swap(this$static.rl, 0, 1, 2, 3, 1);
      break;
    }
    case 4:
    case 5:
    case 6: {
      swap(this$static.fb, 0, 1, 2, 3, (i_0 - 1) % 3);
      break;
    }
    case 7:
    case 8:
    case 9: {
      swap(this$static.ud, 4, 5, 6, 7, (i_0 - 1) % 3);
      break;
    }
    case 10: {
      swap(this$static.rl, 4, 5, 6, 7, 1);
      break;
    }
    case 11:
    case 12:
    case 13: {
      swap(this$static.fb, 4, 5, 6, 7, (i_0 + 1) % 3);
      break;
    }
    case 14: {
      swap(this$static.ud, 0, 1, 2, 3, 1);
      swap(this$static.rl, 0, 5, 4, 1, 1);
      swap(this$static.fb, 0, 5, 4, 1, 1);
      break;
    }
    case 15: {
      swap(this$static.rl, 0, 1, 2, 3, 1);
      swap(this$static.fb, 1, 4, 7, 2, 1);
      swap(this$static.ud, 1, 6, 5, 2, 1);
      break;
    }
    case 16: {
      swap(this$static.fb, 0, 1, 2, 3, 1);
      swap(this$static.ud, 3, 2, 5, 4, 1);
      swap(this$static.rl, 0, 3, 6, 5, 1);
      break;
    }
    case 17: {
      swap(this$static.ud, 4, 5, 6, 7, 1);
      swap(this$static.rl, 3, 2, 7, 6, 1);
      swap(this$static.fb, 3, 2, 7, 6, 1);
      break;
    }
    case 18: {
      swap(this$static.rl, 4, 5, 6, 7, 1);
      swap(this$static.fb, 0, 3, 6, 5, 1);
      swap(this$static.ud, 0, 3, 4, 7, 1);
      break;
    }
    case 19: {
      swap(this$static.fb, 4, 5, 6, 7, 1);
      swap(this$static.ud, 0, 7, 6, 1, 1);
      swap(this$static.rl, 1, 4, 7, 2, 1);
    }
  }
}

function $set_3(this$static, c, eXc_parity) {
  let i_0;
  const parity =
    (c.ct[0] > c.ct[8] ? 1 : 0) ^
    (c.ct[8] > c.ct[16] ? 1 : 0) ^
    (c.ct[0] > c.ct[16] ? 1 : 0)
      ? 1
      : 0;
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this$static.ud[i_0] = (c.ct[i_0] & 1) ^ 1;
    this$static.fb[i_0] = (c.ct[i_0 + 8] & 1) ^ 1;
    this$static.rl[i_0] = (c.ct[i_0 + 16] & 1) ^ 1 ^ parity;
  }
  this$static.parity = parity ^ eXc_parity;
}

function $setct_0(this$static, idx) {
  let i_0;
  let idxfb;
  let idxrl;
  let r;
  this$static.parity = idx & 1;
  idx >>>= 1;
  idxrl = rl2std[idx % 12];
  idx = ~~(idx / 12);
  r = 4;
  for (i_0 = 7; i_0 >= 0; --i_0) {
    this$static.rl[i_0] = 0;
    if (idxrl >= Cnk[i_0][r]) {
      idxrl -= Cnk[i_0][r--];
      this$static.rl[i_0] = 1;
    }
  }
  idxfb = idx % 35;
  idx = ~~(idx / 35);
  r = 4;
  this$static.fb[7] = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    if (idxfb >= Cnk[i_0][r]) {
      idxfb -= Cnk[i_0][r--];
      this$static.fb[i_0] = 1;
    } else {
      this$static.fb[i_0] = 0;
    }
  }
  r = 4;
  this$static.ud[7] = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    if (idx >= Cnk[i_0][r]) {
      idx -= Cnk[i_0][r--];
      this$static.ud[i_0] = 1;
    } else {
      this$static.ud[i_0] = 0;
    }
  }
}

function Center3_0() {
  this.ud = createArray(8);
  this.rl = createArray(8);
  this.fb = createArray(8);
}

function init_4() {
  let depth;
  let done;
  let i_0;
  let m_0;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    std2rl[rl2std[i_0]] = i_0;
  }
  const c = new Center3_0();
  for (i_0 = 0; i_0 < 29400; ++i_0) {
    for (m_0 = 0; m_0 < 20; ++m_0) {
      $setct_0(c, i_0);
      $move_1(c, m_0);
      ctmove[i_0][m_0] = $getct_0(c) & 65535;
    }
  }
  fill_0(prun_0);
  prun_0[0] = 0;
  depth = 0;
  done = 1;
  while (done !== 29400) {
    for (i_0 = 0; i_0 < 29400; ++i_0) {
      if (prun_0[i_0] !== depth) {
        continue;
      }
      for (m_0 = 0; m_0 < 17; ++m_0) {
        if (prun_0[ctmove[i_0][m_0]] === -1) {
          prun_0[ctmove[i_0][m_0]] = depth + 1;
          ++done;
        }
      }
    }
    ++depth;
  }
}

defineSeed(155, 1, {}, Center3_0);
_.parity = 0;
let ctmove;
let pmove;
let prun_0;
let rl2std;
let std2rl;

function $copy_1(this$static, c) {
  let i_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this$static.ct[i_0] = c.ct[i_0];
  }
}

function $move_2(this$static, m_0) {
  const key = m_0 % 3;
  m_0 = ~~(m_0 / 3);
  switch (m_0) {
    case 0: {
      swap(this$static.ct, 0, 1, 2, 3, key);
      break;
    }
    case 1: {
      swap(this$static.ct, 16, 17, 18, 19, key);
      break;
    }
    case 2: {
      swap(this$static.ct, 8, 9, 10, 11, key);
      break;
    }
    case 3: {
      swap(this$static.ct, 4, 5, 6, 7, key);
      break;
    }
    case 4: {
      swap(this$static.ct, 20, 21, 22, 23, key);
      break;
    }
    case 5: {
      swap(this$static.ct, 12, 13, 14, 15, key);
      break;
    }
    case 6: {
      swap(this$static.ct, 0, 1, 2, 3, key);
      swap(this$static.ct, 8, 20, 12, 16, key);
      swap(this$static.ct, 9, 21, 13, 17, key);
      break;
    }
    case 7: {
      swap(this$static.ct, 16, 17, 18, 19, key);
      swap(this$static.ct, 1, 15, 5, 9, key);
      swap(this$static.ct, 2, 12, 6, 10, key);
      break;
    }
    case 8: {
      swap(this$static.ct, 8, 9, 10, 11, key);
      swap(this$static.ct, 2, 19, 4, 21, key);
      swap(this$static.ct, 3, 16, 5, 22, key);
      break;
    }
    case 9: {
      swap(this$static.ct, 4, 5, 6, 7, key);
      swap(this$static.ct, 10, 18, 14, 22, key);
      swap(this$static.ct, 11, 19, 15, 23, key);
      break;
    }
    case 10: {
      swap(this$static.ct, 20, 21, 22, 23, key);
      swap(this$static.ct, 0, 8, 4, 14, key);
      swap(this$static.ct, 3, 11, 7, 13, key);
      break;
    }
    case 11: {
      swap(this$static.ct, 12, 13, 14, 15, key);
      swap(this$static.ct, 1, 20, 7, 18, key);
      swap(this$static.ct, 0, 23, 6, 17, key);
    }
  }
}

function CenterCube_0() {
  let i_0;
  this.ct = createArray(24);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this.ct[i_0] = ~~(i_0 / 4);
  }
}

function CenterCube_1() {
  let i_0;
  let m_0;
  let t;
  CenterCube_0.call(this);
  for (i_0 = 0; i_0 < 23; ++i_0) {
    t = i_0 + randomUIntBelow(24 - i_0);
    if (this.ct[t] !== this.ct[i_0]) {
      m_0 = this.ct[i_0];
      this.ct[i_0] = this.ct[t];
      this.ct[t] = m_0;
    }
  }
}

defineSeed(156, 1, {}, CenterCube_0, CenterCube_1);

let ran$clinit_CornerCube = false;
function $clinit_CornerCube() {
  if (ran$clinit_CornerCube) {
    return;
  }
  ran$clinit_CornerCube = true;
  moveCube_0 = createArray(18);
  initMove_0();
}

function $$init_2(this$static) {
  this$static.cp = [0, 1, 2, 3, 4, 5, 6, 7];
  this$static.co = [0, 0, 0, 0, 0, 0, 0, 0];
}

function $copy_2(this$static, c) {
  let i_0;
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this$static.cp[i_0] = c.cp[i_0];
    this$static.co[i_0] = c.co[i_0];
  }
}

function $move_3(this$static, idx) {
  !this$static.temps && (this$static.temps = new CornerCube_0());
  CornMult_0(this$static, moveCube_0[idx], this$static.temps);
  $copy_2(this$static, this$static.temps);
}

function $setTwist_0(this$static, idx) {
  let i_0;
  let twst;
  twst = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    twst += this$static.co[i_0] = idx % 3;
    idx = ~~(idx / 3);
  }
  this$static.co[7] = (15 - twst) % 3;
}

function CornMult_0(a, b, prod) {
  let corn;
  let ori;
  let oriA;
  let oriB;
  for (corn = 0; corn < 8; ++corn) {
    prod.cp[corn] = a.cp[b.cp[corn]];
    oriA = a.co[b.cp[corn]];
    oriB = b.co[corn];
    ori = oriA;
    ori = ori + (oriA < 3 ? oriB : 6 - oriB);
    ori = ori % 3;
    (oriA >= 3 ? 1 : 0) ^ (oriB >= 3 ? 1 : 0) && (ori = ori + 3);
    prod.co[corn] = ori;
  }
}

function CornerCube_0() {
  $$init_2(this);
}

function CornerCube_1(cperm, twist) {
  $$init_2(this);
  set8Perm(this.cp, cperm);
  $setTwist_0(this, twist);
}

function CornerCube_2() {
  CornerCube_1.call(this, randomUIntBelow(40320), randomUIntBelow(2187));
}

function initMove_0() {
  let a;
  let p_0;
  moveCube_0[0] = new CornerCube_1(15120, 0);
  moveCube_0[3] = new CornerCube_1(21021, 1494);
  moveCube_0[6] = new CornerCube_1(8064, 1236);
  moveCube_0[9] = new CornerCube_1(9, 0);
  moveCube_0[12] = new CornerCube_1(1230, 412);
  moveCube_0[15] = new CornerCube_1(224, 137);
  for (a = 0; a < 18; a += 3) {
    for (p_0 = 0; p_0 < 2; ++p_0) {
      moveCube_0[a + p_0 + 1] = new CornerCube_0();
      CornMult_0(moveCube_0[a + p_0], moveCube_0[a], moveCube_0[a + p_0 + 1]);
    }
  }
}

defineSeed(
  157,
  1,
  makeCastMap([Q$CornerCube]),
  CornerCube_0,
  CornerCube_1,
  CornerCube_2,
);
_.temps = null;
let moveCube_0;

let ran$clinit_Edge3 = false;
function $clinit_Edge3() {
  if (ran$clinit_Edge3) {
    return;
  }
  ran$clinit_Edge3 = true;
  eprun = createArray(1937880);
  sym2raw_0 = createArray(1538);
  symstate = createArray(1538);
  raw2sym_1 = createArray(11880);
  syminv_0 = [0, 1, 6, 3, 4, 5, 2, 7];
  mvrot = createArray(160, 12);
  mvroto = createArray(160, 12);
  factX = [
    1, 1, 1, 3, 12, 60, 360, 2520, 20160, 181440, 1814400, 19958400, 239500800,
  ];
  FullEdgeMap = [0, 2, 4, 6, 1, 3, 7, 5, 8, 9, 10, 11];
}

function $circlex(this$static, a, b, c, d) {
  const temp = this$static.edgeo[d];
  this$static.edgeo[d] = this$static.edge[c];
  this$static.edge[c] = this$static.edgeo[b];
  this$static.edgeo[b] = this$static.edge[a];
  this$static.edge[a] = temp;
}

function $get_2(this$static, end) {
  let i_0;
  let idx;
  let v;
  let valh;
  let vall;
  this$static.isStd || $std(this$static);
  idx = 0;
  vall = 1985229328;
  valh = 47768;
  for (i_0 = 0; i_0 < end; ++i_0) {
    v = this$static.edge[i_0] << 2;
    idx *= 12 - i_0;
    if (v >= 32) {
      idx += (valh >> (v - 32)) & 15;
      valh -= 4368 << (v - 32);
    } else {
      idx += (vall >> v) & 15;
      valh -= 4369;
      vall -= 286331152 << v;
    }
  }
  return idx;
}

function $getsym_0(this$static) {
  let symcord1x;
  const cord1x = $get_2(this$static, 4);
  symcord1x = raw2sym_1[cord1x];
  const symx = symcord1x & 7;
  symcord1x >>= 3;
  $rotate_0(this$static, symx);
  const cord2x = $get_2(this$static, 10) % 20160;
  return symcord1x * 20160 + cord2x;
}

function $move_4(this$static, i_0) {
  this$static.isStd = false;
  switch (i_0) {
    case 0: {
      circle(this$static.edge, 0, 4, 1, 5);
      circle(this$static.edgeo, 0, 4, 1, 5);
      break;
    }
    case 1: {
      $swap_0(this$static.edge, 0, 4, 1, 5);
      $swap_0(this$static.edgeo, 0, 4, 1, 5);
      break;
    }
    case 2: {
      circle(this$static.edge, 0, 5, 1, 4);
      circle(this$static.edgeo, 0, 5, 1, 4);
      break;
    }
    case 3: {
      $swap_0(this$static.edge, 5, 10, 6, 11);
      $swap_0(this$static.edgeo, 5, 10, 6, 11);
      break;
    }
    case 4: {
      circle(this$static.edge, 0, 11, 3, 8);
      circle(this$static.edgeo, 0, 11, 3, 8);
      break;
    }
    case 5: {
      $swap_0(this$static.edge, 0, 11, 3, 8);
      $swap_0(this$static.edgeo, 0, 11, 3, 8);
      break;
    }
    case 6: {
      circle(this$static.edge, 0, 8, 3, 11);
      circle(this$static.edgeo, 0, 8, 3, 11);
      break;
    }
    case 7: {
      circle(this$static.edge, 2, 7, 3, 6);
      circle(this$static.edgeo, 2, 7, 3, 6);
      break;
    }
    case 8: {
      $swap_0(this$static.edge, 2, 7, 3, 6);
      $swap_0(this$static.edgeo, 2, 7, 3, 6);
      break;
    }
    case 9: {
      circle(this$static.edge, 2, 6, 3, 7);
      circle(this$static.edgeo, 2, 6, 3, 7);
      break;
    }
    case 10: {
      $swap_0(this$static.edge, 4, 8, 7, 9);
      $swap_0(this$static.edgeo, 4, 8, 7, 9);
      break;
    }
    case 11: {
      circle(this$static.edge, 1, 9, 2, 10);
      circle(this$static.edgeo, 1, 9, 2, 10);
      break;
    }
    case 12: {
      $swap_0(this$static.edge, 1, 9, 2, 10);
      $swap_0(this$static.edgeo, 1, 9, 2, 10);
      break;
    }
    case 13: {
      circle(this$static.edge, 1, 10, 2, 9);
      circle(this$static.edgeo, 1, 10, 2, 9);
      break;
    }
    case 14: {
      $swap_0(this$static.edge, 0, 4, 1, 5);
      $swap_0(this$static.edgeo, 0, 4, 1, 5);
      circle(this$static.edge, 9, 11);
      circle(this$static.edgeo, 8, 10);
      break;
    }
    case 15: {
      $swap_0(this$static.edge, 5, 10, 6, 11);
      $swap_0(this$static.edgeo, 5, 10, 6, 11);
      circle(this$static.edge, 1, 3);
      circle(this$static.edgeo, 0, 2);
      break;
    }
    case 16: {
      $swap_0(this$static.edge, 0, 11, 3, 8);
      $swap_0(this$static.edgeo, 0, 11, 3, 8);
      circle(this$static.edge, 5, 7);
      circle(this$static.edgeo, 4, 6);
      break;
    }
    case 17: {
      $swap_0(this$static.edge, 2, 7, 3, 6);
      $swap_0(this$static.edgeo, 2, 7, 3, 6);
      circle(this$static.edge, 8, 10);
      circle(this$static.edgeo, 9, 11);
      break;
    }
    case 18: {
      $swap_0(this$static.edge, 4, 8, 7, 9);
      $swap_0(this$static.edgeo, 4, 8, 7, 9);
      circle(this$static.edge, 0, 2);
      circle(this$static.edgeo, 1, 3);
      break;
    }
    case 19: {
      $swap_0(this$static.edge, 1, 9, 2, 10);
      $swap_0(this$static.edgeo, 1, 9, 2, 10);
      circle(this$static.edge, 4, 6);
      circle(this$static.edgeo, 5, 7);
    }
  }
}

function $rot_1(this$static, r) {
  this$static.isStd = false;
  switch (r) {
    case 0: {
      $move_4(this$static, 14);
      $move_4(this$static, 17);
      break;
    }
    case 1: {
      $circlex(this$static, 11, 5, 10, 6);
      $circlex(this$static, 5, 10, 6, 11);
      $circlex(this$static, 1, 2, 3, 0);
      $circlex(this$static, 4, 9, 7, 8);
      $circlex(this$static, 8, 4, 9, 7);
      $circlex(this$static, 0, 1, 2, 3);
      break;
    }
    case 2: {
      $swapx(this$static, 4, 5);
      $swapx(this$static, 5, 4);
      $swapx(this$static, 11, 8);
      $swapx(this$static, 8, 11);
      $swapx(this$static, 7, 6);
      $swapx(this$static, 6, 7);
      $swapx(this$static, 9, 10);
      $swapx(this$static, 10, 9);
      $swapx(this$static, 1, 1);
      $swapx(this$static, 0, 0);
      $swapx(this$static, 3, 3);
      $swapx(this$static, 2, 2);
    }
  }
}

function $rotate_0(this$static, r) {
  while (r >= 2) {
    r -= 2;
    $rot_1(this$static, 1);
    $rot_1(this$static, 2);
  }
  r !== 0 && $rot_1(this$static, 0);
}

function $set_4(this$static, idx) {
  let i_0;
  let p_0;
  let parity;
  let v;
  let vall;
  let valh;
  vall = 0x76543210;
  valh = 0xba98;
  parity = 0;
  for (i_0 = 0; i_0 < 11; ++i_0) {
    p_0 = factX[11 - i_0];
    v = ~~(idx / p_0);
    idx = idx % p_0;
    parity ^= v;
    v <<= 2;
    if (v >= 32) {
      v = v - 32;
      this$static.edge[i_0] = (valh >> v) & 15;
      const m = (1 << v) - 1;
      valh = (valh & m) + ((valh >> 4) & ~m);
    } else {
      this$static.edge[i_0] = (vall >> v) & 15;
      const m = (1 << v) - 1;
      vall = (vall & m) + ((vall >>> 4) & ~m) + (valh << 28);
      valh = valh >> 4;
    }
  }
  if ((parity & 1) === 0) {
    this$static.edge[11] = vall;
  } else {
    this$static.edge[11] = this$static.edge[10];
    this$static.edge[10] = vall;
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.edgeo[i_0] = i_0;
  }
  this$static.isStd = true;
}

function $set_5(this$static, e) {
  let i_0;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.edge[i_0] = e.edge[i_0];
    this$static.edgeo[i_0] = e.edgeo[i_0];
  }
  this$static.isStd = e.isStd;
}

function $set_6(this$static, c) {
  let i_0;
  let parity;
  let s;
  let t;
  this$static.temp === null && (this$static.temp = createArray(12));
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.temp[i_0] = i_0;
    this$static.edge[i_0] = c.ep[FullEdgeMap[i_0] + 12] % 12;
  }
  parity = 1;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    while (this$static.edge[i_0] !== i_0) {
      t = this$static.edge[i_0];
      this$static.edge[i_0] = this$static.edge[t];
      this$static.edge[t] = t;
      s = this$static.temp[i_0];
      this$static.temp[i_0] = this$static.temp[t];
      this$static.temp[t] = s;
      parity ^= 1;
    }
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.edge[i_0] = this$static.temp[c.ep[FullEdgeMap[i_0]] % 12];
  }
  return parity;
}

function $std(this$static) {
  let i_0;
  this$static.temp === null && (this$static.temp = createArray(12));
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.temp[this$static.edgeo[i_0]] = i_0;
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.edge[i_0] = this$static.temp[this$static.edge[i_0]];
    this$static.edgeo[i_0] = i_0;
  }
  this$static.isStd = true;
}

function $swap_0(arr, a, b, c, d) {
  let temp;
  temp = arr[a];
  arr[a] = arr[c];
  arr[c] = temp;
  temp = arr[b];
  arr[b] = arr[d];
  arr[d] = temp;
}

function $swapx(this$static, x, y) {
  const temp = this$static.edge[x];
  this$static.edge[x] = this$static.edgeo[y];
  this$static.edgeo[y] = temp;
}

function Edge3_0() {
  this.edge = createArray(12);
  this.edgeo = createArray(12);
}

function createPrun_0() {
  let chk;
  let cord1;
  let cord1x;
  let cord2;
  let cord2x;
  let dep1m3;
  let depm3;
  let depth;
  let end;
  let find_0;
  let i_0;
  let i_;
  let idx;
  let idxx;
  let inv;
  let j;
  let m_0;
  let symState;
  let symcord1;
  let symcord1x;
  let symx;
  let val;
  const e = new Edge3_0();
  const f = new Edge3_0();
  const g = new Edge3_0();
  fill_0(eprun);
  depth = 0;
  done_0 = 1;
  setPruning_0(eprun, 0, 0);
  // var start = +new Date;
  while (done_0 !== 31006080) {
    inv = depth > 9;
    depm3 = depth % 3;
    dep1m3 = (depth + 1) % 3;
    find_0 = inv ? 3 : depm3;
    chk = inv ? depm3 : 3;
    if (depth >= 9) {
      break;
    }
    for (i_ = 0; i_ < 31006080; i_ += 16) {
      val = eprun[~~i_ >> 4];
      if (!inv && val === -1) {
        continue;
      }
      for (i_0 = i_, end = i_ + 16; i_0 < end; ++i_0, val >>= 2) {
        if ((val & 3) !== find_0) {
          continue;
        }
        symcord1 = ~~(i_0 / 20160);
        cord1 = sym2raw_0[symcord1];
        cord2 = i_0 % 20160;
        $set_4(e, cord1 * 20160 + cord2);
        for (m_0 = 0; m_0 < 17; ++m_0) {
          cord1x = getmvrot(e.edge, m_0 << 3, 4);
          symcord1x = raw2sym_1[cord1x];
          symx = symcord1x & 7;
          symcord1x >>= 3;
          cord2x = getmvrot(e.edge, (m_0 << 3) | symx, 10) % 20160;
          idx = symcord1x * 20160 + cord2x;
          if (getPruning_0(eprun, idx) !== chk) {
            continue;
          }
          setPruning_0(eprun, inv ? i_0 : idx, dep1m3);
          ++done_0;
          if (inv) {
            break;
          }
          symState = symstate[symcord1x];
          if (symState === 1) {
            continue;
          }
          $set_5(f, e);
          $move_4(f, m_0);
          $rotate_0(f, symx);
          for (j = 1; (symState = (~~symState >> 1) & 65535) !== 0; ++j) {
            if ((symState & 1) !== 1) {
              continue;
            }
            $set_5(g, f);
            $rotate_0(g, j);
            idxx = symcord1x * 20160 + ($get_2(g, 10) % 20160);
            if (getPruning_0(eprun, idxx) === chk) {
              setPruning_0(eprun, idxx, dep1m3);
              ++done_0;
            }
          }
        }
      }
    }
    ++depth;
    // console.log(depth + '\t' + done_0 + '\t' + (+new Date - start));
  }
}

function getPruning_0(table, index) {
  return (table[index >> 4] >> ((index & 15) << 1)) & 3;
}

function getmvrot(ep, mrIdx, end) {
  let i_0;
  let idx;
  let v;
  let valh;
  let vall;
  const movo = mvroto[mrIdx];
  const mov = mvrot[mrIdx];
  idx = 0;
  vall = 1985229328;
  valh = 47768;
  for (i_0 = 0; i_0 < end; ++i_0) {
    v = movo[ep[mov[i_0]]] << 2;
    idx *= 12 - i_0;
    if (v >= 32) {
      idx += (valh >> (v - 32)) & 15;
      valh -= 4368 << (v - 32);
    } else {
      idx += (vall >> v) & 15;
      valh -= 4369;
      vall -= 286331152 << v;
    }
  }
  return idx;
}

function getprun(edge) {
  let cord1;
  let cord1x;
  let cord2;
  let cord2x;
  let depm3;
  let depth;
  let idx;
  let m_0;
  let symcord1;
  let symcord1x;
  let symx;
  const e = new Edge3_0();
  depth = 0;
  depm3 = getPruning_0(eprun, edge);
  if (depm3 === 3) {
    return 10;
  }
  while (edge !== 0) {
    depm3 === 0 ? (depm3 = 2) : --depm3;
    symcord1 = ~~(edge / 20160);
    cord1 = sym2raw_0[symcord1];
    cord2 = edge % 20160;
    $set_4(e, cord1 * 20160 + cord2);
    for (m_0 = 0; m_0 < 17; ++m_0) {
      cord1x = getmvrot(e.edge, m_0 << 3, 4);
      symcord1x = raw2sym_1[cord1x];
      symx = symcord1x & 7;
      symcord1x >>= 3;
      cord2x = getmvrot(e.edge, (m_0 << 3) | symx, 10) % 20160;
      idx = symcord1x * 20160 + cord2x;
      if (getPruning_0(eprun, idx) === depm3) {
        ++depth;
        edge = idx;
        break;
      }
    }
  }
  return depth;
}

function getprun_0(edge, prun) {
  const depm3 = getPruning_0(eprun, edge);
  if (depm3 === 3) {
    return 10;
  }
  return (((0x49249249 << depm3) >> prun) & 3) + prun - 1;
  // (depm3 - prun + 16) % 3 + prun - 1;
}

function initMvrot() {
  let i_0;
  let m_0;
  let r;
  const e = new Edge3_0();
  for (m_0 = 0; m_0 < 20; ++m_0) {
    for (r = 0; r < 8; ++r) {
      $set_4(e, 0);
      $move_4(e, m_0);
      $rotate_0(e, r);
      for (i_0 = 0; i_0 < 12; ++i_0) {
        mvrot[(m_0 << 3) | r][i_0] = e.edge[i_0];
      }
      $std(e);
      for (i_0 = 0; i_0 < 12; ++i_0) {
        mvroto[(m_0 << 3) | r][i_0] = e.temp[i_0];
      }
    }
  }
}

function initRaw2Sym() {
  let count;
  let i_0;
  let idx;
  let j;
  const e = new Edge3_0();
  const occ = createArray(1485);
  for (i_0 = 0; i_0 < 1485; i_0++) {
    occ[i_0] = 0;
  }
  count = 0;
  for (i_0 = 0; i_0 < 11880; ++i_0) {
    if ((occ[~~i_0 >>> 3] & (1 << (i_0 & 7))) === 0) {
      $set_4(e, i_0 * factX[8]);
      for (j = 0; j < 8; ++j) {
        idx = $get_2(e, 4);
        idx === i_0 && (symstate[count] = (symstate[count] | (1 << j)) & 65535);
        occ[~~idx >> 3] = occ[~~idx >> 3] | (1 << (idx & 7));
        raw2sym_1[idx] = (count << 3) | syminv_0[j];
        $rot_1(e, 0);
        if (j % 2 === 1) {
          $rot_1(e, 1);
          $rot_1(e, 2);
        }
      }
      sym2raw_0[count++] = i_0;
    }
  }
}

function setPruning_0(table, index, value) {
  table[index >> 4] ^= (3 ^ value) << ((index & 15) << 1);
}

defineSeed(158, 1, makeCastMap([Q$Edge3]), Edge3_0);
_.isStd = true;
_.temp = null;
let FullEdgeMap;
let done_0 = 0;
let eprun;
let factX;
let mvrot;
let mvroto;
let raw2sym_1;
let sym2raw_0;
let syminv_0;
let symstate;

let ran$clinit_EdgeCube = false;
function $clinit_EdgeCube() {
  if (ran$clinit_EdgeCube) {
    return;
  }
  ran$clinit_EdgeCube = true;
}

function $checkEdge(this$static) {
  let ck;
  let i_0;
  let parity;
  ck = 0;
  parity = false;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    ck |= 1 << this$static.ep[i_0];
    parity = parity !== this$static.ep[i_0] >= 12;
  }
  ck &= ~~ck >> 12;
  return ck === 0 && !parity;
}

function $copy_3(this$static, c) {
  let i_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this$static.ep[i_0] = c.ep[i_0];
  }
}

function $move_5(this$static, m_0) {
  const key = m_0 % 3;
  m_0 = ~~(m_0 / 3);
  switch (m_0) {
    case 0: {
      swap(this$static.ep, 0, 1, 2, 3, key);
      swap(this$static.ep, 12, 13, 14, 15, key);
      break;
    }
    case 1: {
      swap(this$static.ep, 11, 15, 10, 19, key);
      swap(this$static.ep, 23, 3, 22, 7, key);
      break;
    }
    case 2: {
      swap(this$static.ep, 0, 11, 6, 8, key);
      swap(this$static.ep, 12, 23, 18, 20, key);
      break;
    }
    case 3: {
      swap(this$static.ep, 4, 5, 6, 7, key);
      swap(this$static.ep, 16, 17, 18, 19, key);
      break;
    }
    case 4: {
      swap(this$static.ep, 1, 20, 5, 21, key);
      swap(this$static.ep, 13, 8, 17, 9, key);
      break;
    }
    case 5: {
      swap(this$static.ep, 2, 9, 4, 10, key);
      swap(this$static.ep, 14, 21, 16, 22, key);
      break;
    }
    case 6: {
      swap(this$static.ep, 0, 1, 2, 3, key);
      swap(this$static.ep, 12, 13, 14, 15, key);
      swap(this$static.ep, 9, 22, 11, 20, key);
      break;
    }
    case 7: {
      swap(this$static.ep, 11, 15, 10, 19, key);
      swap(this$static.ep, 23, 3, 22, 7, key);
      swap(this$static.ep, 2, 16, 6, 12, key);
      break;
    }
    case 8: {
      swap(this$static.ep, 0, 11, 6, 8, key);
      swap(this$static.ep, 12, 23, 18, 20, key);
      swap(this$static.ep, 3, 19, 5, 13, key);
      break;
    }
    case 9: {
      swap(this$static.ep, 4, 5, 6, 7, key);
      swap(this$static.ep, 16, 17, 18, 19, key);
      swap(this$static.ep, 8, 23, 10, 21, key);
      break;
    }
    case 10: {
      swap(this$static.ep, 1, 20, 5, 21, key);
      swap(this$static.ep, 13, 8, 17, 9, key);
      swap(this$static.ep, 14, 0, 18, 4, key);
      break;
    }
    case 11: {
      swap(this$static.ep, 2, 9, 4, 10, key);
      swap(this$static.ep, 14, 21, 16, 22, key);
      swap(this$static.ep, 7, 15, 1, 17, key);
    }
  }
}

function EdgeCube_0() {
  let i_0;
  this.ep = createArray(24);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this.ep[i_0] = i_0;
  }
}

function EdgeCube_1() {
  let i_0;
  let m_0;
  let t;
  EdgeCube_0.call(this);
  for (i_0 = 0; i_0 < 23; ++i_0) {
    t = i_0 + randomUIntBelow(24 - i_0);
    if (t !== i_0) {
      m_0 = this.ep[i_0];
      this.ep[i_0] = this.ep[t];
      this.ep[t] = m_0;
    }
  }
}

defineSeed(159, 1, {}, EdgeCube_0, EdgeCube_1);

let ran$clinit_FullCube_0 = false;
function $clinit_FullCube_0() {
  if (ran$clinit_FullCube_0) {
    return;
  }
  ran$clinit_FullCube_0 = true;
  move2rot = [35, 1, 34, 2, 4, 6, 22, 5, 19];
}

function $$init_3(this$static) {
  this$static.moveBuffer = createArray(60);
}

function $compareTo_1(this$static, c) {
  return this$static.value - c.value;
}

function $copy_4(this$static, c) {
  let i_0;
  $copy_3(this$static.edge, c.edge);
  $copy_1(this$static.center, c.center);
  $copy_2(this$static.corner, c.corner);
  this$static.value = c.value;
  this$static.add1 = c.add1;
  this$static.length1 = c.length1;
  this$static.length2 = c.length2;
  this$static.length3 = c.length3;
  this$static.sym = c.sym;
  for (i_0 = 0; i_0 < 60; ++i_0) {
    this$static.moveBuffer[i_0] = c.moveBuffer[i_0];
  }
  this$static.moveLength = c.moveLength;
  this$static.edgeAvail = c.edgeAvail;
  this$static.centerAvail = c.centerAvail;
  this$static.cornerAvail = c.cornerAvail;
}

function $getCenter(this$static) {
  while (this$static.centerAvail < this$static.moveLength) {
    $move_2(
      this$static.center,
      this$static.moveBuffer[this$static.centerAvail++],
    );
  }
  return this$static.center;
}

function $getCorner(this$static) {
  while (this$static.cornerAvail < this$static.moveLength) {
    $move_3(
      this$static.corner,
      this$static.moveBuffer[this$static.cornerAvail++] % 18,
    );
  }
  return this$static.corner;
}

function $getEdge(this$static) {
  while (this$static.edgeAvail < this$static.moveLength) {
    $move_5(this$static.edge, this$static.moveBuffer[this$static.edgeAvail++]);
  }
  return this$static.edge;
}

function $getMoveString(this$static) {
  let i_0;
  let idx;
  let move;
  let rot;
  let sb;
  let sym;
  const fixedMoves = new Array(
    this$static.moveLength - (this$static.add1 ? 2 : 0),
  );
  idx = 0;
  for (i_0 = 0; i_0 < this$static.length1; ++i_0) {
    fixedMoves[idx++] = this$static.moveBuffer[i_0];
  }
  sym = this$static.sym;
  for (
    i_0 = this$static.length1 + (this$static.add1 ? 2 : 0);
    i_0 < this$static.moveLength;
    ++i_0
  ) {
    if (symmove[sym][this$static.moveBuffer[i_0]] >= 27) {
      fixedMoves[idx++] = symmove[sym][this$static.moveBuffer[i_0]] - 9;
      rot = move2rot[symmove[sym][this$static.moveBuffer[i_0]] - 27];
      sym = symmult[sym][rot];
    } else {
      fixedMoves[idx++] = symmove[sym][this$static.moveBuffer[i_0]];
    }
  }
  const finishSym = symmult[syminv[sym]][getSolvedSym($getCenter(this$static))];
  sb = "";
  sym = finishSym;
  for (i_0 = idx - 1; i_0 >= 0; --i_0) {
    move = fixedMoves[i_0];
    move = ~~(move / 3) * 3 + (2 - (move % 3));
    if (symmove[sym][move] >= 27) {
      sb = `${sb}${move2str_1[symmove[sym][move] - 9]} `;
      rot = move2rot[symmove[sym][move] - 27];
      sym = symmult[sym][rot];
    } else {
      sb = `${sb}${move2str_1[symmove[sym][move]]} `;
    }
  }
  return sb;
}

function $move_6(this$static, m_0) {
  this$static.moveBuffer[this$static.moveLength++] = m_0;
  return;
}

function FullCube_3() {
  $$init_3(this);
  this.edge = new EdgeCube_0();
  this.center = new CenterCube_0();
  this.corner = new CornerCube_0();
}

function FullCube_4(c) {
  FullCube_3.call(this);
  $copy_4(this, c);
}

function FullCube_5() {
  $$init_3(this);
  this.edge = new EdgeCube_1();
  this.center = new CenterCube_1();
  this.corner = new CornerCube_2();
}

defineSeed(
  160,
  1,
  makeCastMap([Q$FullCube_0, Q$Comparable]),
  FullCube_3,
  FullCube_4,
  FullCube_5,
);
_.compareTo$ = function compareTo_1(c) {
  return $compareTo_1(this, c);
};
_.add1 = false;
_.center = null;
_.centerAvail = 0;
_.corner = null;
_.cornerAvail = 0;
_.edge = null;
_.edgeAvail = 0;
_.length1 = 0;
_.length2 = 0;
_.length3 = 0;
_.moveLength = 0;
_.sym = 0;
_.value = 0;
let move2rot;

function $compare(c1, c2) {
  return c2.value - c1.value;
}

function $compare_0(c1, c2) {
  return $compare(c1, c2);
}

function FullCube$ValueComparator_0() {}

defineSeed(161, 1, {}, FullCube$ValueComparator_0);
_.compare = function compare(c1, c2) {
  return $compare_0(c1, c2);
};

let ran$clinit_Moves = false;
function $clinit_Moves() {
  if (ran$clinit_Moves) {
    return;
  }
  ran$clinit_Moves = true;
  let i_0;
  let j;
  move2str_1 = [
    "U  ",
    "U2 ",
    "U' ",
    "R  ",
    "R2 ",
    "R' ",
    "F  ",
    "F2 ",
    "F' ",
    "D  ",
    "D2 ",
    "D' ",
    "L  ",
    "L2 ",
    "L' ",
    "B  ",
    "B2 ",
    "B' ",
    "Uw ",
    "Uw2",
    "Uw'",
    "Rw ",
    "Rw2",
    "Rw'",
    "Fw ",
    "Fw2",
    "Fw'",
    "Dw ",
    "Dw2",
    "Dw'",
    "Lw ",
    "Lw2",
    "Lw'",
    "Bw ",
    "Bw2",
    "Bw'",
  ];
  move2std = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 22,
    23, 25, 28, 30, 31, 32, 34, 36,
  ];
  move3std = [
    0, 1, 2, 4, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 19, 22, 25, 28, 31, 34, 36,
  ];
  std2move = createArray(37);
  std3move = createArray(37);
  ckmv = createArray(37, 36);
  ckmv2_0 = createArray(29, 28);
  ckmv3 = createArray(21, 20);
  skipAxis = createArray(36);
  skipAxis2 = createArray(28);
  skipAxis3 = createArray(20);
  for (i_0 = 0; i_0 < 29; ++i_0) {
    std2move[move2std[i_0]] = i_0;
  }
  for (i_0 = 0; i_0 < 21; ++i_0) {
    std3move[move3std[i_0]] = i_0;
  }
  for (i_0 = 0; i_0 < 36; ++i_0) {
    for (j = 0; j < 36; ++j) {
      ckmv[i_0][j] =
        ~~(i_0 / 3) === ~~(j / 3) ||
        (~~(i_0 / 3) % 3 === ~~(j / 3) % 3 && i_0 > j);
    }
    ckmv[36][i_0] = false;
  }
  for (i_0 = 0; i_0 < 29; ++i_0) {
    for (j = 0; j < 28; ++j) {
      ckmv2_0[i_0][j] = ckmv[move2std[i_0]][move2std[j]];
    }
  }
  for (i_0 = 0; i_0 < 21; ++i_0) {
    for (j = 0; j < 20; ++j) {
      ckmv3[i_0][j] = ckmv[move3std[i_0]][move3std[j]];
    }
  }
  for (i_0 = 0; i_0 < 36; ++i_0) {
    skipAxis[i_0] = 36;
    for (j = i_0; j < 36; ++j) {
      if (!ckmv[i_0][j]) {
        skipAxis[i_0] = j - 1;
        break;
      }
    }
  }
  for (i_0 = 0; i_0 < 28; ++i_0) {
    skipAxis2[i_0] = 28;
    for (j = i_0; j < 28; ++j) {
      if (!ckmv2_0[i_0][j]) {
        skipAxis2[i_0] = j - 1;
        break;
      }
    }
  }
  for (i_0 = 0; i_0 < 20; ++i_0) {
    skipAxis3[i_0] = 20;
    for (j = i_0; j < 20; ++j) {
      if (!ckmv3[i_0][j]) {
        skipAxis3[i_0] = j - 1;
        break;
      }
    }
  }
}

let ckmv;
let ckmv2_0;
let ckmv3;
let move2std;
let move2str_1;
let move3std;
let skipAxis;
let skipAxis2;
let skipAxis3;
let std2move;
let std3move;

function $doSearch(this$static) {
  let MAX_LENGTH2;
  let MAX_LENGTH3;
  let ct;
  let edge;
  let eparity;
  let i_0;
  let index;
  let length12;
  let length123;
  let prun;
  let s2ct;
  let s2rl;
  this$static.solution = "";
  const ud = $getsym(new Center1_1($getCenter(this$static.c), 0));
  const fb = $getsym(new Center1_1($getCenter(this$static.c), 1));
  const rl = $getsym(new Center1_1($getCenter(this$static.c), 2));
  const udprun = csprun[~~ud >> 6];
  const fbprun = csprun[~~fb >> 6];
  const rlprun = csprun[~~rl >> 6];
  this$static.p1SolsCnt = 0;
  this$static.arr2idx = 0;
  $clear(this$static.p1sols.heap);
  for (
    this$static.length1 =
      (udprun < fbprun ? udprun : fbprun) < rlprun
        ? udprun < fbprun
          ? udprun
          : fbprun
        : rlprun;
    this$static.length1 < 100;
    ++this$static.length1
  ) {
    if (
      (rlprun <= this$static.length1 &&
        $search1(
          this$static,
          ~~rl >>> 6,
          rl & 63,
          this$static.length1,
          -1,
          0,
        )) ||
      (udprun <= this$static.length1 &&
        $search1(
          this$static,
          ~~ud >>> 6,
          ud & 63,
          this$static.length1,
          -1,
          0,
        )) ||
      (fbprun <= this$static.length1 &&
        $search1(this$static, ~~fb >>> 6, fb & 63, this$static.length1, -1, 0))
    ) {
      break;
    }
  }
  const p1SolsArr = $toArray_1(
    this$static.p1sols,
    initDim(
      _3Lcs_threephase_FullCube_2_classLit,
      makeCastMap([Q$FullCube_$1, Q$Serializable, Q$Object_$1]),
      Q$FullCube_0,
      0,
      0,
    ),
  );

  p1SolsArr.sort(function (a, b) {
    return a.value - b.value;
  });
  MAX_LENGTH2 = 9;
  do {
    OUT: for (length12 = p1SolsArr[0].value; length12 < 100; ++length12) {
      for (i_0 = 0; i_0 < p1SolsArr.length; ++i_0) {
        if (p1SolsArr[i_0].value > length12) {
          break;
        }
        if (length12 - p1SolsArr[i_0].length1 > MAX_LENGTH2) {
          continue;
        }
        $copy_4(this$static.c1, p1SolsArr[i_0]);
        $set_2(
          this$static.ct2,
          $getCenter(this$static.c1),
          parity_0($getEdge(this$static.c1).ep),
        );
        s2ct = $getct(this$static.ct2);
        s2rl = $getrl(this$static.ct2);
        this$static.length1 = p1SolsArr[i_0].length1;
        this$static.length2 = length12 - p1SolsArr[i_0].length1;
        if ($search2(this$static, s2ct, s2rl, this$static.length2, 28, 0)) {
          break OUT;
        }
      }
    }
    ++MAX_LENGTH2;
  } while (length12 === 100);
  this$static.arr2.sort(function (a, b) {
    return a.value - b.value;
  });
  index = 0;
  MAX_LENGTH3 = 13;
  do {
    OUT2: for (
      length123 = this$static.arr2[0].value;
      length123 < 100;
      ++length123
    ) {
      for (i_0 = 0; i_0 < Math.min(this$static.arr2idx, 100); ++i_0) {
        if (this$static.arr2[i_0].value > length123) {
          break;
        }
        if (
          length123 -
            this$static.arr2[i_0].length1 -
            this$static.arr2[i_0].length2 >
          MAX_LENGTH3
        ) {
          continue;
        }
        eparity = $set_6(this$static.e12, $getEdge(this$static.arr2[i_0]));
        $set_3(
          this$static.ct3,
          $getCenter(this$static.arr2[i_0]),
          eparity ^ parity_0($getCorner(this$static.arr2[i_0]).cp),
        );
        ct = $getct_0(this$static.ct3);
        edge = $get_2(this$static.e12, 10);
        prun = getprun($getsym_0(this$static.e12));
        if (
          prun <=
            length123 -
              this$static.arr2[i_0].length1 -
              this$static.arr2[i_0].length2 &&
          $search3(
            this$static,
            edge,
            ct,
            prun,
            length123 -
              this$static.arr2[i_0].length1 -
              this$static.arr2[i_0].length2,
            20,
            0,
          )
        ) {
          index = i_0;
          break OUT2;
        }
      }
    }
    ++MAX_LENGTH3;
  } while (length123 === 100);
  const solcube = new FullCube_4(this$static.arr2[index]);
  this$static.length1 = solcube.length1;
  this$static.length2 = solcube.length2;
  const length_0 = length123 - this$static.length1 - this$static.length2;
  for (i_0 = 0; i_0 < length_0; ++i_0) {
    $move_6(solcube, move3std[this$static.move3[i_0]]);
  }
  this$static.solution = $getMoveString(solcube);
}

function $init2_0(this$static, sym) {
  let i_0;
  let next;
  $copy_4(this$static.c1, this$static.c);
  for (i_0 = 0; i_0 < this$static.length1; ++i_0) {
    $move_6(this$static.c1, this$static.move1[i_0]);
  }
  switch (finish_0[sym]) {
    case 0: {
      $move_6(this$static.c1, 24);
      $move_6(this$static.c1, 35);
      this$static.move1[this$static.length1] = 24;
      this$static.move1[this$static.length1 + 1] = 35;
      this$static.add1 = true;
      sym = 19;
      break;
    }
    case 12869: {
      $move_6(this$static.c1, 18);
      $move_6(this$static.c1, 29);
      this$static.move1[this$static.length1] = 18;
      this$static.move1[this$static.length1 + 1] = 29;
      this$static.add1 = true;
      sym = 34;
      break;
    }
    case 735470: {
      this$static.add1 = false;
      sym = 0;
    }
  }
  $set_2(
    this$static.ct2,
    $getCenter(this$static.c1),
    parity_0($getEdge(this$static.c1).ep),
  );
  const s2ct = $getct(this$static.ct2);
  const s2rl = $getrl(this$static.ct2);
  const ctp = ctprun[s2ct * 70 + s2rl];
  this$static.c1.value = ctp + this$static.length1;
  this$static.c1.length1 = this$static.length1;
  this$static.c1.add1 = this$static.add1;
  this$static.c1.sym = sym;
  ++this$static.p1SolsCnt;
  if (this$static.p1sols.heap.size < 500) {
    next = new FullCube_4(this$static.c1);
  } else {
    next = $poll(this$static.p1sols);
    next.value > this$static.c1.value && $copy_4(next, this$static.c1);
  }
  $add(this$static.p1sols, next);
  return this$static.p1SolsCnt === 10000;
}

function $init3(this$static) {
  let i_0;
  $copy_4(this$static.c2, this$static.c1);
  for (i_0 = 0; i_0 < this$static.length2; ++i_0) {
    $move_6(this$static.c2, this$static.move2[i_0]);
  }
  if (!$checkEdge($getEdge(this$static.c2))) {
    return false;
  }
  const eparity = $set_6(this$static.e12, $getEdge(this$static.c2));
  $set_3(
    this$static.ct3,
    $getCenter(this$static.c2),
    eparity ^ parity_0($getCorner(this$static.c2).cp),
  );
  const ct = $getct_0(this$static.ct3);
  $get_2(this$static.e12, 10);
  const prun = getprun($getsym_0(this$static.e12));
  !this$static.arr2[this$static.arr2idx]
    ? (this$static.arr2[this$static.arr2idx] = new FullCube_4(this$static.c2))
    : $copy_4(this$static.arr2[this$static.arr2idx], this$static.c2);
  this$static.arr2[this$static.arr2idx].value =
    this$static.length1 + this$static.length2 + Math.max(prun, prun_0[ct]);
  this$static.arr2[this$static.arr2idx].length2 = this$static.length2;
  ++this$static.arr2idx;
  return this$static.arr2idx === this$static.arr2.length;
}

function $randomState(this$static) {
  init_5();
  this$static.c = new FullCube_5();
  $doSearch(this$static);
  return this$static.solution;
}

function $search1(this$static, ct, sym, maxl, lm, depth) {
  let axis;
  let ctx;
  let m_0;
  let power;
  let prun;
  let symx;
  if (ct === 0) {
    return maxl === 0 && $init2_0(this$static, sym);
  }
  for (axis = 0; axis < 27; axis += 3) {
    if (axis === lm || axis === lm - 9 || axis === lm - 18) {
      continue;
    }
    for (power = 0; power < 3; ++power) {
      m_0 = axis + power;
      ctx = ctsmv[ct][symmove[sym][m_0]];
      prun = csprun[~~ctx >>> 6];
      if (prun >= maxl) {
        if (prun > maxl) {
          break;
        }
        continue;
      }
      symx = symmult[sym][ctx & 63];
      ctx >>>= 6;
      this$static.move1[depth] = m_0;
      if ($search1(this$static, ctx, symx, maxl - 1, axis, depth + 1)) {
        return true;
      }
    }
  }
  return false;
}

function $search2(this$static, ct, rl, maxl, lm, depth) {
  let ctx;
  let m_0;
  let prun;
  let rlx;
  if (ct === 0 && ctprun[rl] === 0) {
    return maxl === 0 && $init3(this$static);
  }
  for (m_0 = 0; m_0 < 23; ++m_0) {
    if (ckmv2_0[lm][m_0]) {
      m_0 = skipAxis2[m_0];
      continue;
    }
    ctx = ctmv[ct][m_0];
    rlx = rlmv[rl][m_0];
    prun = ctprun[ctx * 70 + rlx];
    if (prun >= maxl) {
      prun > maxl && (m_0 = skipAxis2[m_0]);
      continue;
    }
    this$static.move2[depth] = move2std[m_0];
    if ($search2(this$static, ctx, rlx, maxl - 1, m_0, depth + 1)) {
      return true;
    }
  }
  return false;
}

function $search3(this$static, edge, ct, prun, maxl, lm, depth) {
  let cord1x;
  let cord2x;
  let ctx;
  let edgex;
  let m_0;
  let prun1;
  let prunx;
  let symcord1x;
  let symx;
  if (maxl === 0) {
    return edge === 0 && ct === 0;
  }
  $set_4(this$static.tempe[depth], edge);
  for (m_0 = 0; m_0 < 17; ++m_0) {
    if (ckmv3[lm][m_0]) {
      m_0 = skipAxis3[m_0];
      continue;
    }
    ctx = ctmove[ct][m_0];
    prun1 = prun_0[ctx];
    if (prun1 >= maxl) {
      prun1 > maxl && m_0 < 14 && (m_0 = skipAxis3[m_0]);
      continue;
    }
    edgex = getmvrot(this$static.tempe[depth].edge, m_0 << 3, 10);
    cord1x = ~~(edgex / 20160);
    symcord1x = raw2sym_1[cord1x];
    symx = symcord1x & 7;
    symcord1x >>= 3;
    cord2x =
      getmvrot(this$static.tempe[depth].edge, (m_0 << 3) | symx, 10) % 20160;
    prunx = getprun_0(symcord1x * 20160 + cord2x, prun);
    if (prunx >= maxl) {
      prunx > maxl && m_0 < 14 && (m_0 = skipAxis3[m_0]);
      continue;
    }
    if ($search3(this$static, edgex, ctx, prunx, maxl - 1, m_0, depth + 1)) {
      this$static.move3[depth] = m_0;
      return true;
    }
  }
  return false;
}

function Search_4() {
  let i_0;
  this.p1sols = new PriorityQueue_0(new FullCube$ValueComparator_0());
  this.move1 = createArray(15);
  this.move2 = createArray(20);
  this.move3 = createArray(20);
  this.c1 = new FullCube_3();
  this.c2 = new FullCube_3();
  this.ct2 = new Center2_0();
  this.ct3 = new Center3_0();
  this.e12 = new Edge3_0();
  this.tempe = createArray(20);
  this.arr2 = createArray(100);
  for (i_0 = 0; i_0 < 20; ++i_0) {
    this.tempe[i_0] = new Edge3_0();
  }
}

function init_5() {
  if (inited_2) {
    return;
  }
  initSym_0();
  raw2sym = createArray(735471);
  initSym2Raw();
  createMoveTable();
  raw2sym = null;
  createPrun();
  init_3();
  init_4();
  initMvrot();
  initRaw2Sym();
  createPrun_0();
  inited_2 = true;
}

defineSeed(163, 1, makeCastMap([Q$Search_0]), Search_4);
_.add1 = false;
_.arr2idx = 0;
_.c = null;
_.length1 = 0;
_.length2 = 0;
_.p1SolsCnt = 0;
_.solution = "";
let inited_2 = false;

let ran$clinit_Util_0 = false;
function $clinit_Util_0() {
  if (ran$clinit_Util_0) {
    return;
  }
  ran$clinit_Util_0 = true;
}

function parity_0(arr) {
  let i_0;
  let j;
  let len;
  let parity;
  parity = 0;
  for (i_0 = 0, len = arr.length; i_0 < len; ++i_0) {
    for (j = i_0; j < len; ++j) {
      arr[i_0] > arr[j] && (parity ^= 1);
    }
  }
  return parity;
}

function swap(arr, a, b, c, d, key) {
  let temp;
  switch (key) {
    case 0: {
      temp = arr[d];
      arr[d] = arr[c];
      arr[c] = arr[b];
      arr[b] = arr[a];
      arr[a] = temp;
      return;
    }
    case 1: {
      temp = arr[a];
      arr[a] = arr[c];
      arr[c] = temp;
      temp = arr[b];
      arr[b] = arr[d];
      arr[d] = temp;
      return;
    }
    case 2: {
      temp = arr[a];
      arr[a] = arr[b];
      arr[b] = arr[c];
      arr[c] = arr[d];
      arr[d] = temp;
      return;
    }
  }
}

function Class_0() {}

function createForArray(packageName, className, seedId, componentType) {
  const clazz = new Class_0();
  clazz.typeName = packageName + className;
  isInstantiable(seedId !== 0 ? -seedId : 0) &&
    setClassLiteral(seedId !== 0 ? -seedId : 0, clazz);
  clazz.modifiers = 4;
  clazz.superclass = Ljava_lang_Object_2_classLit;
  clazz.componentType = componentType;
  return clazz;
}

function createForClass(packageName, className, seedId, superclass) {
  const clazz = new Class_0();
  clazz.typeName = packageName + className;
  isInstantiable(seedId) && setClassLiteral(seedId, clazz);
  clazz.superclass = superclass;
  return clazz;
}

function getSeedFunction(clazz) {
  const func = seedTable[clazz.seedId];
  clazz = null;
  return func;
}

function isInstantiable(seedId) {
  return typeof seedId === "number" && seedId > 0;
}

function setClassLiteral(seedId, clazz) {
  let proto;
  clazz.seedId = seedId;
  if (seedId === 2) {
    proto = String.prototype;
  } else {
    if (seedId > 0) {
      let seed = getSeedFunction(clazz);
      if (seed) {
        proto = seed.prototype;
      } else {
        seed = seedTable[seedId] = function () {};
        seed.___clazz$ = clazz;
        return;
      }
    } else {
      return;
    }
  }
  proto.___clazz$ = clazz;
}

_.val$outerIter = null;

function $add(this$static, o) {
  if ($offer(this$static, o)) {
    return true;
  }
}

function $$init_6(this$static) {
  this$static.array = initDim(
    _3Ljava_lang_Object_2_classLit,
    makeCastMap([Q$Serializable, Q$Object_$1]),
    Q$Object,
    0,
    0,
  );
}

function $add_0(this$static, o) {
  setCheck(this$static.array, this$static.size++, o);
  return true;
}

function $clear(this$static) {
  this$static.array = initDim(
    _3Ljava_lang_Object_2_classLit,
    makeCastMap([Q$Serializable, Q$Object_$1]),
    Q$Object,
    0,
    0,
  );
  this$static.size = 0;
}

function $get_4(this$static, index) {
  return this$static.array[index];
}

function $remove_0(this$static, index) {
  const previous = this$static.array[index];
  splice_0(this$static.array, index, 1);
  --this$static.size;
  return previous;
}

function $set_7(this$static, index, o) {
  const previous = this$static.array[index];
  setCheck(this$static.array, index, o);
  return previous;
}

function $toArray_0(this$static, out) {
  let i_0;
  out.length < this$static.size && (out = createFrom(out, this$static.size));
  for (i_0 = 0; i_0 < this$static.size; ++i_0) {
    setCheck(out, i_0, this$static.array[i_0]);
  }
  out.length > this$static.size && setCheck(out, this$static.size, null);
  return out;
}

function ArrayList_1() {
  $$init_6(this);
  this.array.length = 500;
}

function splice_0(array, index, deleteCount) {
  array.splice(index, deleteCount);
}
_.size = 0;

function binarySearch_0(sortedArray, key) {
  let high;
  let low;
  let mid;
  let midVal;
  low = 0;
  high = sortedArray.length - 1;
  while (low <= high) {
    mid = low + (~~(high - low) >> 1);
    midVal = sortedArray[mid];
    if (midVal < key) {
      low = mid + 1;
    } else if (midVal > key) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return -low - 1;
}

function fill_0(a) {
  fill_1(a, a.length);
}

function fill_1(a, toIndex) {
  let i_0;
  for (i_0 = 0; i_0 < toIndex; ++i_0) {
    a[i_0] = -1;
  }
}

function $mergeHeaps(this$static, node) {
  let smallestChild;
  let leftChild;
  let rightChild;
  let smallestChild_0;
  const heapSize = this$static.heap.size;
  const value = $get_4(this$static.heap, node);
  while (node * 2 + 1 < heapSize) {
    smallestChild =
      ((leftChild = 2 * node + 1),
      (rightChild = leftChild + 1),
      (smallestChild_0 = leftChild),
      rightChild < heapSize &&
        $compare_0(
          $get_4(this$static.heap, rightChild),
          $get_4(this$static.heap, leftChild),
        ) < 0 &&
        (smallestChild_0 = rightChild),
      smallestChild_0);
    if ($compare_0(value, $get_4(this$static.heap, smallestChild)) < 0) {
      break;
    }
    $set_7(this$static.heap, node, $get_4(this$static.heap, smallestChild));
    node = smallestChild;
  }
  $set_7(this$static.heap, node, value);
}

function $offer(this$static, e) {
  let childNode;
  let node;
  node = this$static.heap.size;
  $add_0(this$static.heap, e);
  while (node > 0) {
    childNode = node;
    node = ~~((node - 1) / 2);
    if ($compare_0($get_4(this$static.heap, node), e) <= 0) {
      $set_7(this$static.heap, childNode, e);
      return true;
    }
    $set_7(this$static.heap, childNode, $get_4(this$static.heap, node));
  }
  $set_7(this$static.heap, node, e);
  return true;
}

function $poll(this$static) {
  if (this$static.heap.size === 0) {
    return null;
  }
  const value = $get_4(this$static.heap, 0);
  $removeAtIndex(this$static);
  return value;
}

function $removeAtIndex(this$static) {
  const lastValue = $remove_0(this$static.heap, this$static.heap.size - 1);
  if (0 < this$static.heap.size) {
    $set_7(this$static.heap, 0, lastValue);
    $mergeHeaps(this$static, 0);
  }
}

function $toArray_1(this$static, a) {
  return $toArray_0(this$static.heap, a);
}

function PriorityQueue_0(cmp) {
  this.heap = new ArrayList_1();
  this.cmp = cmp;
}

defineSeed(239, 1, {}, PriorityQueue_0);
_.cmp = null;
_.heap = null;

const Ljava_lang_Object_2_classLit = createForClass(
  "java.lang.",
  "Object",
  1,
  null,
);
const _3Ljava_lang_Object_2_classLit = createForArray(
  "[Ljava.lang.",
  "Object;",
  356,
  Ljava_lang_Object_2_classLit,
);
const Lcs_threephase_FullCube_2_classLit = createForClass(
  "cs.threephase.",
  "FullCube",
  160,
  Ljava_lang_Object_2_classLit,
);
const _3Lcs_threephase_FullCube_2_classLit = createForArray(
  "[Lcs.threephase.",
  "FullCube;",
  381,
  Lcs_threephase_FullCube_2_classLit,
);

let searcher;

let raninit = false;
function init() {
  if (raninit) {
    return;
  }
  raninit = true;
  $clinit_Moves();
  $clinit_Util_0();
  $clinit_Center1();
  $clinit_Center2();
  $clinit_Center3();
  $clinit_Edge3();
  $clinit_CornerCube();
  $clinit_EdgeCube();
  $clinit_FullCube_0();
  searcher = new Search_4();
}

export function initialize(): void {
  init();
  init_5();
}

export async function random444Scramble(): Promise<Alg> {
  init();
  const suffix = Alg.fromString($randomState(searcher));
  return (await rawRandom333Scramble()).concat(suffix);
}
