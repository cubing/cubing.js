var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// src/cubing/alg/common.ts
var writeAlgDebugField = false;
var Comparable = class {
  is(c) {
    return this instanceof c;
  }
};
var AlgCommon = class extends Comparable {
  constructor() {
    super();
    if (writeAlgDebugField) {
      Object.defineProperty(this, "_debugStr", {
        get: function() {
          return this.toString();
        }
      });
    }
  }
};

// src/cubing/alg/iteration.ts
var IterationDirection;
(function(IterationDirection3) {
  IterationDirection3[IterationDirection3["Forwards"] = 1] = "Forwards";
  IterationDirection3[IterationDirection3["Backwards"] = -1] = "Backwards";
})(IterationDirection || (IterationDirection = {}));
function toggleDirection(iterationDirection, flip = true) {
  if (!flip) {
    return iterationDirection;
  }
  switch (iterationDirection) {
    case 1:
      return -1;
    case -1:
      return 1;
  }
}
function direct(g, iterDir) {
  return iterDir === -1 ? Array.from(g).reverse() : g;
}
function reverse(g) {
  return Array.from(g).reverse();
}
function* directedGenerator(g, direction) {
  return direction === -1 ? yield* reverseGenerator(g) : yield* g;
}
function* reverseGenerator(g) {
  for (const t of Array.from(g).reverse()) {
    yield t;
  }
}

// src/cubing/alg/limits.ts
var MAX_INT = 2147483647;
var MAX_INT_DESCRIPTION = "2^32 - 1";

// src/cubing/alg/units/Repetition.ts
var Repetition = class {
  constructor(quantum, repetitionInfo) {
    this.absAmount = null;
    this.prime = false;
    this.quantum = quantum;
    if (typeof repetitionInfo === "undefined" || repetitionInfo === null) {
    } else if (typeof repetitionInfo === "number") {
      this.absAmount = repetitionInfo === null ? null : Math.abs(repetitionInfo);
      this.prime = repetitionInfo === null ? false : repetitionInfo < 0;
      return;
    } else if (repetitionInfo instanceof Array) {
      this.absAmount = repetitionInfo[0] === null ? null : repetitionInfo[0];
      this.prime = repetitionInfo[1];
    } else {
      throw new Error("invalid repetition");
    }
    if (this.absAmount !== null) {
      if (!Number.isInteger(this.absAmount) || this.absAmount < 0 || this.absAmount > MAX_INT) {
        throw new Error(`Unit amount absolute value must be a non-negative integer no larger than ${MAX_INT_DESCRIPTION}.`);
      }
    }
    if (this.prime !== false && this.prime !== true) {
      throw new Error("Invalid prime boolean.");
    }
  }
  experimentalEffectiveAmount() {
    return (this.absAmount ?? 1) * (this.prime ? -1 : 1);
  }
  suffix() {
    let s = "";
    if (this.absAmount !== null && this.absAmount !== 1) {
      s += this.absAmount;
    }
    if (this.prime) {
      s += "'";
    }
    return s;
  }
  isIdentical(other) {
    return this.quantum.isIdentical(other.quantum) && (this.absAmount ?? 1) === (other.absAmount ?? 1) && this.prime === other.prime;
  }
  info() {
    return [this.absAmount, this.prime];
  }
  inverseInfo() {
    return [this.absAmount, !this.prime];
  }
  *experimentalExpand(iterDir, depth) {
    const absAmount = this.absAmount ?? 1;
    const newIterDir = toggleDirection(iterDir, this.prime);
    for (let i = 0; i < absAmount; i++) {
      yield* this.quantum.experimentalExpand(newIterDir, depth);
    }
  }
};

// src/cubing/alg/units/containers/Grouping.ts
var _repetition;
var _Grouping = class extends AlgCommon {
  constructor(algSource, repetitionInfo) {
    super();
    _repetition.set(this, void 0);
    const alg = new Alg(algSource);
    __privateSet(this, _repetition, new Repetition(alg, repetitionInfo));
  }
  isIdentical(other) {
    const otherAsGrouping = other;
    return other.is(_Grouping) && __privateGet(this, _repetition).isIdentical(__privateGet(otherAsGrouping, _repetition));
  }
  get experimentalAlg() {
    return __privateGet(this, _repetition).quantum;
  }
  get experimentalEffectiveAmount() {
    return __privateGet(this, _repetition).experimentalEffectiveAmount();
  }
  get experimentalRepetitionSuffix() {
    return __privateGet(this, _repetition).suffix();
  }
  invert() {
    return new _Grouping(__privateGet(this, _repetition).quantum, __privateGet(this, _repetition).inverseInfo());
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    depth ?? (depth = Infinity);
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* __privateGet(this, _repetition).experimentalExpand(iterDir, depth - 1);
    }
  }
  static fromString() {
    throw new Error("unimplemented");
  }
  toString() {
    return `(${__privateGet(this, _repetition).quantum.toString()})${__privateGet(this, _repetition).suffix()}`;
  }
};
var Grouping = _Grouping;
_repetition = new WeakMap();

