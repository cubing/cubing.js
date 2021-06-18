var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
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
  as(c) {
    return this instanceof c ? this : null;
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

// src/cubing/alg/limits.ts
var MAX_INT = 2147483647;
var MAX_INT_DESCRIPTION = "2^31 - 1";
var MIN_INT = -2147483648;

// src/cubing/alg/AlgBuilder.ts
var _units;
var AlgBuilder = class {
  constructor() {
    __privateAdd(this, _units, []);
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

// src/cubing/alg/units/containers/Commutator.ts
var _A, _B;
var _Commutator = class extends AlgCommon {
  constructor(aSource, bSource) {
    super();
    __privateAdd(this, _A, void 0);
    __privateAdd(this, _B, void 0);
    __privateSet(this, _A, experimentalEnsureAlg(aSource));
    __privateSet(this, _B, experimentalEnsureAlg(bSource));
  }
  get A() {
    return __privateGet(this, _A);
  }
  get B() {
    return __privateGet(this, _B);
  }
  isIdentical(other) {
    const otherAsCommutator = other.as(_Commutator);
    return !!((otherAsCommutator == null ? void 0 : otherAsCommutator.A.isIdentical(this.A)) && (otherAsCommutator == null ? void 0 : otherAsCommutator.B.isIdentical(this.B)));
  }
  invert() {
    return new _Commutator(__privateGet(this, _B), __privateGet(this, _A));
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    depth != null ? depth : depth = Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
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
  }
  toString() {
    return `[${__privateGet(this, _A)}, ${__privateGet(this, _B)}]`;
  }
};
var Commutator = _Commutator;
_A = new WeakMap();
_B = new WeakMap();

// src/cubing/alg/units/containers/Conjugate.ts
var _A2, _B2;
var _Conjugate = class extends AlgCommon {
  constructor(aSource, bSource) {
    super();
    __privateAdd(this, _A2, void 0);
    __privateAdd(this, _B2, void 0);
    __privateSet(this, _A2, experimentalEnsureAlg(aSource));
    __privateSet(this, _B2, experimentalEnsureAlg(bSource));
  }
  get A() {
    return __privateGet(this, _A2);
  }
  get B() {
    return __privateGet(this, _B2);
  }
  isIdentical(other) {
    const otherAsConjugate = other.as(_Conjugate);
    return !!((otherAsConjugate == null ? void 0 : otherAsConjugate.A.isIdentical(this.A)) && (otherAsConjugate == null ? void 0 : otherAsConjugate.B.isIdentical(this.B)));
  }
  invert() {
    return new _Conjugate(__privateGet(this, _A2), __privateGet(this, _B2).invert());
  }
  *experimentalExpand(iterDir, depth) {
    depth != null ? depth : depth = Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* this.A.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.B.experimentalExpand(iterDir, depth - 1);
      yield* this.A.experimentalExpand(IterationDirection.Backwards, depth - 1);
    }
  }
  toString() {
    return `[${this.A}: ${this.B}]`;
  }
};
var Conjugate = _Conjugate;
_A2 = new WeakMap();
_B2 = new WeakMap();

// src/cubing/alg/units/leaves/LineComment.ts
var _text;
var _LineComment = class extends AlgCommon {
  constructor(commentText) {
    super();
    __privateAdd(this, _text, void 0);
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
var amountRegex = /^(\d+)?('?)/;
var moveStartRegex = /^[_\dA-Za-z]/;
var quantumMoveRegex = /^((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z]+)?/;
var commentTextRegex = /^[^\n]*/;
var square1PairStart = /^(-?\d+), ?/;
var square1PairEnd = /^(-?\d+)\)/;
function parseAlg(s) {
  return new AlgParser().parseAlg(s);
}
function parseMove(s) {
  return new AlgParser().parseMove(s);
}
function parseQuantumMove(s) {
  return new AlgParser().parseQuantumMove(s);
}
function addCharIndices(t, startCharIndex, endCharIndex) {
  const parsedT = t;
  parsedT.startCharIndex = startCharIndex;
  parsedT.endCharIndex = endCharIndex;
  return parsedT;
}
function transferCharIndex(from, to) {
  if ("startCharIndex" in from) {
    to.startCharIndex = from.startCharIndex;
  }
  if ("endCharIndex" in from) {
    to.endCharIndex = from.endCharIndex;
  }
  return to;
}
var _input, _idx;
var AlgParser = class {
  constructor() {
    __privateAdd(this, _input, "");
    __privateAdd(this, _idx, 0);
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
    let algStartIdx = __privateGet(this, _idx);
    let algEndIdx = __privateGet(this, _idx);
    const algBuilder = new AlgBuilder();
    let crowded = false;
    const mustNotBeCrowded = (idx) => {
      if (crowded) {
        throw new Error(`Unexpected character at index ${idx}. Are you missing a space?`);
      }
    };
    mainLoop:
      while (__privateGet(this, _idx) < __privateGet(this, _input).length) {
        const savedCharIndex = __privateGet(this, _idx);
        if (stopBefore.includes(__privateGet(this, _input)[__privateGet(this, _idx)])) {
          return addCharIndices(algBuilder.toAlg(), algStartIdx, algEndIdx);
        }
        if (this.tryConsumeNext(" ")) {
          crowded = false;
          if (algBuilder.experimentalNumUnits() === 0) {
            algStartIdx = __privateGet(this, _idx);
          }
          continue mainLoop;
        } else if (moveStartRegex.test(__privateGet(this, _input)[__privateGet(this, _idx)])) {
          mustNotBeCrowded(savedCharIndex);
          const move = this.parseMoveImpl();
          algBuilder.push(move);
          crowded = true;
          algEndIdx = __privateGet(this, _idx);
          continue mainLoop;
        } else if (this.tryConsumeNext("(")) {
          mustNotBeCrowded(savedCharIndex);
          const sq1PairStartMatch = this.tryRegex(square1PairStart);
          if (sq1PairStartMatch) {
            const topAmountString = sq1PairStartMatch[1];
            const savedCharIndexD = __privateGet(this, _idx);
            const sq1PairEndMatch = this.parseRegex(square1PairEnd);
            const uMove = addCharIndices(new Move(new QuantumMove("U_SQ_"), parseInt(topAmountString)), savedCharIndex + 1, savedCharIndex + 1 + topAmountString.length);
            const dMove = addCharIndices(new Move(new QuantumMove("D_SQ_"), parseInt(sq1PairEndMatch[1])), savedCharIndexD, __privateGet(this, _idx) - 1);
            const alg = addCharIndices(new Alg([uMove, dMove]), savedCharIndex + 1, __privateGet(this, _idx) - 1);
            algBuilder.push(addCharIndices(new Grouping(alg), savedCharIndex, __privateGet(this, _idx)));
            crowded = true;
            algEndIdx = __privateGet(this, _idx);
            continue mainLoop;
          } else {
            const alg = this.parseAlgWithStopping([")"]);
            this.mustConsumeNext(")");
            const amount = this.parseAmount();
            algBuilder.push(addCharIndices(new Grouping(alg, amount), savedCharIndex, __privateGet(this, _idx)));
            crowded = true;
            algEndIdx = __privateGet(this, _idx);
            continue mainLoop;
          }
        } else if (this.tryConsumeNext("[")) {
          mustNotBeCrowded(savedCharIndex);
          const A = this.parseAlgWithStopping([",", ":"]);
          const separator = this.popNext();
          const B = this.parseAlgWithStopping(["]"]);
          this.mustConsumeNext("]");
          switch (separator) {
            case ":":
              algBuilder.push(addCharIndices(new Conjugate(A, B), savedCharIndex, __privateGet(this, _idx)));
              crowded = true;
              algEndIdx = __privateGet(this, _idx);
              continue mainLoop;
            case ",":
              algBuilder.push(addCharIndices(new Commutator(A, B), savedCharIndex, __privateGet(this, _idx)));
              crowded = true;
              algEndIdx = __privateGet(this, _idx);
              continue mainLoop;
            default:
              throw "unexpected parsing error";
          }
        } else if (this.tryConsumeNext("\n")) {
          algBuilder.push(addCharIndices(new Newline(), savedCharIndex, __privateGet(this, _idx)));
          crowded = false;
          algEndIdx = __privateGet(this, _idx);
          continue mainLoop;
        } else if (this.tryConsumeNext("/")) {
          if (this.tryConsumeNext("/")) {
            mustNotBeCrowded(savedCharIndex);
            const [text] = this.parseRegex(commentTextRegex);
            algBuilder.push(addCharIndices(new LineComment(text), savedCharIndex, __privateGet(this, _idx)));
            crowded = false;
            algEndIdx = __privateGet(this, _idx);
            continue mainLoop;
          } else {
            algBuilder.push(addCharIndices(new Move("_SLASH_"), savedCharIndex, __privateGet(this, _idx)));
            crowded = true;
            algEndIdx = __privateGet(this, _idx);
            continue mainLoop;
          }
        } else if (this.tryConsumeNext(".")) {
          mustNotBeCrowded(savedCharIndex);
          algBuilder.push(addCharIndices(new Pause(), savedCharIndex, __privateGet(this, _idx)));
          crowded = true;
          algEndIdx = __privateGet(this, _idx);
          continue mainLoop;
        } else {
          throw new Error(`Unexpected character: ${this.popNext()}`);
        }
      }
    if (__privateGet(this, _idx) !== __privateGet(this, _input).length) {
      throw new Error("did not finish parsing?");
    }
    if (stopBefore.length > 0) {
      throw new Error("expected stopping");
    }
    return addCharIndices(algBuilder.toAlg(), algStartIdx, algEndIdx);
  }
  parseQuantumMoveImpl() {
    const [, , , outerLayerStr, innerLayerStr, family] = this.parseRegex(quantumMoveRegex);
    return new QuantumMove(family, parseIntWithEmptyFallback(innerLayerStr, void 0), parseIntWithEmptyFallback(outerLayerStr, void 0));
  }
  parseMoveImpl() {
    const savedCharIndex = __privateGet(this, _idx);
    if (this.tryConsumeNext("/")) {
      return addCharIndices(new Move("_SLASH_"), savedCharIndex, __privateGet(this, _idx));
    }
    let quantumMove = this.parseQuantumMoveImpl();
    let [amount, hadEmptyAbsAmount] = this.parseAmountAndTrackEmptyAbsAmount();
    const suffix = this.parseMoveSuffix();
    if (suffix) {
      if (amount < 0) {
        throw new Error("uh-oh");
      }
      if ((suffix === "++" || suffix === "--") && amount !== 1) {
        throw new Error("Pochmann ++ or -- moves cannot have an amount other than 1.");
      }
      if ((suffix === "++" || suffix === "--") && !hadEmptyAbsAmount) {
        throw new Error("Pochmann ++ or -- moves cannot have an amount written as a number.");
      }
      if ((suffix === "+" || suffix === "-") && hadEmptyAbsAmount) {
        throw new Error("Clock dial moves must have an amount written as a natural number followed by + or -.");
      }
      if (suffix.startsWith("+")) {
        quantumMove = quantumMove.modified({
          family: `${quantumMove.family}_${suffix === "+" ? "PLUS" : "PLUSPLUS"}_`
        });
      }
      if (suffix.startsWith("-")) {
        quantumMove = quantumMove.modified({
          family: `${quantumMove.family}_${suffix === "-" ? "PLUS" : "PLUSPLUS"}_`
        });
        amount *= -1;
      }
    }
    const move = addCharIndices(new Move(quantumMove, amount), savedCharIndex, __privateGet(this, _idx));
    return move;
  }
  parseMoveSuffix() {
    if (this.tryConsumeNext("+")) {
      if (this.tryConsumeNext("+")) {
        return "++";
      }
      return "+";
    }
    if (this.tryConsumeNext("-")) {
      if (this.tryConsumeNext("-")) {
        return "--";
      }
      return "-";
    }
    return null;
  }
  parseAmountAndTrackEmptyAbsAmount() {
    const savedIdx = __privateGet(this, _idx);
    const [, absAmountStr, primeStr] = this.parseRegex(amountRegex);
    if ((absAmountStr == null ? void 0 : absAmountStr.startsWith("0")) && absAmountStr !== "0") {
      throw new Error(`Error at char index ${savedIdx}: An amount can only start with 0 if it's exactly the digit 0.`);
    }
    return [
      parseIntWithEmptyFallback(absAmountStr, 1) * (primeStr === "'" ? -1 : 1),
      !absAmountStr
    ];
  }
  parseAmount() {
    const savedIdx = __privateGet(this, _idx);
    const [, absAmountStr, primeStr] = this.parseRegex(amountRegex);
    if ((absAmountStr == null ? void 0 : absAmountStr.startsWith("0")) && absAmountStr !== "0") {
      throw new Error(`Error at char index ${savedIdx}: An amount number can only start with 0 if it's exactly the digit 0.`);
    }
    return parseIntWithEmptyFallback(absAmountStr, 1) * (primeStr === "'" ? -1 : 1);
  }
  parseRegex(regex) {
    const arr = regex.exec(this.remaining());
    if (arr === null) {
      throw new Error("internal parsing error");
    }
    __privateSet(this, _idx, __privateGet(this, _idx) + arr[0].length);
    return arr;
  }
  tryRegex(regex) {
    const arr = regex.exec(this.remaining());
    if (arr === null) {
      return null;
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

// src/cubing/alg/units/QuantumWithAmount.ts
var QuantumWithAmount = class {
  constructor(quantum, amount = 1) {
    this.quantum = quantum;
    this.amount = amount;
    if (!Number.isInteger(this.amount) || this.amount < MIN_INT || this.amount > MAX_INT) {
      throw new Error(`Unit amount absolute value must be a non-negative integer from ${MAX_INT_DESCRIPTION} to ${MAX_INT_DESCRIPTION}.`);
    }
  }
  suffix() {
    let s = "";
    const absAmount = Math.abs(this.amount);
    if (absAmount !== 1) {
      s += absAmount;
    }
    if (this.amount < 0) {
      s += "'";
    }
    return s;
  }
  isIdentical(other) {
    return this.quantum.isIdentical(other.quantum) && this.amount === other.amount;
  }
  *experimentalExpand(iterDir, depth) {
    const absAmount = Math.abs(this.amount);
    const newIterDir = toggleDirection(iterDir, this.amount < 0);
    for (let i = 0; i < absAmount; i++) {
      yield* this.quantum.experimentalExpand(newIterDir, depth);
    }
  }
};

// src/cubing/alg/units/leaves/Move.ts
var _family, _innerLayer, _outerLayer;
var _QuantumMove = class extends Comparable {
  constructor(family, innerLayer, outerLayer) {
    super();
    __privateAdd(this, _family, void 0);
    __privateAdd(this, _innerLayer, void 0);
    __privateAdd(this, _outerLayer, void 0);
    __privateSet(this, _family, family);
    __privateSet(this, _innerLayer, innerLayer != null ? innerLayer : null);
    __privateSet(this, _outerLayer, outerLayer != null ? outerLayer : null);
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
    var _a, _b, _c;
    return new _QuantumMove((_a = modifications.family) != null ? _a : __privateGet(this, _family), (_b = modifications.innerLayer) != null ? _b : __privateGet(this, _innerLayer), (_c = modifications.outerLayer) != null ? _c : __privateGet(this, _outerLayer));
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
var _quantumWithAmount;
var _Move = class extends AlgCommon {
  constructor(...args) {
    super();
    __privateAdd(this, _quantumWithAmount, void 0);
    var _a;
    if (typeof args[0] === "string") {
      if ((_a = args[1]) != null ? _a : null) {
        __privateSet(this, _quantumWithAmount, new QuantumWithAmount(QuantumMove.fromString(args[0]), args[1]));
        return;
      } else {
        return _Move.fromString(args[0]);
      }
    }
    __privateSet(this, _quantumWithAmount, new QuantumWithAmount(args[0], args[1]));
  }
  isIdentical(other) {
    const otherAsMove = other.as(_Move);
    return !!otherAsMove && __privateGet(this, _quantumWithAmount).isIdentical(__privateGet(otherAsMove, _quantumWithAmount));
  }
  invert() {
    return transferCharIndex(this, new _Move(__privateGet(this, _quantumWithAmount).quantum, -this.amount));
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards) {
    if (iterDir === IterationDirection.Forwards) {
      yield this;
    } else {
      yield this.modified({
        amount: -this.amount
      });
    }
  }
  get quantum() {
    return __privateGet(this, _quantumWithAmount).quantum;
  }
  equals(other) {
    return this.quantum.isIdentical(other.quantum) && __privateGet(this, _quantumWithAmount).isIdentical(__privateGet(other, _quantumWithAmount));
  }
  modified(modifications) {
    var _a;
    return new _Move(__privateGet(this, _quantumWithAmount).quantum.modified(modifications), (_a = modifications.amount) != null ? _a : this.amount);
  }
  static fromString(s) {
    return parseMove(s);
  }
  get amount() {
    return __privateGet(this, _quantumWithAmount).amount;
  }
  get type() {
    warnOnce("deprecated: type");
    return "blockMove";
  }
  get family() {
    var _a;
    return (_a = __privateGet(this, _quantumWithAmount).quantum.family) != null ? _a : void 0;
  }
  get outerLayer() {
    var _a;
    return (_a = __privateGet(this, _quantumWithAmount).quantum.outerLayer) != null ? _a : void 0;
  }
  get innerLayer() {
    var _a;
    return (_a = __privateGet(this, _quantumWithAmount).quantum.innerLayer) != null ? _a : void 0;
  }
  toString() {
    if (this.family === "_SLASH_") {
      return "/";
    }
    if (this.family.endsWith("_PLUS_")) {
      return __privateGet(this, _quantumWithAmount).quantum.toString().slice(0, -6) + Math.abs(this.amount) + (this.amount < 0 ? "-" : "+");
    }
    if (this.family.endsWith("_PLUSPLUS_")) {
      const absAmount = Math.abs(this.amount);
      return __privateGet(this, _quantumWithAmount).quantum.toString().slice(0, -10) + (absAmount === 1 ? "" : absAmount) + (this.amount < 0 ? "--" : "++");
    }
    return __privateGet(this, _quantumWithAmount).quantum.toString() + __privateGet(this, _quantumWithAmount).suffix();
  }
};
var Move = _Move;
_quantumWithAmount = new WeakMap();

// src/cubing/alg/units/containers/Grouping.ts
var Square1TupleFormatter = class {
  constructor() {
    this.quantumU_SQ_ = null;
    this.quantumD_SQ_ = null;
  }
  format(grouping) {
    const amounts = this.tuple(grouping);
    if (!amounts) {
      return null;
    }
    return `(${amounts.map((move) => move.amount).join(", ")})`;
  }
  tuple(grouping) {
    var _a, _b;
    this.quantumU_SQ_ || (this.quantumU_SQ_ = new QuantumMove("U_SQ_"));
    this.quantumD_SQ_ || (this.quantumD_SQ_ = new QuantumMove("D_SQ_"));
    const quantumAlg = grouping.alg;
    if (quantumAlg.experimentalNumUnits() === 2) {
      const [U, D] = quantumAlg.units();
      if (((_a = U.as(Move)) == null ? void 0 : _a.quantum.isIdentical(this.quantumU_SQ_)) && ((_b = D.as(Move)) == null ? void 0 : _b.quantum.isIdentical(this.quantumD_SQ_))) {
        if (grouping.amount !== 1) {
          throw new Error("Square-1 tuples cannot have an amount other than 1.");
        }
        return [U, D];
      }
    }
    return null;
  }
};
var square1TupleFormatterInstance = new Square1TupleFormatter();
var _quantumWithAmount2;
var _Grouping = class extends AlgCommon {
  constructor(algSource, amount) {
    super();
    __privateAdd(this, _quantumWithAmount2, void 0);
    const alg = experimentalEnsureAlg(algSource);
    __privateSet(this, _quantumWithAmount2, new QuantumWithAmount(alg, amount));
  }
  isIdentical(other) {
    const otherAsGrouping = other;
    return other.is(_Grouping) && __privateGet(this, _quantumWithAmount2).isIdentical(__privateGet(otherAsGrouping, _quantumWithAmount2));
  }
  get alg() {
    return __privateGet(this, _quantumWithAmount2).quantum;
  }
  get amount() {
    return __privateGet(this, _quantumWithAmount2).amount;
  }
  get experimentalRepetitionSuffix() {
    return __privateGet(this, _quantumWithAmount2).suffix();
  }
  invert() {
    return new _Grouping(__privateGet(this, _quantumWithAmount2).quantum, -__privateGet(this, _quantumWithAmount2).amount);
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    depth != null ? depth : depth = Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* __privateGet(this, _quantumWithAmount2).experimentalExpand(iterDir, depth - 1);
    }
  }
  static fromString() {
    throw new Error("unimplemented");
  }
  toString() {
    var _a;
    return (_a = square1TupleFormatterInstance.format(this)) != null ? _a : `(${__privateGet(this, _quantumWithAmount2).quantum.toString()})${__privateGet(this, _quantumWithAmount2).suffix()}`;
  }
  experimentalAsSquare1Tuple() {
    return square1TupleFormatterInstance.tuple(this);
  }
};
var Grouping = _Grouping;
_quantumWithAmount2 = new WeakMap();

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
var Simplify = class extends TraversalDownUp {
  *traverseAlg(alg, options) {
    var _a;
    if (options.depth === 0) {
      yield* alg.units();
      return;
    }
    const newUnits = [];
    let lastUnit = null;
    const collapseMoves = (_a = options == null ? void 0 : options.collapseMoves) != null ? _a : true;
    function appendCollapsed(newUnit) {
      if (collapseMoves && (lastUnit == null ? void 0 : lastUnit.is(Move)) && newUnit.is(Move)) {
        const lastMove = lastUnit;
        const newMove = newUnit;
        if (lastMove.quantum.isIdentical(newMove.quantum)) {
          newUnits.pop();
          let newAmount = lastMove.amount + newMove.amount;
          if (options == null ? void 0 : options.quantumMoveOrder) {
            const order = options.quantumMoveOrder(lastMove.quantum);
            newAmount = (newAmount % order + order + 1) % order - 1;
          }
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
    yield new Grouping(this.traverseAlg(grouping.alg, newOptions));
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
function experimentalEnsureAlg(alg) {
  if (experimentalIs(alg, Alg)) {
    return alg;
  }
  return new Alg(alg);
}
var _units2;
var _Alg = class extends AlgCommon {
  constructor(alg) {
    super();
    __privateAdd(this, _units2, void 0);
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
    depth != null ? depth : depth = Infinity;
    for (const unit of direct(__privateGet(this, _units2), iterDir)) {
      yield* unit.experimentalExpand(iterDir, depth);
    }
  }
  expand(options) {
    var _a;
    return new _Alg(this.experimentalExpand(IterationDirection.Forwards, (_a = options == null ? void 0 : options.depth) != null ? _a : Infinity));
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
    return new _Alg(simplify(this, options != null ? options : {}));
  }
};
var Alg = _Alg;
_units2 = new WeakMap();
function spaceBetween(u1, u2) {
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
      new Conjugate(new Alg([new Move("R", 1)]), new Alg([new Move("U", 1)]))
    ]))
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
    ]), new Alg([new Move("D", 1)])),
    new Commutator(new Alg([
      new Conjugate(new Alg([new Move("R", 1)]), new Alg([new Move("U", 1)]))
    ]), new Alg([new Move("D", 1)])),
    new Move("x", 1)
  ]),
  FURURFCompact: new Alg([
    new Conjugate(new Alg([new Move("F", 1)]), new Alg([
      new Commutator(new Alg([new Move("U", 1)]), new Alg([new Move("R", 1)]))
    ]))
  ]),
  APermCompact: new Alg([
    new Conjugate(new Alg([new Move("R", 2)]), new Alg([
      new Commutator(new Alg([new Move("F", 2)]), new Alg([new Move("R", -1), new Move("B", -1), new Move("R", 1)]))
    ]))
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
      new Grouping(new Alg([
        new Commutator(new Alg([new Move("R", 1)]), new Alg([new Move("U", 1)]))
      ]), 3)
    ]))
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

// src/cubing/solve/worker/worker-inside-src.ts
function workerInside() {
  console.log("inside worker!", this);
  console.log("inside worker alg:", new Alg("R U F D2").invert().toString());
}
workerInside();
