var $intern_3 = { 3: 1 };
var $intern_9 = 4194303;
var $intern_10 = 1048575;
var $intern_11 = 524288;
var $intern_20 = 65535;
var $intern_26 = { 11: 1, 3: 1 };
var $intern_27 = { 17: 1, 3: 1 };
var $intern_28 = 14540032;
var $intern_29 = 286331153;
var $intern_30 = { 10: 1, 3: 1 };
var _;
var prototypesByTypeId_0 = {};
function typeMarkerFn() {}

function portableObjCreate(obj) {
  function F() {}

  F.prototype = obj || {};
  return new F();
}

function maybeGetClassLiteralFromPlaceHolder_0(entry) {
  return entry instanceof Array ? entry[0] : null;
}

function defineClass(typeId, superTypeId, castableTypeMap) {
  var prototypesByTypeId = prototypesByTypeId_0;
  var createSubclassPrototype = createSubclassPrototype_0;
  var maybeGetClassLiteralFromPlaceHolder =
    maybeGetClassLiteralFromPlaceHolder_0;
  var prototype_0 = prototypesByTypeId[typeId];
  var clazz = maybeGetClassLiteralFromPlaceHolder(prototype_0);
  if (prototype_0 && !clazz) {
    _ = prototype_0;
  } else {
    _ = prototypesByTypeId[typeId] = !superTypeId
      ? {}
      : createSubclassPrototype(superTypeId);
    _.castableTypeMap$ = castableTypeMap;
    _.constructor = _;
    !superTypeId && (_.typeMarker$ = typeMarkerFn);
  }
  for (let i = 3; i < arguments.length; ++i) {
    // biome-ignore lint/style/noArguments: Legacy code
    arguments[i].prototype = _;
  }
  clazz && (_.___clazz$ = clazz);
}

function createSubclassPrototype_0(superTypeId) {
  var prototypesByTypeId = prototypesByTypeId_0;
  return portableObjCreate(prototypesByTypeId[superTypeId]);
}

function Object_0() {}

defineClass(1, null, {}, Object_0);

function narrow_byte(x_0) {
  return (x_0 << 24) >> 24;
}

function Class() {
  this.typeName = null;
  this.simpleName = null;
  this.packageName = null;
  this.compoundName = null;
  this.canonicalName = null;
  this.typeId = null;
  this.arrayLiterals = null;
}

function createClassObject(packageName, compoundClassName) {
  var clazz;
  clazz = new Class();
  clazz.packageName = packageName;
  clazz.compoundName = compoundClassName;
  return clazz;
}

function createForClass(packageName, compoundClassName, typeId) {
  var clazz;
  clazz = createClassObject(packageName, compoundClassName);
  maybeSetClassLiteral(typeId, clazz);
  return clazz;
}

function createForInterface(packageName, compoundClassName) {
  var clazz;
  clazz = createClassObject(packageName, compoundClassName);
  clazz.modifiers = 2;
  return clazz;
}

function createForPrimitive(className, primitiveTypeId) {
  var clazz;
  clazz = createClassObject("", className);
  clazz.typeId = primitiveTypeId;
  clazz.modifiers = 1;
  return clazz;
}

function getClassLiteralForArray_0(leafClass, dimensions) {
  var arrayLiterals = (leafClass.arrayLiterals = leafClass.arrayLiterals || []);
  return (
    arrayLiterals[dimensions] ||
    (arrayLiterals[dimensions] =
      leafClass.createClassLiteralForArray(dimensions))
  );
}

function getPrototypeForClass(clazz) {
  if (clazz.isPrimitive()) {
    return null;
  }
  var typeId = clazz.typeId;
  var prototype_0 = prototypesByTypeId_0[typeId];
  return prototype_0;
}

function maybeSetClassLiteral(typeId, clazz) {
  if (!typeId) {
    return;
  }
  clazz.typeId = typeId;
  var prototype_0 = getPrototypeForClass(clazz);
  if (!prototype_0) {
    prototypesByTypeId_0[typeId] = [clazz];
    return;
  }
  prototype_0.___clazz$ = clazz;
}

defineClass(79, 1, {}, Class);
_.createClassLiteralForArray = function createClassLiteralForArray(dimensions) {
  var clazz;
  clazz = new Class();
  clazz.modifiers = 4;
  dimensions > 1
    ? (clazz.componentType = getClassLiteralForArray_0(this, dimensions - 1))
    : (clazz.componentType = this);
  return clazz;
};
_.isPrimitive = function isPrimitive() {
  return (this.modifiers & 1) !== 0;
};

function getClassLiteralForArray(clazz, dimensions) {
  return getClassLiteralForArray_0(clazz, dimensions);
}

function initDim(
  leafClassLiteral,
  castableTypeMap,
  elementTypeId,
  length_0,
  elementTypeCategory,
  dimensions,
) {
  var result;
  result = initializeArrayElementsWithDefaults(elementTypeCategory, length_0);
  initValues(
    getClassLiteralForArray(leafClassLiteral, dimensions),
    castableTypeMap,
    elementTypeId,
    elementTypeCategory,
    result,
  );
  return result;
}

function initDims(
  leafClassLiteral,
  castableTypeMapExprs,
  elementTypeIds,
  leafElementTypeCategory,
  dimExprs,
  count,
) {
  return initDims_0(
    leafClassLiteral,
    castableTypeMapExprs,
    elementTypeIds,
    leafElementTypeCategory,
    dimExprs,
    0,
    count,
  );
}

function initDims_0(
  leafClassLiteral,
  castableTypeMapExprs,
  elementTypeIds,
  leafElementTypeCategory,
  dimExprs,
  index_0,
  count,
) {
  var elementTypeCategory;
  var i;
  var isLastDim;
  var length_0;
  var result;
  length_0 = dimExprs[index_0];
  isLastDim = index_0 === count - 1;
  elementTypeCategory = isLastDim ? leafElementTypeCategory : 0;
  result = initializeArrayElementsWithDefaults(elementTypeCategory, length_0);
  initValues(
    getClassLiteralForArray(leafClassLiteral, count - index_0),
    castableTypeMapExprs[index_0],
    elementTypeIds[index_0],
    elementTypeCategory,
    result,
  );
  if (!isLastDim) {
    ++index_0;
    for (i = 0; i < length_0; ++i) {
      result[i] = initDims_0(
        leafClassLiteral,
        castableTypeMapExprs,
        elementTypeIds,
        leafElementTypeCategory,
        dimExprs,
        index_0,
        count,
      );
    }
  }
  return result;
}

function initValues(
  arrayClass,
  castableTypeMap,
  elementTypeId,
  elementTypeCategory,
  array,
) {
  array.___clazz$ = arrayClass;
  array.castableTypeMap$ = castableTypeMap;
  array.typeMarker$ = typeMarkerFn;
  array.__elementTypeId$ = elementTypeId;
  array.__elementTypeCategory$ = elementTypeCategory;
  return array;
}

function initializeArrayElementsWithDefaults(elementTypeCategory, length_0) {
  var array = new Array(length_0);
  var initValue;
  switch (elementTypeCategory) {
    case 6: {
      initValue = { l: 0, m: 0, h: 0 };
      break;
    }
    case 7: {
      initValue = 0;
      break;
    }
    case 8: {
      initValue = false;
      break;
    }
    default:
      return array;
  }
  for (var i = 0; i < length_0; ++i) {
    array[i] = initValue;
  }
  return array;
}

function create(value_0) {
  var a0;
  var a1;
  var a2;
  a0 = value_0 & $intern_9;
  a1 = (value_0 >> 22) & $intern_9;
  a2 = value_0 < 0 ? $intern_10 : 0;
  return create0(a0, a1, a2);
}

function create0(l, m, h) {
  return { l: l, m: m, h: h };
}

function add_1(a, b) {
  var sum0;
  var sum1;
  var sum2;
  sum0 = a.l + b.l;
  sum1 = a.m + b.m + (sum0 >> 22);
  sum2 = a.h + b.h + (sum1 >> 22);
  return { l: sum0 & $intern_9, m: sum1 & $intern_9, h: sum2 & $intern_10 };
}

function and(a, b) {
  return { l: a.l & b.l, m: a.m & b.m, h: a.h & b.h };
}

function fromInt(value_0) {
  var rebase;
  var result;
  if (value_0 > -129 && value_0 < 128) {
    rebase = value_0 + 128;
    boxedValues == null &&
      (boxedValues = initDim(
        Lcom_google_gwt_lang_LongLibBase$LongEmul_2_classLit,
        $intern_3,
        293,
        256,
        0,
        1,
      ));
    result = boxedValues[rebase];
    !result && (result = boxedValues[rebase] = create(value_0));
    return result;
  }
  return create(value_0);
}

function gte(a, b) {
  var signa;
  var signb;
  signa = a.h >> 19;
  signb = b.h >> 19;
  return signa === 0
    ? signb !== 0 ||
        a.h > b.h ||
        (a.h === b.h && a.m > b.m) ||
        (a.h === b.h && a.m === b.m && a.l >= b.l)
    : !(
        signb === 0 ||
        a.h < b.h ||
        (a.h === b.h && a.m < b.m) ||
        (a.h === b.h && a.m === b.m && a.l < b.l)
      );
}

function neq(a, b) {
  return a.l !== b.l || a.m !== b.m || a.h !== b.h;
}

function or(a, b) {
  return { l: a.l | b.l, m: a.m | b.m, h: a.h | b.h };
}

function shl(a, n) {
  var res0;
  var res1;
  var res2;
  n &= 63;
  if (n < 22) {
    res0 = a.l << n;
    res1 = (a.m << n) | (a.l >> (22 - n));
    res2 = (a.h << n) | (a.m >> (22 - n));
  } else if (n < 44) {
    res0 = 0;
    res1 = a.l << (n - 22);
    res2 = (a.m << (n - 22)) | (a.l >> (44 - n));
  } else {
    res0 = 0;
    res1 = 0;
    res2 = a.l << (n - 44);
  }
  return { l: res0 & $intern_9, m: res1 & $intern_9, h: res2 & $intern_10 };
}