// src/cubing/alg/units/leaves/LineComment.ts
var _text;
var _LineComment = class extends AlgCommon {
  constructor(commentText) {
    super();
    _text.set(this, void 0);
    if (commentText.includes("\n") || commentText.includes("\r")) {
      throw new Error("LineComment cannot contain newline");
    }
    __privateSet(this, _text, commentText);
  }
  get text() {
    return __privateGet(this, _text);
  }
  isIdentical(other) {
    const otherAsLineComment = other;
    return other.is(_LineComment) && __privateGet(this, _text) === __privateGet(otherAsLineComment, _text);
  }
  invert() {
    return this;
  }
  *experimentalExpand(_iterDir = IterationDirection.Forwards, _depth = Infinity) {
    yield this;
  }
  toString() {
    return `//${__privateGet(this, _text)}`;
  }
};
var LineComment = _LineComment;
_text = new WeakMap();

// src/cubing/alg/units/containers/Commutator.ts
var QuantumCommutator = class extends Comparable {
  constructor(A, B) {
    super();
    this.A = A;
    this.B = B;
    Object.freeze(this);
  }
  isIdentical(other) {
    const otherAsQuantumCommutator = other;
    return other.is(QuantumCommutator) && this.A.isIdentical(otherAsQuantumCommutator.A) && this.B.isIdentical(otherAsQuantumCommutator.B);
  }
  toString() {
    return `[${this.A}, ${this.B}]`;
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    if (depth === 0) {
      throw new Error("cannot expand depth 0 for a quantum");
    }
    if (iterDir === IterationDirection.Forwards) {
      yield* this.A.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.B.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.A.experimentalExpand(IterationDirection.Backwards, depth - 1);
      yield* this.B.experimentalExpand(IterationDirection.Backwards, depth - 1);
    } else {
      yield* this.B.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.A.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.B.experimentalExpand(IterationDirection.Backwards, depth - 1);
      yield* this.A.experimentalExpand(IterationDirection.Backwards, depth - 1);
    }
  }
};
var _repetition2;
var _Commutator = class extends AlgCommon {
  constructor(aSource, bSource, repetitionInfo) {
    super();
    _repetition2.set(this, void 0);
    __privateSet(this, _repetition2, new Repetition(new QuantumCommutator(new Alg(aSource), new Alg(bSource)), repetitionInfo));
  }
  get A() {
    return __privateGet(this, _repetition2).quantum.A;
  }
  get B() {
    return __privateGet(this, _repetition2).quantum.B;
  }
  get experimentalEffectiveAmount() {
    return __privateGet(this, _repetition2).experimentalEffectiveAmount();
  }
  get experimentalRepetitionSuffix() {
    return __privateGet(this, _repetition2).suffix();
  }
  isIdentical(other) {
    const otherAsCommutator = other;
    return other.is(_Commutator) && __privateGet(this, _repetition2).isIdentical(__privateGet(otherAsCommutator, _repetition2));
  }
  invert() {
    return new _Commutator(__privateGet(this, _repetition2).quantum.B, __privateGet(this, _repetition2).quantum.A, __privateGet(this, _repetition2).info());
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    depth ?? (depth = Infinity);
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* __privateGet(this, _repetition2).experimentalExpand(iterDir, depth);
    }
  }
  toString() {
    return `${__privateGet(this, _repetition2).quantum.toString()}${__privateGet(this, _repetition2).suffix()}`;
  }
};
var Commutator = _Commutator;
_repetition2 = new WeakMap();

// src/cubing/alg/units/containers/Conjugate.ts
var QuantumCommutator2 = class extends Comparable {
  constructor(A, B) {
    super();
    this.A = A;
    this.B = B;
    Object.freeze(this);
  }
  isIdentical(other) {
    const otherAsQuantumCommutator = other;
    return other.is(QuantumCommutator2) && this.A.isIdentical(otherAsQuantumCommutator.A) && this.B.isIdentical(otherAsQuantumCommutator.B);
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    if (depth === 0) {
      throw new Error("cannot expand depth 0 for a quantum");
    }
    yield* this.A.experimentalExpand(IterationDirection.Forwards, depth - 1);
    yield* this.B.experimentalExpand(iterDir, depth - 1);
    yield* this.A.experimentalExpand(IterationDirection.Backwards, depth - 1);
  }
  toString() {
    return `[${this.A}: ${this.B}]`;
  }
};
var _repetition3;
var _Conjugate = class extends AlgCommon {
  constructor(aSource, bSource, repetitionInfo) {
    super();
    _repetition3.set(this, void 0);
    __privateSet(this, _repetition3, new Repetition(new QuantumCommutator2(new Alg(aSource), new Alg(bSource)), repetitionInfo));
  }
  get A() {
    return __privateGet(this, _repetition3).quantum.A;
  }
  get B() {
    return __privateGet(this, _repetition3).quantum.B;
  }
  get experimentalEffectiveAmount() {
    return __privateGet(this, _repetition3).experimentalEffectiveAmount();
  }
  get experimentalRepetitionSuffix() {
    return __privateGet(this, _repetition3).suffix();
  }
  isIdentical(other) {
    const otherAsConjugate = other;
    return other.is(_Conjugate) && __privateGet(this, _repetition3).isIdentical(__privateGet(otherAsConjugate, _repetition3));
  }
  invert() {
    return new _Conjugate(__privateGet(this, _repetition3).quantum.A, __privateGet(this, _repetition3).quantum.B.invert(), __privateGet(this, _repetition3).info());
  }
  *experimentalExpand(iterDir, depth) {
    depth ?? (depth = Infinity);
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* __privateGet(this, _repetition3).experimentalExpand(iterDir, depth);
    }
  }
  toString() {
    return `${__privateGet(this, _repetition3).quantum.toString()}${__privateGet(this, _repetition3).suffix()}`;
  }
};
var Conjugate = _Conjugate;
_repetition3 = new WeakMap();