function shr(a, n) {
  var a2;
  var negative;
  var res0;
  var res1;
  var res2;
  n &= 63;
  a2 = a.h;
  negative = (a2 & $intern_11) !== 0;
  negative && (a2 |= -1048576);
  if (n < 22) {
    res2 = a2 >> n;
    res1 = (a.m >> n) | (a2 << (22 - n));
    res0 = (a.l >> n) | (a.m << (22 - n));
  } else if (n < 44) {
    res2 = negative ? $intern_10 : 0;
    res1 = a2 >> (n - 22);
    res0 = (a.m >> (n - 22)) | (a2 << (44 - n));
  } else {
    res2 = negative ? $intern_10 : 0;
    res1 = negative ? $intern_9 : 0;
    res0 = a2 >> (n - 44);
  }
  return { l: res0 & $intern_9, m: res1 & $intern_9, h: res2 & $intern_10 };
}

function sub_0(a, b) {
  var sum0;
  var sum1;
  var sum2;
  sum0 = a.l - b.l;
  sum1 = a.m - b.m + (sum0 >> 22);
  sum2 = a.h - b.h + (sum1 >> 22);
  return { l: sum0 & $intern_9, m: sum1 & $intern_9, h: sum2 & $intern_10 };
}

function toInt(a) {
  return a.l | (a.m << 22);
}

var boxedValues;

function AbstractStringBuilder(string) {
  this.string = string;
}

function max_0(x_0, y_0) {
  return x_0 > y_0 ? x_0 : y_0;
}

function min_0(x_0, y_0) {
  return x_0 < y_0 ? x_0 : y_0;
}

function $indexOf_0(this$static, str) {
  return this$static.indexOf(str);
}

function _String(value_0) {
  return __valueOf(value_0, 0, value_0.length);
}

function __valueOf(x_0, start_0, end) {
  var s = "";
  for (var batchStart = start_0; batchStart < end; ) {
    var batchEnd = Math.min(batchStart + 10000, end);
    s += String.fromCharCode.apply(null, x_0.slice(batchStart, batchEnd));
    batchStart = batchEnd;
  }
  return s;
}

function fromCodePoint(codePoint) {
  return String.fromCharCode(codePoint & $intern_20);
}

var Ljava_lang_String_2_classLit = createForClass("java.lang", "String", 2);

function $append(this$static) {
  this$static.string += " ";
  return this$static;
}

function $append_1(this$static, x_0) {
  this$static.string += x_0;
  return this$static;
}

function StringBuffer() {
  AbstractStringBuilder.call(this, "");
}

function equals_7(array1, array2) {
  var i;
  if (array1 === array2) {
    return true;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  for (i = 0; i < array1.length; ++i) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

let $clinit_CoordCube_ran = false;
function $clinit_CoordCube() {
  if ($clinit_CoordCube_ran) {
    return;
  }
  $clinit_CoordCube_ran = true;
  UDSliceMove = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [495, 18],
    2,
  );
  TwistMove = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [324, 18],
    2,
  );
  FlipMove = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [336, 18],
    2,
  );
  UDSliceConj = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [495, 8],
    2,
  );
  UDSliceTwistPrun = initDim(I_classLit, $intern_27, 0, 20048, 7, 1);
  UDSliceFlipPrun = initDim(I_classLit, $intern_27, 0, 20791, 7, 1);
  TwistFlipPrun = initDim(I_classLit, $intern_27, 0, 82945, 7, 1);
  CPermMove = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [2768, 10],
    2,
  );
  EPermMove = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [2768, 10],
    2,
  );
  MPermMove = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [24, 10],
    2,
  );
  MPermConj = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [24, 16],
    2,
  );
  CCombPConj = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [140, 16],
    2,
  );
  MCPermPrun = initDim(I_classLit, $intern_27, 0, 8305, 7, 1);
  EPermCCombPPrun = initDim(I_classLit, $intern_27, 0, 48441, 7, 1);
}

function $doMovePrun(this$static, cc, m) {
  this$static.slice_0 = UDSliceMove[cc.slice_0][m];
  this$static.flip =
    FlipMove[cc.flip][($clinit_CubieCube(), Sym8Move)[(m << 3) | cc.fsym]];
  this$static.fsym = (this$static.flip & 7) ^ cc.fsym;
  this$static.flip >>= 3;
  this$static.twist = TwistMove[cc.twist][Sym8Move[(m << 3) | cc.tsym]];
  this$static.tsym = (this$static.twist & 7) ^ cc.tsym;
  this$static.twist >>= 3;
  this$static.prun = max_0(
    max_0(
      getPruning(
        UDSliceTwistPrun,
        this$static.twist * 495 +
          UDSliceConj[this$static.slice_0][this$static.tsym],
      ),
      getPruning(
        UDSliceFlipPrun,
        this$static.flip * 495 +
          UDSliceConj[this$static.slice_0][this$static.fsym],
      ),
    ),
    getPruning(
      TwistFlipPrun,
      (this$static.twist << 11) |
        FlipS2RF[
          (this$static.flip << 3) | (this$static.fsym ^ this$static.tsym)
        ],
    ),
  );
  return this$static.prun;
}

function $doMovePrunConj(this$static, cc, m) {
  m = ($clinit_CubieCube(), SymMove_0)[3][m];
  this$static.flipc =
    FlipMove[cc.flipc >> 3][Sym8Move[(m << 3) | (cc.flipc & 7)]] ^
    (cc.flipc & 7);
  this$static.twistc =
    TwistMove[cc.twistc >> 3][Sym8Move[(m << 3) | (cc.twistc & 7)]] ^
    (cc.twistc & 7);
  return getPruning(
    TwistFlipPrun,
    ((this$static.twistc >> 3) << 11) |
      FlipS2RF[this$static.flipc ^ (this$static.twistc & 7)],
  );
}

function $setWithPrun(this$static, cc, depth) {
  var pc;
  this$static.twist = ($clinit_CubieCube(), TwistR2S)[$getTwist(cc)];
  this$static.flip = FlipR2S[$getFlip(cc)];
  this$static.tsym = this$static.twist & 7;
  this$static.twist = this$static.twist >> 3;
  this$static.prun = getPruning(
    TwistFlipPrun,
    (this$static.twist << 11) | FlipS2RF[this$static.flip ^ this$static.tsym],
  );
  if (this$static.prun > depth) {
    return false;
  }
  this$static.fsym = this$static.flip & 7;
  this$static.flip = this$static.flip >> 3;
  this$static.slice_0 = 494 - getComb(cc.ea, 8, true);
  this$static.prun = max_0(
    this$static.prun,
    max_0(
      getPruning(
        UDSliceTwistPrun,
        this$static.twist * 495 +
          UDSliceConj[this$static.slice_0][this$static.tsym],
      ),
      getPruning(
        UDSliceFlipPrun,
        this$static.flip * 495 +
          UDSliceConj[this$static.slice_0][this$static.fsym],
      ),
    ),
  );
  if (this$static.prun > depth) {
    return false;
  }
  pc = new CubieCube();
  CornConjugate(cc, 1, pc);
  EdgeConjugate(cc, 1, pc);
  this$static.twistc = TwistR2S[$getTwist(pc)];
  this$static.flipc = FlipR2S[$getFlip(pc)];
  this$static.prun = max_0(
    this$static.prun,
    getPruning(
      TwistFlipPrun,
      ((this$static.twistc >> 3) << 11) |
        FlipS2RF[this$static.flipc ^ (this$static.twistc & 7)],
    ),
  );
  return this$static.prun <= depth;
}

function CoordCube() {
  $clinit_CoordCube();
}

function getPruning(table, index_0) {
  $clinit_CoordCube();
  return (table[index_0 >> 3] >> (index_0 << 2)) & 15;
}

function init_0(fullInit) {
  $clinit_CoordCube();
  if (initLevel === 2 || (initLevel === 1 && !fullInit)) {
    return;
  }
  if (initLevel === 0) {
    initPermSym2Raw();
    initCPermMove();
    initEPermMove();
    initMPermMoveConj();
    initCombPMoveConj();
    $clinit_CubieCube();
    initSym2Raw(
      2048,
      FlipS2R,
      FlipR2S,
      (SymStateFlip = initDim(C_classLit, $intern_26, 0, 336, 7, 1)),
      0,
    );
    initSym2Raw(
      2187,
      TwistS2R,
      TwistR2S,
      (SymStateTwist = initDim(C_classLit, $intern_26, 0, 324, 7, 1)),
      1,
    );
    initFlipMove();
    initTwistMove();
    initUDSliceMoveConj();
  }
  initRawSymPrun(
    MCPermPrun,
    MPermMove,
    MPermConj,
    CPermMove,
    ($clinit_CubieCube(), SymStatePerm),
    584244,
    fullInit,
  );
  initRawSymPrun(
    EPermCCombPPrun,
    CCombPMove,
    CCombPConj,
    EPermMove,
    SymStatePerm,
    514084,
    fullInit,
  );
  initRawSymPrun(
    UDSliceTwistPrun,
    UDSliceMove,
    UDSliceConj,
    TwistMove,
    SymStateTwist,
    431619,
    fullInit,
  );
  initRawSymPrun(
    UDSliceFlipPrun,
    UDSliceMove,
    UDSliceConj,
    FlipMove,
    SymStateFlip,
    431619,
    fullInit,
  );
  initRawSymPrun(
    TwistFlipPrun,
    null,
    null,
    TwistMove,
    SymStateTwist,
    103939,
    fullInit,
  );
  initLevel = fullInit ? 2 : 1;
}

function initCPermMove() {
  var c;
  var d;
  var i;
  var j;
  c = new CubieCube();
  d = new CubieCube();
  for (i = 0; i < 2768; i++) {
    $setCPerm(c, ($clinit_CubieCube(), EPermS2R)[i]);
    for (j = 0; j < 10; j++) {
      CornMult(c, moveCube[($clinit_Util(), ud2std)[j]], d);
      CPermMove[i][j] =
        ESym2CSym(EPermR2S[getNPerm(d.ca, 8, false)]) & $intern_20;
    }
  }
}

function initCombPMoveConj() {
  var c;
  var d;
  var i;
  var j;
  var j0;
  c = new CubieCube();
  d = new CubieCube();
  CCombPMove = initDims(
    C_classLit,
    [$intern_3, $intern_26],
    [11, 0],
    7,
    [140, 10],
    2,
  );
  for (i = 0; i < 140; i++) {
    setComb(c.ca, i % 70, 0, false);
    for (j0 = 0; j0 < 10; j0++) {
      CornMult(
        c,
        ($clinit_CubieCube(), moveCube)[($clinit_Util(), ud2std)[j0]],
        d,
      );
      CCombPMove[i][j0] =
        (getComb(d.ca, 0, false) + 70 * (((165 >> j0) & 1) ^ ~~(i / 70))) &
        $intern_20;
    }
    for (j = 0; j < 16; j++) {
      CornConjugate(c, ($clinit_CubieCube(), SymMultInv)[0][j], d);
      CCombPConj[i][j] =
        (getComb(d.ca, 0, false) + 70 * ~~(i / 70)) & $intern_20;
    }
  }
}

function initEPermMove() {
  var c;
  var d;
  var i;
  var j;
  c = new CubieCube();
  d = new CubieCube();
  for (i = 0; i < 2768; i++) {
    $setEPerm(c, ($clinit_CubieCube(), EPermS2R)[i]);
    for (j = 0; j < 10; j++) {
      EdgeMult(c, moveCube[($clinit_Util(), ud2std)[j]], d);
      EPermMove[i][j] = EPermR2S[getNPerm(d.ea, 8, true)];
    }
  }
}

function initFlipMove() {
  var c;
  var d;
  var i;
  var j;
  c = new CubieCube();
  d = new CubieCube();
  for (i = 0; i < 336; i++) {
    $setFlip(c, ($clinit_CubieCube(), FlipS2R)[i]);
    for (j = 0; j < 18; j++) {
      EdgeMult(c, moveCube[j], d);
      FlipMove[i][j] = FlipR2S[$getFlip(d)];
    }
  }
}

function initMPermMoveConj() {
  var c;
  var d;
  var i;
  var j;
  var j0;
  c = new CubieCube();
  d = new CubieCube();
  for (i = 0; i < 24; i++) {
    setNPerm(c.ea, i, 12, true);
    for (j0 = 0; j0 < 10; j0++) {
      EdgeMult(
        c,
        ($clinit_CubieCube(), moveCube)[($clinit_Util(), ud2std)[j0]],
        d,
      );
      MPermMove[i][j0] = (getNPerm(d.ea, 12, true) % 24) & $intern_20;
    }
    for (j = 0; j < 16; j++) {
      EdgeConjugate(c, ($clinit_CubieCube(), SymMultInv)[0][j], d);
      MPermConj[i][j] = (getNPerm(d.ea, 12, true) % 24) & $intern_20;
    }
  }
}

function initRawSymPrun(
  PrunTable,
  RawMove,
  RawConj,
  SymMove,
  SymState,
  PrunFlag,
  fullInit,
) {
  var INV_DEPTH;
  var ISTFP;
  var IS_PHASE2;
  var MAX_DEPTH;
  var MIN_DEPTH;
  var NEXT_AXIS_MAGIC;
  var N_MOVES;
  var N_RAW;
  var N_SIZE;
  var SEARCH_DEPTH;
  var SYM_E2C_MAGIC;
  var SYM_MASK;
  var SYM_SHIFT;
  var check;
  var depth;
  var flip;
  var fsym;
  var i;
  var i0;
  var idx;
  var idxx;
  var inv;
  var j;
  var m;
  var mask;
  var prun;
  var raw;
  var rawx;
  var selArrMask;
  var select;
  var sym;
  var symState;
  var symx;
  var val;
  var val0;
  var xorVal;
  SYM_SHIFT = PrunFlag & 15;
  SYM_E2C_MAGIC = ((PrunFlag >> 4) & 1) === 1 ? $intern_28 : 0;
  IS_PHASE2 = ((PrunFlag >> 5) & 1) === 1;
  INV_DEPTH = (PrunFlag >> 8) & 15;
  MAX_DEPTH = (PrunFlag >> 12) & 15;
  MIN_DEPTH = (PrunFlag >> 16) & 15;
  SEARCH_DEPTH = fullInit ? MAX_DEPTH : MIN_DEPTH;
  SYM_MASK = (1 << SYM_SHIFT) - 1;
  ISTFP = RawMove === null;
  N_RAW = ISTFP ? 2048 : RawMove.length;
  N_SIZE = N_RAW * SymMove.length;
  N_MOVES = IS_PHASE2 ? 10 : 18;
  NEXT_AXIS_MAGIC = N_MOVES === 10 ? 66 : 599186;
  depth = ((PrunTable[N_SIZE >> 3] >> (N_SIZE << 2)) & 15) - 1;

  if (depth === -1) {
    for (i = 0; i < ~~(N_SIZE / 8) + 1; i++) {
      PrunTable[i] = $intern_29;
    }
    PrunTable[0] ^= 1;
    depth = 0;
  }
  while (depth < SEARCH_DEPTH) {
    mask = ((depth + 1) * $intern_29) ^ -1;
    for (i0 = 0; i0 < PrunTable.length; i0++) {
      val0 = PrunTable[i0] ^ mask;
      val0 &= val0 >> 1;
      PrunTable[i0] += val0 & (val0 >> 2) & $intern_29;
    }
    inv = depth > INV_DEPTH;
    select = inv ? depth + 2 : depth;
    selArrMask = select * $intern_29;
    check = inv ? depth : depth + 2;
    ++depth;
    xorVal = depth ^ (depth + 1);
    val = 0;
    for (i = 0; i < N_SIZE; ++i, val >>= 4) {
      if ((i & 7) === 0) {
        val = PrunTable[i >> 3];
        if (
          (((val ^ selArrMask) - $intern_29) &
            ~(val ^ selArrMask) &
            -2004318072) ===
          0
        ) {
          i += 7;
          continue;
        }
      }
      if ((val & 15) !== select) {
        continue;
      }
      raw = i % N_RAW;
      sym = ~~(i / N_RAW);
      flip = 0;
      fsym = 0;
      if (ISTFP) {
        flip = ($clinit_CubieCube(), FlipR2S)[raw];
        fsym = flip & 7;
        flip >>= 3;
      }
      for (m = 0; m < N_MOVES; m++) {
        symx = SymMove[sym][m];
        ISTFP
          ? (rawx = ($clinit_CubieCube(), FlipS2RF)[
              FlipMove[flip][Sym8Move[(m << 3) | fsym]] ^
                fsym ^
                (symx & SYM_MASK)
            ])
          : (rawx = RawConj[RawMove[raw][m]][symx & SYM_MASK]);
        symx >>= SYM_SHIFT;
        idx = symx * N_RAW + rawx;
        prun = (PrunTable[idx >> 3] >> (idx << 2)) & 15;
        if (prun !== check) {
          prun < depth - 1 && (m += (NEXT_AXIS_MAGIC >> m) & 3);
          continue;
        }
        if (inv) {
          PrunTable[i >> 3] ^= xorVal << (i << 2);
          break;
        }
        PrunTable[idx >> 3] ^= xorVal << (idx << 2);
        for (j = 1, symState = SymState[symx]; (symState >>= 1) !== 0; j++) {
          if ((symState & 1) !== 1) {
            continue;
          }
          idxx = symx * N_RAW;
          ISTFP
            ? (idxx += ($clinit_CubieCube(), FlipS2RF)[FlipR2S[rawx] ^ j])
            : (idxx += RawConj[rawx][j ^ ((SYM_E2C_MAGIC >> (j << 1)) & 3)]);
          if (((PrunTable[idxx >> 3] >> (idxx << 2)) & 15) === check) {
            PrunTable[idxx >> 3] ^= xorVal << (idxx << 2);
          }
        }
      }
    }
  }
}

function initTwistMove() {
  var c;
  var d;
  var i;
  var j;
  c = new CubieCube();
  d = new CubieCube();
  for (i = 0; i < 324; i++) {
    $setTwist(c, ($clinit_CubieCube(), TwistS2R)[i]);
    for (j = 0; j < 18; j++) {
      CornMult(c, moveCube[j], d);
      TwistMove[i][j] = TwistR2S[$getTwist(d)];
    }
  }
}

function initUDSliceMoveConj() {
  var c;
  var d;
  var i;
  var i0;
  var j;
  var j0;
  var k;
  var udslice;
  c = new CubieCube();
  d = new CubieCube();
  for (i0 = 0; i0 < 495; i0++) {
    setComb(c.ea, 494 - i0, 8, true);
    for (j0 = 0; j0 < 18; j0 += 3) {
      EdgeMult(c, ($clinit_CubieCube(), moveCube)[j0], d);
      UDSliceMove[i0][j0] = (494 - getComb(d.ea, 8, true)) & $intern_20;
    }
    for (j = 0; j < 16; j += 2) {
      EdgeConjugate(c, ($clinit_CubieCube(), SymMultInv)[0][j], d);
      UDSliceConj[i0][j >> 1] = (494 - getComb(d.ea, 8, true)) & $intern_20;
    }
  }
  for (i = 0; i < 495; i++) {
    for (j = 0; j < 18; j += 3) {
      udslice = UDSliceMove[i][j];
      for (k = 1; k < 3; k++) {
        udslice = UDSliceMove[udslice][j];
        UDSliceMove[i][j + k] = udslice & $intern_20;
      }
    }
  }
}