// src/cubing/alg/AlgBuilder.ts
var _units;
var AlgBuilder = class {
  constructor() {
    _units.set(this, []);
  }
  push(u) {
    __privateGet(this, _units).push(u);
  }
  experimentalNumUnits() {
    return __privateGet(this, _units).length;
  }
  toAlg() {
    return new Alg(__privateGet(this, _units));
  }
  reset() {
    __privateSet(this, _units, []);
  }
};
_units = new WeakMap();

// src/cubing/alg/units/leaves/Newline.ts
var Newline = class extends AlgCommon {
  toString() {
    return `
`;
  }
  isIdentical(other) {
    return other.is(Newline);
  }
  invert() {
    return this;
  }
  *experimentalExpand(_iterDir = IterationDirection.Forwards, _depth = Infinity) {
    yield this;
  }
};

// src/cubing/alg/units/leaves/Pause.ts
var Pause = class extends AlgCommon {
  toString() {
    return `.`;
  }
  isIdentical(other) {
    return other.is(Pause);
  }
  invert() {
    return this;
  }
  *experimentalExpand(_iterDir = IterationDirection.Forwards, _depth = Infinity) {
    yield this;
  }
};

// src/cubing/alg/parse.ts
function parseIntWithEmptyFallback(n, emptyFallback) {
  return n ? parseInt(n) : emptyFallback;
}
var repetitionRegex = /^(\d+)?('?)/;
var moveStartRegex = /^[_\dA-Za-z]/;
var quantumMoveRegex = /^((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z]+)?/;
var commentTextRegex = /[^\n]*/;
function parseAlg(s) {
  return new AlgParser().parseAlg(s);
}
function parseMove(s) {
  return new AlgParser().parseMove(s);
}
function parseQuantumMove(s) {
  return new AlgParser().parseQuantumMove(s);
}
var _input, _idx;
var AlgParser = class {
  constructor() {
    _input.set(this, "");
    _idx.set(this, 0);
  }
  parseAlg(input) {
    __privateSet(this, _input, input);
    __privateSet(this, _idx, 0);
    const alg = this.parseAlgWithStopping([]);
    this.mustBeAtEndOfInput();
    return alg;
  }
  parseMove(input) {
    __privateSet(this, _input, input);
    __privateSet(this, _idx, 0);
    const move = this.parseMoveImpl();
    this.mustBeAtEndOfInput();
    return move;
  }
  parseQuantumMove(input) {
    __privateSet(this, _input, input);
    __privateSet(this, _idx, 0);
    const quantumMove = this.parseQuantumMoveImpl();
    this.mustBeAtEndOfInput();
    return quantumMove;
  }
  mustBeAtEndOfInput() {
    if (__privateGet(this, _idx) !== __privateGet(this, _input).length) {
      throw new Error("parsing unexpectedly ended early");
    }
  }
  parseAlgWithStopping(stopBefore) {
    const algBuilder = new AlgBuilder();
    let crowded = false;
    const mustNotBeCrowded = () => {
      if (crowded) {
        throw new Error(`Unexpected unit at idx ${__privateGet(this, _idx)}. Are you missing a space?`);
      }
    };
    mainLoop:
      while (__privateGet(this, _idx) < __privateGet(this, _input).length) {
        if (stopBefore.includes(__privateGet(this, _input)[__privateGet(this, _idx)])) {
          return algBuilder.toAlg();
        }
        if (this.tryConsumeNext(" ")) {
          crowded = false;
          continue mainLoop;
        } else if (moveStartRegex.test(__privateGet(this, _input)[__privateGet(this, _idx)])) {
          mustNotBeCrowded();
          const move = this.parseMoveImpl();
          algBuilder.push(move);
          crowded = true;
          continue mainLoop;
        } else if (this.tryConsumeNext("(")) {
          mustNotBeCrowded();
          const alg = this.parseAlgWithStopping([")"]);
          this.mustConsumeNext(")");
          const repetitionInfo = this.parseRepetition();
          algBuilder.push(new Grouping(alg, repetitionInfo));
          crowded = true;
          continue mainLoop;
        } else if (this.tryConsumeNext("[")) {
          mustNotBeCrowded();
          const A = this.parseAlgWithStopping([",", ":"]);
          const separator = this.popNext();
          const B = this.parseAlgWithStopping(["]"]);
          this.mustConsumeNext("]");
          const repetitionInfo = this.parseRepetition();
          switch (separator) {
            case ":":
              algBuilder.push(new Conjugate(A, B, repetitionInfo));
              crowded = true;
              continue mainLoop;
            case ",":
              algBuilder.push(new Commutator(A, B, repetitionInfo));
              crowded = true;
              continue mainLoop;
            default:
              throw "unexpected parsing error";
          }
        } else if (this.tryConsumeNext("\n")) {
          algBuilder.push(new Newline());
          crowded = false;
          continue mainLoop;
        } else if (this.tryConsumeNext("/")) {
          this.mustConsumeNext("/");
          const [text] = this.parseRegex(commentTextRegex);
          algBuilder.push(new LineComment(text));
          crowded = false;
          continue mainLoop;
        } else if (this.tryConsumeNext(".")) {
          mustNotBeCrowded();
          algBuilder.push(new Pause());
          while (this.tryConsumeNext(".")) {
            algBuilder.push(new Pause());
          }
          crowded = true;
          continue mainLoop;
        } else {
          console.log(__privateGet(this, _input), __privateGet(this, _idx));
          throw new Error(`Unexpected character: ${this.popNext()}`);
        }
      }
    if (__privateGet(this, _idx) !== __privateGet(this, _input).length) {
      throw new Error("did not finish parsing?");
    }
    if (stopBefore.length > 0) {
      throw new Error("expected stopping");
    }
    return algBuilder.toAlg();
  }
  parseQuantumMoveImpl() {
    const [, , , outerLayerStr, innerLayerStr, family] = this.parseRegex(quantumMoveRegex);
    return new QuantumMove(family, parseIntWithEmptyFallback(innerLayerStr, void 0), parseIntWithEmptyFallback(outerLayerStr, void 0));
  }
  parseMoveImpl() {
    const quantumMove = this.parseQuantumMoveImpl();
    const repetitionInfo = this.parseRepetition();
    const move = new Move(quantumMove, repetitionInfo);
    return move;
  }
  parseRepetition() {
    const [, absAmountStr, primeStr] = this.parseRegex(repetitionRegex);
    return [parseIntWithEmptyFallback(absAmountStr, null), primeStr === "'"];
  }
  parseRegex(regex) {
    const arr = regex.exec(this.remaining());
    if (arr === null) {
      throw new Error("internal parsing error");
    }
    __privateSet(this, _idx, __privateGet(this, _idx) + arr[0].length);
    return arr;
  }
  remaining() {
    return __privateGet(this, _input).slice(__privateGet(this, _idx));
  }
  popNext() {
    var _a;
    const next = __privateGet(this, _input)[__privateGet(this, _idx)];
    __privateSet(this, _idx, (_a = +__privateGet(this, _idx)) + 1), _a;
    return next;
  }
  tryConsumeNext(expected) {
    var _a;
    if (__privateGet(this, _input)[__privateGet(this, _idx)] === expected) {
      __privateSet(this, _idx, (_a = +__privateGet(this, _idx)) + 1), _a;
      return true;
    }
    return false;
  }
  mustConsumeNext(expected) {
    const next = this.popNext();
    if (next !== expected) {
      throw new Error(`expected \`${expected}\` while parsing, encountered ${next}`);
    }
    return next;
  }
};
_input = new WeakMap();
_idx = new WeakMap();

// src/cubing/alg/warnOnce.ts
var warned = new Set();
function warnOnce(s) {
  if (!warned.has(s)) {
    console.warn(s);
    warned.add(s);
  }
}

// src/cubing/alg/units/leaves/Move.ts
var _family, _innerLayer, _outerLayer;
var _QuantumMove = class extends Comparable {
  constructor(family, innerLayer, outerLayer) {
    super();
    _family.set(this, void 0);
    _innerLayer.set(this, void 0);
    _outerLayer.set(this, void 0);
    __privateSet(this, _family, family);
    __privateSet(this, _innerLayer, innerLayer ?? null);
    __privateSet(this, _outerLayer, outerLayer ?? null);
    Object.freeze(this);
    if (__privateGet(this, _innerLayer) !== null && (!Number.isInteger(__privateGet(this, _innerLayer)) || __privateGet(this, _innerLayer) < 1 || __privateGet(this, _innerLayer) > MAX_INT)) {
      throw new Error(`QuantumMove inner layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`);
    }
    if (__privateGet(this, _outerLayer) !== null && (!Number.isInteger(__privateGet(this, _outerLayer)) || __privateGet(this, _outerLayer) < 1 || __privateGet(this, _outerLayer) > MAX_INT)) {
      throw new Error(`QuantumMove outer layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`);
    }
    if (__privateGet(this, _outerLayer) !== null && __privateGet(this, _innerLayer) !== null && __privateGet(this, _innerLayer) <= __privateGet(this, _outerLayer)) {
      throw new Error("QuantumMove outer layer must be smaller than inner layer.");
    }
    if (__privateGet(this, _outerLayer) !== null && __privateGet(this, _innerLayer) === null) {
      throw new Error("QuantumMove with an outer layer must have an inner layer");
    }
  }
  static fromString(s) {
    return parseQuantumMove(s);
  }
  modified(modifications) {
    return new _QuantumMove(modifications.family ?? __privateGet(this, _family), modifications.innerLayer ?? __privateGet(this, _innerLayer), modifications.outerLayer ?? __privateGet(this, _outerLayer));
  }
  isIdentical(other) {
    const otherAsQuantumMove = other;
    return other.is(_QuantumMove) && __privateGet(this, _family) === __privateGet(otherAsQuantumMove, _family) && __privateGet(this, _innerLayer) === __privateGet(otherAsQuantumMove, _innerLayer) && __privateGet(this, _outerLayer) === __privateGet(otherAsQuantumMove, _outerLayer);
  }
  get family() {
    return __privateGet(this, _family);
  }
  get outerLayer() {
    return __privateGet(this, _outerLayer);
  }
  get innerLayer() {
    return __privateGet(this, _innerLayer);
  }
  experimentalExpand() {
    throw new Error("experimentalExpand() cannot be called on a `QuantumMove` directly.");
  }
  toString() {
    let s = __privateGet(this, _family);
    if (__privateGet(this, _innerLayer) !== null) {
      s = String(__privateGet(this, _innerLayer)) + s;
      if (__privateGet(this, _outerLayer) !== null) {
        s = String(__privateGet(this, _outerLayer)) + "-" + s;
      }
    }
    return s;
  }
};
var QuantumMove = _QuantumMove;
_family = new WeakMap();
_innerLayer = new WeakMap();
_outerLayer = new WeakMap();
var _repetition4;
var _Move = class extends AlgCommon {
  constructor(...args) {
    super();
    _repetition4.set(this, void 0);
    if (typeof args[0] === "string") {
      if (args[1] ?? null) {
        __privateSet(this, _repetition4, new Repetition(QuantumMove.fromString(args[0]), args[1]));
        return;
      } else {
        return _Move.fromString(args[0]);
      }
    }
    __privateSet(this, _repetition4, new Repetition(args[0], args[1]));
  }
  isIdentical(other) {
    const otherAsMove = other;
    return other.is(_Move) && __privateGet(this, _repetition4).isIdentical(__privateGet(otherAsMove, _repetition4));
  }
  invert() {
    return new _Move(__privateGet(this, _repetition4).quantum, __privateGet(this, _repetition4).inverseInfo());
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards) {
    if (iterDir === IterationDirection.Forwards) {
      yield this;
    } else {
      yield this.modified({repetition: __privateGet(this, _repetition4).inverseInfo()});
    }
  }
  get quantum() {
    return __privateGet(this, _repetition4).quantum;
  }
  equals(other) {
    return this.quantum.isIdentical(other.quantum) && __privateGet(this, _repetition4).isIdentical(__privateGet(other, _repetition4));
  }
  modified(modifications) {
    return new _Move(__privateGet(this, _repetition4).quantum.modified(modifications), modifications.repetition ?? __privateGet(this, _repetition4).info());
  }
  static fromString(s) {
    return parseMove(s);
  }
  get effectiveAmount() {
    return (__privateGet(this, _repetition4).absAmount ?? 1) * (__privateGet(this, _repetition4).prime ? -1 : 1);
  }
  get type() {
    warnOnce("deprecated: type");
    return "blockMove";
  }
  get family() {
    return __privateGet(this, _repetition4).quantum.family ?? void 0;
  }
  get outerLayer() {
    return __privateGet(this, _repetition4).quantum.outerLayer ?? void 0;
  }
  get innerLayer() {
    return __privateGet(this, _repetition4).quantum.innerLayer ?? void 0;
  }
  toString() {
    return __privateGet(this, _repetition4).quantum.toString() + __privateGet(this, _repetition4).suffix();
  }
};
var Move = _Move;
_repetition4 = new WeakMap();

// src/cubing/alg/is.ts
function experimentalIs(v, c) {
  return v instanceof c;
}
function experimentalIsUnit(v) {
  return experimentalIs(v, Grouping) || experimentalIs(v, LineComment) || experimentalIs(v, Commutator) || experimentalIs(v, Conjugate) || experimentalIs(v, Move) || experimentalIs(v, Newline) || experimentalIs(v, Pause);
}

// src/cubing/alg/traversal.ts
function dispatch(t, unit, dataDown) {
  if (unit.is(Grouping)) {
    return t.traverseGrouping(unit, dataDown);
  }
  if (unit.is(Move)) {
    return t.traverseMove(unit, dataDown);
  }
  if (unit.is(Commutator)) {
    return t.traverseCommutator(unit, dataDown);
  }
  if (unit.is(Conjugate)) {
    return t.traverseConjugate(unit, dataDown);
  }
  if (unit.is(Pause)) {
    return t.traversePause(unit, dataDown);
  }
  if (unit.is(Newline)) {
    return t.traverseNewline(unit, dataDown);
  }
  if (unit.is(LineComment)) {
    return t.traverseLineComment(unit, dataDown);
  }
  throw new Error(`unknown unit`);
}
function assertIsUnit(t) {
  if (t.is(Grouping) || t.is(Move) || t.is(Commutator) || t.is(Conjugate) || t.is(Pause) || t.is(Newline) || t.is(LineComment)) {
    return t;
  }
  throw "internal error: expected unit";
}
var TraversalDownUp = class {
  traverseUnit(unit, dataDown) {
    return dispatch(this, unit, dataDown);
  }
  traverseIntoUnit(unit, dataDown) {
    return assertIsUnit(this.traverseUnit(unit, dataDown));
  }
};
var TraversalUp = class extends TraversalDownUp {
  traverseUnit(unit) {
    return dispatch(this, unit, void 0);
  }
  traverseIntoUnit(unit) {
    return assertIsUnit(this.traverseUnit(unit));
  }
};
var Simplify = class extends TraversalDownUp {
  *traverseAlg(alg, options) {
    if (options.depth === 0) {
      yield* alg.units();
      return;
    }
    const newUnits = [];
    let lastUnit = null;
    const collapseMoves = options?.collapseMoves ?? true;
    function appendCollapsed(newUnit) {
      if (collapseMoves && lastUnit?.is(Move) && newUnit.is(Move)) {
        const lastMove = lastUnit;
        const newMove = newUnit;
        if (lastMove.quantum.isIdentical(newMove.quantum)) {
          newUnits.pop();
          const newAmount = lastMove.effectiveAmount + newMove.effectiveAmount;
          if (newAmount !== 0) {
            const coalescedMove = new Move(lastMove.quantum, newAmount);
            newUnits.push(coalescedMove);
            lastUnit = coalescedMove;
          } else {
            lastUnit = newUnits.slice(-1)[0];
          }
        } else {
          newUnits.push(newUnit);
          lastUnit = newUnit;
        }
      } else {
        newUnits.push(newUnit);
        lastUnit = newUnit;
      }
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null
    };
    for (const unit of alg.units()) {
      for (const ancestorUnit of this.traverseUnit(unit, newOptions)) {
        appendCollapsed(ancestorUnit);
      }
    }
    for (const unit of newUnits) {
      yield unit;
    }
  }
  *traverseGrouping(grouping, options) {
    if (options.depth === 0) {
      yield grouping;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null
    };
    yield new Grouping(this.traverseAlg(grouping.experimentalAlg, newOptions));
  }
  *traverseMove(move, _options) {
    yield move;
  }
  *traverseCommutator(commutator, options) {
    if (options.depth === 0) {
      yield commutator;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null
    };
    yield new Commutator(this.traverseAlg(commutator.A, newOptions), this.traverseAlg(commutator.B, newOptions));
  }
  *traverseConjugate(conjugate, options) {
    if (options.depth === 0) {
      yield conjugate;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null
    };
    yield new Conjugate(this.traverseAlg(conjugate.A, newOptions), this.traverseAlg(conjugate.B, newOptions));
  }
  *traversePause(pause, _options) {
    yield pause;
  }
  *traverseNewline(newline, _options) {
    yield newline;
  }
  *traverseLineComment(comment, _options) {
    yield comment;
  }
};
var simplifyInstance = new Simplify();
var simplify = simplifyInstance.traverseAlg.bind(simplifyInstance);

// src/cubing/alg/Alg.ts
function toIterable(input) {
  if (!input) {
    return [];
  }
  if (experimentalIs(input, Alg)) {
    return input.units();
  }
  if (typeof input === "string") {
    return parseAlg(input).units();
  }
  const iter = input;
  if (typeof iter[Symbol.iterator] === "function") {
    return iter;
  }
  throw "Invalid unit";
}
var _units2;
var _Alg = class extends AlgCommon {
  constructor(alg) {
    super();
    _units2.set(this, void 0);
    __privateSet(this, _units2, Array.from(toIterable(alg)));
    for (const unit of __privateGet(this, _units2)) {
      if (!experimentalIsUnit(unit)) {
        throw new Error("An alg can only contain units.");
      }
    }
  }
  isIdentical(other) {
    const otherAsAlg = other;
    if (!other.is(_Alg)) {
      return false;
    }
    const l1 = Array.from(__privateGet(this, _units2));
    const l2 = Array.from(__privateGet(otherAsAlg, _units2));
    if (l1.length !== l2.length) {
      return false;
    }
    for (let i = 0; i < l1.length; i++) {
      if (!l1[i].isIdentical(l2[i])) {
        return false;
      }
    }
    return true;
  }
  invert() {
    return new _Alg(reverse(Array.from(__privateGet(this, _units2)).map((u) => u.invert())));
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    depth ?? (depth = Infinity);
    for (const unit of direct(__privateGet(this, _units2), iterDir)) {
      yield* unit.experimentalExpand(iterDir, depth);
    }
  }
  expand(options) {
    return new _Alg(this.experimentalExpand(IterationDirection.Forwards, options?.depth ?? Infinity));
  }
  *experimentalLeafMoves() {
    for (const leaf of this.experimentalExpand()) {
      if (leaf.is(Move)) {
        yield leaf;
      }
    }
  }
  concat(input) {
    return new _Alg(Array.from(__privateGet(this, _units2)).concat(Array.from(toIterable(input))));
  }
  experimentalIsEmpty() {
    for (const _ of __privateGet(this, _units2)) {
      return false;
    }
    return true;
  }
  static fromString(s) {
    return parseAlg(s);
  }
  *units() {
    for (const unit of __privateGet(this, _units2)) {
      yield unit;
    }
  }
  experimentalNumUnits() {
    return Array.from(__privateGet(this, _units2)).length;
  }
  get type() {
    warnOnce("deprecated: type");
    return "sequence";
  }
  toString() {
    let output = "";
    let previousUnit = null;
    for (const unit of __privateGet(this, _units2)) {
      if (previousUnit) {
        output += spaceBetween(previousUnit, unit);
      }
      output += unit.toString();
      previousUnit = unit;
    }
    return output;
  }
  simplify(options) {
    return new _Alg(simplify(this, options ?? {}));
  }
};
var Alg = _Alg;
_units2 = new WeakMap();
function spaceBetween(u1, u2) {
  if (u1.is(Pause) && u2.is(Pause)) {
    return "";
  }
  if (u1.is(Newline) || u2.is(Newline)) {
    return "";
  }
  if (u1.is(LineComment) && !u2.is(Newline)) {
    return "\n";
  }
  return " ";
}

// src/cubing/alg/example.ts
var Example = {
  Sune: new Alg([
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", 1),
    new Move("R", 1),
    new Move("U", -2),
    new Move("R", -1)
  ]),
  AntiSune: new Alg([
    new Move("R", 1),
    new Move("U", 2),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", 1),
    new Move("U", -1),
    new Move("R", -1)
  ]),
  SuneCommutator: new Alg([
    new Commutator(new Alg([new Move("R", 1), new Move("U", 1), new Move("R", -2)]), new Alg([
      new Conjugate(new Alg([new Move("R", 1)]), new Alg([new Move("U", 1)]), 1)
    ]), 1)
  ]),
  Niklas: new Alg([
    new Move("R", 1),
    new Move("U", -1),
    new Move("L", -1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("L", 1),
    new Move("U", 1)
  ]),
  EPerm: new Alg([
    new Move("x", -1),
    new Commutator(new Alg([
      new Conjugate(new Alg([new Move("R", 1)]), new Alg([new Move("U", -1)]))
    ]), new Alg([new Move("D", 1)]), 1),
    new Commutator(new Alg([
      new Conjugate(new Alg([new Move("R", 1)]), new Alg([new Move("U", 1)]))
    ]), new Alg([new Move("D", 1)]), 1),
    new Move("x", 1)
  ]),
  FURURFCompact: new Alg([
    new Conjugate(new Alg([new Move("F", 1)]), new Alg([
      new Commutator(new Alg([new Move("U", 1)]), new Alg([new Move("R", 1)]), 1)
    ]), 1)
  ]),
  APermCompact: new Alg([
    new Conjugate(new Alg([new Move("R", 2)]), new Alg([
      new Commutator(new Alg([new Move("F", 2)]), new Alg([new Move("R", -1), new Move("B", -1), new Move("R", 1)]), 1)
    ]), 1)
  ]),
  FURURFMoves: new Alg([
    new Move("F", 1),
    new Move("U", 1),
    new Move("R", 1),
    new Move("U", -1),
    new Move("R", -1),
    new Move("F", -1)
  ]),
  TPerm: new Alg([
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", -1),
    new Move("F", 1),
    new Move("R", 2),
    new Move("U", -1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("F", -1)
  ]),
  HeadlightSwaps: new Alg([
    new Conjugate(new Alg([new Move("F", 1)]), new Alg([
      new Commutator(new Alg([new Move("R", 1)]), new Alg([new Move("U", 1)]), 3)
    ]), 1)
  ]),
  TriplePause: new Alg([new Pause(), new Pause(), new Pause()])
};

// src/cubing/alg/keyboard.ts
var cubeKeyMapping = {
  73: new Move("R"),
  75: new Move("R'"),
  87: new Move("B"),
  79: new Move("B'"),
  83: new Move("D"),
  76: new Move("D'"),
  68: new Move("L"),
  69: new Move("L'"),
  74: new Move("U"),
  70: new Move("U'"),
  72: new Move("F"),
  71: new Move("F'"),
  78: new Move("x'"),
  67: new Move("l"),
  82: new Move("l'"),
  85: new Move("r"),
  77: new Move("r'"),
  88: new Move("d"),
  188: new Move("d'"),
  84: new Move("x"),
  89: new Move("x"),
  66: new Move("x'"),
  186: new Move("y"),
  59: new Move("y"),
  65: new Move("y'"),
  80: new Move("z"),
  81: new Move("z'"),
  90: new Move("M'"),
  190: new Move("M'")
};
function keyToMove(e) {
  if (e.altKey || e.ctrlKey) {
    return null;
  }
  return cubeKeyMapping[e.keyCode] || null;
}

// src/cubing/alg/url.ts
function serializeURLParam(a) {
  let escaped = a.toString();
  escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
  escaped = escaped.replace(/\+/g, "&#2b;");
  escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
  return escaped;
}
function algCubingNetLink(options) {
  const url = new URL("https://alg.cubing.net");
  if (!options.alg) {
    throw new Error("An alg parameter is required.");
  }
  url.searchParams.set("alg", serializeURLParam(options.alg));
  if (options.setup) {
    url.searchParams.set("setup", serializeURLParam(options.setup));
  }
  if (options.title) {
    url.searchParams.set("title", options.title);
  }
  if (options.puzzle) {
    if (![
      "1x1x1",
      "2x2x2",
      "3x3x3",
      "4x4x4",
      "5x5x5",
      "6x6x6",
      "7x7x7",
      "8x8x8",
      "9x9x9",
      "10x10x10",
      "11x11x11",
      "12x12x12",
      "13x13x13",
      "14x14x14",
      "16x16x16",
      "17x17x17"
    ].includes(options.puzzle)) {
      throw new Error(`Invalid puzzle parameter: ${options.puzzle}`);
    }
    url.searchParams.set("puzzle", options.puzzle);
  }
  if (options.stage) {
    if (![
      "full",
      "cross",
      "F2L",
      "LL",
      "OLL",
      "PLL",
      "CLS",
      "ELS",
      "L6E",
      "CMLL",
      "WV",
      "ZBLL",
      "void"
    ].includes(options.stage)) {
      throw new Error(`Invalid stage parameter: ${options.stage}`);
    }
    url.searchParams.set("stage", options.stage);
  }
  if (options.view) {
    if (!["editor", "playback", "fullscreen"].includes(options.view)) {
      throw new Error(`Invalid view parameter: ${options.view}`);
    }
    url.searchParams.set("view", options.view);
  }
  if (options.type) {
    if (![
      "moves",
      "reconstruction",
      "alg",
      "reconstruction-end-with-setup"
    ].includes(options.type)) {
      throw new Error(`Invalid type parameter: ${options.type}`);
    }
    url.searchParams.set("type", options.type);
  }
  return url.toString();
}

// src/cubing/alg/operation.ts
function experimentalAppendMove(alg, newMove, options) {
  const oldUnits = Array.from(alg.units());
  const oldLastMove = oldUnits[oldUnits.length - 1];
  if (options?.coalesce && oldLastMove && oldLastMove.quantum && oldLastMove.quantum.isIdentical(newMove.quantum)) {
    const newUnits = oldUnits.slice(0, oldUnits.length - 1);
    let newAmount = oldLastMove.effectiveAmount + newMove.effectiveAmount;
    const mod = options?.mod;
    if (mod) {
      newAmount = (newAmount % mod + mod) % mod;
      if (newAmount * 2 > mod) {
        newAmount -= mod;
      }
    }
    if (newAmount !== 0) {
      newUnits.push(oldLastMove.modified({repetition: newAmount}));
    }
    return new Alg(newUnits);
  } else {
    return new Alg([...oldUnits, newMove]);
  }
}
export {
  Alg,
  AlgBuilder,
  Commutator,
  Conjugate,
  Example,
  IterationDirection as ExperimentalIterationDirection,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  QuantumMove,
  TraversalDownUp,
  TraversalUp,
  algCubingNetLink,
  experimentalAppendMove,
  direct as experimentalDirect,
  directedGenerator as experimentalDirectedGenerator,
  experimentalIs,
  keyToMove
};