defineClass(31, 1, { 31: 1 }, CoordCube);
_.flip = 0;
_.flipc = 0;
_.fsym = 0;
_.prun = 0;
_.slice_0 = 0;
_.tsym = 0;
_.twist = 0;
_.twistc = 0;
var CCombPConj;
var CCombPMove;
var CPermMove;
var EPermCCombPPrun;
var EPermMove;
var FlipMove;
var MCPermPrun;
var MPermConj;
var MPermMove;
var TwistFlipPrun;
var TwistMove;
var UDSliceConj;
var UDSliceFlipPrun;
var UDSliceMove;
var UDSliceTwistPrun;
var initLevel = 0;
var Lorg_cubing_min2phase_client_CoordCube_2_classLit = createForClass(
  "org.cubing.min2phase.client",
  "CoordCube",
  31,
);
let $clinit_CubieCube_ran = false;
function $clinit_CubieCube() {
  if ($clinit_CubieCube_ran) {
    return;
  }
  $clinit_CubieCube_ran = true;
  CubeSym = initDim(
    Lorg_cubing_min2phase_client_CubieCube_2_classLit,
    $intern_3,
    7,
    16,
    0,
    1,
  );
  moveCube = initDim(
    Lorg_cubing_min2phase_client_CubieCube_2_classLit,
    $intern_3,
    7,
    18,
    0,
    1,
  );
  moveCubeSym = initDim(J_classLit, $intern_3, 0, 18, 6, 1);
  firstMoveSym = initDim(I_classLit, $intern_27, 0, 48, 7, 1);
  SymMult = initDims(
    I_classLit,
    [$intern_3, $intern_27],
    [17, 0],
    7,
    [16, 16],
    2,
  );
  SymMultInv = initDims(
    I_classLit,
    [$intern_3, $intern_27],
    [17, 0],
    7,
    [16, 16],
    2,
  );
  SymMove_0 = initDims(
    I_classLit,
    [$intern_3, $intern_27],
    [17, 0],
    7,
    [16, 18],
    2,
  );
  Sym8Move = initDim(I_classLit, $intern_27, 0, 144, 7, 1);
  SymMoveUD = initDims(
    I_classLit,
    [$intern_3, $intern_27],
    [17, 0],
    7,
    [16, 18],
    2,
  );
  FlipS2R = initDim(C_classLit, $intern_26, 0, 336, 7, 1);
  TwistS2R = initDim(C_classLit, $intern_26, 0, 324, 7, 1);
  EPermS2R = initDim(C_classLit, $intern_26, 0, 2768, 7, 1);
  Perm2CombP = initDim(B_classLit, $intern_30, 0, 2768, 7, 1);
  PermInvEdgeSym = initDim(C_classLit, $intern_26, 0, 2768, 7, 1);
  MPermInv = initDim(B_classLit, $intern_30, 0, 24, 7, 1);
  FlipR2S = initDim(C_classLit, $intern_26, 0, 2048, 7, 1);
  TwistR2S = initDim(C_classLit, $intern_26, 0, 2187, 7, 1);
  EPermR2S = initDim(C_classLit, $intern_26, 0, 40320, 7, 1);
  FlipS2RF = initDim(C_classLit, $intern_26, 0, 2688, 7, 1);
  urf1 = new CubieCube_0(2531, 1373, 67026819, 1367);
  urf2 = new CubieCube_0(2089, 1906, 322752913, 2040);
  urfMove = initValues(
    getClassLiteralForArray(B_classLit, 2),
    $intern_3,
    10,
    0,
    [
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [6, 7, 8, 0, 1, 2, 3, 4, 5, 15, 16, 17, 9, 10, 11, 12, 13, 14],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [3, 4, 5, 6, 7, 8, 0, 1, 2, 12, 13, 14, 15, 16, 17, 9, 10, 11],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [2, 1, 0, 5, 4, 3, 8, 7, 6, 11, 10, 9, 14, 13, 12, 17, 16, 15],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [8, 7, 6, 2, 1, 0, 5, 4, 3, 17, 16, 15, 11, 10, 9, 14, 13, 12],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [5, 4, 3, 8, 7, 6, 2, 1, 0, 14, 13, 12, 17, 16, 15, 11, 10, 9],
      ),
    ],
  );
  initMove();
  initSym();
}

function $$init(this$static) {
  this$static.ca = initValues(
    getClassLiteralForArray(B_classLit, 1),
    $intern_30,
    0,
    7,
    [0, 1, 2, 3, 4, 5, 6, 7],
  );
  this$static.ea = initValues(
    getClassLiteralForArray(B_classLit, 1),
    $intern_30,
    0,
    7,
    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
  );
}

function $URFConjugate(this$static) {
  !this$static.temps && (this$static.temps = new CubieCube());
  CornMult(urf2, this$static, this$static.temps);
  CornMult(this$static.temps, urf1, this$static);
  EdgeMult(urf2, this$static, this$static.temps);
  EdgeMult(this$static.temps, urf1, this$static);
}

function $copy(this$static, c) {
  var i;
  var i0;
  for (i0 = 0; i0 < 8; i0++) {
    this$static.ca[i0] = c.ca[i0];
  }
  for (i = 0; i < 12; i++) {
    this$static.ea[i] = c.ea[i];
  }
}

function $getCPermSym(this$static) {
  return ESym2CSym(EPermR2S[getNPerm(this$static.ca, 8, false)]);
}

function $getEPermSym(this$static) {
  return EPermR2S[getNPerm(this$static.ea, 8, true)];
}

function $getFlip(this$static) {
  var i;
  var idx;
  idx = 0;
  for (i = 0; i < 11; i++) {
    idx = (idx << 1) | (this$static.ea[i] & 1);
  }
  return idx;
}

function $getTwist(this$static) {
  var i;
  var idx;
  idx = 0;
  for (i = 0; i < 7; i++) {
    idx += (idx << 1) + (this$static.ca[i] >> 3);
  }
  return idx;
}

function $invCubieCube(this$static) {
  var corn;
  var edge;
  !this$static.temps && (this$static.temps = new CubieCube());
  for (edge = 0; edge < 12; edge++) {
    this$static.temps.ea[this$static.ea[edge] >> 1] =
      (((edge << 1) | (this$static.ea[edge] & 1)) << 24) >> 24;
  }
  for (corn = 0; corn < 8; corn++) {
    this$static.temps.ca[this$static.ca[corn] & 7] =
      ((corn | ((32 >> (this$static.ca[corn] >> 3)) & 24)) << 24) >> 24;
  }
  $copy(this$static, this$static.temps);
}

function $selfSymmetry(this$static) {
  var c;
  var cperm;
  var cpermx;
  var d;
  var i;
  var sym;
  var urfInv;
  c = new CubieCube_1(this$static);
  d = new CubieCube();
  cperm = ESym2CSym(EPermR2S[getNPerm(c.ca, 8, false)]) >> 4;
  sym = { l: 0, m: 0, h: 0 };
  for (urfInv = 0; urfInv < 6; urfInv++) {
    cpermx = ESym2CSym(EPermR2S[getNPerm(c.ca, 8, false)]) >> 4;
    if (cperm === cpermx) {
      for (i = 0; i < 16; i++) {
        CornConjugate(c, SymMultInv[0][i], d);
        if (equals_7(d.ca, this$static.ca)) {
          EdgeConjugate(c, SymMultInv[0][i], d);
          equals_7(d.ea, this$static.ea) &&
            (sym = or(
              sym,
              shl(
                { l: 1, m: 0, h: 0 },
                ((urfInv << 4) | i) < 48 ? (urfInv << 4) | i : 48,
              ),
            ));
        }
      }
    }
    $URFConjugate(c);
    urfInv % 3 === 2 && $invCubieCube(c);
  }
  return sym;
}

function $setCPerm(this$static, idx) {
  setNPerm(this$static.ca, idx, 8, false);
}

function $setEPerm(this$static, idx) {
  setNPerm(this$static.ea, idx, 8, true);
}

function $setFlip(this$static, idx) {
  var i;
  var parity;
  var val;
  parity = 0;
  for (i = 10; i >= 0; --i, idx >>= 1) {
    parity ^= val = idx & 1;
    this$static.ea[i] = (((this$static.ea[i] & -2) | val) << 24) >> 24;
  }
  this$static.ea[11] = (((this$static.ea[11] & -2) | parity) << 24) >> 24;
}

function $setTwist(this$static, idx) {
  var i;
  var twst;
  var val;
  twst = 15;
  for (i = 6; i >= 0; --i, idx = ~~(idx / 3)) {
    twst -= val = idx % 3;
    this$static.ca[i] = (((this$static.ca[i] & 7) | (val << 3)) << 24) >> 24;
  }
  this$static.ca[7] =
    (((this$static.ca[7] & 7) | ((twst % 3) << 3)) << 24) >> 24;
}

function $verify(this$static) {
  var c;
  var cornMask;
  var e;
  var edgeMask;
  var sum;
  sum = 0;
  edgeMask = 0;
  for (e = 0; e < 12; e++) {
    edgeMask |= 1 << (this$static.ea[e] >> 1);
    sum ^= this$static.ea[e] & 1;
  }
  if (edgeMask !== 4095) {
    return -2;
  }
  if (sum !== 0) {
    return -3;
  }
  cornMask = 0;
  sum = 0;
  for (c = 0; c < 8; c++) {
    cornMask |= 1 << (this$static.ca[c] & 7);
    sum += this$static.ca[c] >> 3;
  }
  if (cornMask !== 255) {
    return -4;
  }
  if (sum % 3 !== 0) {
    return -5;
  }
  if (
    (getNParity(getNPerm(this$static.ea, 12, true), 12) ^
      getNParity(getNPerm(this$static.ca, 8, false), 8)) !==
    0
  ) {
    return -6;
  }
  return 0;
}

function CornConjugate(a, idx, b) {
  $clinit_CubieCube();
  var corn;
  var ori;
  var oriA;
  var oriB;
  var s;
  var sinv;
  sinv = CubeSym[SymMultInv[0][idx]];
  s = CubeSym[idx];
  for (corn = 0; corn < 8; corn++) {
    oriA = sinv.ca[a.ca[s.ca[corn] & 7] & 7] >> 3;
    oriB = a.ca[s.ca[corn] & 7] >> 3;
    ori = oriA < 3 ? oriB : (3 - oriB) % 3;
    b.ca[corn] =
      (((sinv.ca[a.ca[s.ca[corn] & 7] & 7] & 7) | (ori << 3)) << 24) >> 24;
  }
}

function CornMult(a, b, prod) {
  $clinit_CubieCube();
  var corn;
  var oriA;
  var oriB;
  for (corn = 0; corn < 8; corn++) {
    oriA = a.ca[b.ca[corn] & 7] >> 3;
    oriB = b.ca[corn] >> 3;
    prod.ca[corn] =
      (((a.ca[b.ca[corn] & 7] & 7) | (((oriA + oriB) % 3) << 3)) << 24) >> 24;
  }
}

function CornMultFull(a, b, prod) {
  var corn;
  var ori;
  var oriA;
  var oriB;
  for (corn = 0; corn < 8; corn++) {
    oriA = a.ca[b.ca[corn] & 7] >> 3;
    oriB = b.ca[corn] >> 3;
    ori = oriA + (oriA < 3 ? oriB : 6 - oriB);
    ori = (ori % 3) + (oriA < 3 === oriB < 3 ? 0 : 3);
    prod.ca[corn] = (((a.ca[b.ca[corn] & 7] & 7) | (ori << 3)) << 24) >> 24;
  }
}

function CubieCube() {
  $clinit_CubieCube();
  $$init(this);
}

function CubieCube_0(cperm, twist, eperm, flip) {
  $$init(this);
  setNPerm(this.ca, cperm, 8, false);
  $setTwist(this, twist);
  setNPerm(this.ea, eperm, 12, true);
  $setFlip(this, flip);
}

function CubieCube_1(c) {
  $$init(this);
  $copy(this, c);
}

function ESym2CSym(idx) {
  $clinit_CubieCube();
  return idx ^ (($intern_28 >> ((idx & 15) << 1)) & 3);
}

function EdgeConjugate(a, idx, b) {
  $clinit_CubieCube();
  var ed;
  var s;
  var sinv;
  sinv = CubeSym[SymMultInv[0][idx]];
  s = CubeSym[idx];
  for (ed = 0; ed < 12; ed++) {
    b.ea[ed] =
      ((sinv.ea[a.ea[s.ea[ed] >> 1] >> 1] ^
        (a.ea[s.ea[ed] >> 1] & 1) ^
        (s.ea[ed] & 1)) <<
        24) >>
      24;
  }
}

function EdgeMult(a, b, prod) {
  $clinit_CubieCube();
  var ed;
  for (ed = 0; ed < 12; ed++) {
    prod.ea[ed] = ((a.ea[b.ea[ed] >> 1] ^ (b.ea[ed] & 1)) << 24) >> 24;
  }
}

function getPermSymInv(idx, sym, isCorner) {
  $clinit_CubieCube();
  var idxi;
  idxi = PermInvEdgeSym[idx];
  isCorner && (idxi = idxi ^ (($intern_28 >> ((idxi & 15) << 1)) & 3));
  return (idxi & 65520) | SymMult[idxi & 15][sym];
}

function getSkipMoves() {
  $clinit_CubieCube();
  // var i, ret;
  // ret = 0;
  // for (i = 1; neq((ssym = shr(ssym, 1)), { l: 0, m: 0, h: 0 }); i++) {
  //   eq(and(ssym, { l: 1, m: 0, h: 0 }), { l: 1, m: 0, h: 0 }) &&
  //     (ret |= firstMoveSym[i]);
  // }
  return 0;
}

function initMove() {
  var a;
  var p;
  moveCube[0] = new CubieCube_0(15120, 0, 119750400, 0);
  moveCube[3] = new CubieCube_0(21021, 1494, 323403417, 0);
  moveCube[6] = new CubieCube_0(8064, 1236, 29441808, 550);
  moveCube[9] = new CubieCube_0(9, 0, 5880, 0);
  moveCube[12] = new CubieCube_0(1230, 412, 2949660, 0);
  moveCube[15] = new CubieCube_0(224, 137, 328552, 137);
  for (a = 0; a < 18; a += 3) {
    for (p = 0; p < 2; p++) {
      moveCube[a + p + 1] = new CubieCube();
      EdgeMult(moveCube[a + p], moveCube[a], moveCube[a + p + 1]);
      CornMult(moveCube[a + p], moveCube[a], moveCube[a + p + 1]);
    }
  }
}

function initPermSym2Raw() {
  $clinit_CubieCube();
  var cc;
  var i;
  var i0;
  initSym2Raw(
    40320,
    EPermS2R,
    EPermR2S,
    (SymStatePerm = initDim(C_classLit, $intern_26, 0, 2768, 7, 1)),
    2,
  );
  cc = new CubieCube();
  for (i0 = 0; i0 < 2768; i0++) {
    $setEPerm(cc, EPermS2R[i0]);
    Perm2CombP[i0] =
      ((getComb(cc.ea, 0, true) + getNParity(EPermS2R[i0], 8) * 70) << 24) >>
      24;
    $invCubieCube(cc);
    PermInvEdgeSym[i0] = EPermR2S[getNPerm(cc.ea, 8, true)];
  }
  for (i = 0; i < 24; i++) {
    setNPerm(cc.ea, i, 12, true);
    $invCubieCube(cc);
    MPermInv[i] = ((getNPerm(cc.ea, 12, true) % 24) << 24) >> 24;
  }
}

function initSym() {
  var c;
  var d;
  var f2;
  var i;
  var i0;
  var i1;
  var i2;
  var j;
  var j0;
  var j1;
  var k;
  var lr2;
  var m;
  var s;
  var t;
  var u4;
  c = new CubieCube();
  d = new CubieCube();
  f2 = new CubieCube_0(28783, 0, 259268407, 0);
  u4 = new CubieCube_0(15138, 0, 119765538, 7);
  lr2 = new CubieCube_0(5167, 0, 83473207, 0);
  for (i0 = 0; i0 < 8; i0++) {
    lr2.ca[i0] = narrow_byte(lr2.ca[i0] | 24);
  }
  for (i1 = 0; i1 < 16; i1++) {
    CubeSym[i1] = new CubieCube_1(c);
    CornMultFull(c, u4, d);
    EdgeMult(c, u4, d);
    t = d;
    d = c;
    c = t;
    if (i1 % 4 === 3) {
      CornMultFull(t, lr2, d);
      EdgeMult(t, lr2, d);
      t = d;
      d = c;
      c = t;
    }
    if (i1 % 8 === 7) {
      CornMultFull(t, f2, d);
      EdgeMult(t, f2, d);
      t = d;
      d = c;
      c = t;
    }
  }
  for (i2 = 0; i2 < 16; i2++) {
    for (j0 = 0; j0 < 16; j0++) {
      CornMultFull(CubeSym[i2], CubeSym[j0], c);
      for (k = 0; k < 16; k++) {
        if (equals_7(CubeSym[k].ca, c.ca)) {
          SymMult[i2][j0] = k;
          SymMultInv[k][j0] = i2;
          break;
        }
      }
    }
  }
  for (j1 = 0; j1 < 18; j1++) {
    for (s = 0; s < 16; s++) {
      CornConjugate(moveCube[j1], SymMultInv[0][s], c);
      for (m = 0; m < 18; m++) {
        if (equals_7(moveCube[m].ca, c.ca)) {
          SymMove_0[s][j1] = m;
          SymMoveUD[s][($clinit_Util(), std2ud)[j1]] = std2ud[m];
          break;
        }
      }
      s % 2 === 0 && (Sym8Move[(j1 << 3) | (s >> 1)] = SymMove_0[s][j1]);
    }
  }
  for (i = 0; i < 18; i++) {
    moveCubeSym[i] = $selfSymmetry(moveCube[i]);
    j = i;
    for (s = 0; s < 48; s++) {
      SymMove_0[s % 16][j] < i && (firstMoveSym[s] |= 1 << i);
      s % 16 === 15 && (j = urfMove[2][j]);
    }
  }
}

function initSym2Raw(N_RAW, Sym2Raw, Raw2Sym, SymState, coord) {
  $clinit_CubieCube();
  var c;
  var count;
  var d;
  var i;
  var idx;
  var isEdge;
  var s;
  var symIdx;
  var sym_inc;
  c = new CubieCube();
  d = new CubieCube();
  count = 0;
  idx = 0;
  sym_inc = coord >= 2 ? 1 : 2;
  isEdge = coord !== 1;
  for (i = 0; i < N_RAW; i++) {
    if (Raw2Sym[i] !== 0) {
      continue;
    }
    switch (coord) {
      case 0: {
        $setFlip(c, i);
        break;
      }
      case 1: {
        $setTwist(c, i);
        break;
      }
      case 2:
        setNPerm(c.ea, i, 8, true);
    }
    for (s = 0; s < 16; s += sym_inc) {
      isEdge ? EdgeConjugate(c, s, d) : CornConjugate(c, s, d);
      switch (coord) {
        case 0: {
          idx = $getFlip(d);
          break;
        }
        case 1: {
          idx = $getTwist(d);
          break;
        }
        case 2:
          idx = getNPerm(d.ea, 8, true);
      }
      coord === 0 && (FlipS2RF[(count << 3) | (s >> 1)] = idx & $intern_20);
      idx === i &&
        (SymState[count] =
          (SymState[count] | (1 << ~~(s / sym_inc))) & $intern_20);
      symIdx = ~~(((count << 4) | s) / sym_inc);
      Raw2Sym[idx] = symIdx & $intern_20;
    }
    Sym2Raw[count++] = i & $intern_20;
  }
  return count;
}

var CubeSym;
var EPermR2S;
var EPermS2R;
var FlipR2S;
var FlipS2R;
var FlipS2RF;
var MPermInv;
var Perm2CombP;
var PermInvEdgeSym;
var Sym8Move;
var SymMove_0;
var SymMoveUD;
var SymMult;
var SymMultInv;
var SymStateFlip;
var SymStatePerm;
var SymStateTwist;
var TwistR2S;
var TwistS2R;
var firstMoveSym;
var moveCube;
var moveCubeSym;
var urf1;
var urf2;
var urfMove;
var Lorg_cubing_min2phase_client_CubieCube_2_classLit = createForClass(
  "org.cubing.min2phase.client",
  "CubieCube",
  7,
);

function $initPhase2(
  this$static,
  p2corn,
  p2csym,
  p2edge,
  p2esym,
  p2mid,
  edgei,
  corni,
) {
  var depth2;
  var i;
  var i0;
  var prun;
  var ret;
  prun = max_0(
    getPruning(
      ($clinit_CoordCube(), EPermCCombPPrun),
      (edgei >> 4) * 140 +
        CCombPConj[($clinit_CubieCube(), Perm2CombP)[corni >> 4] & 255][
          SymMultInv[edgei & 15][corni & 15]
        ],
    ),
    max_0(
      getPruning(
        EPermCCombPPrun,
        p2edge * 140 +
          CCombPConj[Perm2CombP[p2corn] & 255][SymMultInv[p2esym][p2csym]],
      ),
      getPruning(MCPermPrun, p2corn * 24 + MPermConj[p2mid][p2csym]),
    ),
  );
  if (prun > this$static.maxDep2) {
    return prun - this$static.maxDep2;
  }
  for (depth2 = this$static.maxDep2; depth2 >= prun; depth2--) {
    ret = $phase2(
      this$static,
      p2edge,
      p2esym,
      p2corn,
      p2csym,
      p2mid,
      depth2,
      this$static.depth1,
      10,
    );
    if (ret < 0) {
      break;
    }
    depth2 -= ret;
    this$static.solLen = 0;
    this$static.solution = new Util$Solution();
    $setArgs(
      this$static.solution,
      this$static.verbose,
      this$static.urfIdx,
      this$static.depth1,
    );
    for (i0 = 0; i0 < this$static.depth1 + depth2; i0++) {
      $appendSolMove(this$static.solution, this$static.move[i0]);
    }
    for (i = this$static.preMoveLen - 1; i >= 0; i--) {
      $appendSolMove(this$static.solution, this$static.preMoves[i]);
    }
    this$static.solLen = this$static.solution.length_0;
  }
  if (depth2 !== this$static.maxDep2) {
    this$static.maxDep2 = min_0(
      MAX_DEPTH2,
      this$static.solLen - this$static.length1 - 1,
    );
    return gte(this$static.probe, this$static.probeMin) ? 0 : 1;
  }
  return 1;
}

function $initPhase2Pre(this$static) {
  var corni;
  var edgei;
  var i;
  var lastMove;
  var lastPre;
  var m;
  var p2corn;
  var p2csym;
  var p2edge;
  var p2esym;
  var p2mid;
  var p2switch;
  var p2switchMask;
  var p2switchMax;
  var ret;
  this$static.isRec = false;
  if (
    gte(
      this$static.probe,
      !this$static.solution ? this$static.probeMax : this$static.probeMin,
    )
  ) {
    return 0;
  }
  this$static.probe = add_1(this$static.probe, { l: 1, m: 0, h: 0 });
  for (i = this$static.valid1; i < this$static.depth1; i++) {
    CornMult(
      this$static.phase1Cubie[i],
      ($clinit_CubieCube(), moveCube)[this$static.move[i]],
      this$static.phase1Cubie[i + 1],
    );
    EdgeMult(
      this$static.phase1Cubie[i],
      moveCube[this$static.move[i]],
      this$static.phase1Cubie[i + 1],
    );
  }
  this$static.valid1 = this$static.depth1;
  p2corn = $getCPermSym(this$static.phase1Cubie[this$static.depth1]);
  p2csym = p2corn & 15;
  p2corn >>= 4;
  p2edge = $getEPermSym(this$static.phase1Cubie[this$static.depth1]);
  p2esym = p2edge & 15;
  p2edge >>= 4;
  p2mid =
    getNPerm(this$static.phase1Cubie[this$static.depth1].ea, 12, true) % 24;
  edgei = getPermSymInv(p2edge, p2esym, false);
  corni = getPermSymInv(p2corn, p2csym, true);
  lastMove =
    this$static.depth1 === 0 ? -1 : this$static.move[this$static.depth1 - 1];
  lastPre =
    this$static.preMoveLen === 0
      ? -1
      : this$static.preMoves[this$static.preMoveLen - 1];
  ret = 0;
  p2switchMax =
    (this$static.preMoveLen === 0 ? 1 : 2) * (this$static.depth1 === 0 ? 1 : 2);
  for (
    p2switch = 0, p2switchMask = (1 << p2switchMax) - 1;
    p2switch < p2switchMax;
    p2switch++
  ) {
    if (((p2switchMask >> p2switch) & 1) !== 0) {
      p2switchMask &= ~(1 << p2switch);
      ret = $initPhase2(
        this$static,
        p2corn,
        p2csym,
        p2edge,
        p2esym,
        p2mid,
        edgei,
        corni,
      );
      if (ret === 0 || ret > 2) {
        break;
      } else {
        ret === 2 && (p2switchMask &= 4 << p2switch);
      }
    }
    if (p2switchMask === 0) {
      break;
    }
    if ((p2switch & 1) === 0 && this$static.depth1 > 0) {
      m = ($clinit_Util(), std2ud)[~~(lastMove / 3) * 3 + 1];
      this$static.move[this$static.depth1 - 1] =
        ud2std[m] * 2 - this$static.move[this$static.depth1 - 1];
      p2mid = ($clinit_CoordCube(), MPermMove)[p2mid][m];
      p2corn = CPermMove[p2corn][($clinit_CubieCube(), SymMoveUD)[p2csym][m]];
      p2csym = SymMult[p2corn & 15][p2csym];
      p2corn >>= 4;
      p2edge = EPermMove[p2edge][SymMoveUD[p2esym][m]];
      p2esym = SymMult[p2edge & 15][p2esym];
      p2edge >>= 4;
      corni = getPermSymInv(p2corn, p2csym, true);
      edgei = getPermSymInv(p2edge, p2esym, false);
    } else if (this$static.preMoveLen > 0) {
      m = ($clinit_Util(), std2ud)[~~(lastPre / 3) * 3 + 1];
      this$static.preMoves[this$static.preMoveLen - 1] =
        ud2std[m] * 2 - this$static.preMoves[this$static.preMoveLen - 1];
      p2mid = ($clinit_CubieCube(), MPermInv)[
        ($clinit_CoordCube(), MPermMove)[MPermInv[p2mid]][m]
      ];
      p2corn = CPermMove[corni >> 4][SymMoveUD[corni & 15][m]];
      corni = (p2corn & -16) | SymMult[p2corn & 15][corni & 15];
      p2corn = getPermSymInv(corni >> 4, corni & 15, true);
      p2csym = p2corn & 15;
      p2corn >>= 4;
      p2edge = EPermMove[edgei >> 4][SymMoveUD[edgei & 15][m]];
      edgei = (p2edge & -16) | SymMult[p2edge & 15][edgei & 15];
      p2edge = getPermSymInv(edgei >> 4, edgei & 15, false);
      p2esym = p2edge & 15;
      p2edge >>= 4;
    }
  }
  this$static.depth1 > 0 &&
    (this$static.move[this$static.depth1 - 1] = lastMove);
  this$static.preMoveLen > 0 &&
    (this$static.preMoves[this$static.preMoveLen - 1] = lastPre);
  return ret === 0 ? 0 : 2;
}

function $initSearch(this$static) {
  var i;
  this$static.conjMask = 0;
  this$static.selfSym = $selfSymmetry(this$static.cc);
  this$static.conjMask |= neq(
    and(shr(this$static.selfSym, 16), {
      l: $intern_20,
      m: 0,
      h: 0,
    }),
    { l: 0, m: 0, h: 0 },
  )
    ? 18
    : 0;
  this$static.conjMask |= neq(
    and(shr(this$static.selfSym, 32), {
      l: $intern_20,
      m: 0,
      h: 0,
    }),
    { l: 0, m: 0, h: 0 },
  )
    ? 36
    : 0;
  this$static.conjMask |= neq(
    and(shr(this$static.selfSym, 48), {
      l: $intern_20,
      m: 0,
      h: 0,
    }),
    { l: 0, m: 0, h: 0 },
  )
    ? 56
    : 0;
  this$static.selfSym = and(this$static.selfSym, {
    l: $intern_9,
    m: $intern_9,
    h: 15,
  });
  this$static.maxPreMoves = this$static.conjMask > 7 ? 0 : 20;
  for (i = 0; i < 6; i++) {
    $copy(this$static.urfCubieCube[i], this$static.cc);
    $setWithPrun(this$static.urfCoordCube[i], this$static.urfCubieCube[i], 20);
    $URFConjugate(this$static.cc);
    i % 3 === 2 && $invCubieCube(this$static.cc);
  }
}

function $phase1(this$static, node, ssym, maxl, lm) {
  var axis_0;
  var m;
  var power;
  var prun;
  var ret;
  var skipMoves;
  if (node.prun === 0 && maxl < 5) {
    if (this$static.allowShorter || maxl === 0) {
      this$static.depth1 -= maxl;
      ret = $initPhase2Pre(this$static);
      this$static.depth1 += maxl;
      return ret;
    } else {
      return 1;
    }
  }
  skipMoves = getSkipMoves(fromInt(ssym));
  for (axis_0 = 0; axis_0 < 18; axis_0 += 3) {
    if (axis_0 === lm || axis_0 === lm - 9) {
      continue;
    }
    for (power = 0; power < 3; power++) {
      m = axis_0 + power;
      if (
        (this$static.isRec &&
          m !== this$static.move[this$static.depth1 - maxl]) ||
        (skipMoves !== 0 && (skipMoves & (1 << m)) !== 0)
      ) {
        continue;
      }
      prun = $doMovePrun(this$static.nodeUD[maxl], node, m);
      if (prun > maxl) {
        break;
      } else if (prun === maxl) {
        continue;
      }
      prun = $doMovePrunConj(this$static.nodeUD[maxl], node, m);
      if (prun > maxl) {
        break;
      } else if (prun === maxl) {
        continue;
      }
      this$static.move[this$static.depth1 - maxl] = m;
      this$static.valid1 = min_0(this$static.valid1, this$static.depth1 - maxl);
      ret = $phase1(
        this$static,
        this$static.nodeUD[maxl],
        ssym & toInt(($clinit_CubieCube(), moveCubeSym)[m]),
        maxl - 1,
        axis_0,
      );
      if (ret === 0) {
        return 0;
      } else if (ret >= 2) {
        break;
      }
    }
  }
  return 1;
}

function $phase1PreMoves(this$static, maxl, lm, cc, ssym) {
  var m;
  var ret;
  var skipMoves;
  this$static.preMoveLen = this$static.maxPreMoves - maxl;
  if (
    this$static.isRec
      ? this$static.depth1 === this$static.length1 - this$static.preMoveLen
      : this$static.preMoveLen === 0 || ((225207 >> lm) & 1) === 0
  ) {
    this$static.depth1 = this$static.length1 - this$static.preMoveLen;
    this$static.phase1Cubie[0] = cc;
    this$static.allowShorter =
      this$static.depth1 === MIN_P1LENGTH_PRE && this$static.preMoveLen !== 0;
    if (
      $setWithPrun(
        this$static.nodeUD[this$static.depth1 + 1],
        cc,
        this$static.depth1,
      ) &&
      $phase1(
        this$static,
        this$static.nodeUD[this$static.depth1 + 1],
        ssym,
        this$static.depth1,
        -1,
      ) === 0
    ) {
      return 0;
    }
  }
  if (
    maxl === 0 ||
    this$static.preMoveLen + MIN_P1LENGTH_PRE >= this$static.length1
  ) {
    return 1;
  }
  skipMoves = getSkipMoves(fromInt(ssym));
  (maxl === 1 ||
    this$static.preMoveLen + 1 + MIN_P1LENGTH_PRE >= this$static.length1) &&
    (skipMoves |= 225207);
  lm = ~~(lm / 3) * 3;
  for (m = 0; m < 18; m++) {
    if (m === lm || m === lm - 9 || m === lm + 9) {
      m += 2;
      continue;
    }
    if (
      (this$static.isRec &&
        m !== this$static.preMoves[this$static.maxPreMoves - maxl]) ||
      (skipMoves & (1 << m)) !== 0
    ) {
      continue;
    }
    CornMult(
      ($clinit_CubieCube(), moveCube)[m],
      cc,
      this$static.preMoveCubes[maxl],
    );
    EdgeMult(moveCube[m], cc, this$static.preMoveCubes[maxl]);
    this$static.preMoves[this$static.maxPreMoves - maxl] = m;
    ret = $phase1PreMoves(
      this$static,
      maxl - 1,
      m,
      this$static.preMoveCubes[maxl],
      ssym & toInt(moveCubeSym[m]),
    );
    if (ret === 0) {
      return 0;
    }
  }
  return 1;
}

function $phase2(this$static, edge, esym, corn, csym, mid, maxl, depth, lm) {
  var corni;
  var cornx;
  var csymx;
  var edgei;
  var edgex;
  var esymx;
  var m;
  var midx;
  var moveMask;
  var prun;
  var ret;
  if (edge === 0 && corn === 0 && mid === 0) {
    return maxl;
  }
  moveMask = ($clinit_Util(), ckmv2bit)[lm];
  for (m = 0; m < 10; m++) {
    if (((moveMask >> m) & 1) !== 0) {
      m += (66 >> m) & 3;
      continue;
    }
    midx = ($clinit_CoordCube(), MPermMove)[mid][m];
    cornx = CPermMove[corn][($clinit_CubieCube(), SymMoveUD)[csym][m]];
    csymx = SymMult[cornx & 15][csym];
    cornx >>= 4;
    edgex = EPermMove[edge][SymMoveUD[esym][m]];
    esymx = SymMult[edgex & 15][esym];
    edgex >>= 4;
    edgei = getPermSymInv(edgex, esymx, false);
    corni = getPermSymInv(cornx, csymx, true);
    prun = getPruning(
      EPermCCombPPrun,
      (edgei >> 4) * 140 +
        CCombPConj[Perm2CombP[corni >> 4] & 255][
          SymMultInv[edgei & 15][corni & 15]
        ],
    );
    if (prun > maxl + 1) {
      return maxl - prun + 1;
    } else if (prun >= maxl) {
      m += (66 >> m) & 3 & (maxl - prun);
      continue;
    }
    prun = max_0(
      getPruning(MCPermPrun, cornx * 24 + MPermConj[midx][csymx]),
      getPruning(
        EPermCCombPPrun,
        edgex * 140 +
          CCombPConj[Perm2CombP[cornx] & 255][SymMultInv[esymx][csymx]],
      ),
    );
    if (prun >= maxl) {
      m += (66 >> m) & 3 & (maxl - prun);
      continue;
    }
    ret = $phase2(
      this$static,
      edgex,
      esymx,
      cornx,
      csymx,
      midx,
      maxl - 1,
      depth + 1,
      m,
    );
    if (ret >= 0) {
      this$static.move[depth] = ud2std[m];
      return ret;
    }
    if (ret < -2) {
      break;
    }
    ret < -1 && (m += (66 >> m) & 3);
  }
  return -1;
}

function $search(this$static) {
  for (
    this$static.length1 = this$static.isRec ? this$static.length1 : 0;
    this$static.length1 < this$static.solLen;
    this$static.length1++
  ) {
    this$static.maxDep2 = min_0(
      MAX_DEPTH2,
      this$static.solLen - this$static.length1 - 1,
    );
    for (
      this$static.urfIdx = this$static.isRec ? this$static.urfIdx : 0;
      this$static.urfIdx < 6;
      this$static.urfIdx++
    ) {
      if ((this$static.conjMask & (1 << this$static.urfIdx)) !== 0) {
        continue;
      }
      if (
        $phase1PreMoves(
          this$static,
          this$static.maxPreMoves,
          -30,
          this$static.urfCubieCube[this$static.urfIdx],
          toInt(and(this$static.selfSym, { l: $intern_20, m: 0, h: 0 })),
        ) === 0
      ) {
        return !this$static.solution
          ? "Error 8"
          : $toString_2(this$static.solution);
      }
    }
  }
  return !this$static.solution ? "Error 7" : $toString_2(this$static.solution);
}

function $solution(this$static, facelets) {
  var check;
  check = $verify_0(this$static, facelets);
  if (check !== 0) {
    return `Error ${check < 0 ? -check : check}`;
  }
  this$static.solLen = 22;
  this$static.probe = { l: 0, m: 0, h: 0 };
  this$static.probeMax = { l: 3531008, m: 23, h: 0 };
  this$static.probeMin = { l: 0, m: 0, h: 0 };
  this$static.verbose = 0;
  this$static.solution = null;
  this$static.isRec = false;
  init_0(false);
  $initSearch(this$static);
  return $search(this$static);
}

function $verify_0(this$static, facelets) {
  var center;
  var count;
  var f;
  var i;
  count = 0;
  f = initDim(B_classLit, $intern_30, 0, 54, 7, 1);
  // try {
  center = _String(
    initValues(getClassLiteralForArray(C_classLit, 1), $intern_26, 0, 7, [
      facelets.charCodeAt(4),
      facelets.charCodeAt(13),
      facelets.charCodeAt(22),
      facelets.charCodeAt(31),
      facelets.charCodeAt(40),
      facelets.charCodeAt(49),
    ]),
  );
  for (i = 0; i < 54; i++) {
    f[i] =
      ($indexOf_0(center, fromCodePoint(facelets.charCodeAt(i))) << 24) >> 24;
    if (f[i] === -1) {
      return -1;
    }
    count += 1 << (f[i] << 2);
  }
  // } catch ($e0) {
  //   $e0 = wrap($e0);
  //   if (instanceOf($e0, 9)) {
  //     return -1;
  //   } else throw unwrap($e0);
  // }
  if (count !== 10066329) {
    return -1;
  }
  toCubieCube(f, this$static.cc);
  return $verify(this$static.cc);
}

function Search() {
  var i;
  var i0;
  var i1;
  this.move = initDim(I_classLit, $intern_27, 0, 31, 7, 1);
  this.nodeUD = initDim(
    Lorg_cubing_min2phase_client_CoordCube_2_classLit,
    $intern_3,
    31,
    21,
    0,
    1,
  );
  this.nodeRL = initDim(
    Lorg_cubing_min2phase_client_CoordCube_2_classLit,
    $intern_3,
    31,
    21,
    0,
    1,
  );
  this.nodeFB = initDim(
    Lorg_cubing_min2phase_client_CoordCube_2_classLit,
    $intern_3,
    31,
    21,
    0,
    1,
  );
  this.cc = new CubieCube();
  this.urfCubieCube = initDim(
    Lorg_cubing_min2phase_client_CubieCube_2_classLit,
    $intern_3,
    7,
    6,
    0,
    1,
  );
  this.urfCoordCube = initDim(
    Lorg_cubing_min2phase_client_CoordCube_2_classLit,
    $intern_3,
    31,
    6,
    0,
    1,
  );
  this.phase1Cubie = initDim(
    Lorg_cubing_min2phase_client_CubieCube_2_classLit,
    $intern_3,
    7,
    21,
    0,
    1,
  );
  this.preMoveCubes = initDim(
    Lorg_cubing_min2phase_client_CubieCube_2_classLit,
    $intern_3,
    7,
    21,
    0,
    1,
  );
  this.preMoves = initDim(I_classLit, $intern_27, 0, 20, 7, 1);
  for (i0 = 0; i0 < 21; i0++) {
    this.nodeUD[i0] = new CoordCube();
    this.nodeRL[i0] = new CoordCube();
    this.nodeFB[i0] = new CoordCube();
    this.phase1Cubie[i0] = new CubieCube();
  }
  for (i1 = 0; i1 < 6; i1++) {
    this.urfCubieCube[i1] = new CubieCube();
    this.urfCoordCube[i1] = new CoordCube();
  }
  for (i = 0; i < 20; i++) {
    this.preMoveCubes[i + 1] = new CubieCube();
  }
}

defineClass(72, 1, {}, Search);
_.allowShorter = false;
_.conjMask = 0;
_.depth1 = 0;
_.isRec = false;
_.length1 = 0;
_.maxDep2 = 0;
_.maxPreMoves = 0;
_.preMoveLen = 0;
_.probe = { l: 0, m: 0, h: 0 };
_.probeMax = { l: 0, m: 0, h: 0 };
_.probeMin = { l: 0, m: 0, h: 0 };
_.selfSym = { l: 0, m: 0, h: 0 };
_.solLen = 0;
_.urfIdx = 0;
_.valid1 = 0;
_.verbose = 0;
var MAX_DEPTH2 = 12;
var MIN_P1LENGTH_PRE = 7;
let $clinit_Util_ran = false;
function $clinit_Util() {
  if ($clinit_Util_ran) {
    return;
  }
  $clinit_Util_ran = true;
  var i;
  var i0;
  var i1;
  var ix;
  var j;
  var jx;
  cornerFacelet = initValues(
    getClassLiteralForArray(B_classLit, 2),
    $intern_3,
    10,
    0,
    [
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [8, 9, 20],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [6, 18, 38],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [0, 36, 47],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [2, 45, 11],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [29, 26, 15],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [27, 44, 24],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [33, 53, 42],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [35, 17, 51],
      ),
    ],
  );
  edgeFacelet = initValues(
    getClassLiteralForArray(B_classLit, 2),
    $intern_3,
    10,
    0,
    [
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [5, 10],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [7, 19],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [3, 37],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [1, 46],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [32, 16],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [28, 25],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [30, 43],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [34, 52],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [23, 12],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [21, 41],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [50, 39],
      ),
      initValues(
        getClassLiteralForArray(B_classLit, 1),
        $intern_30,
        0,
        7,
        [48, 14],
      ),
    ],
  );
  Cnk = initDims(I_classLit, [$intern_3, $intern_27], [17, 0], 7, [13, 13], 2);
  move2str = initValues(
    getClassLiteralForArray(Ljava_lang_String_2_classLit, 1),
    $intern_3,
    2,
    4,
    [
      "U ",
      "U2",
      "U'",
      "R ",
      "R2",
      "R'",
      "F ",
      "F2",
      "F'",
      "D ",
      "D2",
      "D'",
      "L ",
      "L2",
      "L'",
      "B ",
      "B2",
      "B'",
    ],
  );
  ud2std = initValues(
    getClassLiteralForArray(I_classLit, 1),
    $intern_27,
    0,
    7,
    [0, 1, 2, 4, 7, 9, 10, 11, 13, 16, 3, 5, 6, 8, 12, 14, 15, 17],
  );
  std2ud = initDim(I_classLit, $intern_27, 0, 18, 7, 1);
  ckmv2bit = initDim(I_classLit, $intern_27, 0, 11, 7, 1);
  for (i0 = 0; i0 < 18; i0++) {
    std2ud[ud2std[i0]] = i0;
  }
  for (i1 = 0; i1 < 10; i1++) {
    ix = ~~(ud2std[i1] / 3);
    ckmv2bit[i1] = 0;
    for (j = 0; j < 10; j++) {
      jx = ~~(ud2std[j] / 3);
      ckmv2bit[i1] |=
        (ix === jx || (ix % 3 === jx % 3 && ix >= jx) ? 1 : 0) << j;
    }
  }
  ckmv2bit[10] = 0;
  for (i = 0; i < 13; i++) {
    Cnk[i][0] = Cnk[i][i] = 1;
    for (j = 1; j < i; j++) {
      Cnk[i][j] = Cnk[i - 1][j - 1] + Cnk[i - 1][j];
    }
  }
}

function getComb(arr, mask, isEdge) {
  $clinit_Util();
  var end;
  var i;
  var idxC;
  var perm;
  var r;
  end = arr.length - 1;
  idxC = 0;
  r = 4;
  for (i = end; i >= 0; i--) {
    perm = getVal(arr[i], isEdge);
    (perm & 12) === mask && (idxC += Cnk[i][r--]);
  }
  return idxC;
}

function getNParity(idx, n) {
  $clinit_Util();
  var i;
  var p;
  p = 0;
  for (i = n - 2; i >= 0; i--) {
    p ^= idx % (n - i);
    idx = ~~(idx / (n - i));
  }
  return p & 1;
}

function getNPerm(arr, n, isEdge) {
  $clinit_Util();
  var i;
  var idx;
  var v;
  var val;
  idx = 0;
  val = { l: 1323536, m: 2777561, h: 1043915 };
  for (i = 0; i < n - 1; i++) {
    v = getVal(arr[i], isEdge) << 2;
    idx = (n - i) * idx + toInt(and(shr(val, v), { l: 15, m: 0, h: 0 }));
    val = sub_0(val, shl({ l: 1118480, m: 279620, h: 69905 }, v));
  }
  return idx;
}

function getVal(val0, isEdge) {
  return isEdge ? val0 >> 1 : val0 & 7;
}

function setComb(arr, idxC, mask, isEdge) {
  $clinit_Util();
  var end;
  var fill;
  var i;
  var r;
  end = arr.length - 1;
  r = 4;
  fill = end;
  for (i = end; i >= 0; i--) {
    if (idxC >= Cnk[i][r]) {
      idxC -= Cnk[i][r--];
      arr[i] = setVal(arr[i], r | mask, isEdge);
    } else {
      (fill & 12) === mask && (fill -= 4);
      arr[i] = setVal(arr[i], fill--, isEdge);
    }
  }
}

function setNPerm(arr, idx, n, isEdge) {
  $clinit_Util();
  var extract;
  var i;
  var m;
  var p;
  var v;
  var val;
  val = { l: 1323536, m: 2777561, h: 1043915 };
  extract = { l: 0, m: 0, h: 0 };
  for (p = 2; p <= n; p++) {
    extract = or(shl(extract, 4), fromInt(idx % p));
    idx = ~~(idx / p);
  }
  for (i = 0; i < n - 1; i++) {
    v = (toInt(extract) & 15) << 2;
    extract = shr(extract, 4);
    arr[i] = setVal(
      arr[i],
      toInt(and(shr(val, v), { l: 15, m: 0, h: 0 })),
      isEdge,
    );
    m = sub_0(shl({ l: 1, m: 0, h: 0 }, v), { l: 1, m: 0, h: 0 });
    val = or(
      and(val, m),
      and(shr(val, 4), {
        l: ~m.l & $intern_9,
        m: ~m.m & $intern_9,
        h: ~m.h & $intern_10,
      }),
    );
  }
  arr[n - 1] = setVal(
    arr[n - 1],
    toInt(and(val, { l: 15, m: 0, h: 0 })),
    isEdge,
  );
}

function setVal(val0, val, isEdge) {
  return ((isEdge ? (val << 1) | (val0 & 1) : val | (val0 & -8)) << 24) >> 24;
}

function toCubieCube(f, ccRet) {
  $clinit_Util();
  var col1;
  var col2;
  var i;
  var i0;
  var i1;
  var i2;
  var j;
  var ori;
  for (i0 = 0; i0 < 8; i0++) {
    ccRet.ca[i0] = 0;
  }
  for (i1 = 0; i1 < 12; i1++) {
    ccRet.ea[i1] = 0;
  }
  for (i2 = 0; i2 < 8; i2++) {
    for (ori = 0; ori < 3; ori++) {
      if (f[cornerFacelet[i2][ori]] === 0 || f[cornerFacelet[i2][ori]] === 3) {
        break;
      }
    }
    col1 = f[cornerFacelet[i2][(ori + 1) % 3]];
    col2 = f[cornerFacelet[i2][(ori + 2) % 3]];
    for (j = 0; j < 8; j++) {
      if (
        col1 === ~~(cornerFacelet[j][1] / 9) &&
        col2 === ~~(cornerFacelet[j][2] / 9)
      ) {
        ccRet.ca[i2] = narrow_byte(((ori % 3) << 3) | j);
        break;
      }
    }
  }
  for (i = 0; i < 12; i++) {
    for (j = 0; j < 12; j++) {
      if (
        f[edgeFacelet[i][0]] === ~~(edgeFacelet[j][0] / 9) &&
        f[edgeFacelet[i][1]] === ~~(edgeFacelet[j][1] / 9)
      ) {
        ccRet.ea[i] = narrow_byte(j << 1);
        break;
      }
      if (
        f[edgeFacelet[i][0]] === ~~(edgeFacelet[j][1] / 9) &&
        f[edgeFacelet[i][1]] === ~~(edgeFacelet[j][0] / 9)
      ) {
        ccRet.ea[i] = narrow_byte((j << 1) | 1);
        break;
      }
    }
  }
}

var Cnk;
var ckmv2bit;
var cornerFacelet;
var edgeFacelet;
var move2str;
var std2ud;
var ud2std;
function $appendSolMove(this$static, curMove) {
  var axisCur;
  var axisLast;
  var pow_0;
  if (this$static.length_0 === 0) {
    this$static.moves[this$static.length_0++] = curMove;
    return;
  }
  axisCur = ~~(curMove / 3);
  axisLast = ~~(this$static.moves[this$static.length_0 - 1] / 3);
  if (axisCur === axisLast) {
    pow_0 =
      ((curMove % 3) + (this$static.moves[this$static.length_0 - 1] % 3) + 1) %
      4;
    pow_0 === 3
      ? --this$static.length_0
      : (this$static.moves[this$static.length_0 - 1] = axisCur * 3 + pow_0);
    return;
  }
  if (
    this$static.length_0 > 1 &&
    axisCur % 3 === axisLast % 3 &&
    axisCur === ~~(this$static.moves[this$static.length_0 - 2] / 3)
  ) {
    pow_0 =
      ((curMove % 3) + (this$static.moves[this$static.length_0 - 2] % 3) + 1) %
      4;
    if (pow_0 === 3) {
      this$static.moves[this$static.length_0 - 2] =
        this$static.moves[this$static.length_0 - 1];
      --this$static.length_0;
    } else {
      this$static.moves[this$static.length_0 - 2] = axisCur * 3 + pow_0;
    }
    return;
  }
  this$static.moves[this$static.length_0++] = curMove;
}

function $setArgs(this$static, verbose, urfIdx, depth1) {
  this$static.verbose = verbose;
  this$static.urfIdx = urfIdx;
  this$static.depth1 = depth1;
}

function $toString_2(this$static) {
  var s;
  var sb;
  var urf;
  sb = new StringBuffer();
  urf =
    (this$static.verbose & 2) !== 0
      ? (this$static.urfIdx + 3) % 6
      : this$static.urfIdx;
  if (urf < 3) {
    for (s = 0; s < this$static.length_0; s++) {
      (this$static.verbose & 1) !== 0 &&
        s === this$static.depth1 &&
        ((sb.string += ".  "), sb);
      $append(
        $append_1(
          sb,
          ($clinit_Util(), move2str)[
            ($clinit_CubieCube(), urfMove)[urf][this$static.moves[s]]
          ],
        ),
      );
    }
  } else {
    for (s = this$static.length_0 - 1; s >= 0; s--) {
      $append(
        $append_1(
          sb,
          ($clinit_Util(), move2str)[
            ($clinit_CubieCube(), urfMove)[urf][this$static.moves[s]]
          ],
        ),
      );
      (this$static.verbose & 1) !== 0 &&
        s === this$static.depth1 &&
        ((sb.string += ".  "), sb);
    }
  }
  return sb.string;
}

function Util$Solution() {
  this.moves = initDim(I_classLit, $intern_27, 0, 31, 7, 1);
}

defineClass(150, 1, {}, Util$Solution);
_.depth1 = 0;
_.length_0 = 0;
_.urfIdx = 0;
_.verbose = 0;
var I_classLit = createForPrimitive("int", "I");
createForClass("com.google.gwt.lang", "CollapsedPropertyHolder", 252);

createForClass("com.google.gwt.lang", "JavaClassHierarchySetupUtil", 254);
const Lcom_google_gwt_lang_LongLibBase$LongEmul_2_classLit = createForClass(
  "com.google.gwt.lang",
  "LongLibBase/LongEmul",
  null,
);
createForClass("com.google.gwt.lang", "ModuleUtils", 257);
var B_classLit = createForPrimitive("byte", "B");
var J_classLit = createForPrimitive("long", "J");
var C_classLit = createForPrimitive("char", "C");
createForClass("com.google.gwt.user.client.rpc", "XsrfToken", null),
  createForInterface("java.util", "Map/Entry");

export const initialize = function () {
  init_0(false);
};
export const solvePattern = function (s) {
  return $solution(new Search(), s);
};
