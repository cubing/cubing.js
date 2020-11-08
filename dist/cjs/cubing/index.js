var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module2) => () => {
  if (!module2) {
    module2 = {exports: {}};
    callback(module2.exports, module2);
  }
  return module2.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name6 in all)
    __defProp(target, name6, {get: all[name6], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  __markAsModule(target);
  if (typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__defProp(__create(__getProtoOf(module2)), "default", {value: module2, enumerable: true}), module2);
};

// src/cubing/alg/parser/parser-pegjs.js
var require_parser_pegjs = __commonJS((exports2, module2) => {
  "use strict";
  function peg$subclass(child, parent) {
    function C() {
      this.constructor = child;
    }
    C.prototype = parent.prototype;
    child.prototype = new C();
  }
  function peg$SyntaxError(message, expected, found, location) {
    this.message = message;
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }
  peg$subclass(peg$SyntaxError, Error);
  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
      literal: function(expectation) {
        return '"' + literalEscape(expectation.text) + '"';
      },
      class: function(expectation) {
        var escapedParts = expectation.parts.map(function(part) {
          return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
        });
        return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
      },
      any: function() {
        return "any character";
      },
      end: function() {
        return "end of input";
      },
      other: function(expectation) {
        return expectation.description;
      },
      not: function(expectation) {
        return "not " + describeExpectation(expectation.expected);
      }
    };
    function hex2(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }
    function literalEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex2(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex2(ch);
      });
    }
    function classEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex2(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex2(ch);
      });
    }
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      var descriptions = expected2.map(describeExpectation);
      var i2, j;
      descriptions.sort();
      if (descriptions.length > 0) {
        for (i2 = 1, j = 1; i2 < descriptions.length; i2++) {
          if (descriptions[i2 - 1] !== descriptions[i2]) {
            descriptions[j] = descriptions[i2];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };
  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};
    var peg$FAILED = {};
    var peg$startRuleFunctions = {start: peg$parsestart};
    var peg$startRuleFunction = peg$parsestart;
    var peg$c0 = "'";
    var peg$c1 = "R++";
    var peg$c2 = "R--";
    var peg$c3 = "D++";
    var peg$c4 = "D--";
    var peg$c5 = "-";
    var peg$c6 = "[";
    var peg$c7 = "]";
    var peg$c8 = "(";
    var peg$c9 = ")";
    var peg$c10 = "//";
    var peg$c11 = ".";
    var peg$r0 = /^[0-9]/;
    var peg$r1 = /^[_A-Za-z]/;
    var peg$r2 = /^[,:]/;
    var peg$r3 = /^[^\n\r]/;
    var peg$r4 = /^[\n\r]/;
    var peg$r5 = /^[ ]/;
    var peg$e0 = peg$classExpectation([["0", "9"]], false, false);
    var peg$e1 = peg$literalExpectation("'", false);
    var peg$e2 = peg$literalExpectation("R++", false);
    var peg$e3 = peg$literalExpectation("R--", false);
    var peg$e4 = peg$literalExpectation("D++", false);
    var peg$e5 = peg$literalExpectation("D--", false);
    var peg$e6 = peg$classExpectation(["_", ["A", "Z"], ["a", "z"]], false, false);
    var peg$e7 = peg$literalExpectation("-", false);
    var peg$e8 = peg$literalExpectation("[", false);
    var peg$e9 = peg$classExpectation([",", ":"], false, false);
    var peg$e10 = peg$literalExpectation("]", false);
    var peg$e11 = peg$literalExpectation("(", false);
    var peg$e12 = peg$literalExpectation(")", false);
    var peg$e13 = peg$literalExpectation("//", false);
    var peg$e14 = peg$classExpectation(["\n", "\r"], true, false);
    var peg$e15 = peg$classExpectation(["\n", "\r"], false, false);
    var peg$e16 = peg$literalExpectation(".", false);
    var peg$e17 = peg$classExpectation([" "], false, false);
    var peg$f0 = function(characters) {
      return parseInt(characters.join(""), 10);
    };
    var peg$f1 = function(repetition) {
      return -repetition;
    };
    var peg$f2 = function() {
      return -1;
    };
    var peg$f3 = function(megaminx_scramble_move) {
      return megaminx_scramble_move;
    };
    var peg$f4 = function(characters) {
      return typeof characters === "string" ? characters : characters.join("");
    };
    var peg$f5 = function(family) {
      return {type: "blockMove", family};
    };
    var peg$f6 = function(innerLayer, family) {
      return {type: "blockMove", family, innerLayer};
    };
    var peg$f7 = function(outerLayer, innerLayer, family) {
      return {type: "blockMove", family, outerLayer, innerLayer};
    };
    var peg$f8 = function(a, separator, b) {
      return {type: separator === "," ? "commutator" : "conjugate", A: a, B: b};
    };
    var peg$f9 = function(nestedSequence) {
      return {type: "group", nestedSequence};
    };
    var peg$f10 = function(repeatable_unit, amount) {
      repeatable_unit.amount = amount;
      return repeatable_unit;
    };
    var peg$f11 = function(repeatable_unit) {
      repeatable_unit.amount = 1;
      return repeatable_unit;
    };
    var peg$f12 = function(body) {
      return {type: "comment", comment: body.join("")};
    };
    var peg$f13 = function() {
      return {type: "newLine"};
    };
    var peg$f14 = function() {
      return {type: "pause"};
    };
    var peg$f15 = function(segment_part, segment) {
      return [segment_part].concat(segment);
    };
    var peg$f16 = function(segment_part) {
      return [segment_part];
    };
    var peg$f17 = function(segment, unit_list) {
      return segment.concat(unit_list);
    };
    var peg$f18 = function(unit_list) {
      return {type: "sequence", nestedUnits: unit_list};
    };
    var peg$f19 = function() {
      return {type: "sequence", nestedUnits: []};
    };
    var peg$currPos = 0;
    var peg$savedPos = 0;
    var peg$posDetailsCache = [{line: 1, column: 1}];
    var peg$expected = [];
    var peg$silentFails = 0;
    var peg$result;
    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
      }
      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }
    function offset() {
      return peg$savedPos;
    }
    function range() {
      return [peg$savedPos, peg$currPos];
    }
    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function expected(description, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildStructuredError([peg$otherExpectation(description)], input.substring(peg$savedPos, peg$currPos), location2);
    }
    function error(message, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildSimpleError(message, location2);
    }
    function peg$literalExpectation(text2, ignoreCase) {
      return {type: "literal", text: text2, ignoreCase};
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
      return {type: "class", parts, inverted, ignoreCase};
    }
    function peg$anyExpectation() {
      return {type: "any"};
    }
    function peg$endExpectation() {
      return {type: "end"};
    }
    function peg$otherExpectation(description) {
      return {type: "other", description};
    }
    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos];
      var p2;
      if (details) {
        return details;
      } else {
        p2 = pos - 1;
        while (!peg$posDetailsCache[p2]) {
          p2--;
        }
        details = peg$posDetailsCache[p2];
        details = {
          line: details.line,
          column: details.column
        };
        while (p2 < pos) {
          if (input.charCodeAt(p2) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
          p2++;
        }
        peg$posDetailsCache[pos] = details;
        return details;
      }
    }
    var peg$VALIDFILENAME = typeof options.filename === "string" && options.filename.length > 0;
    function peg$computeLocation(startPos, endPos) {
      var loc = {};
      if (peg$VALIDFILENAME)
        loc.filename = options.filename;
      var startPosDetails = peg$computePosDetails(startPos);
      loc.start = {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      };
      var endPosDetails = peg$computePosDetails(endPos);
      loc.end = {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      };
      return loc;
    }
    function peg$begin() {
      peg$expected.push({pos: peg$currPos, variants: []});
    }
    function peg$expect(expected2) {
      var top = peg$expected[peg$expected.length - 1];
      if (peg$currPos < top.pos) {
        return;
      }
      if (peg$currPos > top.pos) {
        top.pos = peg$currPos;
        top.variants = [];
      }
      top.variants.push(expected2);
    }
    function peg$end(invert2) {
      var expected2 = peg$expected.pop();
      var top = peg$expected[peg$expected.length - 1];
      var variants = expected2.variants;
      if (top.pos !== expected2.pos) {
        return;
      }
      if (invert2) {
        variants = variants.map(function(e) {
          return e.type === "not" ? e.expected : {type: "not", expected: e};
        });
      }
      Array.prototype.push.apply(top.variants, variants);
    }
    function peg$buildSimpleError(message, location2) {
      return new peg$SyntaxError(message, null, null, location2);
    }
    function peg$buildStructuredError(expected2, found, location2) {
      return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected2, found), expected2, found, location2);
    }
    function peg$buildError() {
      var expected2 = peg$expected[0];
      var failPos = expected2.pos;
      return peg$buildStructuredError(expected2.variants, failPos < input.length ? input.charAt(failPos) : null, failPos < input.length ? peg$computeLocation(failPos, failPos + 1) : peg$computeLocation(failPos, failPos));
    }
    function peg$parsestart() {
      var s0;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$parseSEQUENCE();
      return s0;
    }
    function peg$parseNUMBER() {
      var s0, s1, s22;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = [];
      rule$expects(peg$e0);
      if (peg$r0.test(input.charAt(peg$currPos))) {
        s22 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s22 = peg$FAILED;
      }
      if (s22 !== peg$FAILED) {
        while (s22 !== peg$FAILED) {
          s1.push(s22);
          rule$expects(peg$e0);
          if (peg$r0.test(input.charAt(peg$currPos))) {
            s22 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s22 = peg$FAILED;
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f0(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseAMOUNT() {
      var s0, s1, s22;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseNUMBER();
      if (s1 !== peg$FAILED) {
        rule$expects(peg$e1);
        if (input.charCodeAt(peg$currPos) === 39) {
          s22 = peg$c0;
          peg$currPos++;
        } else {
          s22 = peg$FAILED;
        }
        if (s22 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f1(s1);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseNUMBER();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          rule$expects(peg$e1);
          if (input.charCodeAt(peg$currPos) === 39) {
            s1 = peg$c0;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f2();
          }
          s0 = s1;
        }
      }
      return s0;
    }
    function peg$parseFAMILY() {
      var s0, s1, s22;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      rule$expects(peg$e2);
      if (input.substr(peg$currPos, 3) === peg$c1) {
        s1 = peg$c1;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 === peg$FAILED) {
        rule$expects(peg$e3);
        if (input.substr(peg$currPos, 3) === peg$c2) {
          s1 = peg$c2;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
        }
        if (s1 === peg$FAILED) {
          rule$expects(peg$e4);
          if (input.substr(peg$currPos, 3) === peg$c3) {
            s1 = peg$c3;
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
          }
          if (s1 === peg$FAILED) {
            rule$expects(peg$e5);
            if (input.substr(peg$currPos, 3) === peg$c4) {
              s1 = peg$c4;
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f3(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        rule$expects(peg$e6);
        if (peg$r1.test(input.charAt(peg$currPos))) {
          s22 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s22 = peg$FAILED;
        }
        if (s22 !== peg$FAILED) {
          while (s22 !== peg$FAILED) {
            s1.push(s22);
            rule$expects(peg$e6);
            if (peg$r1.test(input.charAt(peg$currPos))) {
              s22 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s22 = peg$FAILED;
            }
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f4(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parseBLOCK_MOVE() {
      var s0, s1, s22, s3, s4;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseFAMILY();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f5(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseNUMBER();
        if (s1 !== peg$FAILED) {
          s22 = peg$parseFAMILY();
          if (s22 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f6(s1, s22);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseNUMBER();
          if (s1 !== peg$FAILED) {
            rule$expects(peg$e7);
            if (input.charCodeAt(peg$currPos) === 45) {
              s22 = peg$c5;
              peg$currPos++;
            } else {
              s22 = peg$FAILED;
            }
            if (s22 !== peg$FAILED) {
              s3 = peg$parseNUMBER();
              if (s3 !== peg$FAILED) {
                s4 = peg$parseFAMILY();
                if (s4 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f7(s1, s3, s4);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
      return s0;
    }
    function peg$parseREPEATABLE_UNIT() {
      var s0, s1, s22, s3, s4, s5;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$parseBLOCK_MOVE();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        rule$expects(peg$e8);
        if (input.charCodeAt(peg$currPos) === 91) {
          s1 = peg$c6;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s22 = peg$parseSEQUENCE();
          if (s22 !== peg$FAILED) {
            rule$expects(peg$e9);
            if (peg$r2.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseSEQUENCE();
              if (s4 !== peg$FAILED) {
                rule$expects(peg$e10);
                if (input.charCodeAt(peg$currPos) === 93) {
                  s5 = peg$c7;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                }
                if (s5 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f8(s22, s3, s4);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          rule$expects(peg$e11);
          if (input.charCodeAt(peg$currPos) === 40) {
            s1 = peg$c8;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            s22 = peg$parseSEQUENCE();
            if (s22 !== peg$FAILED) {
              rule$expects(peg$e12);
              if (input.charCodeAt(peg$currPos) === 41) {
                s3 = peg$c9;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f9(s22);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
      return s0;
    }
    function peg$parseREPEATED_UNIT() {
      var s0, s1, s22;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseREPEATABLE_UNIT();
      if (s1 !== peg$FAILED) {
        s22 = peg$parseAMOUNT();
        if (s22 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f10(s1, s22);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseREPEATABLE_UNIT();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f11(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parseCOMMENT() {
      var s0, s1, s22, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      rule$expects(peg$e13);
      if (input.substr(peg$currPos, 2) === peg$c10) {
        s1 = peg$c10;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s22 = [];
        rule$expects(peg$e14);
        if (peg$r3.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s22.push(s3);
          rule$expects(peg$e14);
          if (peg$r3.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f12(s22);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseANNOTATION() {
      var s0, s1;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      rule$expects(peg$e15);
      if (peg$r4.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f13();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        rule$expects(peg$e16);
        if (input.charCodeAt(peg$currPos) === 46) {
          s1 = peg$c11;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f14();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$parseCOMMENT();
        }
      }
      return s0;
    }
    function peg$parseSEGMENT_PART() {
      var s0;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$parseREPEATED_UNIT();
      if (s0 === peg$FAILED) {
        s0 = peg$parseANNOTATION();
      }
      return s0;
    }
    function peg$parseSEGMENT() {
      var s0, s1, s22;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseSEGMENT_PART();
      if (s1 !== peg$FAILED) {
        s22 = peg$parseSEGMENT();
        if (s22 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f15(s1, s22);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseSEGMENT_PART();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f16(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parseUNIT_LIST() {
      var s0, s1, s22, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseSEGMENT();
      if (s1 !== peg$FAILED) {
        s22 = [];
        rule$expects(peg$e17);
        if (peg$r5.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s22.push(s3);
            rule$expects(peg$e17);
            if (peg$r5.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
            }
          }
        } else {
          s22 = peg$FAILED;
        }
        if (s22 !== peg$FAILED) {
          s3 = peg$parseUNIT_LIST();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f17(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseSEGMENT();
      }
      return s0;
    }
    function peg$parseSEQUENCE() {
      var s0, s1, s22, s3, s4;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = [];
      rule$expects(peg$e17);
      if (peg$r5.test(input.charAt(peg$currPos))) {
        s22 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s22 = peg$FAILED;
      }
      while (s22 !== peg$FAILED) {
        s1.push(s22);
        rule$expects(peg$e17);
        if (peg$r5.test(input.charAt(peg$currPos))) {
          s22 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s22 = peg$FAILED;
        }
      }
      s22 = peg$parseUNIT_LIST();
      if (s22 !== peg$FAILED) {
        s3 = [];
        rule$expects(peg$e17);
        if (peg$r5.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          rule$expects(peg$e17);
          if (peg$r5.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f18(s22);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        rule$expects(peg$e17);
        if (peg$r5.test(input.charAt(peg$currPos))) {
          s22 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s22 = peg$FAILED;
        }
        while (s22 !== peg$FAILED) {
          s1.push(s22);
          rule$expects(peg$e17);
          if (peg$r5.test(input.charAt(peg$currPos))) {
            s22 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s22 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s1 = peg$f19();
        s0 = s1;
      }
      return s0;
    }
    peg$begin();
    peg$result = peg$startRuleFunction();
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$expect(peg$endExpectation());
      }
      throw peg$buildError();
    }
  }
  module2.exports = {
    SyntaxError: peg$SyntaxError,
    parse: peg$parse
  };
});

// src/cubing/kpuzzle/parser/parser-pegjs.js
var require_parser_pegjs2 = __commonJS((exports2, module2) => {
  "use strict";
  function peg$subclass(child, parent) {
    function C() {
      this.constructor = child;
    }
    C.prototype = parent.prototype;
    child.prototype = new C();
  }
  function peg$SyntaxError(message, expected, found, location) {
    this.message = message;
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }
  peg$subclass(peg$SyntaxError, Error);
  peg$SyntaxError.buildMessage = function(expected, found) {
    var DESCRIBE_EXPECTATION_FNS = {
      literal: function(expectation) {
        return '"' + literalEscape(expectation.text) + '"';
      },
      class: function(expectation) {
        var escapedParts = expectation.parts.map(function(part) {
          return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
        });
        return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
      },
      any: function() {
        return "any character";
      },
      end: function() {
        return "end of input";
      },
      other: function(expectation) {
        return expectation.description;
      },
      not: function(expectation) {
        return "not " + describeExpectation(expectation.expected);
      }
    };
    function hex2(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }
    function literalEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex2(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex2(ch);
      });
    }
    function classEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex2(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex2(ch);
      });
    }
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      var descriptions = expected2.map(describeExpectation);
      var i2, j;
      descriptions.sort();
      if (descriptions.length > 0) {
        for (i2 = 1, j = 1; i2 < descriptions.length; i2++) {
          if (descriptions[i2 - 1] !== descriptions[i2]) {
            descriptions[j] = descriptions[i2];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  };
  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};
    var peg$FAILED = {};
    var peg$startRuleFunctions = {start: peg$parsestart};
    var peg$startRuleFunction = peg$parsestart;
    var peg$c0 = " ";
    var peg$c1 = "Name";
    var peg$c2 = "Set";
    var peg$c3 = "\n";
    var peg$c4 = "Solved";
    var peg$c5 = "End";
    var peg$c6 = "Move";
    var peg$r0 = /^[A-Za-z0-9<>]/;
    var peg$r1 = /^[A-Za-z]/;
    var peg$r2 = /^[A-Za-z0-9]/;
    var peg$r3 = /^[0-9]/;
    var peg$e0 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "<", ">"], false, false);
    var peg$e1 = peg$classExpectation([["A", "Z"], ["a", "z"]], false, false);
    var peg$e2 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"]], false, false);
    var peg$e3 = peg$classExpectation([["0", "9"]], false, false);
    var peg$e4 = peg$literalExpectation(" ", false);
    var peg$e5 = peg$literalExpectation("Name", false);
    var peg$e6 = peg$literalExpectation("Set", false);
    var peg$e7 = peg$literalExpectation("\n", false);
    var peg$e8 = peg$literalExpectation("Solved", false);
    var peg$e9 = peg$literalExpectation("End", false);
    var peg$e10 = peg$literalExpectation("Move", false);
    var peg$f0 = function(def2) {
      return fixMoves(def2);
    };
    var peg$f1 = function(characters) {
      return characters.join("");
    };
    var peg$f2 = function(first, rest) {
      return [first].concat(rest).join("");
    };
    var peg$f3 = function(characters) {
      return parseInt(characters.join(""), 10);
    };
    var peg$f4 = function(identifier) {
      return identifier;
    };
    var peg$f5 = function(set_identifier, num_pieces, num_orientations) {
      return [set_identifier, {numPieces: num_pieces, orientations: num_orientations}];
    };
    var peg$f6 = function(orbit, orbits6) {
      orbits6[orbit[0]] = orbit[1];
      return orbits6;
    };
    var peg$f7 = function(orbit) {
      const orbits6 = {};
      orbits6[orbit[0]] = orbit[1];
      return orbits6;
    };
    var peg$f8 = function(num, nums) {
      return [num].concat(nums);
    };
    var peg$f9 = function(num) {
      return [num];
    };
    var peg$f10 = function(nums) {
      return fixPermutation(nums);
    };
    var peg$f11 = function(set_identifier, permutation, nums) {
      return [set_identifier, {permutation, orientation: nums}];
    };
    var peg$f12 = function(set_identifier, permutation) {
      return [set_identifier, {permutation, orientation: new Array(permutation.length).fill(0)}];
    };
    var peg$f13 = function(definition, definitions2) {
      definitions2[definition[0]] = definition[1];
      return definitions2;
    };
    var peg$f14 = function(definition) {
      const definitions2 = {};
      definitions2[definition[0]] = definition[1];
      return definitions2;
    };
    var peg$f15 = function(definitions2) {
      return definitions2;
    };
    var peg$f16 = function(identifier, definitions2) {
      return [identifier, definitions2];
    };
    var peg$f17 = function(move, moves6) {
      moves6[move[0]] = move[1];
      return moves6;
    };
    var peg$f18 = function(move) {
      const moves6 = {};
      moves6[move[0]] = move[1];
      return moves6;
    };
    var peg$f19 = function(name6, orbits6, start_pieces, moves6) {
      return {name: name6, orbits: orbits6, moves: moves6, startPieces: start_pieces};
    };
    var peg$currPos = 0;
    var peg$savedPos = 0;
    var peg$posDetailsCache = [{line: 1, column: 1}];
    var peg$expected = [];
    var peg$silentFails = 0;
    var peg$result;
    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
      }
      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }
    function offset() {
      return peg$savedPos;
    }
    function range() {
      return [peg$savedPos, peg$currPos];
    }
    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function expected(description, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildStructuredError([peg$otherExpectation(description)], input.substring(peg$savedPos, peg$currPos), location2);
    }
    function error(message, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildSimpleError(message, location2);
    }
    function peg$literalExpectation(text2, ignoreCase) {
      return {type: "literal", text: text2, ignoreCase};
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
      return {type: "class", parts, inverted, ignoreCase};
    }
    function peg$anyExpectation() {
      return {type: "any"};
    }
    function peg$endExpectation() {
      return {type: "end"};
    }
    function peg$otherExpectation(description) {
      return {type: "other", description};
    }
    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos];
      var p2;
      if (details) {
        return details;
      } else {
        p2 = pos - 1;
        while (!peg$posDetailsCache[p2]) {
          p2--;
        }
        details = peg$posDetailsCache[p2];
        details = {
          line: details.line,
          column: details.column
        };
        while (p2 < pos) {
          if (input.charCodeAt(p2) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
          p2++;
        }
        peg$posDetailsCache[pos] = details;
        return details;
      }
    }
    var peg$VALIDFILENAME = typeof options.filename === "string" && options.filename.length > 0;
    function peg$computeLocation(startPos, endPos) {
      var loc = {};
      if (peg$VALIDFILENAME)
        loc.filename = options.filename;
      var startPosDetails = peg$computePosDetails(startPos);
      loc.start = {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      };
      var endPosDetails = peg$computePosDetails(endPos);
      loc.end = {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      };
      return loc;
    }
    function peg$begin() {
      peg$expected.push({pos: peg$currPos, variants: []});
    }
    function peg$expect(expected2) {
      var top = peg$expected[peg$expected.length - 1];
      if (peg$currPos < top.pos) {
        return;
      }
      if (peg$currPos > top.pos) {
        top.pos = peg$currPos;
        top.variants = [];
      }
      top.variants.push(expected2);
    }
    function peg$end(invert2) {
      var expected2 = peg$expected.pop();
      var top = peg$expected[peg$expected.length - 1];
      var variants = expected2.variants;
      if (top.pos !== expected2.pos) {
        return;
      }
      if (invert2) {
        variants = variants.map(function(e) {
          return e.type === "not" ? e.expected : {type: "not", expected: e};
        });
      }
      Array.prototype.push.apply(top.variants, variants);
    }
    function peg$buildSimpleError(message, location2) {
      return new peg$SyntaxError(message, null, null, location2);
    }
    function peg$buildStructuredError(expected2, found, location2) {
      return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected2, found), expected2, found, location2);
    }
    function peg$buildError() {
      var expected2 = peg$expected[0];
      var failPos = expected2.pos;
      return peg$buildStructuredError(expected2.variants, failPos < input.length ? input.charAt(failPos) : null, failPos < input.length ? peg$computeLocation(failPos, failPos + 1) : peg$computeLocation(failPos, failPos));
    }
    function peg$parsestart() {
      var s0, s1;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseDEFINITION_FILE();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f0(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseIDENTIFIER() {
      var s0, s1, s22;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = [];
      rule$expects(peg$e0);
      if (peg$r0.test(input.charAt(peg$currPos))) {
        s22 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s22 = peg$FAILED;
      }
      if (s22 !== peg$FAILED) {
        while (s22 !== peg$FAILED) {
          s1.push(s22);
          rule$expects(peg$e0);
          if (peg$r0.test(input.charAt(peg$currPos))) {
            s22 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s22 = peg$FAILED;
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f1(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseSET_IDENTIFIER() {
      var s0, s1, s22, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      rule$expects(peg$e1);
      if (peg$r1.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s22 = [];
        rule$expects(peg$e2);
        if (peg$r2.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s22.push(s3);
          rule$expects(peg$e2);
          if (peg$r2.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f2(s1, s22);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseNUMBER() {
      var s0, s1, s22;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = [];
      rule$expects(peg$e3);
      if (peg$r3.test(input.charAt(peg$currPos))) {
        s22 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s22 = peg$FAILED;
      }
      if (s22 !== peg$FAILED) {
        while (s22 !== peg$FAILED) {
          s1.push(s22);
          rule$expects(peg$e3);
          if (peg$r3.test(input.charAt(peg$currPos))) {
            s22 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s22 = peg$FAILED;
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f3(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseSPACE() {
      var s0;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      rule$expects(peg$e4);
      if (input.charCodeAt(peg$currPos) === 32) {
        s0 = peg$c0;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseNAME() {
      var s0, s1, s22, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      rule$expects(peg$e5);
      if (input.substr(peg$currPos, 4) === peg$c1) {
        s1 = peg$c1;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s22 = peg$parseSPACE();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseIDENTIFIER();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f4(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseORBIT() {
      var s0, s1, s22, s3, s4, s5, s6, s7;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      rule$expects(peg$e6);
      if (input.substr(peg$currPos, 3) === peg$c2) {
        s1 = peg$c2;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s22 = peg$parseSPACE();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseSET_IDENTIFIER();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseSPACE();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseNUMBER();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseSPACE();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseNUMBER();
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f5(s3, s5, s7);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseORBITS() {
      var s0, s1, s22, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseORBIT();
      if (s1 !== peg$FAILED) {
        s22 = peg$parseNEWLINE();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseORBITS();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f6(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseORBIT();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f7(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parseNEWLINE() {
      var s0;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      rule$expects(peg$e7);
      if (input.charCodeAt(peg$currPos) === 10) {
        s0 = peg$c3;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseNEWLINES() {
      var s0, s1;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = [];
      rule$expects(peg$e7);
      if (input.charCodeAt(peg$currPos) === 10) {
        s1 = peg$c3;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          rule$expects(peg$e7);
          if (input.charCodeAt(peg$currPos) === 10) {
            s1 = peg$c3;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
          }
        }
      } else {
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseOPTIONAL_NEWLINES() {
      var s0, s1;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = [];
      rule$expects(peg$e7);
      if (input.charCodeAt(peg$currPos) === 10) {
        s1 = peg$c3;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        rule$expects(peg$e7);
        if (input.charCodeAt(peg$currPos) === 10) {
          s1 = peg$c3;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
        }
      }
      return s0;
    }
    function peg$parseNUMBERS() {
      var s0, s1, s22, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseNUMBER();
      if (s1 !== peg$FAILED) {
        s22 = peg$parseSPACE();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseNUMBERS();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f8(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseNUMBER();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f9(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parsePERMUTATION() {
      var s0, s1;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseNUMBERS();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f10(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseDEFINITION() {
      var s0, s1, s22, s3, s4, s5;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseSET_IDENTIFIER();
      if (s1 !== peg$FAILED) {
        s22 = peg$parseNEWLINE();
        if (s22 !== peg$FAILED) {
          s3 = peg$parsePERMUTATION();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseNEWLINE();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseNUMBERS();
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f11(s1, s3, s5);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseSET_IDENTIFIER();
        if (s1 !== peg$FAILED) {
          s22 = peg$parseNEWLINE();
          if (s22 !== peg$FAILED) {
            s3 = peg$parsePERMUTATION();
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f12(s1, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
      return s0;
    }
    function peg$parseDEFINITIONS() {
      var s0, s1, s22, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseDEFINITION();
      if (s1 !== peg$FAILED) {
        s22 = peg$parseNEWLINE();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseDEFINITIONS();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f13(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseDEFINITION();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f14(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parseSTART_PIECES() {
      var s0, s1, s22, s3, s4, s5;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      rule$expects(peg$e8);
      if (input.substr(peg$currPos, 6) === peg$c4) {
        s1 = peg$c4;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s22 = peg$parseNEWLINE();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseDEFINITIONS();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseNEWLINE();
            if (s4 !== peg$FAILED) {
              rule$expects(peg$e9);
              if (input.substr(peg$currPos, 3) === peg$c5) {
                s5 = peg$c5;
                peg$currPos += 3;
              } else {
                s5 = peg$FAILED;
              }
              if (s5 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f15(s3);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseMOVE() {
      var s0, s1, s22, s3, s4, s5, s6, s7;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      rule$expects(peg$e10);
      if (input.substr(peg$currPos, 4) === peg$c6) {
        s1 = peg$c6;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s22 = peg$parseSPACE();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseIDENTIFIER();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseNEWLINE();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseDEFINITIONS();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseNEWLINE();
                if (s6 !== peg$FAILED) {
                  rule$expects(peg$e9);
                  if (input.substr(peg$currPos, 3) === peg$c5) {
                    s7 = peg$c5;
                    peg$currPos += 3;
                  } else {
                    s7 = peg$FAILED;
                  }
                  if (s7 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s0 = peg$f16(s3, s5);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseMOVES() {
      var s0, s1, s22, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseMOVE();
      if (s1 !== peg$FAILED) {
        s22 = peg$parseNEWLINES();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseMOVES();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f17(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseMOVE();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f18(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parseDEFINITION_FILE() {
      var s0, s1, s22, s3, s4, s5, s6, s7, s8;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseNAME();
      if (s1 !== peg$FAILED) {
        s22 = peg$parseNEWLINES();
        if (s22 !== peg$FAILED) {
          s3 = peg$parseORBITS();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseNEWLINES();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseSTART_PIECES();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseNEWLINES();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseMOVES();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseOPTIONAL_NEWLINES();
                    peg$savedPos = s0;
                    s0 = peg$f19(s1, s3, s5, s7);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function fixPermutation(permutation) {
      return permutation.map((x) => x - 1);
    }
    function fixMoves(def2) {
      for (const moveName in def2.moves) {
        const move = def2.moves[moveName];
        for (const orbitName in def2.orbits) {
          const moveOrbit = move[orbitName];
          const oldOrientation = moveOrbit.orientation;
          const perm = moveOrbit.permutation;
          const newOrientation = new Array(oldOrientation.length);
          for (let i2 = 0; i2 < perm.length; i2++) {
            newOrientation[i2] = oldOrientation[perm[i2]];
          }
          moveOrbit.orientation = newOrientation;
        }
      }
      return def2;
    }
    peg$begin();
    peg$result = peg$startRuleFunction();
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$expect(peg$endExpectation());
      }
      throw peg$buildError();
    }
  }
  module2.exports = {
    SyntaxError: peg$SyntaxError,
    parse: peg$parse
  };
});

// src/cubing/index.ts
__export(exports, {
  alg: () => alg_exports,
  bluetooth: () => bluetooth_exports,
  kpuzzle: () => kpuzzle_exports,
  protocol: () => protocol_exports,
  puzzleGeometry: () => puzzle_geometry_exports,
  stream: () => stream_exports,
  twisty: () => twisty_exports
});

// src/cubing/alg/index.ts
const alg_exports = {};
__export(alg_exports, {
  AlgPart: () => AlgPart,
  Annotation: () => Annotation,
  BareBlockMove: () => BareBlockMove,
  BlockMove: () => BlockMove,
  Comment: () => Comment,
  Commutator: () => Commutator,
  Conjugate: () => Conjugate,
  Container: () => Container,
  Example: () => Example,
  Group: () => Group,
  LayerBlockMove: () => LayerBlockMove,
  Move: () => Move,
  NewLine: () => NewLine,
  Pause: () => Pause,
  RangeBlockMove: () => RangeBlockMove,
  Sequence: () => Sequence,
  TraversalDownUp: () => TraversalDownUp,
  TraversalUp: () => TraversalUp,
  Unit: () => Unit,
  ValidationError: () => ValidationError,
  algCubingNetLink: () => algCubingNetLink,
  algPartToStringForTesting: () => algPartToStringForTesting,
  algToString: () => algToString,
  blockMoveToString: () => blockMoveToString,
  coalesceBaseMoves: () => coalesceBaseMoves,
  deserializeURLParam: () => deserializeURLParam,
  expand: () => expand,
  experimentalAppendBlockMove: () => experimentalAppendBlockMove,
  experimentalConcatAlgs: () => experimentalConcatAlgs,
  fromJSON: () => fromJSON,
  getAlgURLParam: () => getAlgURLParam,
  invert: () => invert,
  keyToMove: () => keyToMove,
  modifiedBlockMove: () => modifiedBlockMove,
  parse: () => parse2,
  serializeURLParam: () => serializeURLParam,
  setAlgPartTypeMismatchReportingLevel: () => setAlgPartTypeMismatchReportingLevel,
  structureEquals: () => structureEquals,
  validateFlatAlg: () => validateFlatAlg,
  validateSiGNAlg: () => validateSiGNAlg,
  validateSiGNMoves: () => validateSiGNMoves
});

// src/cubing/alg/debug.ts
let currentReportingLevel = "warn";
const MAX_NUMBER_OF_TIMES_TO_WARN = 10;
let numWarned = 0;
function reportTypeMismatch(msg) {
  switch (currentReportingLevel) {
    case "error":
      throw new Error(msg);
    case "warn":
      numWarned++;
      if (numWarned < MAX_NUMBER_OF_TIMES_TO_WARN) {
        if (numWarned + 1 === MAX_NUMBER_OF_TIMES_TO_WARN) {
          console.warn(msg);
        }
      }
      return;
  }
}
function setAlgPartTypeMismatchReportingLevel(level) {
  currentReportingLevel = level;
}

// src/cubing/alg/algorithm/alg-part.ts
class AlgPart {
}
function matchesAlgType(a, t2) {
  return a.type === t2;
}
function assertMatchesType(a, t2) {
  if (!matchesAlgType(a, t2)) {
    reportTypeMismatch(`Expected "type": "${t2}", saw "type": "${a.type}".`);
  }
  return a;
}
function isUnit(a) {
  if (!("type" in a)) {
    return false;
  }
  return !matchesAlgType(a, "sequence");
}
function assertIsUnit(a) {
  if (!("type" in a)) {
    reportTypeMismatch(`Expected "unit", saw a value that was not an AlgPart.`);
  }
  if (matchesAlgType(a, "sequence")) {
    reportTypeMismatch(`Expected unit, saw "sequence".`);
  }
  return a;
}
class Unit extends AlgPart {
}
class Move extends Unit {
}
class Annotation extends Unit {
}
class Container extends Unit {
}
class Sequence extends AlgPart {
  constructor(nestedUnits) {
    super();
    this.nestedUnits = nestedUnits;
    this.type = "sequence";
    for (const n of nestedUnits) {
      assertIsUnit(n);
    }
    Object.freeze(this.nestedUnits);
    Object.freeze(this);
  }
}
class Group extends Container {
  constructor(nestedSequence, amount = 1) {
    super();
    this.nestedSequence = nestedSequence;
    this.amount = amount;
    this.type = "group";
    Object.freeze(this);
  }
}
class Commutator extends Container {
  constructor(A, B, amount = 1) {
    super();
    this.A = A;
    this.B = B;
    this.amount = amount;
    this.type = "commutator";
    Object.freeze(this);
  }
}
class Conjugate extends Container {
  constructor(A, B, amount = 1) {
    super();
    this.A = A;
    this.B = B;
    this.amount = amount;
    this.type = "conjugate";
    Object.freeze(this);
  }
}
class Pause extends Move {
  constructor() {
    super();
    this.type = "pause";
    Object.freeze(this);
  }
}
class NewLine extends Annotation {
  constructor() {
    super();
    this.type = "newLine";
    Object.freeze(this);
  }
}
class Comment extends Annotation {
  constructor(comment) {
    super();
    this.comment = comment;
    this.type = "comment";
    Object.freeze(this);
  }
}

// src/cubing/alg/algorithm/block-move.ts
class BlockMove extends Move {
  constructor(outerLayer, innerLayer, family, amount = 1) {
    super();
    this.family = family;
    this.amount = amount;
    this.type = "blockMove";
    if (innerLayer) {
      this.innerLayer = innerLayer;
      if (outerLayer) {
        this.outerLayer = outerLayer;
      }
    }
    if (outerLayer && !innerLayer) {
      throw new Error("Attempted to contruct block move with outer layer but no inner layer");
    }
    Object.freeze(this);
  }
}
function BareBlockMove(family, amount) {
  return new BlockMove(void 0, void 0, family, amount);
}
function LayerBlockMove(innerLayer, family, amount) {
  return new BlockMove(void 0, innerLayer, family, amount);
}
function RangeBlockMove(outerLayer, innerLayer, family, amount) {
  return new BlockMove(outerLayer, innerLayer, family, amount);
}

// src/cubing/alg/operation.ts
function canCoalesce(m1, m2) {
  return m1.family === m2.family && m1.innerLayer === m2.innerLayer && m1.outerLayer === m2.outerLayer;
}
function modifiedBlockMove(original, modifications) {
  return new BlockMove(modifications.outerLayer ?? original.outerLayer, modifications.innerLayer ?? original.innerLayer, modifications.family ?? original.family, modifications.amount ?? original.amount);
}
function experimentalAppendBlockMove(s, newMove, coalesceLastMove = false, mod = 0) {
  const oldNestedUnits = s.nestedUnits;
  const oldLastMove = oldNestedUnits[oldNestedUnits.length - 1];
  if (coalesceLastMove && oldLastMove && canCoalesce(oldLastMove, newMove)) {
    const newNestedUnits = s.nestedUnits.slice(0, oldNestedUnits.length - 1);
    let newAmount = oldLastMove.amount + newMove.amount;
    if (mod > 1) {
      newAmount = (newAmount % mod + mod) % mod;
      if (newAmount * 2 > mod) {
        newAmount -= mod;
      }
    }
    if (newAmount !== 0) {
      newNestedUnits.push(modifiedBlockMove(oldLastMove, {amount: newAmount}));
    }
    return new Sequence(newNestedUnits);
  } else {
    return new Sequence([...oldNestedUnits, newMove]);
  }
}
function experimentalConcatAlgs(...args) {
  return new Sequence(Array.prototype.concat.apply([], [...args].map((s) => s.nestedUnits)));
}

// src/cubing/alg/traversal.ts
function dispatch(t2, algPart, dataDown) {
  switch (algPart.type) {
    case "sequence":
      assertMatchesType(algPart, "sequence");
      return t2.traverseSequence(algPart, dataDown);
    case "group":
      assertMatchesType(algPart, "group");
      return t2.traverseGroup(algPart, dataDown);
    case "blockMove":
      assertMatchesType(algPart, "blockMove");
      return t2.traverseBlockMove(algPart, dataDown);
    case "commutator":
      assertMatchesType(algPart, "commutator");
      return t2.traverseCommutator(algPart, dataDown);
    case "conjugate":
      assertMatchesType(algPart, "conjugate");
      return t2.traverseConjugate(algPart, dataDown);
    case "pause":
      assertMatchesType(algPart, "pause");
      return t2.traversePause(algPart, dataDown);
    case "newLine":
      assertMatchesType(algPart, "newLine");
      return t2.traverseNewLine(algPart, dataDown);
    case "comment":
      assertMatchesType(algPart, "comment");
      return t2.traverseComment(algPart, dataDown);
    default:
      throw new Error(`Unknown AlgPart type: ${algPart.type}`);
  }
}
class TraversalDownUp {
  traverse(algPart, dataDown) {
    return dispatch(this, algPart, dataDown);
  }
  traverseIntoUnit(algPart, dataDown) {
    return assertIsUnit(this.traverse(algPart, dataDown));
  }
}
class TraversalUp extends TraversalDownUp {
  traverse(algPart) {
    return dispatch(this, algPart, void 0);
  }
  traverseIntoUnit(algPart) {
    return assertIsUnit(this.traverse(algPart));
  }
}
class Invert extends TraversalUp {
  traverseSequence(sequence) {
    return new Sequence(sequence.nestedUnits.map((a) => this.traverseIntoUnit(a)).reverse());
  }
  traverseGroup(group) {
    return new Group(this.traverseSequence(group.nestedSequence), group.amount);
  }
  traverseBlockMove(blockMove) {
    return new BlockMove(blockMove.outerLayer, blockMove.innerLayer, blockMove.family, -blockMove.amount);
  }
  traverseCommutator(commutator) {
    return new Commutator(commutator.B, commutator.A, commutator.amount);
  }
  traverseConjugate(conjugate) {
    return new Conjugate(conjugate.A, this.traverseSequence(conjugate.B), conjugate.amount);
  }
  traversePause(pause) {
    return pause;
  }
  traverseNewLine(newLine) {
    return newLine;
  }
  traverseComment(comment) {
    return comment;
  }
}
class Expand extends TraversalUp {
  traverseSequence(sequence) {
    return new Sequence(this.flattenSequenceOneLevel(sequence.nestedUnits.map((a) => this.traverse(a))));
  }
  traverseGroup(group) {
    return this.repeat(this.flattenSequenceOneLevel([this.traverse(group.nestedSequence)]), group);
  }
  traverseBlockMove(blockMove) {
    return blockMove;
  }
  traverseCommutator(commutator) {
    const expandedA = this.traverseSequence(commutator.A);
    const expandedB = this.traverseSequence(commutator.B);
    let once = [];
    once = once.concat(expandedA, expandedB, invert(expandedA), invert(expandedB));
    return this.repeat(this.flattenSequenceOneLevel(once), commutator);
  }
  traverseConjugate(conjugate) {
    const expandedA = this.traverseSequence(conjugate.A);
    const expandedB = this.traverseSequence(conjugate.B);
    let once = [];
    once = once.concat(expandedA, expandedB, invert(expandedA));
    return this.repeat(this.flattenSequenceOneLevel(once), conjugate);
  }
  traversePause(pause) {
    return pause;
  }
  traverseNewLine(newLine) {
    return newLine;
  }
  traverseComment(comment) {
    return comment;
  }
  flattenSequenceOneLevel(algList) {
    let flattened = [];
    for (const part of algList) {
      if (matchesAlgType(part, "sequence")) {
        flattened = flattened.concat(part.nestedUnits);
      } else if (isUnit(part)) {
        flattened.push(part);
      } else {
        throw new Error("expand() encountered an internal error. Did you pass in a valid Algorithm?");
      }
    }
    return flattened;
  }
  repeat(algList, accordingTo) {
    const amount = Math.abs(accordingTo.amount);
    const amountDir = accordingTo.amount > 0 ? 1 : -1;
    let once;
    if (amountDir === -1) {
      once = invert(new Sequence(algList)).nestedUnits;
    } else {
      once = algList;
    }
    let repeated = [];
    for (let i2 = 0; i2 < amount; i2++) {
      repeated = repeated.concat(once);
    }
    return new Sequence(repeated);
  }
}
class StructureEquals extends TraversalDownUp {
  traverseSequence(sequence, dataDown) {
    if (isUnit(dataDown)) {
      return false;
    }
    const dataDownSeq = dataDown;
    if (sequence.nestedUnits.length !== dataDownSeq.nestedUnits.length) {
      return false;
    }
    for (let i2 = 0; i2 < sequence.nestedUnits.length; i2++) {
      if (!this.traverse(sequence.nestedUnits[i2], dataDownSeq.nestedUnits[i2])) {
        return false;
      }
    }
    return true;
  }
  traverseGroup(group, dataDown) {
    return matchesAlgType(dataDown, "group") && this.traverse(group.nestedSequence, dataDown.nestedSequence);
  }
  traverseBlockMove(blockMove, dataDown) {
    return matchesAlgType(dataDown, "blockMove") && blockMove.outerLayer === dataDown.outerLayer && blockMove.innerLayer === dataDown.innerLayer && blockMove.family === dataDown.family && blockMove.amount === dataDown.amount;
  }
  traverseCommutator(commutator, dataDown) {
    return matchesAlgType(dataDown, "commutator") && this.traverse(commutator.A, dataDown.A) && this.traverse(commutator.B, dataDown.B);
  }
  traverseConjugate(conjugate, dataDown) {
    return matchesAlgType(dataDown, "conjugate") && this.traverse(conjugate.A, dataDown.A) && this.traverse(conjugate.B, dataDown.B);
  }
  traversePause(_pause, dataDown) {
    return matchesAlgType(dataDown, "pause");
  }
  traverseNewLine(_newLine, dataDown) {
    return matchesAlgType(dataDown, "newLine");
  }
  traverseComment(comment, dataDown) {
    return matchesAlgType(dataDown, "comment") && comment.comment === dataDown.comment;
  }
}
class CoalesceBaseMoves extends TraversalUp {
  traverseSequence(sequence) {
    const coalesced = [];
    for (const part of sequence.nestedUnits) {
      if (!matchesAlgType(part, "blockMove")) {
        coalesced.push(this.traverseIntoUnit(part));
      } else if (coalesced.length > 0) {
        const last = coalesced[coalesced.length - 1];
        if (matchesAlgType(last, "blockMove") && this.sameBlock(last, part)) {
          const amount = last.amount + part.amount;
          coalesced.pop();
          if (amount !== 0) {
            coalesced.push(new BlockMove(part.outerLayer, part.innerLayer, part.family, amount));
          }
        } else {
          coalesced.push(part);
        }
      } else {
        coalesced.push(part);
      }
    }
    return new Sequence(coalesced);
  }
  traverseGroup(group) {
    return group;
  }
  traverseBlockMove(blockMove) {
    return blockMove;
  }
  traverseCommutator(commutator) {
    return commutator;
  }
  traverseConjugate(conjugate) {
    return conjugate;
  }
  traversePause(pause) {
    return pause;
  }
  traverseNewLine(newLine) {
    return newLine;
  }
  traverseComment(comment) {
    return comment;
  }
  sameBlock(moveA, moveB) {
    return moveA.outerLayer === moveB.outerLayer && moveA.innerLayer === moveB.innerLayer && moveA.family === moveB.family;
  }
}
function repetitionSuffix(amount) {
  const absAmount = Math.abs(amount);
  let s = "";
  if (absAmount !== 1) {
    s += String(absAmount);
  }
  if (absAmount !== amount) {
    s += "'";
  }
  return s;
}
function blockMoveToString(blockMove) {
  let out = blockMove.family + repetitionSuffix(blockMove.amount);
  if (typeof blockMove.innerLayer !== "undefined") {
    out = String(blockMove.innerLayer) + out;
    if (typeof blockMove.outerLayer !== "undefined") {
      out = String(blockMove.outerLayer) + "-" + out;
    }
  }
  return out;
}
class ToString extends TraversalUp {
  traverseSequence(sequence) {
    let output = "";
    if (sequence.nestedUnits.length > 0) {
      output += this.traverse(sequence.nestedUnits[0]);
      for (let i2 = 1; i2 < sequence.nestedUnits.length; i2++) {
        output += this.spaceBetween(sequence.nestedUnits[i2 - 1], sequence.nestedUnits[i2]);
        output += this.traverse(sequence.nestedUnits[i2]);
      }
    }
    return output;
  }
  traverseGroup(group) {
    return "(" + this.traverse(group.nestedSequence) + ")" + repetitionSuffix(group.amount);
  }
  traverseBlockMove(blockMove) {
    return blockMoveToString(blockMove);
  }
  traverseCommutator(commutator) {
    return "[" + this.traverse(commutator.A) + ", " + this.traverse(commutator.B) + "]" + repetitionSuffix(commutator.amount);
  }
  traverseConjugate(conjugate) {
    return "[" + this.traverse(conjugate.A) + ": " + this.traverse(conjugate.B) + "]" + repetitionSuffix(conjugate.amount);
  }
  traversePause(_pause) {
    return ".";
  }
  traverseNewLine(_newLine) {
    return "\n";
  }
  traverseComment(comment) {
    return "//" + comment.comment;
  }
  spaceBetween(u1, u2) {
    if (matchesAlgType(u1, "pause") && matchesAlgType(u2, "pause")) {
      return "";
    }
    if (matchesAlgType(u1, "newLine") || matchesAlgType(u2, "newLine")) {
      return "";
    }
    if (matchesAlgType(u1, "comment") && !matchesAlgType(u2, "newLine")) {
      return "\n";
    }
    return " ";
  }
}
const invertInstance = new Invert();
const expandInstance = new Expand();
const structureEqualsInstance = new StructureEquals();
const coalesceBaseMovesInstance = new CoalesceBaseMoves();
const algToStringInstance = new ToString();
const invert = invertInstance.traverseSequence.bind(invertInstance);
const expand = expandInstance.traverseSequence.bind(expandInstance);
const structureEquals = structureEqualsInstance.traverseSequence.bind(structureEqualsInstance);
const coalesceBaseMoves = coalesceBaseMovesInstance.traverseSequence.bind(coalesceBaseMovesInstance);
const algToString = algToStringInstance.traverseSequence.bind(algToStringInstance);
const algPartStructureEqualsForTesting = algToStringInstance.traverse.bind(algToStringInstance);
const algPartToStringForTesting = algToStringInstance.traverse.bind(algToStringInstance);
function experimentalBlockMoveQuantumName(move) {
  return algPartToStringForTesting(new BlockMove(move.outerLayer, move.innerLayer, move.family, 1));
}

// src/cubing/alg/example.ts
const Example = {
  Sune: new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("U", 1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -2),
    BareBlockMove("R", -1)
  ]),
  AntiSune: new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", 2),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1)
  ]),
  SuneCommutator: new Sequence([
    new Commutator(new Sequence([
      BareBlockMove("R", 1),
      BareBlockMove("U", 1),
      BareBlockMove("R", -2)
    ]), new Sequence([
      new Conjugate(new Sequence([BareBlockMove("R", 1)]), new Sequence([BareBlockMove("U", 1)]), 1)
    ]), 1)
  ]),
  Niklas: new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("L", -1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("L", 1),
    BareBlockMove("U", 1)
  ]),
  EPerm: new Sequence([
    BareBlockMove("x", -1),
    new Commutator(new Sequence([
      new Conjugate(new Sequence([BareBlockMove("R", 1)]), new Sequence([BareBlockMove("U", -1)]))
    ]), new Sequence([BareBlockMove("D", 1)]), 1),
    new Commutator(new Sequence([
      new Conjugate(new Sequence([BareBlockMove("R", 1)]), new Sequence([BareBlockMove("U", 1)]))
    ]), new Sequence([BareBlockMove("D", 1)]), 1),
    BareBlockMove("x", 1)
  ]),
  FURURFCompact: new Sequence([
    new Conjugate(new Sequence([BareBlockMove("F", 1)]), new Sequence([
      new Commutator(new Sequence([BareBlockMove("U", 1)]), new Sequence([BareBlockMove("R", 1)]), 1)
    ]), 1)
  ]),
  APermCompact: new Sequence([
    new Conjugate(new Sequence([BareBlockMove("R", 2)]), new Sequence([
      new Commutator(new Sequence([BareBlockMove("F", 2)]), new Sequence([
        BareBlockMove("R", -1),
        BareBlockMove("B", -1),
        BareBlockMove("R", 1)
      ]), 1)
    ]), 1)
  ]),
  FURURFMoves: new Sequence([
    BareBlockMove("F", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", 1),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
    BareBlockMove("F", -1)
  ]),
  TPerm: new Sequence([
    BareBlockMove("R", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
    BareBlockMove("F", 1),
    BareBlockMove("R", 2),
    BareBlockMove("U", -1),
    BareBlockMove("R", -1),
    BareBlockMove("U", -1),
    BareBlockMove("R", 1),
    BareBlockMove("U", 1),
    BareBlockMove("R", -1),
    BareBlockMove("F", -1)
  ]),
  HeadlightSwaps: new Sequence([
    new Conjugate(new Sequence([BareBlockMove("F", 1)]), new Sequence([
      new Commutator(new Sequence([BareBlockMove("R", 1)]), new Sequence([BareBlockMove("U", 1)]), 3)
    ]), 1)
  ]),
  TriplePause: new Sequence([new Pause(), new Pause(), new Pause()]),
  AllAlgParts: [
    new Sequence([BareBlockMove("R", 1), BareBlockMove("U", -1)]),
    new Group(new Sequence([BareBlockMove("F", 1)]), 2),
    BareBlockMove("R", 2),
    new Commutator(new Sequence([BareBlockMove("R", 2)]), new Sequence([BareBlockMove("U", 2)]), 2),
    new Conjugate(new Sequence([BareBlockMove("L", 2)]), new Sequence([BareBlockMove("D", -1)]), 2),
    new Pause(),
    new NewLine(),
    new Comment("short comment")
  ]
};

// src/cubing/alg/json.ts
function fromJSON(json3) {
  if (json3.type !== "sequence") {
    throw new Error(`Expected Sequence while parsing, got: ${json3.type}`);
  }
  if (!json3.nestedUnits) {
    throw new Error("Missing nestedUnits");
  }
  return new Sequence(json3.nestedUnits.map((j) => unitFromJSON(j)));
}
function unitFromJSON(json3) {
  switch (json3.type) {
    case "sequence":
      throw new Error(`Expected AlgPart while parsing, got \`Sequence\`.`);
    case "group":
      if (!json3.nestedSequence) {
        throw new Error("Missing nestedSequence");
      }
      if (!json3.amount) {
        throw new Error("Missing amount");
      }
      return new Group(fromJSON(json3.nestedSequence), json3.amount);
    case "blockMove":
      if (!json3.family) {
        throw new Error("Missing family");
      }
      if (!json3.amount) {
        throw new Error("Missing amount");
      }
      return new BlockMove(json3.outerLayer, json3.innerLayer, json3.family, json3.amount);
    case "commutator":
      if (!json3.A) {
        throw new Error("Missing A");
      }
      if (!json3.B) {
        throw new Error("Missing B");
      }
      if (!json3.amount) {
        throw new Error("Missing amount");
      }
      return new Commutator(fromJSON(json3.A), fromJSON(json3.B), json3.amount);
    case "conjugate":
      if (!json3.A) {
        throw new Error("Missing A");
      }
      if (!json3.B) {
        throw new Error("Missing B");
      }
      if (!json3.amount) {
        throw new Error("Missing amount");
      }
      return new Conjugate(fromJSON(json3.A), fromJSON(json3.B), json3.amount);
    case "pause":
      return new Pause();
    case "newLine":
      return new NewLine();
    case "comment":
      if (!json3.comment && json3.comment !== "") {
        throw new Error("Missing comment");
      }
      return new Comment(json3.comment);
    default:
      throw new Error(`Unknown alg type: ${json3.type}`);
  }
}

// src/cubing/alg/validation.ts
class ValidationError extends Error {
}
class ValidatorTraversal extends TraversalUp {
}
function validateFamily(family, allowedFamilyLists) {
  for (const list of allowedFamilyLists) {
    if (list[family] === true) {
      return true;
    }
  }
  return false;
}
const plainMoveFamilies = {
  x: true,
  y: true,
  z: true,
  M: true,
  E: true,
  S: true,
  m: true,
  e: true,
  s: true
};
const singleSliceMoveFamilies = {
  U: true,
  L: true,
  F: true,
  R: true,
  B: true,
  D: true
};
const wideMoveFamilies = {
  u: true,
  l: true,
  f: true,
  r: true,
  b: true,
  d: true,
  Uw: true,
  Lw: true,
  Fw: true,
  Rw: true,
  Bw: true,
  Dw: true
};
class BaseMoveValidator extends ValidatorTraversal {
  traverseSequence(sequence) {
    for (const unit of sequence.nestedUnits) {
      this.traverse(unit);
    }
  }
  traverseGroup(group) {
    return this.traverse(group.nestedSequence);
  }
  traverseCommutator(commutator) {
    this.traverse(commutator.A);
    this.traverse(commutator.B);
  }
  traverseConjugate(conjugate) {
    this.traverse(conjugate.A);
    this.traverse(conjugate.B);
  }
  traversePause(_pause) {
    return;
  }
  traverseNewLine(_newLine) {
    return;
  }
  traverseComment(_comment) {
    return;
  }
}
class BlockMoveValidator extends BaseMoveValidator {
  traverseBlockMove(blockMove) {
    if (typeof blockMove.outerLayer !== "undefined") {
      if (typeof blockMove.innerLayer === "undefined") {
        throw new ValidationError("A BlockMove with an outer layer must have an inner layer.");
      }
      if (!validateFamily(blockMove.family, [wideMoveFamilies])) {
        throw new ValidationError(`The provided SiGN move family is invalid, or cannot have an outer and inner layer: ${blockMove.family}`);
      }
      if (blockMove.outerLayer <= 0) {
        throw new ValidationError("Cannot have an outer layer of 0 or less.");
      }
      if (blockMove.outerLayer >= blockMove.innerLayer) {
        throw new ValidationError("The outer layer must be less than the inner layer.");
      }
      return;
    } else if (typeof blockMove.innerLayer !== "undefined") {
      if (!validateFamily(blockMove.family, [
        wideMoveFamilies,
        singleSliceMoveFamilies
      ])) {
        throw new ValidationError(`The provided SiGN move family is invalid, or cannot have an inner slice: ${blockMove.family}`);
      }
      if (blockMove.innerLayer <= 0) {
        throw new ValidationError("Cannot have an inner layer of 0 or less.");
      }
      return;
    } else {
      if (!validateFamily(blockMove.family, [
        wideMoveFamilies,
        singleSliceMoveFamilies,
        plainMoveFamilies
      ])) {
        throw new ValidationError(`Invalid SiGN plain move family: ${blockMove.family}`);
      }
      return;
    }
  }
}
class FlatAlgValidator extends ValidatorTraversal {
  traverseSequence(sequence) {
    for (const unit of sequence.nestedUnits) {
      this.traverse(unit);
    }
    return;
  }
  traverseGroup(_group) {
    throw new ValidationError("A flat alg cannot contain a group.");
  }
  traverseBlockMove(_blockMove) {
    return;
  }
  traverseCommutator(_commutator) {
    throw new ValidationError("A flat alg cannot contain a commutator.");
  }
  traverseConjugate(_conjugate) {
    throw new ValidationError("A flat alg cannot contain a conjugate.");
  }
  traversePause(_pause) {
    return;
  }
  traverseNewLine(_newLine) {
    return;
  }
  traverseComment(_comment) {
    return;
  }
}
const BlockMoveValidatorInstance = new BlockMoveValidator();
const validateSiGNMoves = BlockMoveValidatorInstance.traverse.bind(BlockMoveValidatorInstance);
const flatAlgValidatorInstance = new FlatAlgValidator();
const validateFlatAlg = flatAlgValidatorInstance.traverse.bind(flatAlgValidatorInstance);
function validateSiGNAlg(a) {
  validateSiGNMoves(a);
  validateFlatAlg(a);
}

// src/cubing/alg/parser/parser.js
const parser_pegjs = __toModule(require_parser_pegjs());

// src/cubing/alg/parser/index.ts
function parse2(s, options = {validators: []}) {
  options.validators = options.validators || [];
  const algo = fromJSON(parser_pegjs.parse(s));
  for (const validate of options.validators) {
    validate(algo);
  }
  return algo;
}

// src/cubing/alg/keyboard.ts
const cubeKeyMapping = {
  73: BareBlockMove("R"),
  75: BareBlockMove("R", -1),
  87: BareBlockMove("B"),
  79: BareBlockMove("B", -1),
  83: BareBlockMove("D"),
  76: BareBlockMove("D", -1),
  68: BareBlockMove("L"),
  69: BareBlockMove("L", -1),
  74: BareBlockMove("U"),
  70: BareBlockMove("U", -1),
  72: BareBlockMove("F"),
  71: BareBlockMove("F", -1),
  78: BareBlockMove("x", -1),
  67: BareBlockMove("l"),
  82: BareBlockMove("l", -1),
  85: BareBlockMove("r"),
  77: BareBlockMove("r", -1),
  88: BareBlockMove("d", 1),
  188: BareBlockMove("d", -1),
  84: BareBlockMove("x"),
  89: BareBlockMove("x"),
  66: BareBlockMove("x", -1),
  186: BareBlockMove("y"),
  59: BareBlockMove("y"),
  65: BareBlockMove("y", -1),
  80: BareBlockMove("z"),
  81: BareBlockMove("z", -1),
  90: BareBlockMove("M", -1),
  190: BareBlockMove("M", -1)
};
function keyToMove(e) {
  if (e.altKey || e.ctrlKey) {
    return null;
  }
  return cubeKeyMapping[e.keyCode] || null;
}

// src/cubing/alg/url.ts
function serializeURLParam(a) {
  let escaped = algToString(a);
  escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
  escaped = escaped.replace(/\+/g, "&#2b;");
  escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
  return escaped;
}
function deserializeURLParam(a) {
  let unescaped = a;
  unescaped = unescaped.replace(/-/g, "'").replace(/&#45;/g, "-");
  unescaped = unescaped.replace(/\+/g, " ").replace(/&#2b;/g, "+");
  unescaped = unescaped.replace(/_/g, " ").replace(/&#95;/g, "_");
  return parse2(unescaped);
}
function getAlgURLParam(name6) {
  const s = new URLSearchParams(window.location.search).get(name6) || "";
  return deserializeURLParam(s);
}
function algCubingNetLink(options) {
  const url2 = new URL("https://alg.cubing.net");
  if (!options.alg) {
    throw new Error("An alg parameter is required.");
  }
  url2.searchParams.set("alg", serializeURLParam(options.alg));
  if (options.setup) {
    url2.searchParams.set("setup", serializeURLParam(options.setup));
  }
  if (options.title) {
    url2.searchParams.set("title", options.title);
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
    url2.searchParams.set("puzzle", options.puzzle);
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
    url2.searchParams.set("stage", options.stage);
  }
  if (options.view) {
    if (!["editor", "playback", "fullscreen"].includes(options.view)) {
      throw new Error(`Invalid view parameter: ${options.view}`);
    }
    url2.searchParams.set("view", options.view);
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
    url2.searchParams.set("type", options.type);
  }
  return url2.toString();
}

// src/cubing/bluetooth/index.ts
const bluetooth_exports = {};
__export(bluetooth_exports, {
  BluetoothPuzzle: () => BluetoothPuzzle,
  GanCube: () => GanCube,
  GiiKERCube: () => GiiKERCube,
  GoCube: () => GoCube,
  KeyboardPuzzle: () => KeyboardPuzzle,
  connect: () => connect,
  debugKeyboardConnect: () => debugKeyboardConnect,
  enableDebugLogging: () => enableDebugLogging,
  giikerMoveToBlockMoveForTesting: () => giikerMoveToBlockMove
});

// src/cubing/bluetooth/transformer.ts
const three = __toModule(require("three"));
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
const s2 = Math.sqrt(0.5);
const m = {
  "y z": new three.Quaternion(0, 0, 0, 1),
  "-z y": new three.Quaternion(s2, 0, 0, s2),
  "x z": new three.Quaternion(0, 0, -s2, s2),
  "-x z": new three.Quaternion(0, 0, s2, s2)
};
class BasicRotationTransformer {
  transformMove(_moveEvent) {
  }
  transformOrientation(orientationEvent) {
    const {x, y, z, w} = orientationEvent.quaternion;
    const quat = new three.Quaternion(x, y, z, w);
    const U = new three.Vector3(0, 1, 0);
    const F = new three.Vector3(0, 0, 1);
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
}

// src/cubing/bluetooth/bluetooth-puzzle.ts
class BluetoothPuzzle {
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
    for (const transformer2 of this.transformers) {
      transformer2.transformMove(moveEvent);
    }
    for (const l of this.listeners) {
      l(moveEvent);
    }
  }
  dispatchOrientation(orientationEvent) {
    for (const transformer2 of this.transformers) {
      transformer2.transformOrientation(orientationEvent);
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
}

// src/cubing/bluetooth/debug.ts
let DEBUG_LOGGING_ENABLED = false;
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

// src/cubing/bluetooth/gan.ts
const three2 = __toModule(require("three"));

// src/cubing/kpuzzle/index.ts
const kpuzzle_exports = {};
__export(kpuzzle_exports, {
  CanonicalSequenceIterator: () => CanonicalSequenceIterator,
  Canonicalize: () => Canonicalize,
  Combine: () => Combine,
  EquivalentStates: () => EquivalentStates,
  EquivalentTransformations: () => EquivalentTransformations,
  IdentityTransformation: () => IdentityTransformation,
  Invert: () => Invert2,
  KPuzzle: () => KPuzzle,
  Multiply: () => Multiply,
  Order: () => Order,
  Puzzles: () => Puzzles,
  SVG: () => SVG,
  SearchSequence: () => SearchSequence,
  parseKPuzzle: () => parseKPuzzle,
  stateForBlockMove: () => stateForBlockMove
});

// src/cubing/kpuzzle/transformations.ts
function Combine(def2, t1, t2) {
  const newTrans = {};
  for (const orbitName in def2.orbits) {
    const oDef = def2.orbits[orbitName];
    const o1 = t1[orbitName];
    const o2 = t2[orbitName];
    const newPerm = new Array(oDef.numPieces);
    const newOri = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      newOri[idx] = (o1.orientation[o2.permutation[idx]] + o2.orientation[idx]) % oDef.orientations;
      newPerm[idx] = o1.permutation[o2.permutation[idx]];
    }
    newTrans[orbitName] = {permutation: newPerm, orientation: newOri};
  }
  return newTrans;
}
function Multiply(def2, t2, amount) {
  if (amount < 0) {
    return Multiply(def2, Invert2(def2, t2), -amount);
  }
  if (amount === 0) {
    return IdentityTransformation(def2);
  }
  if (amount === 1) {
    return t2;
  }
  const halfish = Multiply(def2, t2, Math.floor(amount / 2));
  const twiceHalfish = Combine(def2, halfish, halfish);
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return Combine(def2, t2, twiceHalfish);
  }
}
function IdentityTransformation(definition) {
  const transformation = {};
  for (const orbitName in definition.orbits) {
    const orbitDefinition = definition.orbits[orbitName];
    const newPermutation = new Array(orbitDefinition.numPieces);
    const newOrientation = new Array(orbitDefinition.numPieces);
    for (let i2 = 0; i2 < orbitDefinition.numPieces; i2++) {
      newPermutation[i2] = i2;
      newOrientation[i2] = 0;
    }
    const orbitTransformation = {
      permutation: newPermutation,
      orientation: newOrientation
    };
    transformation[orbitName] = orbitTransformation;
  }
  return transformation;
}
function Invert2(def2, t2) {
  const newTrans = {};
  for (const orbitName in def2.orbits) {
    const oDef = def2.orbits[orbitName];
    const o2 = t2[orbitName];
    const newPerm = new Array(oDef.numPieces);
    const newOri = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      const fromIdx = o2.permutation[idx];
      newPerm[fromIdx] = idx;
      newOri[fromIdx] = (oDef.orientations - o2.orientation[idx] + oDef.orientations) % oDef.orientations;
    }
    newTrans[orbitName] = {permutation: newPerm, orientation: newOri};
  }
  return newTrans;
}
function gcd(a, b) {
  if (b) {
    return gcd(b, a % b);
  }
  return a;
}
function Order(def2, t2) {
  let r3 = 1;
  for (const orbitName in def2.orbits) {
    const oDef = def2.orbits[orbitName];
    const o2 = t2[orbitName];
    const d2 = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      if (!d2[idx]) {
        let w = idx;
        let om = 0;
        let pm = 0;
        for (; ; ) {
          d2[w] = true;
          om = om + o2.orientation[w];
          pm = pm + 1;
          w = o2.permutation[w];
          if (w === idx) {
            break;
          }
        }
        if (om !== 0) {
          pm = pm * oDef.orientations / gcd(oDef.orientations, om);
        }
        r3 = r3 * pm / gcd(r3, pm);
      }
    }
  }
  return r3;
}
function EquivalentTransformations(def2, t1, t2) {
  for (const orbitName in def2.orbits) {
    const oDef = def2.orbits[orbitName];
    const o1 = t1[orbitName];
    const o2 = t2[orbitName];
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      if (o1.orientation[idx] !== o2.orientation[idx]) {
        return false;
      }
      if (o1.permutation[idx] !== o2.permutation[idx]) {
        return false;
      }
    }
  }
  return true;
}
function EquivalentStates(def2, t1, t2) {
  return EquivalentTransformations(def2, Combine(def2, def2.startPieces, t1), Combine(def2, def2.startPieces, t2));
}

// src/cubing/kpuzzle/kpuzzle.ts
function stateForBlockMove(def2, blockMove) {
  const move = getNotationLayer(def2).lookupMove(blockMove);
  if (!move) {
    throw new Error("Unknown move: " + blockMoveToString(blockMove));
  }
  return move;
}
function getNotationLayer(def2) {
  if (!def2.moveNotation) {
    def2.moveNotation = new KPuzzleMoveNotation(def2);
  }
  return def2.moveNotation;
}
class KPuzzleMoveNotation {
  constructor(def2) {
    this.def = def2;
    this.cache = {};
  }
  lookupMove(move) {
    const key = blockMoveToString(move);
    let r3 = this.cache[key];
    if (r3) {
      return r3;
    }
    const baseMove = new BlockMove(move.outerLayer, move.innerLayer, move.family, 1);
    const baseKey = blockMoveToString(baseMove);
    r3 = this.def.moves[baseKey];
    if (r3) {
      r3 = Multiply(this.def, r3, move.amount);
      this.cache[key] = r3;
    }
    return r3;
  }
}
class KPuzzle {
  constructor(definition) {
    this.definition = definition;
    this.state = IdentityTransformation(definition);
  }
  reset() {
    this.state = IdentityTransformation(this.definition);
  }
  serialize() {
    let output = "";
    for (const orbitName in this.definition.orbits) {
      output += orbitName + "\n";
      output += this.state[orbitName].permutation.join(" ") + "\n";
      output += this.state[orbitName].orientation.join(" ") + "\n";
    }
    output = output.slice(0, output.length - 1);
    return output;
  }
  applyBlockMove(blockMove) {
    this.state = Combine(this.definition, this.state, stateForBlockMove(this.definition, blockMove));
  }
  applyAlg(a) {
    for (const move of expand(a).nestedUnits) {
      this.applyBlockMove(move);
    }
  }
}

// src/cubing/kpuzzle/canonicalize.ts
class InternalMove {
  constructor(base, twist) {
    this.base = base;
    this.twist = twist;
  }
  getTransformation(canon) {
    return canon.transforms[this.base][this.twist];
  }
  asString(canon) {
    const mod = canon.moveorder[this.base];
    let tw = this.twist % mod;
    while (tw + tw > mod) {
      tw -= mod;
    }
    while (tw + tw <= -mod) {
      tw += mod;
    }
    const nam = canon.movenames[this.base];
    if (tw === 1) {
      return nam;
    } else if (tw === -1) {
      return nam + "'";
    } else if (tw > 0) {
      return nam + tw;
    } else if (tw < 0) {
      return nam + -tw + "'";
    } else {
      throw new Error("Stringifying null move?");
    }
  }
}
class Canonicalize {
  constructor(def2) {
    this.def = def2;
    this.commutes = [];
    this.moveorder = [];
    this.movenames = [];
    this.transforms = [];
    this.moveindex = {};
    const basemoves = def2.moves;
    const id = IdentityTransformation(def2);
    for (const mv1 in basemoves) {
      this.moveindex[mv1] = this.movenames.length;
      this.movenames.push(mv1);
      this.transforms.push([id, basemoves[mv1]]);
    }
    this.baseMoveCount = this.movenames.length;
    for (let i2 = 0; i2 < this.baseMoveCount; i2++) {
      this.commutes.push([]);
      const t1 = this.transforms[i2][1];
      for (let j = 0; j < this.baseMoveCount; j++) {
        const t2 = this.transforms[j][1];
        const ab = Combine(def2, t1, t2);
        const ba = Combine(def2, t2, t1);
        this.commutes[i2][j] = EquivalentTransformations(def2, ab, ba);
      }
    }
    for (let i2 = 0; i2 < this.baseMoveCount; i2++) {
      const t1 = this.transforms[i2][1];
      let ct = t1;
      let order = 1;
      for (let mult = 2; !EquivalentTransformations(def2, id, ct); mult++) {
        order++;
        ct = Combine(def2, ct, t1);
        this.transforms[i2].push(ct);
      }
      this.moveorder[i2] = order;
    }
  }
  blockMoveToInternalMove(mv) {
    const basemove = modifiedBlockMove(mv, {amount: 1});
    const s = blockMoveToString(basemove);
    if (!(s in this.def.moves)) {
      throw new Error("! move " + s + " not in def.");
    }
    const ind = this.moveindex[s];
    const mod = this.moveorder[ind];
    let tw = mv.amount % mod;
    if (tw < 0) {
      tw = (tw + mod) % mod;
    }
    return new InternalMove(ind, tw);
  }
  sequenceToSearchSequence(s, tr) {
    const ss = new SearchSequence(this, tr);
    for (const mv of s.nestedUnits) {
      ss.appendOneMove(this.blockMoveToInternalMove(mv));
    }
    return ss;
  }
  mergeSequenceToSearchSequence(s, tr) {
    const ss = new SearchSequence(this, tr);
    for (const mv of s.nestedUnits) {
      ss.mergeOneMove(this.blockMoveToInternalMove(mv));
    }
    return ss;
  }
}
class SearchSequence {
  constructor(canon, tr) {
    this.canon = canon;
    this.moveseq = [];
    if (tr) {
      this.trans = tr;
    } else {
      this.trans = IdentityTransformation(canon.def);
    }
  }
  clone() {
    const r3 = new SearchSequence(this.canon, this.trans);
    r3.moveseq = [...this.moveseq];
    return r3;
  }
  mergeOneMove(mv) {
    const r3 = this.onlyMergeOneMove(mv);
    this.trans = Combine(this.canon.def, this.trans, mv.getTransformation(this.canon));
    return r3;
  }
  appendOneMove(mv) {
    this.moveseq.push(mv);
    this.trans = Combine(this.canon.def, this.trans, mv.getTransformation(this.canon));
    return 1;
  }
  popMove() {
    const mv = this.moveseq.pop();
    if (!mv) {
      throw new Error("Can't pop an empty sequence");
    }
    this.trans = Combine(this.canon.def, this.trans, this.canon.transforms[mv.base][this.canon.moveorder[mv.base] - mv.twist]);
    return 1;
  }
  oneMoreTwist() {
    const lastmv = this.moveseq[this.moveseq.length - 1];
    this.trans = Combine(this.canon.def, this.trans, this.canon.transforms[lastmv.base][1]);
    this.moveseq[this.moveseq.length - 1] = new InternalMove(lastmv.base, lastmv.twist + 1);
    return 0;
  }
  onlyMergeOneMove(mv) {
    let j = this.moveseq.length - 1;
    while (j >= 0) {
      if (mv.base === this.moveseq[j].base) {
        const mo = this.canon.moveorder[mv.base];
        let twist = (mv.twist + this.moveseq[j].twist) % mo;
        if (twist < 0) {
          twist = (twist + mo) % mo;
        }
        if (twist === 0) {
          this.moveseq.splice(j, 1);
          return -1;
        } else {
          this.moveseq[j] = new InternalMove(mv.base, twist);
          return 0;
        }
      } else if (this.canon.commutes[mv.base][this.moveseq[j].base]) {
        j--;
      } else {
        break;
      }
    }
    this.moveseq.push(mv);
    return 1;
  }
  mergeSequence(seq) {
    let r3 = this.moveseq.length;
    for (let i2 = 0; i2 < seq.moveseq.length; i2++) {
      const mv = seq.moveseq[i2];
      const d2 = this.onlyMergeOneMove(mv);
      r3 += d2;
    }
    this.trans = Combine(this.canon.def, this.trans, seq.trans);
    return r3;
  }
  getSequenceAsString() {
    const r3 = [];
    for (const mv of this.moveseq) {
      r3.push(mv.asString(this.canon));
    }
    return r3.join(" ");
  }
}
class CanonicalSequenceIterator {
  constructor(canon, state) {
    this.canon = canon;
    this.ss = new SearchSequence(canon, state);
    this.targetLength = 0;
  }
  nextState(base, canonstate) {
    const newstate = [];
    for (const prevbase of canonstate) {
      if (prevbase === base) {
        return null;
      } else if (!this.canon.commutes[prevbase][base]) {
      } else if (base < prevbase) {
        return null;
      } else {
        newstate.push(prevbase);
      }
    }
    return newstate;
  }
  *genSequence(togo, canonstate) {
    if (togo === 0) {
      yield this.ss;
    } else {
      for (let base = 0; base < this.canon.baseMoveCount; base++) {
        const newstate = this.nextState(base, canonstate);
        if (newstate) {
          newstate.push(base);
          for (let tw = 1; tw < this.canon.moveorder[base]; tw++) {
            this.ss.appendOneMove(new InternalMove(base, tw));
            yield* this.genSequence(togo - 1, newstate);
            this.ss.popMove();
          }
        }
      }
    }
    return null;
  }
  *generator() {
    for (let d2 = 0; ; d2++) {
      yield* this.genSequence(d2, []);
    }
  }
  *genSequenceTree(canonstate) {
    const r3 = yield this.ss;
    if (r3 > 0) {
      return null;
    }
    for (let base = 0; base < this.canon.baseMoveCount; base++) {
      const newstate = this.nextState(base, canonstate);
      if (newstate) {
        newstate.push(base);
        for (let tw = 1; tw < this.canon.moveorder[base]; tw++) {
          this.ss.appendOneMove(new InternalMove(base, tw));
          yield* this.genSequenceTree(newstate);
          this.ss.popMove();
        }
      }
    }
    return null;
  }
}

// src/cubing/kpuzzle/definitions/2x2x2.kpuzzle.json
var name = "2x2x2";
var orbits = {
  CORNERS: {numPieces: 8, orientations: 3}
};
var startPieces = {
  CORNERS: {
    permutation: [0, 1, 2, 3, 4, 5, 6, 7],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0]
  }
};
var moves = {
  U: {
    CORNERS: {
      permutation: [1, 2, 3, 0, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  y: {
    CORNERS: {
      permutation: [1, 2, 3, 0, 7, 4, 5, 6],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  x: {
    CORNERS: {
      permutation: [4, 0, 3, 5, 7, 6, 2, 1],
      orientation: [2, 1, 2, 1, 1, 2, 1, 2]
    }
  },
  L: {
    CORNERS: {
      permutation: [0, 1, 6, 2, 4, 3, 5, 7],
      orientation: [0, 0, 2, 1, 0, 2, 1, 0]
    }
  },
  F: {
    CORNERS: {
      permutation: [3, 1, 2, 5, 0, 4, 6, 7],
      orientation: [1, 0, 0, 2, 2, 1, 0, 0]
    }
  },
  R: {
    CORNERS: {
      permutation: [4, 0, 2, 3, 7, 5, 6, 1],
      orientation: [2, 1, 0, 0, 1, 0, 0, 2]
    }
  },
  B: {
    CORNERS: {
      permutation: [0, 7, 1, 3, 4, 5, 2, 6],
      orientation: [0, 2, 1, 0, 0, 0, 2, 1]
    }
  },
  D: {
    CORNERS: {
      permutation: [0, 1, 2, 3, 5, 6, 7, 4],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  z: {
    CORNERS: {
      permutation: [3, 2, 6, 5, 0, 4, 7, 1],
      orientation: [1, 2, 1, 2, 2, 1, 2, 1]
    }
  }
};
var x2x2_kpuzzle_default = {
  name,
  orbits,
  startPieces,
  moves
};

// src/cubing/kpuzzle/definitions/svg-inlined/2x2x2.kpuzzle.svg.ts
var x2x2_kpuzzle_svg_default = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN"
       "http://www.w3.org/TR/2001/REC-SVG-20050904/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 520 394" preserveAspectRatio="xMidYMid meet">
  <title>2x2x2</title>
  <defs>
    <g id="sticker">
        <rect x="0" y="0" width="1" height="1" stroke="black" stroke-width="0.04px" />
    </g>
  </defs>
  <g id="puzzle" transform="translate(5, 5) scale(60)">
    <use id="CORNERS-l0-o0" xlink:href="#sticker" transform="translate(3.2, 1)" style="fill: white"/>
    <use id="CORNERS-l0-o1" xlink:href="#sticker" transform="translate(4.4, 2.2)" style="fill: red"/>
    <use id="CORNERS-l0-o2" xlink:href="#sticker" transform="translate(3.2, 2.2)" style="fill: limegreen"/>

    <use id="CORNERS-l1-o0" xlink:href="#sticker" transform="translate(3.2, 0)" style="fill: white"/>
    <use id="CORNERS-l1-o1" xlink:href="#sticker" transform="translate(6.6, 2.2)" style="fill: #26f"/>
    <use id="CORNERS-l1-o2" xlink:href="#sticker" transform="translate(5.4, 2.2)" style="fill: red"/>

    <use id="CORNERS-l2-o0" xlink:href="#sticker" transform="translate(2.2, 0)" style="fill: white"/>
    <use id="CORNERS-l2-o1" xlink:href="#sticker" transform="translate(0, 2.2)" style="fill: orange"/>
    <use id="CORNERS-l2-o2" xlink:href="#sticker" transform="translate(7.6, 2.2)" style="fill: #26f"/>

    <use id="CORNERS-l3-o0" xlink:href="#sticker" transform="translate(2.2, 1)" style="fill: white"/>
    <use id="CORNERS-l3-o1" xlink:href="#sticker" transform="translate(2.2, 2.2)" style="fill: limegreen"/>
    <use id="CORNERS-l3-o2" xlink:href="#sticker" transform="translate(1, 2.2)" style="fill: orange"/>

    <use id="CORNERS-l4-o0" xlink:href="#sticker" transform="translate(3.2, 4.4)" style="fill: yellow"/>
    <use id="CORNERS-l4-o1" xlink:href="#sticker" transform="translate(3.2, 3.2)" style="fill: limegreen"/>
    <use id="CORNERS-l4-o2" xlink:href="#sticker" transform="translate(4.4, 3.2)" style="fill: red"/>

    <use id="CORNERS-l5-o0" xlink:href="#sticker" transform="translate(2.2, 4.4)" style="fill: yellow"/>
    <use id="CORNERS-l5-o1" xlink:href="#sticker" transform="translate(1, 3.2)" style="fill: orange"/>
    <use id="CORNERS-l5-o2" xlink:href="#sticker" transform="translate(2.2, 3.2)" style="fill: limegreen"/>

    <use id="CORNERS-l6-o0" xlink:href="#sticker" transform="translate(2.2, 5.4)" style="fill: yellow"/>
    <use id="CORNERS-l6-o1" xlink:href="#sticker" transform="translate(7.6, 3.2)" style="fill: #26f"/>
    <use id="CORNERS-l6-o2" xlink:href="#sticker" transform="translate(0, 3.2)"  style="fill: orange"/>

    <use id="CORNERS-l7-o0" xlink:href="#sticker" transform="translate(3.2, 5.4)" style="fill: yellow"/>
    <use id="CORNERS-l7-o1" xlink:href="#sticker" transform="translate(5.4, 3.2)" style="fill: red"/>
    <use id="CORNERS-l7-o2" xlink:href="#sticker" transform="translate(6.6, 3.2)" style="fill: #26f"/>
  </g>

</svg>`;

// src/cubing/kpuzzle/definitions/3x3x3.kpuzzle.json
var name2 = "3x3x3";
var orbits2 = {
  EDGES: {numPieces: 12, orientations: 2},
  CORNERS: {numPieces: 8, orientations: 3},
  CENTERS: {numPieces: 6, orientations: 4}
};
var startPieces2 = {
  EDGES: {
    permutation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  CORNERS: {
    permutation: [0, 1, 2, 3, 4, 5, 6, 7],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0]
  },
  CENTERS: {
    permutation: [0, 1, 2, 3, 4, 5],
    orientation: [0, 0, 0, 0, 0, 0]
  }
};
var moves2 = {
  U: {
    EDGES: {
      permutation: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [1, 2, 3, 0, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [1, 0, 0, 0, 0, 0]
    }
  },
  y: {
    EDGES: {
      permutation: [1, 2, 3, 0, 5, 6, 7, 4, 10, 8, 11, 9],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
    },
    CORNERS: {
      permutation: [1, 2, 3, 0, 7, 4, 5, 6],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [0, 2, 3, 4, 1, 5],
      orientation: [1, 0, 0, 0, 0, 3]
    }
  },
  x: {
    EDGES: {
      permutation: [4, 8, 0, 9, 6, 10, 2, 11, 5, 7, 1, 3],
      orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [4, 0, 3, 5, 7, 6, 2, 1],
      orientation: [2, 1, 2, 1, 1, 2, 1, 2]
    },
    CENTERS: {
      permutation: [2, 1, 5, 3, 0, 4],
      orientation: [0, 3, 0, 1, 2, 2]
    }
  },
  L: {
    EDGES: {
      permutation: [0, 1, 2, 11, 4, 5, 6, 9, 8, 3, 10, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [0, 1, 6, 2, 4, 3, 5, 7],
      orientation: [0, 0, 2, 1, 0, 2, 1, 0]
    },
    CENTERS: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 1, 0, 0, 0, 0]
    }
  },
  F: {
    EDGES: {
      permutation: [9, 1, 2, 3, 8, 5, 6, 7, 0, 4, 10, 11],
      orientation: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]
    },
    CORNERS: {
      permutation: [3, 1, 2, 5, 0, 4, 6, 7],
      orientation: [1, 0, 0, 2, 2, 1, 0, 0]
    },
    CENTERS: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 1, 0, 0, 0]
    }
  },
  R: {
    EDGES: {
      permutation: [0, 8, 2, 3, 4, 10, 6, 7, 5, 9, 1, 11],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [4, 0, 2, 3, 7, 5, 6, 1],
      orientation: [2, 1, 0, 0, 1, 0, 0, 2]
    },
    CENTERS: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 1, 0, 0]
    }
  },
  B: {
    EDGES: {
      permutation: [0, 1, 10, 3, 4, 5, 11, 7, 8, 9, 6, 2],
      orientation: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1]
    },
    CORNERS: {
      permutation: [0, 7, 1, 3, 4, 5, 2, 6],
      orientation: [0, 2, 1, 0, 0, 0, 2, 1]
    },
    CENTERS: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 1, 0]
    }
  },
  D: {
    EDGES: {
      permutation: [0, 1, 2, 3, 7, 4, 5, 6, 8, 9, 10, 11],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [0, 1, 2, 3, 5, 6, 7, 4],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 1]
    }
  },
  z: {
    EDGES: {
      permutation: [9, 3, 11, 7, 8, 1, 10, 5, 0, 4, 2, 6],
      orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    CORNERS: {
      permutation: [3, 2, 6, 5, 0, 4, 7, 1],
      orientation: [1, 2, 1, 2, 2, 1, 2, 1]
    },
    CENTERS: {
      permutation: [1, 5, 2, 0, 4, 3],
      orientation: [1, 1, 1, 1, 3, 1]
    }
  },
  M: {
    EDGES: {
      permutation: [2, 1, 6, 3, 0, 5, 4, 7, 8, 9, 10, 11],
      orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [4, 1, 0, 3, 5, 2],
      orientation: [2, 0, 0, 0, 2, 0]
    }
  },
  E: {
    EDGES: {
      permutation: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 8, 10],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
    },
    CORNERS: {
      permutation: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [0, 4, 1, 2, 3, 5],
      orientation: [0, 0, 0, 0, 0, 0]
    }
  },
  S: {
    EDGES: {
      permutation: [0, 3, 2, 7, 4, 1, 6, 5, 8, 9, 10, 11],
      orientation: [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [1, 5, 2, 0, 4, 3],
      orientation: [1, 1, 0, 1, 0, 1]
    }
  },
  u: {
    EDGES: {
      permutation: [1, 2, 3, 0, 4, 5, 6, 7, 10, 8, 11, 9],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
    },
    CORNERS: {
      permutation: [1, 2, 3, 0, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [0, 2, 3, 4, 1, 5],
      orientation: [1, 0, 0, 0, 0, 0]
    }
  },
  l: {
    EDGES: {
      permutation: [2, 1, 6, 11, 0, 5, 4, 9, 8, 3, 10, 7],
      orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [0, 1, 6, 2, 4, 3, 5, 7],
      orientation: [0, 0, 2, 1, 0, 2, 1, 0]
    },
    CENTERS: {
      permutation: [4, 1, 0, 3, 5, 2],
      orientation: [2, 1, 0, 0, 2, 0]
    }
  },
  f: {
    EDGES: {
      permutation: [9, 3, 2, 7, 8, 1, 6, 5, 0, 4, 10, 11],
      orientation: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0]
    },
    CORNERS: {
      permutation: [3, 1, 2, 5, 0, 4, 6, 7],
      orientation: [1, 0, 0, 2, 2, 1, 0, 0]
    },
    CENTERS: {
      permutation: [1, 5, 2, 0, 4, 3],
      orientation: [1, 1, 1, 1, 0, 1]
    }
  },
  r: {
    EDGES: {
      permutation: [4, 8, 0, 3, 6, 10, 2, 7, 5, 9, 1, 11],
      orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [4, 0, 2, 3, 7, 5, 6, 1],
      orientation: [2, 1, 0, 0, 1, 0, 0, 2]
    },
    CENTERS: {
      permutation: [2, 1, 5, 3, 0, 4],
      orientation: [0, 0, 0, 1, 2, 2]
    }
  },
  b: {
    EDGES: {
      permutation: [8, 5, 2, 1, 9, 7, 6, 3, 4, 0, 10, 11],
      orientation: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0]
    },
    CORNERS: {
      permutation: [4, 1, 2, 0, 5, 3, 6, 7],
      orientation: [1, 0, 0, 2, 2, 1, 0, 0]
    },
    CENTERS: {
      permutation: [3, 0, 2, 5, 4, 1],
      orientation: [3, 3, 3, 3, 0, 3]
    }
  },
  d: {
    EDGES: {
      permutation: [0, 1, 2, 3, 7, 4, 5, 6, 9, 11, 8, 10],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
    },
    CORNERS: {
      permutation: [0, 1, 2, 3, 5, 6, 7, 4],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [0, 4, 1, 2, 3, 5],
      orientation: [0, 0, 0, 0, 0, 1]
    }
  }
};
var x3x3_kpuzzle_default = {
  name: name2,
  orbits: orbits2,
  startPieces: startPieces2,
  moves: moves2
};

// src/cubing/kpuzzle/definitions/svg-inlined/3x3x3.kpuzzle.svg.ts
var x3x3_kpuzzle_svg_default = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN"
       "http://www.w3.org/TR/2001/REC-SVG-20050904/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 518 392" preserveAspectRatio="xMidYMid meet">
  <title>3x3x3</title>
  <defs>
    <g id="sticker">
        <rect x="0" y="0" width="1" height="1" stroke="black" stroke-width="0.04px" />
    </g>
  </defs>

<!--        0 1 2 3 4 5 6 7 8 9 10 11  -->
<!--        | | | | | | | | | | | |<-  -->
<!--    0 -       . . .                -->
<!--    1 -       . . .                -->
<!--    2 -       . . .                -->
<!--    3 - . . . . . . . . . . . .    -->
<!--    4 - . . . . . . . . . . . .    -->
<!--    5 - . . . . . . . . . . . .    -->
<!--    6 -       . . .                -->
<!--    7 -       . . .                -->
<!--    8 -       . . .                -->

  <g id="puzzle" transform="translate(5,5) scale(40)">
    <!-- CORNERS -->
    <use id="CORNERS-l0-o0" xlink:href="#sticker" transform="translate(5.3,2.1)" style="fill: white"/>
    <use id="CORNERS-l0-o1" xlink:href="#sticker" transform="translate(6.5,3.3)" style="fill: red"/>
    <use id="CORNERS-l0-o2" xlink:href="#sticker" transform="translate(5.3,3.3)" style="fill: limegreen"/>

    <use id="CORNERS-l1-o0" xlink:href="#sticker" transform="translate(5.3,0.1)" style="fill: white"/>
    <use id="CORNERS-l1-o1" xlink:href="#sticker" transform="translate(9.7,3.3)" style="fill: #26f"/>
    <use id="CORNERS-l1-o2" xlink:href="#sticker" transform="translate(8.5,3.3)" style="fill: red"/>

    <use id="CORNERS-l2-o0" xlink:href="#sticker" transform="translate(3.3,0.1)" style="fill: white"/>
    <use id="CORNERS-l2-o1" xlink:href="#sticker" transform="translate(0.1,3.3)" style="fill: orange"/>
    <use id="CORNERS-l2-o2" xlink:href="#sticker" transform="translate(11.7,3.3)" style="fill: #26f"/>

    <use id="CORNERS-l3-o0" xlink:href="#sticker" transform="translate(3.3,2.1)" style="fill: white"/>
    <use id="CORNERS-l3-o1" xlink:href="#sticker" transform="translate(3.3,3.3)" style="fill: limegreen"/>
    <use id="CORNERS-l3-o2" xlink:href="#sticker" transform="translate(2.1,3.3)" style="fill: orange"/>

    <use id="CORNERS-l4-o0" xlink:href="#sticker" transform="translate(5.3,6.5)" style="fill: yellow"/>
    <use id="CORNERS-l4-o1" xlink:href="#sticker" transform="translate(5.3,5.3)" style="fill: limegreen"/>
    <use id="CORNERS-l4-o2" xlink:href="#sticker" transform="translate(6.5,5.3)" style="fill: red"/>

    <use id="CORNERS-l5-o0" xlink:href="#sticker" transform="translate(3.3,6.5)" style="fill: yellow"/>
    <use id="CORNERS-l5-o1" xlink:href="#sticker" transform="translate(2.1,5.3)" style="fill: orange"/>
    <use id="CORNERS-l5-o2" xlink:href="#sticker" transform="translate(3.3,5.3)" style="fill: limegreen"/>

    <use id="CORNERS-l6-o0" xlink:href="#sticker" transform="translate(3.3,8.5)" style="fill: yellow"/>
    <use id="CORNERS-l6-o1" xlink:href="#sticker" transform="translate(11.7,5.3)" style="fill: #26f"/>
    <use id="CORNERS-l6-o2" xlink:href="#sticker" transform="translate(0.1,5.3)"  style="fill: orange"/>

    <use id="CORNERS-l7-o0" xlink:href="#sticker" transform="translate(5.3,8.5)" style="fill: yellow"/>
    <use id="CORNERS-l7-o1" xlink:href="#sticker" transform="translate(8.5,5.3)" style="fill: red"/>
    <use id="CORNERS-l7-o2" xlink:href="#sticker" transform="translate(9.7,5.3)" style="fill: #26f"/>

    <!-- EDGES -->
    <use id="EDGES-l0-o0"  xlink:href="#sticker" transform="translate(4.3,2.1)" style="fill: white"/>
    <use id="EDGES-l0-o1"  xlink:href="#sticker" transform="translate(4.3,3.3)" style="fill: limegreen"/>

    <use id="EDGES-l1-o0"  xlink:href="#sticker" transform="translate(5.3,1.1)" style="fill: white"/>
    <use id="EDGES-l1-o1"  xlink:href="#sticker" transform="translate(7.5,3.3)" style="fill: red"/>

    <use id="EDGES-l2-o0"  xlink:href="#sticker" transform="translate(4.3,0.1)" style="fill: white"/>
    <use id="EDGES-l2-o1"  xlink:href="#sticker" transform="translate(10.7,3.3)" style="fill: #26f"/>

    <use id="EDGES-l3-o0"  xlink:href="#sticker" transform="translate(3.3,1.1)" style="fill: white"/>
    <use id="EDGES-l3-o1"  xlink:href="#sticker" transform="translate(1.1,3.3)" style="fill: orange"/>

    <use id="EDGES-l4-o0"  xlink:href="#sticker" transform="translate(4.3,6.5)" style="fill: yellow"/>
    <use id="EDGES-l4-o1"  xlink:href="#sticker" transform="translate(4.3,5.3)" style="fill: limegreen"/>

    <use id="EDGES-l5-o0" xlink:href="#sticker" transform="translate(5.3,7.5)" style="fill: yellow"/>
    <use id="EDGES-l5-o1" xlink:href="#sticker" transform="translate(7.5,5.3)" style="fill: red"/>

    <use id="EDGES-l6-o0" xlink:href="#sticker" transform="translate(4.3,8.5)" style="fill: yellow"/>
    <use id="EDGES-l6-o1" xlink:href="#sticker" transform="translate(10.7,5.3)" style="fill: #26f"/>

    <use id="EDGES-l7-o0"  xlink:href="#sticker" transform="translate(3.3,7.5)" style="fill: yellow"/>
    <use id="EDGES-l7-o1"  xlink:href="#sticker" transform="translate(1.1,5.3)" style="fill: orange"/>

    <use id="EDGES-l8-o0"  xlink:href="#sticker" transform="translate(5.3,4.3)" style="fill: limegreen"/>
    <use id="EDGES-l8-o1"  xlink:href="#sticker" transform="translate(6.5,4.3)" style="fill: red"/>

    <use id="EDGES-l9-o0"  xlink:href="#sticker" transform="translate(3.3,4.3)" style="fill: limegreen"/>
    <use id="EDGES-l9-o1"  xlink:href="#sticker" transform="translate(2.1,4.3)" style="fill: orange"/>

    <use id="EDGES-l10-o0" xlink:href="#sticker" transform="translate(9.7,4.3)" style="fill: #26f"/>
    <use id="EDGES-l10-o1" xlink:href="#sticker" transform="translate(8.5,4.3)" style="fill: red"/>

    <use id="EDGES-l11-o0" xlink:href="#sticker" transform="translate(11.7,4.3)" style="fill: #26f"/>
    <use id="EDGES-l11-o1" xlink:href="#sticker" transform="translate(0.1,4.3)" style="fill: orange"/>

    <!-- CENTERS -->
    <!-- TODO: Allow the same sticker to be reused for multiple orientations -->
    <use id="CENTERS-l0-o0" xlink:href="#sticker" transform="translate(4.3,1.1)" style="fill: white"/>
    <use id="CENTERS-l0-o1" xlink:href="#sticker" transform="translate(4.3,1.1)" style="fill: white"/>
    <use id="CENTERS-l0-o2" xlink:href="#sticker" transform="translate(4.3,1.1)" style="fill: white"/>
    <use id="CENTERS-l0-o3" xlink:href="#sticker" transform="translate(4.3,1.1)" style="fill: white"/>

    <use id="CENTERS-l1-o0" xlink:href="#sticker" transform="translate(1.1,4.3)" style="fill: orange"/>
    <use id="CENTERS-l1-o1" xlink:href="#sticker" transform="translate(1.1,4.3)" style="fill: orange"/>
    <use id="CENTERS-l1-o2" xlink:href="#sticker" transform="translate(1.1,4.3)" style="fill: orange"/>
    <use id="CENTERS-l1-o3" xlink:href="#sticker" transform="translate(1.1,4.3)" style="fill: orange"/>

    <use id="CENTERS-l2-o0" xlink:href="#sticker" transform="translate(4.3,4.3)" style="fill: limegreen"/>
    <use id="CENTERS-l2-o1" xlink:href="#sticker" transform="translate(4.3,4.3)" style="fill: limegreen"/>
    <use id="CENTERS-l2-o2" xlink:href="#sticker" transform="translate(4.3,4.3)" style="fill: limegreen"/>
    <use id="CENTERS-l2-o3" xlink:href="#sticker" transform="translate(4.3,4.3)" style="fill: limegreen"/>

    <use id="CENTERS-l3-o0" xlink:href="#sticker" transform="translate(7.5,4.3)" style="fill: red"/>
    <use id="CENTERS-l3-o1" xlink:href="#sticker" transform="translate(7.5,4.3)" style="fill: red"/>
    <use id="CENTERS-l3-o2" xlink:href="#sticker" transform="translate(7.5,4.3)" style="fill: red"/>
    <use id="CENTERS-l3-o3" xlink:href="#sticker" transform="translate(7.5,4.3)" style="fill: red"/>

    <use id="CENTERS-l4-o0" xlink:href="#sticker" transform="translate(10.7,4.3)" style="fill: #26f"/>
    <use id="CENTERS-l4-o1" xlink:href="#sticker" transform="translate(10.7,4.3)" style="fill: #26f"/>
    <use id="CENTERS-l4-o2" xlink:href="#sticker" transform="translate(10.7,4.3)" style="fill: #26f"/>
    <use id="CENTERS-l4-o3" xlink:href="#sticker" transform="translate(10.7,4.3)" style="fill: #26f"/>

    <use id="CENTERS-l5-o0" xlink:href="#sticker" transform="translate(4.3,7.5)" style="fill: yellow"/>
    <use id="CENTERS-l5-o1" xlink:href="#sticker" transform="translate(4.3,7.5)" style="fill: yellow"/>
    <use id="CENTERS-l5-o2" xlink:href="#sticker" transform="translate(4.3,7.5)" style="fill: yellow"/>
    <use id="CENTERS-l5-o3" xlink:href="#sticker" transform="translate(4.3,7.5)" style="fill: yellow"/>
  </g>

</svg>`;

// src/cubing/kpuzzle/definitions/svg-inlined/3x3x3-ll.kpuzzle.svg.ts
var x3x3_ll_kpuzzle_svg_default = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256px" height="256px" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>3x3x3 LL</title>
  <defs>
    <g id="sticker">
        <rect x="-10" y="-10" width="1" height="1" stroke="black" stroke-width="0.04px" />
    </g>
  </defs>
  <g id="3x3x3-LL" stroke="none" stroke-width="4" style="none" stroke-linejoin="round">
    <rect id="CENTERS-l0-o0" stroke="#000000" style="fill: #FFFFFF" x="96" y="96" width="64" height="64"></rect>
    <rect id="CENTERS-l0-o1" stroke="#000000" style="fill: #FFFFFF" x="96" y="96" width="64" height="64"></rect>
    <rect id="CENTERS-l0-o2" stroke="#000000" style="fill: #FFFFFF" x="96" y="96" width="64" height="64"></rect>
    <rect id="CENTERS-l0-o3" stroke="#000000" style="fill: #FFFFFF" x="96" y="96" width="64" height="64"></rect>

    <rect    id="CORNERS-l0-o0" stroke="#000000" style="fill: #FFFFFF" x="160" y="160" width="64" height="64"></rect>
    <polygon id="CORNERS-l0-o1" stroke="#000000" style="fill: #FF0000" points="224 160 252 160 252 252 224 224"></polygon>
    <polygon id="CORNERS-l0-o2" stroke="#000000" style="fill: #00FF00" transform="translate(206, 238) scale(1, -1) rotate(-90) translate(-206, -238) " points="192 192 220 192 220 284 192 256"></polygon>
    <rect    id="CORNERS-l1-o0" stroke="#000000" style="fill: #FFFFFF" x="160" y="32" width="64" height="64"></rect>
    <polygon id="CORNERS-l1-o1" stroke="#000000" style="fill: #0000FF" transform="translate(206, 18) rotate(-90) translate(-206, -18) " points="192 -28 220 -28 220 64 192 36"></polygon>
    <polygon id="CORNERS-l1-o2" stroke="#000000" style="fill: #FF0000" transform="translate(238, 50) scale(1, -1) translate(-238, -50) " points="224 4 252 4 252 96 224 68"></polygon>
    <rect    id="CORNERS-l2-o0" stroke="#000000" style="fill: #FFFFFF" x="32" y="32" width="64" height="64"></rect>
    <polygon id="CORNERS-l2-o1" stroke="#000000" style="fill: #FF7F00" transform="translate(18, 50) scale(-1, -1) translate(-18, -50) " points="4 4 32 4 32 96 4 68"></polygon>
    <polygon id="CORNERS-l2-o2" stroke="#000000" style="fill: #0000FF" transform="translate(50, 18) scale(1, -1) rotate(90) translate(-50, -18) " points="36 -28 64 -28 64 64 36 36"></polygon>
    <rect    id="CORNERS-l3-o0" stroke="#000000" style="fill: #FFFFFF" x="32" y="160" width="64" height="64"></rect>
    <polygon id="CORNERS-l3-o1" stroke="#000000" style="fill: #00FF00" transform="translate(50, 238) rotate(90) translate(-50, -238) " points="36 192 64 192 64 284 36 256"></polygon>
    <polygon id="CORNERS-l3-o2" stroke="#000000" style="fill: #FF7F00" transform="translate(18, 206) scale(-1, 1) translate(-18, -206) " points="4 160 32 160 32 252 4 224"></polygon>

    <rect id="EDGES-l0-o0" stroke="#000000" style="fill: #FFFFFF" x="96" y="160" width="64" height="64"></rect>
    <rect id="EDGES-l0-o1" stroke="#000000" style="fill: #00FF00" transform="translate(128, 238) scale(1, -1) rotate(90) translate(-128, -238) " x="114" y="206" width="28" height="64"></rect>
    <rect id="EDGES-l1-o0" stroke="#000000" style="fill: #FFFFFF" x="160" y="96" width="64" height="64"></rect>
    <rect id="EDGES-l1-o1" stroke="#000000" style="fill: #FF0000" x="224" y="96" width="28" height="64"></rect>
    <rect id="EDGES-l2-o0" stroke="#000000" style="fill: #FFFFFF" x="96" y="32" width="64" height="64"></rect>
    <rect id="EDGES-l2-o1" stroke="#000000" style="fill: #0000FF" transform="translate(128, 18) scale(1, -1) rotate(90) translate(-128, -18) " x="114" y="-14" width="28" height="64"></rect>
    <rect id="EDGES-l3-o0" stroke="#000000" style="fill: #FFFFFF" x="32" y="96" width="64" height="64"></rect>
    <rect id="EDGES-l3-o1" stroke="#000000" style="fill: #FF7F00" x="4" y="96" width="28" height="64"></rect>

  </g>
  <g style="opacity: 0">
    <!-- CORNERS -->
    <use id="CORNERS-l4-o0" xlink:href="#sticker" style="fill: yellow"/>
    <use id="CORNERS-l4-o1" xlink:href="#sticker" style="fill: limegreen"/>
    <use id="CORNERS-l4-o2" xlink:href="#sticker" style="fill: red"/>

    <use id="CORNERS-l5-o0" xlink:href="#sticker" style="fill: yellow"/>
    <use id="CORNERS-l5-o1" xlink:href="#sticker" style="fill: orange"/>
    <use id="CORNERS-l5-o2" xlink:href="#sticker" style="fill: limegreen"/>

    <use id="CORNERS-l6-o0" xlink:href="#sticker" style="fill: yellow"/>
    <use id="CORNERS-l6-o1" xlink:href="#sticker" style="fill: #26f"/>
    <use id="CORNERS-l6-o2" xlink:href="#sticker"  style="fill: orange"/>

    <use id="CORNERS-l7-o0" xlink:href="#sticker" style="fill: yellow"/>
    <use id="CORNERS-l7-o1" xlink:href="#sticker" style="fill: red"/>
    <use id="CORNERS-l7-o2" xlink:href="#sticker" style="fill: #26f"/>

    <!-- EDGES -->
    <use id="EDGES-l4-o0"  xlink:href="#sticker" style="fill: yellow"/>
    <use id="EDGES-l4-o1"  xlink:href="#sticker" style="fill: limegreen"/>

    <use id="EDGES-l5-o0" xlink:href="#sticker" style="fill: yellow"/>
    <use id="EDGES-l5-o1" xlink:href="#sticker" style="fill: red"/>

    <use id="EDGES-l6-o0" xlink:href="#sticker" style="fill: yellow"/>
    <use id="EDGES-l6-o1" xlink:href="#sticker" style="fill: #26f"/>

    <use id="EDGES-l7-o0"  xlink:href="#sticker" style="fill: yellow"/>
    <use id="EDGES-l7-o1"  xlink:href="#sticker" style="fill: orange"/>

    <use id="EDGES-l8-o0"  xlink:href="#sticker" style="fill: limegreen"/>
    <use id="EDGES-l8-o1"  xlink:href="#sticker" style="fill: red"/>

    <use id="EDGES-l9-o0"  xlink:href="#sticker" style="fill: limegreen"/>
    <use id="EDGES-l9-o1"  xlink:href="#sticker" style="fill: orange"/>

    <use id="EDGES-l10-o0" xlink:href="#sticker" style="fill: #26f"/>
    <use id="EDGES-l10-o1" xlink:href="#sticker" style="fill: red"/>

    <use id="EDGES-l11-o0" xlink:href="#sticker" style="fill: #26f"/>
    <use id="EDGES-l11-o1" xlink:href="#sticker" style="fill: orange"/>

    <!-- CENTERS -->
    <!-- TODO: Allow the same sticker to be reused for multiple orientations -->
    <use id="CENTERS-l1-o0" xlink:href="#sticker" style="fill: orange"/>
    <use id="CENTERS-l1-o1" xlink:href="#sticker" style="fill: orange"/>
    <use id="CENTERS-l1-o2" xlink:href="#sticker" style="fill: orange"/>
    <use id="CENTERS-l1-o3" xlink:href="#sticker" style="fill: orange"/>

    <use id="CENTERS-l2-o0" xlink:href="#sticker" style="fill: limegreen"/>
    <use id="CENTERS-l2-o1" xlink:href="#sticker" style="fill: limegreen"/>
    <use id="CENTERS-l2-o2" xlink:href="#sticker" style="fill: limegreen"/>
    <use id="CENTERS-l2-o3" xlink:href="#sticker" style="fill: limegreen"/>

    <use id="CENTERS-l3-o0" xlink:href="#sticker" style="fill: red"/>
    <use id="CENTERS-l3-o1" xlink:href="#sticker" style="fill: red"/>
    <use id="CENTERS-l3-o2" xlink:href="#sticker" style="fill: red"/>
    <use id="CENTERS-l3-o3" xlink:href="#sticker" style="fill: red"/>

    <use id="CENTERS-l4-o0" xlink:href="#sticker" style="fill: #26f"/>
    <use id="CENTERS-l4-o1" xlink:href="#sticker" style="fill: #26f"/>
    <use id="CENTERS-l4-o2" xlink:href="#sticker" style="fill: #26f"/>
    <use id="CENTERS-l4-o3" xlink:href="#sticker" style="fill: #26f"/>

    <use id="CENTERS-l5-o0" xlink:href="#sticker" style="fill: yellow"/>
    <use id="CENTERS-l5-o1" xlink:href="#sticker" style="fill: yellow"/>
    <use id="CENTERS-l5-o2" xlink:href="#sticker" style="fill: yellow"/>
    <use id="CENTERS-l5-o3" xlink:href="#sticker" style="fill: yellow"/>
  </g>
</svg>`;

// src/cubing/kpuzzle/definitions/pyraminx.kpuzzle.json
var name3 = "Pyraminx";
var orbits3 = {
  CENTERS: {numPieces: 4, orientations: 3},
  TIPS: {numPieces: 4, orientations: 3},
  EDGES: {numPieces: 6, orientations: 2}
};
var startPieces3 = {
  CENTERS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0]},
  TIPS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0]},
  EDGES: {
    permutation: [0, 1, 2, 3, 4, 5],
    orientation: [0, 0, 0, 0, 0, 0]
  }
};
var moves3 = {
  U: {
    CENTERS: {permutation: [0, 1, 2, 3], orientation: [1, 0, 0, 0]},
    TIPS: {permutation: [0, 1, 2, 3], orientation: [1, 0, 0, 0]},
    EDGES: {
      permutation: [1, 2, 0, 3, 4, 5],
      orientation: [1, 0, 1, 0, 0, 0]
    }
  },
  L: {
    CENTERS: {permutation: [0, 1, 2, 3], orientation: [0, 1, 0, 0]},
    TIPS: {permutation: [0, 1, 2, 3], orientation: [0, 1, 0, 0]},
    EDGES: {
      permutation: [5, 1, 2, 0, 4, 3],
      orientation: [1, 0, 0, 0, 0, 1]
    }
  },
  R: {
    CENTERS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 1, 0]},
    TIPS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 1, 0]},
    EDGES: {
      permutation: [0, 3, 2, 4, 1, 5],
      orientation: [0, 0, 0, 1, 1, 0]
    }
  },
  B: {
    CENTERS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 1]},
    TIPS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 1]},
    EDGES: {
      permutation: [0, 1, 4, 3, 5, 2],
      orientation: [0, 0, 0, 0, 1, 1]
    }
  },
  u: {
    CENTERS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0]},
    TIPS: {permutation: [0, 1, 2, 3], orientation: [1, 0, 0, 0]},
    EDGES: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0]
    }
  },
  l: {
    CENTERS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0]},
    TIPS: {permutation: [0, 1, 2, 3], orientation: [0, 1, 0, 0]},
    EDGES: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0]
    }
  },
  r: {
    CENTERS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0]},
    TIPS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 1, 0]},
    EDGES: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0]
    }
  },
  b: {
    CENTERS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 0]},
    TIPS: {permutation: [0, 1, 2, 3], orientation: [0, 0, 0, 1]},
    EDGES: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0]
    }
  }
};
var pyraminx_kpuzzle_default = {
  name: name3,
  orbits: orbits3,
  startPieces: startPieces3,
  moves: moves3
};

// src/cubing/kpuzzle/definitions/svg-inlined/pyraminx.kpuzzle.svg.ts
var pyraminx_kpuzzle_svg_default = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN"
       "http://www.w3.org/TR/2001/REC-SVG-20050904/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 506 440" preserveAspectRatio="xMidYMid meet">
  <defs>
  </defs>
  <title>pyraminx</title>
  <defs>
    <g id="stickerA" transform="scale(1, 0.577350269)">
      <path
         d="m 0,1.732050808 1,-1.732050808 1,1.732050808 z"
         stroke="black" stroke-width="0.04px" stroke-linecap="butt" stroke-linejoin="round"
      />
    </g>
    <g id="stickerV" transform="scale(1, 0.577350269)">
      <path
         d="m 0,0 1,1.732050808 1,-1.732050808 z"
         stroke="black" stroke-width="0.04px" stroke-linecap="butt" stroke-linejoin="round"
      />
    </g>
  </defs>

<!--        0 1 2 3 4 5 6 7 8 9 10   -->
<!--        | | | | | | | | | | |    -->
<!--    0 - L L L L L F R R R R R    -->
<!--    1 -   L L L F F F R R R      -->
<!--    2 -     L F F F F F R        -->
<!--    3 -       D D D D D          -->
<!--    4 -         D D D            -->
<!--    5 -           D              -->

  <g id="puzzle" transform="translate(5, 5) scale(40, 69.28203232)">
    <!-- CENTERS -->
    <use id="CENTERS-l0-o0" xlink:href="#stickerV" transform="translate(5.2, 1.066666667)" style="fill: limegreen"/>
    <use id="CENTERS-l0-o1" xlink:href="#stickerA" transform="translate(3, 0)" style="fill: red"/>
    <use id="CENTERS-l0-o2" xlink:href="#stickerA" transform="translate(7.4, 0)" style="fill: blue"/>

    <use id="CENTERS-l1-o0" xlink:href="#stickerV" transform="translate(4.2, 2.066666667)" style="fill: limegreen"/>
    <use id="CENTERS-l1-o1" xlink:href="#stickerA" transform="translate(4.2, 3.2)" style="fill: yellow"/>
    <use id="CENTERS-l1-o2" xlink:href="#stickerA" transform="translate(2, 1)" style="fill: red"/>

    <use id="CENTERS-l2-o0" xlink:href="#stickerV" transform="translate(6.2, 2.066666667)" style="fill: limegreen"/>
    <use id="CENTERS-l2-o1" xlink:href="#stickerA" transform="translate(8.4, 1)" style="fill: blue"/>
    <use id="CENTERS-l2-o2" xlink:href="#stickerA" transform="translate(6.2, 3.2)" style="fill: yellow"/>

    <use id="CENTERS-l3-o0" xlink:href="#stickerA" transform="translate(9.4, 0)" style="fill: blue"/>
    <use id="CENTERS-l3-o1" xlink:href="#stickerA" transform="translate(1, 0)" style="fill: red"/>
    <use id="CENTERS-l3-o2" xlink:href="#stickerA" transform="translate(5.2, 4.2)" style="fill: yellow"/>

    <!-- TIPS -->
    <use id="TIPS-l0-o0" xlink:href="#stickerA" transform="translate(5.2, 0.066666667)" style="fill: limegreen"/>
    <use id="TIPS-l0-o1" xlink:href="#stickerV" transform="translate(4, 0)" style="fill: red"/>
    <use id="TIPS-l0-o2" xlink:href="#stickerV" transform="translate(6.4, 0)" style="fill: blue"/>

    <use id="TIPS-l1-o0" xlink:href="#stickerA" transform="translate(3.2, 2.066666667)" style="fill: limegreen"/>
    <use id="TIPS-l1-o1" xlink:href="#stickerV" transform="translate(3.2, 3.2)" style="fill: yellow"/>
    <use id="TIPS-l1-o2" xlink:href="#stickerV" transform="translate(2, 2)" style="fill: red"/>

    <use id="TIPS-l2-o0" xlink:href="#stickerV" transform="translate(8.4, 2)" style="fill: blue"/>
    <use id="TIPS-l2-o1" xlink:href="#stickerV" transform="translate(7.2, 3.2)" style="fill: yellow"/>
    <use id="TIPS-l2-o2" xlink:href="#stickerA" transform="translate(7.2, 2.066666667)" style="fill: limegreen"/>

    <use id="TIPS-l3-o0" xlink:href="#stickerV" transform="translate(10.4,0)" style="fill: blue"/>
    <use id="TIPS-l3-o1" xlink:href="#stickerV" transform="translate(0, 0)" style="fill: red"/>
    <use id="TIPS-l3-o2" xlink:href="#stickerV" transform="translate(5.2, 5.2)" style="fill: yellow"/>

    <!-- EDGES -->
    <use id="EDGES-l0-o0" xlink:href="#stickerA" transform="translate(4.2, 1.066666667)" style="fill: limegreen"/>
    <use id="EDGES-l0-o1" xlink:href="#stickerV" transform="translate(3, 1)" style="fill: red"/>

    <use id="EDGES-l1-o0" xlink:href="#stickerA" transform="translate(6.2, 1.066666667)" style="fill: limegreen"/>
    <use id="EDGES-l1-o1" xlink:href="#stickerV" transform="translate(7.4, 1)" style="fill: blue"/>

    <use id="EDGES-l2-o0" xlink:href="#stickerV" transform="translate(8.4, 0)" style="fill: blue"/>
    <use id="EDGES-l2-o1" xlink:href="#stickerV" transform="translate(2, 0)" style="fill: red"/>

    <use id="EDGES-l3-o0" xlink:href="#stickerV" transform="translate(5.2, 3.2)" style="fill: yellow"/>
    <use id="EDGES-l3-o1" xlink:href="#stickerA" transform="translate(5.2, 2.066666667)" style="fill: limegreen"/>

    <use id="EDGES-l4-o0" xlink:href="#stickerV" transform="translate(6.2, 4.2)" style="fill: yellow"/>
    <use id="EDGES-l4-o1" xlink:href="#stickerV" transform="translate(9.4, 1)" style="fill: blue"/>

    <use id="EDGES-l5-o0" xlink:href="#stickerV" transform="translate(4.2, 4.2)" style="fill: yellow"/>
    <use id="EDGES-l5-o1" xlink:href="#stickerV" transform="translate(1, 1)" style="fill: red"/>
  </g>

</svg>`;

// src/cubing/kpuzzle/definitions/sq1-hyperorbit.kpuzzle.json
var name4 = "Square-1";
var orbits4 = {
  WEDGES: {numPieces: 24, orientations: 9},
  EQUATOR: {numPieces: 2, orientations: 6}
};
var startPieces4 = {
  WEDGES: {
    permutation: [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23
    ],
    orientation: [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  EQUATOR: {permutation: [0, 1], orientation: [0, 0]}
};
var moves4 = {
  U: {
    WEDGES: {
      permutation: [
        11,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ],
      orientation: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    },
    EQUATOR: {permutation: [0, 1], orientation: [0, 0]}
  },
  D: {
    WEDGES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        23,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22
      ],
      orientation: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    },
    EQUATOR: {permutation: [0, 1], orientation: [0, 0]}
  },
  SLICE: {
    WEDGES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        12,
        13,
        14,
        15,
        16,
        17,
        6,
        7,
        8,
        9,
        10,
        11,
        18,
        19,
        20,
        21,
        22,
        23
      ],
      orientation: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]
    },
    EQUATOR: {permutation: [0, 1], orientation: [0, 3]}
  }
};
var sq1_hyperorbit_kpuzzle_default = {
  name: name4,
  orbits: orbits4,
  startPieces: startPieces4,
  moves: moves4
};

// src/cubing/kpuzzle/definitions/svg-inlined/sq1-hyperorbit.kpuzzle.svg.ts
var sq1_hyperorbit_kpuzzle_svg_default = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="360px" height="552px" viewBox="0 0 360 552" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 59.1 (86144) - https://sketch.com -->
    <title>sq1-fancy</title>
    <desc>Created with Sketch.</desc>
    <!-- stroke="none" -->
    <g id="sq1-fancy" stroke="#888" stroke-width="0.25" fill="none" fill-rule="evenodd">
        <g id="EQUATOR" transform="translate(24.000000, 264.000000)">
            <rect id="EQUATOR-l1-o3" style="fill: red" x="168" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l1-o4" style="fill: red" x="192" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l1-o5" style="fill: limegreen" x="216" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l1-o2" style="fill: limegreen" x="240" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l1-o1" style="fill: limegreen" x="264" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l1-o0" style="fill: orange" x="288" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l0-o3" style="fill: orange" x="0" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l0-o4" style="fill: orange" x="24" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l0-o5" style="fill: limegreen" x="48" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l0-o2" style="fill: limegreen" x="72" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l0-o1" style="fill: limegreen" x="96" y="0" width="24" height="24"></rect>
            <rect id="EQUATOR-l0-o0" style="fill: red" x="120" y="0" width="24" height="24"></rect>
        </g>
        <g id="BOTTOM" transform="translate(41.000000, 257.000000)" stroke-linejoin="round">
            <g id="WEDGES-23" transform="translate(130.000000, 88.588457) rotate(120.000000) translate(-130.000000, -88.588457) translate(82.000000, 22.588457)">
                <polygon id="WEDGES-l23-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l23-o7" style="fill: red" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l23-o6" style="fill: red" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l23-o5" style="fill: red" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l23-o4" style="fill: red" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l23-o3" style="fill: white" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l23-o2" style="fill: white" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l23-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l23-o0" style="fill: red" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-22" transform="translate(97.157677, 115.157677) rotate(90.000000) translate(-97.157677, -115.157677) translate(49.157677, 49.157677)">
                <polygon id="WEDGES-l22-o8" style="fill: blue" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l22-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l22-o6" style="fill: blue" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l22-o5" style="fill: blue" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l22-o4" style="fill: white" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l22-o3" style="fill: blue" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l22-o2" style="fill: white" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l22-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l22-o0" style="fill: blue" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-21" transform="translate(82.000000, 154.588457) rotate(60.000000) translate(-82.000000, -154.588457) translate(34.000000, 88.588457)">
                <polygon id="WEDGES-l21-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l21-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l21-o6" style="fill: #D8D8D8" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l21-o5" style="fill: blue" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l21-o4" style="fill: blue" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l21-o3" style="fill: blue" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l21-o2" style="fill: blue" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l21-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l21-o0" style="fill: blue" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-20" transform="translate(88.588457, 196.315353) rotate(30.000000) translate(-88.588457, -196.315353) translate(40.588457, 130.315353)">
                <polygon id="WEDGES-l20-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l20-o7" style="fill: blue" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l20-o6" style="fill: blue" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l20-o5" style="fill: blue" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l20-o4" style="fill: blue" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l20-o3" style="fill: white" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l20-o2" style="fill: white" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l20-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l20-o0" style="fill: blue" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-19" transform="translate(67.157677, 163.157677)">
                <polygon id="WEDGES-l19-o8" style="fill: orange" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l19-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l19-o6" style="fill: orange" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l19-o5" style="fill: orange" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l19-o4" style="fill: white" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l19-o3" style="fill: orange" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l19-o2" style="fill: white" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l19-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l19-o0" style="fill: orange" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-18" transform="translate(154.588457, 244.315353) scale(-1, -1) rotate(150.000000) translate(-154.588457, -244.315353) translate(106.588457, 178.315353)">
                <polygon id="WEDGES-l18-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l18-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l18-o6" style="fill: #D8D8D8" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l18-o5" style="fill: orange" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l18-o4" style="fill: orange" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l18-o3" style="fill: orange" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l18-o2" style="fill: orange" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l18-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l18-o0" style="fill: orange" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-17" transform="translate(196.315353, 237.726896) scale(-1, -1) rotate(120.000000) translate(-196.315353, -237.726896) translate(148.315353, 171.726896)">
                <polygon id="WEDGES-l17-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l17-o7" style="fill: orange" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l17-o6" style="fill: orange" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l17-o5" style="fill: orange" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l17-o4" style="fill: orange" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l17-o3" style="fill: white" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l17-o2" style="fill: white" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l17-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l17-o0" style="fill: orange" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-16" transform="translate(229.157677, 211.157677) scale(-1, -1) rotate(90.000000) translate(-229.157677, -211.157677) translate(181.157677, 145.157677)">
                <polygon id="WEDGES-l16-o8" style="fill: limegreen" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l16-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l16-o6" style="fill: limegreen" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l16-o5" style="fill: limegreen" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l16-o4" style="fill: white" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l16-o3" style="fill: limegreen" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l16-o2" style="fill: white" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l16-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l16-o0" style="fill: limegreen" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-15" transform="translate(244.315353, 171.726896) scale(-1, -1) rotate(60.000000) translate(-244.315353, -171.726896) translate(196.315353, 105.726896)">
                <polygon id="WEDGES-l15-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l15-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l15-o6" style="fill: #D8D8D8" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l15-o5" style="fill: limegreen" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l15-o4" style="fill: limegreen" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l15-o3" style="fill: limegreen" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l15-o2" style="fill: limegreen" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l15-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l15-o0" style="fill: limegreen" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-14" transform="translate(237.726896, 130.000000) scale(-1, -1) rotate(30.000000) translate(-237.726896, -130.000000) translate(189.726896, 64.000000)">
                <polygon id="WEDGES-l14-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l14-o7" style="fill: limegreen" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l14-o6" style="fill: limegreen" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l14-o5" style="fill: limegreen" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l14-o4" style="fill: limegreen" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l14-o3" style="fill: white" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l14-o2" style="fill: white" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l14-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l14-o0" style="fill: limegreen" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-13" transform="translate(211.157677, 97.157677) scale(-1, -1) translate(-211.157677, -97.157677) translate(163.157677, 31.157677)">
                <polygon id="WEDGES-l13-o8" style="fill: red" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l13-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l13-o6" style="fill: red" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l13-o5" style="fill: red" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l13-o4" style="fill: white" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l13-o3" style="fill: red" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l13-o2" style="fill: white" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l13-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l13-o0" style="fill: red" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-12" transform="translate(171.726896, 82.000000) rotate(150.000000) translate(-171.726896, -82.000000) translate(123.726896, 16.000000)">
                <polygon id="WEDGES-l12-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l12-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l12-o6" style="fill: #D8D8D8" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l12-o5" style="fill: red" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l12-o4" style="fill: red" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l12-o3" style="fill: red" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l12-o2" style="fill: red" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l12-o1" style="fill: white" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l12-o0" style="fill: red" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
        </g>
        <g id="TOP" transform="translate(41.000000, -31.000000)" stroke-linejoin="round">
            <g id="WEDGES-11" transform="translate(154.588457, 244.315353) scale(-1, -1) rotate(150.000000) translate(-154.588457, -244.315353) translate(106.588457, 178.315353)">
                <polygon id="WEDGES-l11-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l11-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l11-o6" style="fill: #D8D8D8" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l11-o5" style="fill: red" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l11-o4" style="fill: red" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l11-o3" style="fill: red" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l11-o2" style="fill: red" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l11-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l11-o0" style="fill: red" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-10" transform="translate(196.315353, 237.726896) scale(-1, -1) rotate(120.000000) translate(-196.315353, -237.726896) translate(148.315353, 171.726896)">
                <polygon id="WEDGES-l10-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l10-o7" style="fill: red" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l10-o6" style="fill: red" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l10-o5" style="fill: red" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l10-o4" style="fill: red" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l10-o3" style="fill: yellow" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l10-o2" style="fill: yellow" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l10-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l10-o0" style="fill: red" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-9" transform="translate(229.157677, 211.157677) scale(-1, -1) rotate(90.000000) translate(-229.157677, -211.157677) translate(181.157677, 145.157677)">
                <polygon id="WEDGES-l9-o8" style="fill: limegreen" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l9-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l9-o6" style="fill: limegreen" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l9-o5" style="fill: limegreen" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l9-o4" style="fill: yellow" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l9-o3" style="fill: limegreen" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l9-o2" style="fill: yellow" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l9-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l9-o0" style="fill: limegreen" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-8" transform="translate(244.315353, 171.726896) scale(-1, -1) rotate(60.000000) translate(-244.315353, -171.726896) translate(196.315353, 105.726896)">
                <polygon id="WEDGES-l8-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l8-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l8-o6" style="fill: #D8D8D8" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l8-o5" style="fill: limegreen" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l8-o4" style="fill: limegreen" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l8-o3" style="fill: limegreen" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l8-o2" style="fill: limegreen" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l8-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l8-o0" style="fill: limegreen" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-7" transform="translate(237.726896, 130.000000) scale(-1, -1) rotate(30.000000) translate(-237.726896, -130.000000) translate(189.726896, 64.000000)">
                <polygon id="WEDGES-l7-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l7-o7" style="fill: limegreen" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l7-o6" style="fill: limegreen" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l7-o5" style="fill: limegreen" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l7-o4" style="fill: limegreen" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l7-o3" style="fill: yellow" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l7-o2" style="fill: yellow" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l7-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l7-o0" style="fill: limegreen" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-6" transform="translate(211.157677, 97.157677) scale(-1, -1) translate(-211.157677, -97.157677) translate(163.157677, 31.157677)">
                <polygon id="WEDGES-l6-o8" style="fill: orange" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l6-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l6-o6" style="fill: orange" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l6-o5" style="fill: orange" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l6-o4" style="fill: yellow" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l6-o3" style="fill: orange" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l6-o2" style="fill: yellow" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l6-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l6-o0" style="fill: orange" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-5" transform="translate(171.726896, 82.000000) rotate(150.000000) translate(-171.726896, -82.000000) translate(123.726896, 16.000000)">
                <polygon id="WEDGES-l5-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l5-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l5-o6" style="fill: #D8D8D8" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l5-o5" style="fill: orange" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l5-o4" style="fill: orange" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l5-o3" style="fill: orange" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l5-o2" style="fill: orange" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l5-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l5-o0" style="fill: orange" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-4" transform="translate(130.000000, 88.588457) rotate(120.000000) translate(-130.000000, -88.588457) translate(82.000000, 22.588457)">
                <polygon id="WEDGES-l4-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l4-o7" style="fill: orange" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l4-o6" style="fill: orange" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l4-o5" style="fill: orange" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l4-o4" style="fill: orange" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l4-o3" style="fill: yellow" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l4-o2" style="fill: yellow" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l4-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l4-o0" style="fill: orange" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-3" transform="translate(97.157677, 115.157677) rotate(90.000000) translate(-97.157677, -115.157677) translate(49.157677, 49.157677)">
                <polygon id="WEDGES-l3-o8" style="fill: blue" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l3-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l3-o6" style="fill: blue" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l3-o5" style="fill: blue" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l3-o4" style="fill: yellow" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l3-o3" style="fill: blue" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l3-o2" style="fill: yellow" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l3-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l3-o0" style="fill: blue" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-2" transform="translate(82.000000, 154.588457) rotate(60.000000) translate(-82.000000, -154.588457) translate(34.000000, 88.588457)">
                <polygon id="WEDGES-l2-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l2-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l2-o6" style="fill: #D8D8D8" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l2-o5" style="fill: blue" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l2-o4" style="fill: blue" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l2-o3" style="fill: blue" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l2-o2" style="fill: blue" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l2-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l2-o0" style="fill: blue" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-1" transform="translate(88.588457, 196.315353) rotate(30.000000) translate(-88.588457, -196.315353) translate(40.588457, 130.315353)">
                <polygon id="WEDGES-l1-o8" style="fill: #D8D8D8" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l1-o7" style="fill: blue" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l1-o6" style="fill: blue" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l1-o5" style="fill: blue" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l1-o4" style="fill: blue" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l1-o3" style="fill: yellow" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l1-o2" style="fill: yellow" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l1-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l1-o0" style="fill: blue" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
            <g id="WEDGES-0" transform="translate(67.157677, 163.157677)">
                <polygon id="WEDGES-l0-o8" style="fill: red" points="25.723 70.277 40.574 95.999 -2.27373675e-13 96"></polygon>
                <polygon id="WEDGES-l0-o7" style="fill: #D8D8D8" points="70.2768775 96 60.8615612 131.138439 40.5741225 95.9988775"></polygon>
                <polygon id="WEDGES-l0-o6" style="fill: red" points="70.2768775 96 40.574 95.999 25.7231225 70.2768775"></polygon>
                <polygon id="WEDGES-l0-o5" style="fill: red" points="48.0001225 47.9995 68.287 47.9995 78.4307806 65.5692194"></polygon>
                <polygon id="WEDGES-l0-o4" style="fill: yellow" points="60.8615 35.1385 68.287 47.9995 48 48"></polygon>
                <polygon id="WEDGES-l0-o3" style="fill: red" points="83.1384388 48 78.4307806 65.5692194 68.2870612 47.9994388"></polygon>
                <polygon id="WEDGES-l0-o2" style="fill: yellow" points="83.1384388 48 68.287 47.9995 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l0-o1" style="fill: yellow" points="96 0 83.1384388 48 60.8615612 35.1384388"></polygon>
                <polygon id="WEDGES-l0-o0" style="fill: red" points="70.2768775 96 25.7231225 70.2768775 48.0001225 47.9995 78.4307806 65.5692194"></polygon>
            </g>
        </g>
        <g id="DIAGONALS" transform="translate(168.861561, 1.019238)" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <line x1="0" y1="287.842323" x2="70.2768775" y2="550.119201" id="BOTTOM"></line>
            <line x1="0.15767665" y1="262.276878" x2="70.4345542" y2="2.27488928e-16" id="TOP"></line>
        </g>
    </g>
</svg>`;

// src/cubing/kpuzzle/definitions/clock.kpuzzle.json
var name5 = "Clock";
var orbits5 = {
  DIALS: {numPieces: 18, orientations: 12},
  FACES: {numPieces: 18, orientations: 1},
  FRAME: {numPieces: 1, orientations: 2}
};
var startPieces5 = {
  DIALS: {
    permutation: [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17
    ],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  FACES: {
    permutation: [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17
    ],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  FRAME: {permutation: [0], orientation: [0]}
};
var moves5 = {
  UR: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 1, 1, 0, 1, 1, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  DR: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  DL: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  UL: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  U: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [1, 1, 1, 1, 1, 1, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 0]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  R: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 1, 1, 0, 1, 1, 0, 1, 1, -1, 0, 0, 0, 0, 0, -1, 0, 0]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  D: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, -1]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  L: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, -1, 0, 0, 0, 0, 0, -1]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  ALL: {
    DIALS: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        -1,
        0,
        -1,
        0,
        0,
        0,
        -1,
        0,
        -1
      ]
    },
    FACES: {
      permutation: [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [0]}
  },
  FLIP: {
    DIALS: {
      permutation: [
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FACES: {
      permutation: [
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    FRAME: {permutation: [0], orientation: [1]}
  }
};
var clock_kpuzzle_default = {
  name: name5,
  orbits: orbits5,
  startPieces: startPieces5,
  moves: moves5
};

// src/cubing/kpuzzle/definitions/svg-inlined/clock.kpuzzle.svg.ts
var clock_kpuzzle_svg_default = `<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid meet">
  <title>clock</title>
  <defs>
    <g id="hand" transform="translate(-20, -20)">
      <path d="M19.9995197,2.22079449 L23.8791657,19.0203611 C23.9580836,19.3338406 24,19.6620253 24,20 C24,22.209139 22.209139,24 20,24 C17.790861,24 16,22.209139 16,20 C16,19.6620253 16.0419164,19.3338406 16.1208343,19.0203611 L19.9995197,2.22079449 Z"></path>
    </g>
    <g id="cardinal_hours" style="fill: #FFFFFF">
      <circle cx="0" cy="24" r="2"></circle>
      <circle cx="-24" cy="0" r="2"></circle>
      <circle cx="24" cy="0" r="2"></circle>
      <circle cx="0" cy="-24" r="2"></circle>
    </g>
    <g id="face_hours">
      <g>
        <use xlink:href="#cardinal_hours"/>
      </g>
      <g transform="rotate(30)">
        <use xlink:href="#cardinal_hours"/>
      </g>
      <g  transform="rotate(60)">
        <use xlink:href="#cardinal_hours"/>
      </g>
    </g>
    <g id="pegs" stroke="#000000" style="fill: #FFD000">
      <circle id="PEG4" cx="90" cy="90" r="10"></circle>
      <circle id="PEG3" cx="30" cy="90" r="10"></circle>
      <circle id="PEG2" cx="90" cy="30" r="10"></circle>
      <circle id="PEG1" cx="30" cy="30" r="10"></circle>
    </g>
    <g id="frame" transform="translate(-24, -24)">
      <path stroke="#000000" d="M120,20 C137.495665,20 153.941932,24.4930026 168.247913,32.3881183 C171.855881,30.8514056 175.828512,30 180,30 C196.568542,30 210,43.4314575 210,60 C210,64.1714878 209.148594,68.1441192 207.610077,71.7536009 C215.506997,86.0580678 220,102.504335 220,120 C220,137.495665 215.506997,153.941932 207.611882,168.247913 C209.148594,171.855881 210,175.828512 210,180 C210,196.568542 196.568542,210 180,210 C175.828512,210 171.855881,209.148594 168.246399,207.610077 C153.941932,215.506997 137.495665,220 120,220 C102.504335,220 86.0580678,215.506997 71.7520869,207.611882 C68.1441192,209.148594 64.1714878,210 60,210 C43.4314575,210 30,196.568542 30,180 C30,175.828512 30.8514056,171.855881 32.3899234,168.246399 C24.4930026,153.941932 20,137.495665 20,120 C20,102.504335 24.4930026,86.0580678 32.3881183,71.7520869 C30.8514056,68.1441192 30,64.1714878 30,60 C30,43.4314575 43.4314575,30 60,30 C64.1714878,30 68.1441192,30.8514056 71.7536009,32.3899234 C86.0580678,24.4930026 102.504335,20 120,20 Z"></path>
    </g>
  </defs>
  <g>
    <g transform="translate(24, 24)">
      <use xlink:href="#frame" id="FRAME-l0-o0" style="fill: #0C5093"/>
      <use xlink:href="#pegs" transform="translate(36, 36)"/>
      <g transform="translate(36, 36)">
        <circle id="FACES-l0-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l0-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l0-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l0-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l0-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l0-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l0-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l0-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l0-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l0-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l0-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l0-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l0-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 36)">
        <circle id="FACES-l1-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l1-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l1-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l1-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l1-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l1-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l1-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l1-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l1-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l1-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l1-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l1-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l1-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 36)">
        <circle id="FACES-l2-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l2-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l2-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l2-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l2-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l2-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l2-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l2-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l2-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l2-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l2-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l2-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l2-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(36, 96)">
        <circle id="FACES-l3-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l3-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l3-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l3-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l3-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l3-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l3-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l3-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l3-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l3-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l3-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l3-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l3-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 96)">
        <circle id="FACES-l4-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l4-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l4-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l4-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l4-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l4-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l4-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l4-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l4-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l4-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l4-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l4-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l4-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 96)">
        <circle id="FACES-l5-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l5-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l5-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l5-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l5-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l5-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l5-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l5-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l5-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l5-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l5-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l5-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l5-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(36, 156)">
        <circle id="FACES-l6-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l6-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l6-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l6-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l6-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l6-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l6-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l6-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l6-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l6-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l6-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l6-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l6-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 156)">
        <circle id="FACES-l7-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l7-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l7-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l7-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l7-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l7-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l7-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l7-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l7-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l7-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l7-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l7-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l7-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 156)">
        <circle id="FACES-l8-o0" stroke="#000000" style="fill: #90B8DF" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l8-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l8-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l8-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l8-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l8-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l8-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l8-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l8-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l8-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l8-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l8-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l8-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
    </g>
    <g transform="translate(264, 24)">
      <use xlink:href="#frame" id="FRAME-l0-o1" style="fill: #90B8DF"/>
      <use xlink:href="#pegs" transform="translate(36, 36)"/>
      <g transform="translate(36, 36)">
        <circle id="FACES-l9-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l9-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l9-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l9-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l9-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l9-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l9-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l9-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l9-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l9-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l9-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l9-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l9-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 36)">
        <circle id="FACES-l10-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l10-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l10-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l10-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l10-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l10-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l10-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l10-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l10-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l10-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l10-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l10-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l10-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 36)">
        <circle id="FACES-l11-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l11-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l11-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l11-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l11-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l11-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l11-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l11-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l11-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l11-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l11-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l11-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l11-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(36, 96)">
        <circle id="FACES-l12-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l12-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l12-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l12-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l12-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l12-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l12-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l12-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l12-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l12-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l12-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l12-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l12-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 96)">
        <circle id="FACES-l13-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l13-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l13-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l13-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l13-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l13-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l13-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l13-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l13-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l13-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l13-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l13-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l13-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 96)">
        <circle id="FACES-l14-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l14-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l14-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l14-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l14-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l14-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l14-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l14-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l14-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l14-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l14-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l14-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l14-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(36, 156)">
        <circle id="FACES-l15-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l15-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l15-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l15-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l15-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l15-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l15-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l15-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l15-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l15-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l15-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l15-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l15-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(96, 156)">
        <circle id="FACES-l16-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l16-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l16-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l16-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l16-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l16-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l16-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l16-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l16-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l16-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l16-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l16-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l16-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
      <g transform="translate(156, 156)">
        <circle id="FACES-l17-o0" stroke="#000000" style="fill: #0C5093" r="20"></circle>
        <use xlink:href="#face_hours"/>
        <g>
          <use id="DIALS-l17-o0"  xlink:href="#hand" transform="rotate(0)" style="fill: #FFD000"/>
          <use id="DIALS-l17-o1"  xlink:href="#hand" transform="rotate(30)" style="fill: #0000"/>
          <use id="DIALS-l17-o2"  xlink:href="#hand" transform="rotate(60)" style="fill: #0000"/>
          <use id="DIALS-l17-o3"  xlink:href="#hand" transform="rotate(90)" style="fill: #0000"/>
          <use id="DIALS-l17-o4"  xlink:href="#hand" transform="rotate(120)" style="fill: #0000"/>
          <use id="DIALS-l17-o5"  xlink:href="#hand" transform="rotate(150)" style="fill: #0000"/>
          <use id="DIALS-l17-o6"  xlink:href="#hand" transform="rotate(180)" style="fill: #0000"/>
          <use id="DIALS-l17-o7"  xlink:href="#hand" transform="rotate(210)" style="fill: #0000"/>
          <use id="DIALS-l17-o8"  xlink:href="#hand" transform="rotate(240)" style="fill: #0000"/>
          <use id="DIALS-l17-o9"  xlink:href="#hand" transform="rotate(270)" style="fill: #0000"/>
          <use id="DIALS-l17-o10" xlink:href="#hand" transform="rotate(300)" style="fill: #0000"/>
          <use id="DIALS-l17-o11" xlink:href="#hand" transform="rotate(330)" style="fill: #0000"/>
        </g>
      </g>
    </g>
  </g>
</svg>`;

// src/cubing/kpuzzle/definitions/index.ts
const Cube222 = x2x2_kpuzzle_default;
Cube222.svg = x2x2_kpuzzle_svg_default;
const Cube333 = x3x3_kpuzzle_default;
Cube333.svg = x3x3_kpuzzle_svg_default;
const Cube333LL = JSON.parse(JSON.stringify(x3x3_kpuzzle_default));
Cube333LL.svg = x3x3_ll_kpuzzle_svg_default;
const Pyraminx = pyraminx_kpuzzle_default;
Pyraminx.svg = pyraminx_kpuzzle_svg_default;
const Square1 = sq1_hyperorbit_kpuzzle_default;
Square1.svg = sq1_hyperorbit_kpuzzle_svg_default;
const Clock = clock_kpuzzle_default;
Clock.svg = clock_kpuzzle_svg_default;

// src/cubing/kpuzzle/puzzle_definitions.ts
const Puzzles = {
  "2x2x2": Cube222,
  "3x3x3": Cube333,
  "3x3x3LL": Cube333LL,
  pyraminx: Pyraminx,
  sq1: Square1,
  clock: Clock
};

// src/cubing/kpuzzle/parser/parser-shim.js
const parser_pegjs2 = __toModule(require_parser_pegjs2());

// src/cubing/kpuzzle/parser/parser.ts
const parseKPuzzle = parser_pegjs2.parse;

// src/cubing/kpuzzle/svg.ts
const xmlns = "http://www.w3.org/2000/svg";
let svgCounter = 0;
function nextSVGID() {
  svgCounter += 1;
  return "svg" + svgCounter.toString();
}
class SVG {
  constructor(kPuzzleDefinition) {
    this.kPuzzleDefinition = kPuzzleDefinition;
    this.originalColors = {};
    this.gradients = {};
    if (!kPuzzleDefinition.svg) {
      throw new Error(`No SVG definition for puzzle type: ${kPuzzleDefinition.name}`);
    }
    this.svgID = nextSVGID();
    this.element = document.createElement("div");
    this.element.classList.add("svg-wrapper");
    this.element.innerHTML = kPuzzleDefinition.svg;
    const svgElem = this.element.querySelector("svg");
    if (!svgElem) {
      throw new Error("Could not get SVG element");
    }
    if (xmlns !== svgElem.namespaceURI) {
      throw new Error("Unexpected XML namespace");
    }
    svgElem.style.maxWidth = "100%";
    svgElem.style.maxHeight = "100%";
    this.gradientDefs = document.createElementNS(xmlns, "defs");
    svgElem.insertBefore(this.gradientDefs, svgElem.firstChild);
    for (const orbitName in kPuzzleDefinition.orbits) {
      const orbitDefinition = kPuzzleDefinition.orbits[orbitName];
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (let orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          const id = this.elementID(orbitName, idx, orientation);
          const elem = this.elementByID(id);
          const originalColor = elem.style.fill;
          this.originalColors[id] = originalColor;
          this.gradients[id] = this.newGradient(id, originalColor);
          this.gradientDefs.appendChild(this.gradients[id]);
          elem.setAttribute("style", `fill: url(#grad-${this.svgID}-${id})`);
        }
      }
    }
  }
  drawKPuzzle(kpuzzle11, nextState, fraction) {
    this.draw(kpuzzle11.definition, kpuzzle11.state, nextState, fraction);
  }
  draw(definition, state, nextState, fraction) {
    for (const orbitName in definition.orbits) {
      const orbitDefinition = definition.orbits[orbitName];
      const curOrbitState = state[orbitName];
      const nextOrbitState = nextState ? nextState[orbitName] : null;
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (let orientation = 0; orientation < orbitDefinition.orientations; orientation++) {
          const id = this.elementID(orbitName, idx, orientation);
          const fromCur = this.elementID(orbitName, curOrbitState.permutation[idx], (orbitDefinition.orientations - curOrbitState.orientation[idx] + orientation) % orbitDefinition.orientations);
          let singleColor = false;
          if (nextOrbitState) {
            const fromNext = this.elementID(orbitName, nextOrbitState.permutation[idx], (orbitDefinition.orientations - nextOrbitState.orientation[idx] + orientation) % orbitDefinition.orientations);
            if (fromCur === fromNext) {
              singleColor = true;
            }
            fraction = fraction || 0;
            const easedBackwardsPercent = 100 * (1 - fraction * fraction * (2 - fraction * fraction));
            this.gradients[id].children[0].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("offset", `${Math.max(easedBackwardsPercent - 5, 0)}%`);
            this.gradients[id].children[2].setAttribute("offset", `${Math.max(easedBackwardsPercent - 5, 0)}%`);
            this.gradients[id].children[3].setAttribute("offset", `${easedBackwardsPercent}%`);
            this.gradients[id].children[4].setAttribute("offset", `${easedBackwardsPercent}%`);
            this.gradients[id].children[4].setAttribute("stop-color", this.originalColors[fromNext]);
            this.gradients[id].children[5].setAttribute("stop-color", this.originalColors[fromNext]);
          } else {
            singleColor = true;
          }
          if (singleColor) {
            this.gradients[id].children[0].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("stop-color", this.originalColors[fromCur]);
            this.gradients[id].children[1].setAttribute("offset", `100%`);
            this.gradients[id].children[2].setAttribute("offset", `100%`);
            this.gradients[id].children[3].setAttribute("offset", `100%`);
            this.gradients[id].children[4].setAttribute("offset", `100%`);
          }
        }
      }
    }
  }
  newGradient(id, originalColor) {
    const grad = document.createElementNS(xmlns, "radialGradient");
    grad.setAttribute("id", `grad-${this.svgID}-${id}`);
    grad.setAttribute("r", `70.7107%`);
    const stopDefs = [
      {offset: 0, color: originalColor},
      {offset: 0, color: originalColor},
      {offset: 0, color: "black"},
      {offset: 0, color: "black"},
      {offset: 0, color: originalColor},
      {offset: 100, color: originalColor}
    ];
    for (const stopDef of stopDefs) {
      const stop = document.createElementNS(xmlns, "stop");
      stop.setAttribute("offset", `${stopDef.offset}%`);
      stop.setAttribute("stop-color", stopDef.color);
      stop.setAttribute("stop-opacity", "1");
      grad.appendChild(stop);
    }
    return grad;
  }
  elementID(orbitName, idx, orientation) {
    return orbitName + "-l" + idx + "-o" + orientation;
  }
  elementByID(id) {
    return this.element.querySelector("#" + id);
  }
}

// src/cubing/bluetooth/unsafe-raw-aes.ts
const blockSize = 16;
const zeros = new Uint8Array(blockSize);
const paddingBlockPlaintext = new Uint8Array(new Array(blockSize).fill(blockSize));
const AES_CBC = "AES-CBC";
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

// src/cubing/bluetooth/gan.ts
const DEFAULT_INTERVAL_MS = 150;
const MAX_LATEST_MOVES = 6;
const ganMoveToBlockMove = {
  0: BareBlockMove("U"),
  2: BareBlockMove("U", -1),
  3: BareBlockMove("R"),
  5: BareBlockMove("R", -1),
  6: BareBlockMove("F"),
  8: BareBlockMove("F", -1),
  9: BareBlockMove("D"),
  11: BareBlockMove("D", -1),
  12: BareBlockMove("L"),
  14: BareBlockMove("L", -1),
  15: BareBlockMove("B"),
  17: BareBlockMove("B", -1)
};
let homeQuatInverse = null;
function probablyDecodedCorrectly(data) {
  return data[13] < 18 && data[14] < 18 && data[15] < 18 && data[16] < 18 && data[17] < 18 && data[18] < 18;
}
const key10 = new Uint8Array([
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
const key11 = new Uint8Array([
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
class PhysicalState {
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
    const quat = new three2.Quaternion(x, y, z, w);
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
    return Array.from(this.arr.slice(19 - n, 19)).map((i2) => ganMoveToBlockMove[i2]);
  }
  debugInfo() {
    return {
      arr: this.arr
    };
  }
}
const UUIDs = {
  ganCubeService: "0000fff0-0000-1000-8000-00805f9b34fb",
  physicalStateCharacteristic: "0000fff5-0000-1000-8000-00805f9b34fb",
  actualAngleAndBatteryCharacteristic: "0000fff7-0000-1000-8000-00805f9b34fb",
  faceletStatus1Characteristic: "0000fff2-0000-1000-8000-00805f9b34fb",
  faceletStatus2Characteristic: "0000fff3-0000-1000-8000-00805f9b34fb",
  infoService: "0000180a-0000-1000-8000-00805f9b34fb",
  systemIDCharacteristic: "00002a23-0000-1000-8000-00805f9b34fb",
  versionCharacteristic: "00002a28-0000-1000-8000-00805f9b34fb"
};
const commands = {
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
const ganConfig = {
  filters: [{namePrefix: "GAN"}],
  optionalServices: [UUIDs.ganCubeService, UUIDs.infoService]
};
function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join(" ");
}
const reidEdgeOrder = "UF UR UB UL DF DR DB DL FR FL BR BL".split(" ");
const reidCornerOrder = "UFR URB UBL ULF DRF DFL DLB DBR".split(" ");
function rotateLeft(s, i2) {
  return s.slice(i2) + s.slice(0, i2);
}
const pieceMap = {};
reidEdgeOrder.forEach((edge, idx) => {
  for (let i2 = 0; i2 < 2; i2++) {
    pieceMap[rotateLeft(edge, i2)] = {piece: idx, orientation: i2};
  }
});
reidCornerOrder.forEach((corner, idx) => {
  for (let i2 = 0; i2 < 3; i2++) {
    pieceMap[rotateLeft(corner, i2)] = {piece: idx, orientation: i2};
  }
});
const gan356iCornerMappings = [
  [0, 21, 15],
  [5, 13, 47],
  [7, 45, 39],
  [2, 37, 23],
  [29, 10, 16],
  [31, 18, 32],
  [26, 34, 40],
  [24, 42, 8]
];
const gan356iEdgeMappings = [
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
const faceOrder = "URFDLB";
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
  for (let i2 = 0; i2 < systemID.length; i2++) {
    key[i2] = (key[i2] + systemID[i2]) % 256;
  }
  return importKey(key);
}
class GanCube extends BluetoothPuzzle {
  constructor(service, server, physicalStateCharacteristic, lastMoveCounter, aesKey) {
    super();
    this.service = service;
    this.server = server;
    this.physicalStateCharacteristic = physicalStateCharacteristic;
    this.lastMoveCounter = lastMoveCounter;
    this.aesKey = aesKey;
    this.INTERVAL_MS = DEFAULT_INTERVAL_MS;
    this.intervalHandle = null;
    this.kpuzzle = new KPuzzle(Puzzles["3x3x3"]);
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
    const cube2 = new GanCube(ganCubeService, server, physicalStateCharacteristic, initialMoveCounter, aesKey);
    return cube2;
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
      this.kpuzzle.applyBlockMove(move);
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
    for (let i2 = 0; i2 < 18; i2 += 3) {
      let v = ((arr[i2 ^ 1] << 8) + arr[i2 + 1 ^ 1] << 8) + arr[i2 + 2 ^ 1];
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
      const pieceInfo = pieceMap[cornerMapping.map((i2) => faceOrder[stickers[i2]]).join("")];
      state.CORNERS.permutation.push(pieceInfo.piece);
      state.CORNERS.orientation.push(pieceInfo.orientation);
    }
    for (const edgeMapping of gan356iEdgeMappings) {
      const pieceInfo = pieceMap[edgeMapping.map((i2) => faceOrder[stickers[i2]]).join("")];
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
}

// src/cubing/bluetooth/giiker.ts
const MESSAGE_LENGTH = 20;
const UUIDs2 = {
  cubeService: "0000aadb-0000-1000-8000-00805f9b34fb",
  cubeCharacteristic: "0000aadc-0000-1000-8000-00805f9b34fb"
};
const giiKERConfig = {
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
function giikerMoveToBlockMove(face2, amount) {
  switch (amount) {
    case 3:
      amount = -1;
      break;
    case 9:
      debugLog("Encountered 9", face2, amount);
      amount = -2;
      break;
  }
  const family = ["?", "B", "D", "L", "U", "R", "F"][face2];
  return BareBlockMove(family, amount);
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
const Reid333SolvedCenters = {
  permutation: [0, 1, 2, 3, 4, 5],
  orientation: [0, 0, 0, 0, 0, 0]
};
const epGiiKERtoReid333 = [4, 8, 0, 9, 5, 1, 3, 7, 6, 10, 2, 11];
const epReid333toGiiKER = [2, 5, 10, 6, 0, 4, 8, 7, 1, 3, 9, 11];
const preEO = [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0];
const postEO = [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0];
const cpGiiKERtoReid333 = [4, 0, 3, 5, 7, 1, 2, 6];
const cpReid333toGiiKER = [1, 5, 6, 2, 0, 3, 7, 4];
const preCO = [1, 2, 1, 2, 2, 1, 2, 1];
const postCO = [2, 1, 2, 1, 1, 2, 1, 2];
const coFlip = [-1, 1, -1, 1, 1, -1, 1, -1];
function getNibble(val, i2) {
  if (i2 % 2 === 1) {
    return val[i2 / 2 | 0] % 16;
  }
  return 0 | val[i2 / 2 | 0] / 16;
}
function probablyEncrypted(data) {
  return data[18] === 167;
}
const lookup = [
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
  for (let i2 = 0; i2 < MESSAGE_LENGTH; i2++) {
    output[i2] = data[i2] + lookup[offset1 + i2] + lookup[offset2 + i2];
  }
  return output;
}
async function decodeState(data) {
  if (!probablyEncrypted(data)) {
    return data;
  }
  return await decryptState2(data);
}
class GiiKERCube extends BluetoothPuzzle {
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
    const cube2 = new GiiKERCube(server, cubeCharacteristic, originalValue);
    await cubeCharacteristic.startNotifications();
    cubeCharacteristic.addEventListener("characteristicvaluechanged", cube2.onCubeCharacteristicChanged.bind(cube2));
    return cube2;
  }
  name() {
    return this.server.device.name;
  }
  async getState() {
    return this.toReid333(new Uint8Array((await this.cubeCharacteristic.readValue()).buffer));
  }
  getBit(val, i2) {
    const n = i2 / 8 | 0;
    const shift = 7 - i2 % 8;
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
    for (let i2 = 0; i2 < 12; i2++) {
      const gi = epReid333toGiiKER[i2];
      state.EDGES.permutation[i2] = epGiiKERtoReid333[getNibble(val, gi + 16) - 1];
      state.EDGES.orientation[i2] = this.getBit(val, gi + 112) ^ preEO[state.EDGES.permutation[i2]] ^ postEO[i2];
    }
    for (let i2 = 0; i2 < 8; i2++) {
      const gi = cpReid333toGiiKER[i2];
      state.CORNERS.permutation[i2] = cpGiiKERtoReid333[getNibble(val, gi) - 1];
      state.CORNERS.orientation[i2] = (getNibble(val, gi + 8) * coFlip[gi] + preCO[state.CORNERS.permutation[i2]] + postCO[i2]) % 3;
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
    for (let i2 = 0; i2 < MESSAGE_LENGTH; i2++) {
      giikerState.push(Math.floor(val[i2] / 16));
      giikerState.push(val[i2] % 16);
    }
    debugLog(giikerState);
    const str = giikerStateStr(giikerState);
    debugLog(str);
    this.dispatchMove({
      latestMove: giikerMoveToBlockMove(giikerState[32], giikerState[33]),
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
    for (let i2 = 0; i2 < MESSAGE_LENGTH - 2; i2++) {
      if (originalValue[i2] !== val[i2]) {
        debugLog("Different at index ", i2);
        return false;
      }
    }
    return true;
  }
}

// src/cubing/bluetooth/gocube.ts
const three3 = __toModule(require("three"));
const UUIDs3 = {
  goCubeService: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  goCubeStateCharacteristic: "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
};
const goCubeConfig = {
  filters: [{namePrefix: "GoCube"}, {namePrefix: "Rubik"}],
  optionalServices: [UUIDs3.goCubeService]
};
function buf2hex2(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
function bufferToString(buffer) {
  const byteView = new Uint8Array(buffer);
  let str = "";
  for (const charCode of byteView) {
    str += String.fromCharCode(charCode);
  }
  return str;
}
const moveMap = [
  BareBlockMove("B", 1),
  BareBlockMove("B", -1),
  BareBlockMove("F", 1),
  BareBlockMove("F", -1),
  BareBlockMove("U", 1),
  BareBlockMove("U", -1),
  BareBlockMove("D", 1),
  BareBlockMove("D", -1),
  BareBlockMove("R", 1),
  BareBlockMove("R", -1),
  BareBlockMove("L", 1),
  BareBlockMove("L", -1)
];
class GoCube extends BluetoothPuzzle {
  constructor(server, goCubeStateCharacteristic) {
    super();
    this.server = server;
    this.goCubeStateCharacteristic = goCubeStateCharacteristic;
    this.recorded = [];
    this.homeQuatInverse = null;
    this.lastRawQuat = new three3.Quaternion(0, 0, 0, 1);
    this.currentQuat = new three3.Quaternion(0, 0, 0, 1);
    this.lastTarget = new three3.Quaternion(0, 0, 0, 1);
    this.alg = new Sequence([]);
  }
  static async connect(server) {
    const service = await server.getPrimaryService(UUIDs3.goCubeService);
    debugLog({service});
    const goCubeStateCharacteristic = await service.getCharacteristic(UUIDs3.goCubeStateCharacteristic);
    debugLog({goCubeStateCharacteristic});
    const cube2 = new GoCube(server, goCubeStateCharacteristic);
    await goCubeStateCharacteristic.startNotifications();
    goCubeStateCharacteristic.addEventListener("characteristicvaluechanged", cube2.onCubeCharacteristicChanged.bind(cube2));
    return cube2;
  }
  reset() {
    this.resetAlg();
    this.resetOrientation();
  }
  resetAlg(algo) {
    this.alg = algo || new Sequence([]);
  }
  resetOrientation() {
    this.homeQuatInverse = this.lastRawQuat.clone().inverse();
    this.currentQuat = new three3.Quaternion(0, 0, 0, 1);
    this.lastTarget = new three3.Quaternion(0, 0, 0, 1);
  }
  name() {
    return this.server.device.name;
  }
  onCubeCharacteristicChanged(event) {
    const buffer = event.target.value;
    this.recorded.push([event.timeStamp, buf2hex2(buffer.buffer)]);
    if (buffer.byteLength === 8) {
      const move = moveMap[buffer.getUint8(3)];
      this.alg = new Sequence(this.alg.nestedUnits.concat([move]));
      this.dispatchMove({
        latestMove: moveMap[buffer.getUint8(3)],
        timeStamp: event.timeStamp,
        debug: {
          stateStr: buf2hex2(buffer.buffer)
        }
      });
    } else {
      const coords = bufferToString(buffer.buffer.slice(3, buffer.byteLength - 3)).split("#").map((s) => parseInt(s, 10) / 16384);
      const quat = new three3.Quaternion(coords[0], coords[1], coords[2], coords[3]);
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
}
const rotateTowardsRate = 0.5;

// src/cubing/bluetooth/connect.ts
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
let consecutiveFailures = 0;
const MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK = 2;
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
  const name6 = server.device?.name || "";
  if (name6 && name6.startsWith("GAN")) {
    return await GanCube.connect(server);
  } else if (name6 && name6.startsWith("GoCube") || name6.startsWith("Rubik")) {
    return await GoCube.connect(server);
  } else {
    return await GiiKERCube.connect(server);
  }
}

// src/cubing/bluetooth/keyboard.ts
const def = Puzzles["3x3x3"];
class KeyboardPuzzle extends BluetoothPuzzle {
  constructor(target) {
    super();
    this.puzzle = new KPuzzle(def);
    target.addEventListener("keydown", this.onKeyDown.bind(this));
  }
  name() {
    return "Keyboard Input";
  }
  async getState() {
    return this.puzzle.state;
  }
  onKeyDown(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }
    const move = keyToMove(e);
    if (move) {
      this.puzzle.applyBlockMove(move);
      this.dispatchMove({
        latestMove: move,
        timeStamp: e.timeStamp,
        state: this.puzzle.state
      });
      e.preventDefault();
    }
  }
}
async function debugKeyboardConnect(target = window) {
  return new KeyboardPuzzle(target);
}

// src/cubing/protocol/index.ts
const protocol_exports = {};
__export(protocol_exports, {
  bufferToSpacedHex: () => bufferToSpacedHex,
  reid3x3x3ToTwizzleBinary: () => reid3x3x3ToTwizzleBinary,
  spacedHexToBuffer: () => spacedHexToBuffer,
  twizzleBinaryToReid3x3x3: () => twizzleBinaryToReid3x3x3
});

// src/cubing/protocol/binary/orbit-indexing.ts
function identityPermutation(numElems) {
  const arr = new Array(numElems);
  for (let i2 = 0; i2 < numElems; i2++) {
    arr[i2] = i2;
  }
  return arr;
}
function orientationsToMask(radix, orientations) {
  let val = 0;
  for (const orientation of orientations) {
    val *= radix;
    val += orientation;
  }
  return val;
}
function maskToOrientations(radix, numElems, mask) {
  const arr = [];
  while (mask > 0) {
    arr.push(mask % radix);
    mask = Math.floor(mask / radix);
  }
  return new Array(numElems - arr.length).fill(0).concat(arr.reverse());
}
function permutationToLex(permutation) {
  const n = permutation.length;
  let lexicographicIdx = 0;
  for (let i2 = 0; i2 < n - 1; i2++) {
    lexicographicIdx = lexicographicIdx * (n - i2);
    for (let j = i2 + 1; j < n; j++) {
      if (permutation[i2] > permutation[j]) {
        lexicographicIdx += 1;
      }
    }
  }
  return lexicographicIdx;
}
function lexToPermutation(numPieces, lexicographicIdx) {
  const permutation = new Array(numPieces);
  permutation[numPieces - 1] = 0;
  for (let i2 = numPieces - 2; i2 >= 0; i2--) {
    permutation[i2] = lexicographicIdx % (numPieces - i2);
    lexicographicIdx = Math.floor(lexicographicIdx / (numPieces - i2));
    for (let j = i2 + 1; j < numPieces; j++) {
      if (permutation[j] >= permutation[i2]) {
        permutation[j] = permutation[j] + 1;
      }
    }
  }
  return permutation;
}

// src/cubing/protocol/binary/binary3x3x3.ts
const BIT_LENGTHS = [29, 12, 16, 13, 3, 2, 1, 12];
function arraySum(arr) {
  let total = 0;
  for (const entry of arr) {
    total += entry;
  }
  return total;
}
function splitBinary(bitLengths, buffy) {
  const u8buffy = new Uint8Array(buffy);
  let at = 0;
  let bits = 0;
  let accum = 0;
  const values = [];
  for (const bitLength of bitLengths) {
    while (bits < bitLength) {
      accum = accum << 8 | u8buffy[at++];
      bits += 8;
    }
    values.push(accum >> bits - bitLength & (1 << bitLength) - 1);
    bits -= bitLength;
  }
  return values;
}
function concatBinary(bitLengths, values) {
  const buffy = new Uint8Array(Math.ceil(arraySum(bitLengths) / 8));
  let at = 0;
  let bits = 0;
  let accum = 0;
  for (let i2 = 0; i2 < bitLengths.length; i2++) {
    accum = accum << bitLengths[i2] | values[i2];
    bits += bitLengths[i2];
    while (bits >= 8) {
      buffy[at++] = accum >> bits - 8;
      bits -= 8;
    }
  }
  if (bits > 0) {
    buffy[at++] = accum << 8 - bits;
  }
  return buffy;
}
function puzzleOrientationIdx(state) {
  const idxU = state["CENTERS"].permutation[0];
  const idxD = state["CENTERS"].permutation[5];
  const unadjustedIdxL = state["CENTERS"].permutation[1];
  let idxL = unadjustedIdxL;
  if (idxU < unadjustedIdxL) {
    idxL--;
  }
  if (idxD < unadjustedIdxL) {
    idxL--;
  }
  return [idxU, idxL];
}
const puzzleOrientationCache = new Array(6).fill(0).map(() => {
  return new Array(6);
});
{
  const orientationKpuzzle = new KPuzzle(Puzzles["3x3x3"]);
  const uAlgs = ["", "z", "x", "z'", "x'", "x2"].map((s) => parse2(s));
  const yAlg = parse2("y");
  for (const uAlg of uAlgs) {
    orientationKpuzzle.reset();
    orientationKpuzzle.applyAlg(uAlg);
    for (let i2 = 0; i2 < 4; i2++) {
      orientationKpuzzle.applyAlg(yAlg);
      const [idxU, idxL] = puzzleOrientationIdx(orientationKpuzzle.state);
      puzzleOrientationCache[idxU][idxL] = Invert2(Puzzles["3x3x3"], orientationKpuzzle.state);
    }
  }
}
function normalizePuzzleOrientation(s) {
  const [idxU, idxL] = puzzleOrientationIdx(s);
  const orientationTransformation = puzzleOrientationCache[idxU][idxL];
  return Combine(Puzzles["3x3x3"], s, orientationTransformation);
}
function reorientPuzzle(s, idxU, idxL) {
  const orientationTransformation = Invert2(Puzzles["3x3x3"], puzzleOrientationCache[idxU][idxL]);
  return Combine(Puzzles["3x3x3"], s, orientationTransformation);
}
function supportsPuzzleOrientation(components) {
  return components.poIdxU !== 7;
}
function reid3x3x3ToBinaryComponents(state) {
  const normedState = normalizePuzzleOrientation(state);
  const epLex = permutationToLex(normedState["EDGES"].permutation);
  const eoMask = orientationsToMask(2, normedState["EDGES"].orientation);
  const cpLex = permutationToLex(normedState["CORNERS"].permutation);
  const coMask = orientationsToMask(3, normedState["CORNERS"].orientation);
  const [poIdxU, poIdxL] = puzzleOrientationIdx(state);
  const moSupport = 1;
  const moMask = orientationsToMask(4, normedState["CENTERS"].orientation);
  return {
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask
  };
}
function binaryComponentsToTwizzleBinary(components) {
  const {
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask
  } = components;
  return concatBinary(BIT_LENGTHS, [
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask
  ]);
}
function reid3x3x3ToTwizzleBinary(state) {
  const components = reid3x3x3ToBinaryComponents(state);
  return binaryComponentsToTwizzleBinary(components);
}
function twizzleBinaryToBinaryComponents(buffer) {
  const [
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask
  ] = splitBinary(BIT_LENGTHS, buffer);
  return {
    epLex,
    eoMask,
    cpLex,
    coMask,
    poIdxU,
    poIdxL,
    moSupport,
    moMask
  };
}
function binaryComponentsToReid3x3x3(components) {
  if (components.moSupport !== 1) {
    throw new Error("Must support center orientation.");
  }
  const normedState = {
    EDGES: {
      permutation: lexToPermutation(12, components.epLex),
      orientation: maskToOrientations(2, 12, components.eoMask)
    },
    CORNERS: {
      permutation: lexToPermutation(8, components.cpLex),
      orientation: maskToOrientations(3, 8, components.coMask)
    },
    CENTERS: {
      permutation: identityPermutation(6),
      orientation: maskToOrientations(4, 6, components.moMask)
    }
  };
  if (!supportsPuzzleOrientation(components)) {
    return normedState;
  }
  return reorientPuzzle(normedState, components.poIdxU, components.poIdxL);
}
function validateComponents(components) {
  const errors = [];
  if (components.epLex < 0 || components.epLex >= 479001600) {
    errors.push(`epLex (${components.epLex}) out of range`);
  }
  if (components.cpLex < 0 || components.cpLex >= 40320) {
    errors.push(`cpLex (${components.cpLex}) out of range`);
  }
  if (components.coMask < 0 || components.coMask >= 6561) {
    errors.push(`coMask (${components.coMask}) out of range`);
  }
  if (components.poIdxU < 0 || components.poIdxU >= 6) {
    if (supportsPuzzleOrientation(components)) {
      errors.push(`poIdxU (${components.poIdxU}) out of range`);
    }
  }
  if (components.eoMask < 0 || components.eoMask >= 4096) {
    errors.push(`eoMask (${components.eoMask}) out of range`);
  }
  if (components.moMask < 0 || components.moMask >= 4096) {
    errors.push(`moMask (${components.moMask}) out of range`);
  }
  if (components.poIdxL < 0 || components.poIdxL >= 4) {
    errors.push(`poIdxL (${components.poIdxL}) out of range`);
  }
  if (components.moSupport < 0 || components.moSupport >= 2) {
    errors.push(`moSupport (${components.moSupport}) out of range`);
  }
  return errors;
}
function twizzleBinaryToReid3x3x3(buffy) {
  const components = twizzleBinaryToBinaryComponents(buffy);
  const errors = validateComponents(components);
  if (errors.length !== 0) {
    throw new Error(`Invalid binary state components: ${errors.join(", ")}`);
  }
  return binaryComponentsToReid3x3x3(components);
}

// src/cubing/protocol/binary/hex.ts
function bufferToSpacedHex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join(" ");
}
function spacedHexToBuffer(hex2) {
  return new Uint8Array(hex2.split(" ").map((c) => parseInt(c, 16)));
}

// src/cubing/puzzle-geometry/index.ts
const puzzle_geometry_exports = {};
__export(puzzle_geometry_exports, {
  Orbit: () => Orbit,
  OrbitDef: () => OrbitDef,
  OrbitsDef: () => OrbitsDef,
  Perm: () => Perm,
  PuzzleGeometry: () => PuzzleGeometry,
  Quat: () => Quat,
  Transformation: () => Transformation3,
  VisibleState: () => VisibleState,
  getPuzzleGeometryByDesc: () => getPuzzleGeometryByDesc,
  getPuzzleGeometryByName: () => getPuzzleGeometryByName,
  getpuzzle: () => getpuzzle,
  getpuzzles: () => getpuzzles,
  parsedesc: () => parsedesc,
  schreierSims: () => schreierSims,
  useNewFaceNames: () => useNewFaceNames
});

// src/cubing/puzzle-geometry/Perm.ts
const zeroCache = [];
const iotaCache = [];
function zeros2(n) {
  if (!zeroCache[n]) {
    const c = Array(n);
    for (let i2 = 0; i2 < n; i2++) {
      c[i2] = 0;
    }
    zeroCache[n] = c;
  }
  return zeroCache[n];
}
function iota(n) {
  if (!iotaCache[n]) {
    const c = Array(n);
    for (let i2 = 0; i2 < n; i2++) {
      c[i2] = i2;
    }
    iotaCache[n] = c;
  }
  return iotaCache[n];
}
function identity(n) {
  return new Perm(iota(n));
}
function factorial(a) {
  let r3 = 1;
  while (a > 1) {
    r3 *= a;
    a--;
  }
  return r3;
}
function gcd2(a, b) {
  if (a > b) {
    const t2 = a;
    a = b;
    b = t2;
  }
  while (a > 0) {
    const m2 = b % a;
    b = a;
    a = m2;
  }
  return b;
}
function lcm(a, b) {
  return a / gcd2(a, b) * b;
}
class Perm {
  constructor(a) {
    this.n = a.length;
    this.p = a;
  }
  toString() {
    return "Perm[" + this.p.join(" ") + "]";
  }
  mul(p2) {
    const c = Array(this.n);
    for (let i2 = 0; i2 < this.n; i2++) {
      c[i2] = p2.p[this.p[i2]];
    }
    return new Perm(c);
  }
  rmul(p2) {
    const c = Array(this.n);
    for (let i2 = 0; i2 < this.n; i2++) {
      c[i2] = this.p[p2.p[i2]];
    }
    return new Perm(c);
  }
  inv() {
    const c = Array(this.n);
    for (let i2 = 0; i2 < this.n; i2++) {
      c[this.p[i2]] = i2;
    }
    return new Perm(c);
  }
  compareTo(p2) {
    for (let i2 = 0; i2 < this.n; i2++) {
      if (this.p[i2] !== p2.p[i2]) {
        return this.p[i2] - p2.p[i2];
      }
    }
    return 0;
  }
  toGap() {
    const cyc = new Array();
    const seen = new Array(this.n);
    for (let i2 = 0; i2 < this.p.length; i2++) {
      if (seen[i2] || this.p[i2] === i2) {
        continue;
      }
      const incyc = new Array();
      for (let j = i2; !seen[j]; j = this.p[j]) {
        incyc.push(1 + j);
        seen[j] = true;
      }
      cyc.push("(" + incyc.join(",") + ")");
    }
    return cyc.join("");
  }
  order() {
    let r3 = 1;
    const seen = new Array(this.n);
    for (let i2 = 0; i2 < this.p.length; i2++) {
      if (seen[i2] || this.p[i2] === i2) {
        continue;
      }
      let cs = 0;
      for (let j = i2; !seen[j]; j = this.p[j]) {
        cs++;
        seen[j] = true;
      }
      r3 = lcm(r3, cs);
    }
    return r3;
  }
}

// src/cubing/puzzle-geometry/PermOriSet.ts
class OrbitDef {
  constructor(size, mod) {
    this.size = size;
    this.mod = mod;
  }
  reassemblySize() {
    return factorial(this.size) * Math.pow(this.mod, this.size);
  }
}
class OrbitsDef {
  constructor(orbitnames, orbitdefs, solved, movenames, moveops) {
    this.orbitnames = orbitnames;
    this.orbitdefs = orbitdefs;
    this.solved = solved;
    this.movenames = movenames;
    this.moveops = moveops;
  }
  transformToKPuzzle(t2) {
    const mp = {};
    for (let j = 0; j < this.orbitnames.length; j++) {
      mp[this.orbitnames[j]] = t2.orbits[j].toKpuzzle();
    }
    return mp;
  }
  toKsolve(name6, forTwisty) {
    const result = [];
    result.push("Name " + name6);
    result.push("");
    for (let i2 = 0; i2 < this.orbitnames.length; i2++) {
      result.push("Set " + this.orbitnames[i2] + " " + this.orbitdefs[i2].size + " " + this.orbitdefs[i2].mod);
    }
    result.push("");
    result.push("Solved");
    for (let i2 = 0; i2 < this.orbitnames.length; i2++) {
      result.push(this.orbitnames[i2]);
      const o2 = this.solved.orbits[i2].toKsolveVS();
      result.push(o2[0]);
      result.push(o2[1]);
    }
    result.push("End");
    result.push("");
    for (let i2 = 0; i2 < this.movenames.length; i2++) {
      result.push("Move " + this.movenames[i2]);
      for (let j = 0; j < this.orbitnames.length; j++) {
        if (!forTwisty && this.moveops[i2].orbits[j].isIdentity()) {
          continue;
        }
        result.push(this.orbitnames[j]);
        const o2 = this.moveops[i2].orbits[j].toKsolve();
        result.push(o2[0]);
        result.push(o2[1]);
      }
      result.push("End");
      result.push("");
    }
    return result;
  }
  toKpuzzle() {
    const orbits6 = {};
    const start = {};
    for (let i2 = 0; i2 < this.orbitnames.length; i2++) {
      orbits6[this.orbitnames[i2]] = {
        numPieces: this.orbitdefs[i2].size,
        orientations: this.orbitdefs[i2].mod
      };
      start[this.orbitnames[i2]] = this.solved.orbits[i2].toKpuzzle();
    }
    const moves6 = {};
    for (let i2 = 0; i2 < this.movenames.length; i2++) {
      moves6[this.movenames[i2]] = this.transformToKPuzzle(this.moveops[i2]);
    }
    return {name: "PG3D", orbits: orbits6, startPieces: start, moves: moves6};
  }
  optimize() {
    const neworbitnames = [];
    const neworbitdefs = [];
    const newsolved = [];
    const newmoveops = [];
    for (let j = 0; j < this.moveops.length; j++) {
      newmoveops.push([]);
    }
    for (let i2 = 0; i2 < this.orbitdefs.length; i2++) {
      const om = this.orbitdefs[i2].mod;
      const n = this.orbitdefs[i2].size;
      const du = new DisjointUnion(n);
      const changed = new Array(this.orbitdefs[i2].size);
      for (let k = 0; k < n; k++) {
        changed[k] = false;
      }
      for (let j = 0; j < this.moveops.length; j++) {
        for (let k = 0; k < n; k++) {
          if (this.moveops[j].orbits[i2].perm[k] !== k || this.moveops[j].orbits[i2].ori[k] !== 0) {
            changed[k] = true;
            du.union(k, this.moveops[j].orbits[i2].perm[k]);
          }
        }
      }
      let keepori = true;
      if (om > 1) {
        keepori = false;
        const duo = new DisjointUnion(this.orbitdefs[i2].size * om);
        for (let j = 0; j < this.moveops.length; j++) {
          for (let k = 0; k < n; k++) {
            if (this.moveops[j].orbits[i2].perm[k] !== k || this.moveops[j].orbits[i2].ori[k] !== 0) {
              for (let o2 = 0; o2 < om; o2++) {
                duo.union(k * om + o2, this.moveops[j].orbits[i2].perm[k] * om + (o2 + this.moveops[j].orbits[i2].ori[k]) % om);
              }
            }
          }
        }
        for (let j = 0; !keepori && j < n; j++) {
          for (let o2 = 1; o2 < om; o2++) {
            if (duo.find(j * om) === duo.find(j * om + o2)) {
              keepori = true;
            }
          }
        }
        for (let j = 0; !keepori && j < n; j++) {
          for (let k = 0; k < j; k++) {
            if (this.solved.orbits[i2].perm[j] === this.solved.orbits[i2].perm[k]) {
              keepori = true;
            }
          }
        }
      }
      let nontriv = -1;
      let multiple = false;
      for (let j = 0; j < this.orbitdefs[i2].size; j++) {
        if (changed[j]) {
          const h = du.find(j);
          if (nontriv < 0) {
            nontriv = h;
          } else if (nontriv !== h) {
            multiple = true;
          }
        }
      }
      for (let j = 0; j < this.orbitdefs[i2].size; j++) {
        if (!changed[j]) {
          continue;
        }
        const h = du.find(j);
        if (h !== j) {
          continue;
        }
        const no = [];
        const on = [];
        let nv = 0;
        for (let k = 0; k < this.orbitdefs[i2].size; k++) {
          if (du.find(k) === j) {
            no[nv] = k;
            on[k] = nv;
            nv++;
          }
        }
        if (multiple) {
          neworbitnames.push(this.orbitnames[i2] + "_p" + j);
        } else {
          neworbitnames.push(this.orbitnames[i2]);
        }
        if (keepori) {
          neworbitdefs.push(new OrbitDef(nv, this.orbitdefs[i2].mod));
          newsolved.push(this.solved.orbits[i2].remapVS(no, nv));
          for (let k = 0; k < this.moveops.length; k++) {
            newmoveops[k].push(this.moveops[k].orbits[i2].remap(no, on, nv));
          }
        } else {
          neworbitdefs.push(new OrbitDef(nv, 1));
          newsolved.push(this.solved.orbits[i2].remapVS(no, nv).killOri());
          for (let k = 0; k < this.moveops.length; k++) {
            newmoveops[k].push(this.moveops[k].orbits[i2].remap(no, on, nv).killOri());
          }
        }
      }
    }
    return new OrbitsDef(neworbitnames, neworbitdefs, new VisibleState(newsolved), this.movenames, newmoveops.map((_) => new Transformation3(_)));
  }
  scramble(n) {
    const pool = [];
    for (let i2 = 0; i2 < this.moveops.length; i2++) {
      pool[i2] = this.moveops[i2];
    }
    for (let i2 = 0; i2 < pool.length; i2++) {
      const j = Math.floor(Math.random() * pool.length);
      const t2 = pool[i2];
      pool[i2] = pool[j];
      pool[j] = t2;
    }
    if (n < pool.length) {
      n = pool.length;
    }
    for (let i2 = 0; i2 < n; i2++) {
      const ri = Math.floor(Math.random() * pool.length);
      const rj = Math.floor(Math.random() * pool.length);
      const rm = Math.floor(Math.random() * this.moveops.length);
      pool[ri] = pool[ri].mul(pool[rj]).mul(this.moveops[rm]);
      if (Math.random() < 0.1) {
        pool[ri] = pool[ri].mul(this.moveops[rm]);
      }
    }
    let s = pool[0];
    for (let i2 = 1; i2 < pool.length; i2++) {
      s = s.mul(pool[i2]);
    }
    this.solved = this.solved.mul(s);
  }
  reassemblySize() {
    let n = 1;
    for (let i2 = 0; i2 < this.orbitdefs.length; i2++) {
      n *= this.orbitdefs[i2].reassemblySize();
    }
    return n;
  }
}
class Orbit {
  constructor(perm, ori, orimod) {
    this.perm = perm;
    this.ori = ori;
    this.orimod = orimod;
  }
  static e(n, mod) {
    return new Orbit(iota(n), zeros2(n), mod);
  }
  mul(b) {
    const n = this.perm.length;
    const newPerm = new Array(n);
    if (this.orimod === 1) {
      for (let i2 = 0; i2 < n; i2++) {
        newPerm[i2] = this.perm[b.perm[i2]];
      }
      return new Orbit(newPerm, this.ori, this.orimod);
    } else {
      const newOri = new Array(n);
      for (let i2 = 0; i2 < n; i2++) {
        newPerm[i2] = this.perm[b.perm[i2]];
        newOri[i2] = (this.ori[b.perm[i2]] + b.ori[i2]) % this.orimod;
      }
      return new Orbit(newPerm, newOri, this.orimod);
    }
  }
  inv() {
    const n = this.perm.length;
    const newPerm = new Array(n);
    const newOri = new Array(n);
    for (let i2 = 0; i2 < n; i2++) {
      newPerm[this.perm[i2]] = i2;
      newOri[this.perm[i2]] = (this.orimod - this.ori[i2]) % this.orimod;
    }
    return new Orbit(newPerm, newOri, this.orimod);
  }
  equal(b) {
    const n = this.perm.length;
    for (let i2 = 0; i2 < n; i2++) {
      if (this.perm[i2] !== b.perm[i2] || this.ori[i2] !== b.ori[i2]) {
        return false;
      }
    }
    return true;
  }
  killOri() {
    const n = this.perm.length;
    for (let i2 = 0; i2 < n; i2++) {
      this.ori[i2] = 0;
    }
    this.orimod = 1;
    return this;
  }
  toPerm() {
    const o2 = this.orimod;
    if (o2 === 1) {
      return new Perm(this.perm);
    }
    const n = this.perm.length;
    const newPerm = new Array(n * o2);
    for (let i2 = 0; i2 < n; i2++) {
      for (let j = 0; j < o2; j++) {
        newPerm[i2 * o2 + j] = o2 * this.perm[i2] + (this.ori[i2] + j) % o2;
      }
    }
    return new Perm(newPerm);
  }
  identicalPieces() {
    const done = [];
    const n = this.perm.length;
    const r3 = [];
    for (let i2 = 0; i2 < n; i2++) {
      const v = this.perm[i2];
      if (done[v] === void 0) {
        const s = [i2];
        done[v] = true;
        for (let j = i2 + 1; j < n; j++) {
          if (this.perm[j] === v) {
            s.push(j);
          }
        }
        r3.push(s);
      }
    }
    return r3;
  }
  order() {
    return this.toPerm().order();
  }
  isIdentity() {
    const n = this.perm.length;
    if (this.perm === iota(n) && this.ori === zeros2(n)) {
      return true;
    }
    for (let i2 = 0; i2 < n; i2++) {
      if (this.perm[i2] !== i2 || this.ori[i2] !== 0) {
        return false;
      }
    }
    return true;
  }
  remap(no, on, nv) {
    const newPerm = new Array(nv);
    const newOri = new Array(nv);
    for (let i2 = 0; i2 < nv; i2++) {
      newPerm[i2] = on[this.perm[no[i2]]];
      newOri[i2] = this.ori[no[i2]];
    }
    return new Orbit(newPerm, newOri, this.orimod);
  }
  remapVS(no, nv) {
    const newPerm = new Array(nv);
    const newOri = new Array(nv);
    let nextNew = 0;
    const reassign = [];
    for (let i2 = 0; i2 < nv; i2++) {
      const ov = this.perm[no[i2]];
      if (reassign[ov] === void 0) {
        reassign[ov] = nextNew++;
      }
      newPerm[i2] = reassign[ov];
      newOri[i2] = this.ori[no[i2]];
    }
    return new Orbit(newPerm, newOri, this.orimod);
  }
  toKsolveVS() {
    return [this.perm.map((_) => _ + 1).join(" "), this.ori.join(" ")];
  }
  toKsolve() {
    const newori = new Array(this.ori.length);
    for (let i2 = 0; i2 < newori.length; i2++) {
      newori[this.perm[i2]] = this.ori[i2];
    }
    return [this.perm.map((_) => _ + 1).join(" "), newori.join(" ")];
  }
  toKpuzzle() {
    return {permutation: this.perm, orientation: this.ori};
  }
}
class TransformationBase {
  constructor(orbits6) {
    this.orbits = orbits6;
  }
  internalMul(b) {
    const newOrbits = [];
    for (let i2 = 0; i2 < this.orbits.length; i2++) {
      newOrbits.push(this.orbits[i2].mul(b.orbits[i2]));
    }
    return newOrbits;
  }
  internalInv() {
    const newOrbits = [];
    for (let i2 = 0; i2 < this.orbits.length; i2++) {
      newOrbits.push(this.orbits[i2].inv());
    }
    return newOrbits;
  }
  equal(b) {
    for (let i2 = 0; i2 < this.orbits.length; i2++) {
      if (!this.orbits[i2].equal(b.orbits[i2])) {
        return false;
      }
    }
    return true;
  }
  killOri() {
    for (let i2 = 0; i2 < this.orbits.length; i2++) {
      this.orbits[i2].killOri();
    }
    return this;
  }
  toPerm() {
    const perms = new Array();
    let n = 0;
    for (let i2 = 0; i2 < this.orbits.length; i2++) {
      const p2 = this.orbits[i2].toPerm();
      perms.push(p2);
      n += p2.n;
    }
    const newPerm = new Array(n);
    n = 0;
    for (let i2 = 0; i2 < this.orbits.length; i2++) {
      const p2 = perms[i2];
      for (let j = 0; j < p2.n; j++) {
        newPerm[n + j] = n + p2.p[j];
      }
      n += p2.n;
    }
    return new Perm(newPerm);
  }
  identicalPieces() {
    const r3 = [];
    let n = 0;
    for (let i2 = 0; i2 < this.orbits.length; i2++) {
      const o2 = this.orbits[i2].orimod;
      const s = this.orbits[i2].identicalPieces();
      for (let j = 0; j < s.length; j++) {
        r3.push(s[j].map((_) => _ * o2 + n));
      }
      n += o2 * this.orbits[i2].perm.length;
    }
    return r3;
  }
  order() {
    let r3 = 1;
    for (let i2 = 0; i2 < this.orbits.length; i2++) {
      r3 = lcm(r3, this.orbits[i2].order());
    }
    return r3;
  }
}
class Transformation3 extends TransformationBase {
  constructor(orbits6) {
    super(orbits6);
  }
  mul(b) {
    return new Transformation3(this.internalMul(b));
  }
  mulScalar(n) {
    if (n === 0) {
      return this.e();
    }
    let t2 = this;
    if (n < 0) {
      t2 = t2.inv();
      n = -n;
    }
    while ((n & 1) === 0) {
      t2 = t2.mul(t2);
      n >>= 1;
    }
    if (n === 1) {
      return t2;
    }
    let s = t2;
    let r3 = this.e();
    while (n > 0) {
      if (n & 1) {
        r3 = r3.mul(s);
      }
      if (n > 1) {
        s = s.mul(s);
      }
      n >>= 1;
    }
    return r3;
  }
  inv() {
    return new Transformation3(this.internalInv());
  }
  e() {
    return new Transformation3(this.orbits.map((_) => Orbit.e(_.perm.length, _.orimod)));
  }
}
class VisibleState extends TransformationBase {
  constructor(orbits6) {
    super(orbits6);
  }
  mul(b) {
    return new VisibleState(this.internalMul(b));
  }
}
class DisjointUnion {
  constructor(n) {
    this.n = n;
    this.heads = new Array(n);
    for (let i2 = 0; i2 < n; i2++) {
      this.heads[i2] = i2;
    }
  }
  find(v) {
    let h = this.heads[v];
    if (this.heads[h] === h) {
      return h;
    }
    h = this.find(this.heads[h]);
    this.heads[v] = h;
    return h;
  }
  union(a, b) {
    const ah = this.find(a);
    const bh = this.find(b);
    if (ah < bh) {
      this.heads[bh] = ah;
    } else if (ah > bh) {
      this.heads[ah] = bh;
    }
  }
}
function showcanon(g, disp) {
  const n = g.moveops.length;
  if (n > 30) {
    throw new Error("Canon info too big for bitmask");
  }
  const orders = [];
  const commutes = [];
  for (let i2 = 0; i2 < n; i2++) {
    const permA = g.moveops[i2];
    orders.push(permA.order());
    let bits = 0;
    for (let j = 0; j < n; j++) {
      if (j === i2) {
        continue;
      }
      const permB = g.moveops[j];
      if (permA.mul(permB).equal(permB.mul(permA))) {
        bits |= 1 << j;
      }
    }
    commutes.push(bits);
  }
  let curlev = {};
  curlev[0] = 1;
  for (let d2 = 0; d2 < 100; d2++) {
    let sum = 0;
    const nextlev = {};
    let uniq = 0;
    for (const sti in curlev) {
      const st = +sti;
      const cnt = curlev[st];
      sum += cnt;
      uniq++;
      for (let mv = 0; mv < orders.length; mv++) {
        if ((st >> mv & 1) === 0 && (st & commutes[mv] & (1 << mv) - 1) === 0) {
          const nst = st & commutes[mv] | 1 << mv;
          if (nextlev[nst] === void 0) {
            nextlev[nst] = 0;
          }
          nextlev[nst] += (orders[mv] - 1) * cnt;
        }
      }
    }
    disp("" + d2 + ": canonseq " + sum + " states " + uniq);
    curlev = nextlev;
  }
}

// src/cubing/puzzle-geometry/Quat.ts
const eps = 1e-9;
function expandfaces(rots, faces) {
  const nfaces = [];
  for (let i2 = 0; i2 < rots.length; i2++) {
    for (let k = 0; k < faces.length; k++) {
      const face2 = faces[k];
      const nface = [];
      for (let j = 0; j < face2.length; j++) {
        nface.push(face2[j].rotateplane(rots[i2]));
      }
      nfaces.push(nface);
    }
  }
  return nfaces;
}
function centermassface(face2) {
  let s = new Quat(0, 0, 0, 0);
  for (let i2 = 0; i2 < face2.length; i2++) {
    s = s.sum(face2[i2]);
  }
  return s.smul(1 / face2.length);
}
function solvethreeplanes(p1, p2, p3, planes) {
  const p4 = planes[p1].intersect3(planes[p2], planes[p3]);
  if (!p4) {
    return p4;
  }
  for (let i2 = 0; i2 < planes.length; i2++) {
    if (i2 !== p1 && i2 !== p2 && i2 !== p3) {
      const dt = planes[i2].b * p4.b + planes[i2].c * p4.c + planes[i2].d * p4.d;
      if (planes[i2].a > 0 && dt > planes[i2].a || planes[i2].a < 0 && dt < planes[i2].a) {
        return false;
      }
    }
  }
  return p4;
}
class Quat {
  constructor(a, b, c, d2) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d2;
  }
  mul(q) {
    return new Quat(this.a * q.a - this.b * q.b - this.c * q.c - this.d * q.d, this.a * q.b + this.b * q.a + this.c * q.d - this.d * q.c, this.a * q.c - this.b * q.d + this.c * q.a + this.d * q.b, this.a * q.d + this.b * q.c - this.c * q.b + this.d * q.a);
  }
  toString() {
    return "Q[" + this.a + "," + this.b + "," + this.c + "," + this.d + "]";
  }
  dist(q) {
    return Math.hypot(this.a - q.a, this.b - q.b, this.c - q.c, this.d - q.d);
  }
  len() {
    return Math.hypot(this.a, this.b, this.c, this.d);
  }
  cross(q) {
    return new Quat(0, this.c * q.d - this.d * q.c, this.d * q.b - this.b * q.d, this.b * q.c - this.c * q.b);
  }
  dot(q) {
    return this.b * q.b + this.c * q.c + this.d * q.d;
  }
  normalize() {
    const d2 = Math.sqrt(this.dot(this));
    return new Quat(this.a / d2, this.b / d2, this.c / d2, this.d / d2);
  }
  makenormal() {
    return new Quat(0, this.b, this.c, this.d).normalize();
  }
  normalizeplane() {
    const d2 = Math.hypot(this.b, this.c, this.d);
    return new Quat(this.a / d2, this.b / d2, this.c / d2, this.d / d2);
  }
  smul(m2) {
    return new Quat(this.a * m2, this.b * m2, this.c * m2, this.d * m2);
  }
  sum(q) {
    return new Quat(this.a + q.a, this.b + q.b, this.c + q.c, this.d + q.d);
  }
  sub(q) {
    return new Quat(this.a - q.a, this.b - q.b, this.c - q.c, this.d - q.d);
  }
  angle() {
    return 2 * Math.acos(this.a);
  }
  invrot() {
    return new Quat(this.a, -this.b, -this.c, -this.d);
  }
  det3x3(a00, a01, a02, a10, a11, a12, a20, a21, a22) {
    return a00 * (a11 * a22 - a12 * a21) + a01 * (a12 * a20 - a10 * a22) + a02 * (a10 * a21 - a11 * a20);
  }
  rotateplane(q) {
    const t2 = q.mul(new Quat(0, this.b, this.c, this.d)).mul(q.invrot());
    t2.a = this.a;
    return t2;
  }
  orthogonal() {
    const ab = Math.abs(this.b);
    const ac = Math.abs(this.c);
    const ad = Math.abs(this.d);
    if (ab < ac && ab < ad) {
      return this.cross(new Quat(0, 1, 0, 0)).normalize();
    } else if (ac < ab && ac < ad) {
      return this.cross(new Quat(0, 0, 1, 0)).normalize();
    } else {
      return this.cross(new Quat(0, 0, 0, 1)).normalize();
    }
  }
  pointrotation(b) {
    const a = this.normalize();
    b = b.normalize();
    if (a.sub(b).len() < eps) {
      return new Quat(1, 0, 0, 0);
    }
    let h = a.sum(b);
    if (h.len() < eps) {
      h = h.orthogonal();
    } else {
      h = h.normalize();
    }
    const r3 = a.cross(h);
    r3.a = a.dot(h);
    return r3;
  }
  unproject(b) {
    return this.sum(b.smul(-this.dot(b) / (this.len() * b.len())));
  }
  rotatepoint(q) {
    return q.mul(this).mul(q.invrot());
  }
  rotateface(face2) {
    return face2.map((_) => _.rotatepoint(this));
  }
  rotatecubie(cubie) {
    return cubie.map((_) => this.rotateface(_));
  }
  intersect3(p2, p3) {
    const det = this.det3x3(this.b, this.c, this.d, p2.b, p2.c, p2.d, p3.b, p3.c, p3.d);
    if (Math.abs(det) < eps) {
      return false;
    }
    return new Quat(0, this.det3x3(this.a, this.c, this.d, p2.a, p2.c, p2.d, p3.a, p3.c, p3.d) / det, this.det3x3(this.b, this.a, this.d, p2.b, p2.a, p2.d, p3.b, p3.a, p3.d) / det, this.det3x3(this.b, this.c, this.a, p2.b, p2.c, p2.a, p3.b, p3.c, p3.a) / det);
  }
  side(x) {
    if (x > eps) {
      return 1;
    }
    if (x < -eps) {
      return -1;
    }
    return 0;
  }
  cutfaces(faces) {
    const d2 = this.a;
    const nfaces = [];
    for (let j = 0; j < faces.length; j++) {
      const face2 = faces[j];
      const inout = face2.map((_) => this.side(_.dot(this) - d2));
      let seen = 0;
      for (let i2 = 0; i2 < inout.length; i2++) {
        seen |= 1 << inout[i2] + 1;
      }
      if ((seen & 5) === 5) {
        for (let s = -1; s <= 1; s += 2) {
          const nface = [];
          for (let k = 0; k < face2.length; k++) {
            if (inout[k] === s || inout[k] === 0) {
              nface.push(face2[k]);
            }
            const kk = (k + 1) % face2.length;
            if (inout[k] + inout[kk] === 0 && inout[k] !== 0) {
              const vk = face2[k].dot(this) - d2;
              const vkk = face2[kk].dot(this) - d2;
              const r3 = vk / (vk - vkk);
              const pt = face2[k].smul(1 - r3).sum(face2[kk].smul(r3));
              nface.push(pt);
            }
          }
          nfaces.push(nface);
        }
      } else {
        nfaces.push(face2);
      }
    }
    return nfaces;
  }
  faceside(face2) {
    const d2 = this.a;
    for (let i2 = 0; i2 < face2.length; i2++) {
      const s = this.side(face2[i2].dot(this) - d2);
      if (s !== 0) {
        return s;
      }
    }
    throw new Error("Could not determine side of plane in faceside");
  }
  sameplane(p2) {
    const a = this.normalize();
    const b = p2.normalize();
    return a.dist(b) < eps || a.dist(b.smul(-1)) < eps;
  }
  makecut(r3) {
    return new Quat(r3, this.b, this.c, this.d);
  }
}

// src/cubing/puzzle-geometry/PlatonicGenerator.ts
const eps2 = 1e-9;
function cube() {
  const s5 = Math.sqrt(0.5);
  return [new Quat(s5, s5, 0, 0), new Quat(s5, 0, s5, 0)];
}
function tetrahedron() {
  return [new Quat(0.5, 0.5, 0.5, 0.5), new Quat(0.5, 0.5, 0.5, -0.5)];
}
function dodecahedron() {
  const d36 = 2 * Math.PI / 10;
  let dx = 0.5 + 0.3 * Math.sqrt(5);
  let dy = 0.5 + 0.1 * Math.sqrt(5);
  const dd = Math.sqrt(dx * dx + dy * dy);
  dx /= dd;
  dy /= dd;
  return [
    new Quat(Math.cos(d36), dx * Math.sin(d36), dy * Math.sin(d36), 0),
    new Quat(0.5, 0.5, 0.5, 0.5)
  ];
}
function icosahedron() {
  let dx = 1 / 6 + Math.sqrt(5) / 6;
  let dy = 2 / 3 + Math.sqrt(5) / 3;
  const dd = Math.sqrt(dx * dx + dy * dy);
  dx /= dd;
  dy /= dd;
  const ang = 2 * Math.PI / 6;
  return [
    new Quat(Math.cos(ang), dx * Math.sin(ang), dy * Math.sin(ang), 0),
    new Quat(Math.cos(ang), -dx * Math.sin(ang), dy * Math.sin(ang), 0)
  ];
}
function octahedron() {
  const s5 = Math.sqrt(0.5);
  return [new Quat(0.5, 0.5, 0.5, 0.5), new Quat(s5, 0, 0, s5)];
}
function closure(g) {
  const q = [new Quat(1, 0, 0, 0)];
  for (let i2 = 0; i2 < q.length; i2++) {
    for (let j = 0; j < g.length; j++) {
      const ns = g[j].mul(q[i2]);
      const negns = ns.smul(-1);
      let wasseen = false;
      for (let k = 0; k < q.length; k++) {
        if (ns.dist(q[k]) < eps2 || negns.dist(q[k]) < eps2) {
          wasseen = true;
          break;
        }
      }
      if (!wasseen) {
        q.push(ns);
      }
    }
  }
  return q;
}
function uniqueplanes(p2, g) {
  const planes = [];
  const planerot = [];
  for (let i2 = 0; i2 < g.length; i2++) {
    const p22 = p2.rotateplane(g[i2]);
    let wasseen = false;
    for (let j = 0; j < planes.length; j++) {
      if (p22.dist(planes[j]) < eps2) {
        wasseen = true;
        break;
      }
    }
    if (!wasseen) {
      planes.push(p22);
      planerot.push(g[i2]);
    }
  }
  return planerot;
}
function getface(planes) {
  const face2 = [];
  for (let i2 = 1; i2 < planes.length; i2++) {
    for (let j = i2 + 1; j < planes.length; j++) {
      const p2 = solvethreeplanes(0, i2, j, planes);
      if (p2) {
        let wasseen = false;
        for (let k = 0; k < face2.length; k++) {
          if (p2.dist(face2[k]) < eps2) {
            wasseen = true;
            break;
          }
        }
        if (!wasseen) {
          face2.push(p2);
        }
      }
    }
  }
  for (; ; ) {
    let changed = false;
    for (let i2 = 0; i2 < face2.length; i2++) {
      const j = (i2 + 1) % face2.length;
      if (planes[0].dot(face2[i2].cross(face2[j])) < 0) {
        const t2 = face2[i2];
        face2[i2] = face2[j];
        face2[j] = t2;
        changed = true;
      }
    }
    if (!changed) {
      break;
    }
  }
  return face2;
}

// src/cubing/puzzle-geometry/Puzzles.ts
const Puzzles2 = {
  "2x2x2": "c f 0",
  "3x3x3": "c f 0.333333333333333",
  "4x4x4": "c f 0.5 f 0",
  "5x5x5": "c f 0.6 f 0.2",
  "6x6x6": "c f 0.666666666666667 f 0.333333333333333 f 0",
  "7x7x7": "c f 0.714285714285714 f 0.428571428571429 f 0.142857142857143",
  "8x8x8": "c f 0.75 f 0.5 f 0.25 f 0",
  "9x9x9": "c f 0.777777777777778 f 0.555555555555556 f 0.333333333333333 f 0.111111111111111",
  "10x10x10": "c f 0.8 f 0.6 f 0.4 f 0.2 f 0",
  "11x11x11": "c f 0.818181818181818 f 0.636363636363636 f 0.454545454545455 f 0.272727272727273 f 0.0909090909090909",
  "12x12x12": "c f 0.833333333333333 f 0.666666666666667 f 0.5 f 0.333333333333333 f 0.166666666666667 f 0",
  "13x13x13": "c f 0.846153846153846 f 0.692307692307692 f 0.538461538461538 f 0.384615384615385 f 0.230769230769231 f 0.0769230769230769",
  "20x20x20": "c f 0 f .1 f .2 f .3 f .4 f .5 f .6 f .7 f .8 f .9",
  "30x30x30": "c f 0 f .066667 f .133333 f .2 f .266667 f .333333 f .4 f .466667 f .533333 f .6 f .666667 f .733333 f .8 f .866667 f .933333",
  skewb: "c v 0",
  "master skewb": "c v 0.275",
  "professor skewb": "c v 0 v 0.38",
  "compy cube": "c v 0.915641442663986",
  helicopter: "c e 0.707106781186547",
  "curvy copter": "c e 0.83",
  dino: "c v 0.577350269189626",
  "little chop": "c e 0",
  pyramorphix: "t e 0",
  mastermorphix: "t e 0.346184634065199",
  pyraminx: "t v 0.333333333333333 v 1.66666666666667",
  "master pyraminx": "t v 0 v 1 v 2",
  "professor pyraminx": "t v -0.2 v 0.6 v 1.4 v 2.2",
  "Jing pyraminx": "t f 0",
  "master pyramorphix": "t e 0.866025403784437",
  megaminx: "d f 0.7",
  gigaminx: "d f 0.64 f 0.82",
  pentultimate: "d f 0",
  starminx: "d v 0.937962370425399",
  "starminx 2": "d f 0.23606797749979",
  "pyraminx crystal": "d f 0.447213595499989",
  chopasaurus: "d v 0",
  "big chop": "d e 0",
  "skewb diamond": "o f 0",
  FTO: "o f 0.333333333333333",
  "Christopher's jewel": "o v 0.577350269189626",
  octastar: "o e 0",
  "Trajber's octahedron": "o v 0.433012701892219",
  "radio chop": "i f 0",
  icosamate: "i v 0",
  "icosahedron 2": "i v 0.18759247376021",
  "icosahedron 3": "i v 0.18759247376021 e 0",
  "icosahedron static faces": "i v 0.84",
  "icosahedron moving faces": "i v 0.73",
  "Eitan's star": "i f 0.61803398874989",
  "2x2x2 + dino": "c f 0 v 0.577350269189626",
  "2x2x2 + little chop": "c f 0 e 0",
  "dino + little chop": "c v 0.577350269189626 e 0",
  "2x2x2 + dino + little chop": "c f 0 v 0.577350269189626 e 0",
  "megaminx + chopasaurus": "d f 0.61803398875 v 0",
  "starminx combo": "d f 0.23606797749979 v 0.937962370425399"
};

// src/cubing/puzzle-geometry/interfaces.ts
class BlockMove7 {
  constructor(outerLayer, innerLayer, family, amount = 1) {
    this.family = family;
    this.amount = amount;
    this.type = "blockMove";
    if (innerLayer) {
      this.innerLayer = innerLayer;
      if (outerLayer) {
        this.outerLayer = outerLayer;
      }
    }
    if (outerLayer && !innerLayer) {
      throw new Error("Attempted to contruct block move with outer layer but no inner layer");
    }
  }
}

// src/cubing/puzzle-geometry/NotationMapper.ts
class NullMapper {
  notationToInternal(mv) {
    return mv;
  }
  notationToExternal(mv) {
    return mv;
  }
}
class NxNxNCubeMapper {
  constructor(slices) {
    this.slices = slices;
  }
  notationToInternal(mv) {
    const grip = mv.family;
    if (!mv.innerLayer && !mv.outerLayer) {
      if (grip === "x") {
        mv = new BlockMove7(void 0, void 0, "Rv", mv.amount);
      } else if (grip === "y") {
        mv = new BlockMove7(void 0, void 0, "Uv", mv.amount);
      } else if (grip === "z") {
        mv = new BlockMove7(void 0, void 0, "Fv", mv.amount);
      }
      if ((this.slices & 1) === 1) {
        if (grip === "E") {
          mv = new BlockMove7(void 0, (this.slices + 1) / 2, "D", mv.amount);
        } else if (grip === "M") {
          mv = new BlockMove7(void 0, (this.slices + 1) / 2, "L", mv.amount);
        } else if (grip === "S") {
          mv = new BlockMove7(void 0, (this.slices + 1) / 2, "F", mv.amount);
        }
      }
      if (this.slices > 2) {
        if (grip === "e") {
          mv = new BlockMove7(2, this.slices - 1, "D", mv.amount);
        } else if (grip === "m") {
          mv = new BlockMove7(2, this.slices - 1, "L", mv.amount);
        } else if (grip === "s") {
          mv = new BlockMove7(2, this.slices - 1, "F", mv.amount);
        }
      }
    }
    return mv;
  }
  notationToExternal(mv) {
    const grip = mv.family;
    if (!mv.innerLayer && !mv.outerLayer) {
      if (grip === "Rv") {
        return new BlockMove7(void 0, void 0, "x", mv.amount);
      } else if (grip === "Uv") {
        return new BlockMove7(void 0, void 0, "y", mv.amount);
      } else if (grip === "Fv") {
        return new BlockMove7(void 0, void 0, "z", mv.amount);
      } else if (grip === "Lv") {
        return this.negate("x", mv.amount);
      } else if (grip === "Dv") {
        return this.negate("y", mv.amount);
      } else if (grip === "Bv") {
        return this.negate("z", mv.amount);
      }
    }
    return mv;
  }
  negate(family, v) {
    if (v === void 0) {
      v = -1;
    } else if (v === -1) {
      v = void 0;
    } else {
      v = -v;
    }
    return new BlockMove7(void 0, void 0, family, v);
  }
}
class FaceRenamingMapper {
  constructor(internalNames, externalNames) {
    this.internalNames = internalNames;
    this.externalNames = externalNames;
  }
  convertString(grip, a, b) {
    let suffix = "";
    if ((grip.endsWith("v") || grip.endsWith("v")) && grip <= "_") {
      suffix = grip.slice(grip.length - 1);
      grip = grip.slice(0, grip.length - 1);
    }
    const upper = grip.toUpperCase();
    let isLowerCase = false;
    if (grip !== upper) {
      isLowerCase = true;
      grip = upper;
    }
    grip = b.joinByFaceIndices(a.splitByFaceNames(grip));
    if (isLowerCase) {
      grip = grip.toLowerCase();
    }
    return grip + suffix;
  }
  convert(mv, a, b) {
    const grip = mv.family;
    const ngrip = this.convertString(grip, a, b);
    if (grip === ngrip) {
      return mv;
    } else {
      return new BlockMove7(mv.outerLayer, mv.innerLayer, ngrip, mv.amount);
    }
  }
  notationToInternal(mv) {
    const r3 = this.convert(mv, this.externalNames, this.internalNames);
    return r3;
  }
  notationToExternal(mv) {
    return this.convert(mv, this.internalNames, this.externalNames);
  }
}
class MegaminxScramblingNotationMapper {
  constructor(child) {
    this.child = child;
  }
  notationToInternal(mv) {
    if (mv.innerLayer === void 0 && mv.outerLayer === void 0 && Math.abs(mv.amount) === 1) {
      if (mv.family === "R++") {
        return new BlockMove7(2, 3, "L", -2 * mv.amount);
      } else if (mv.family === "R--") {
        return new BlockMove7(2, 3, "L", 2 * mv.amount);
      } else if (mv.family === "D++") {
        return new BlockMove7(2, 3, "U", -2 * mv.amount);
      } else if (mv.family === "D--") {
        return new BlockMove7(2, 3, "U", 2 * mv.amount);
      }
    }
    return this.child.notationToInternal(mv);
  }
  notationToExternal(mv) {
    return this.child.notationToExternal(mv);
  }
}

// src/cubing/puzzle-geometry/FaceNameSwizzler.ts
class FaceNameSwizzler {
  constructor(facenames, gripnames_arg) {
    this.facenames = facenames;
    this.prefixFree = true;
    this.gripnames = [];
    if (gripnames_arg) {
      this.gripnames = gripnames_arg;
    }
    for (let i2 = 0; this.prefixFree && i2 < facenames.length; i2++) {
      for (let j = 0; this.prefixFree && j < facenames.length; j++) {
        if (i2 !== j && facenames[i2].startsWith(facenames[j])) {
          this.prefixFree = false;
        }
      }
    }
  }
  setGripNames(names) {
    this.gripnames = names;
  }
  splitByFaceNames(s) {
    const r3 = [];
    let at = 0;
    while (at < s.length) {
      if (at > 0 && at < s.length && s[at] === "_") {
        at++;
      }
      let currentMatch = -1;
      for (let i2 = 0; i2 < this.facenames.length; i2++) {
        if (s.substr(at).startsWith(this.facenames[i2]) && (currentMatch < 0 || this.facenames[i2].length > this.facenames[currentMatch].length)) {
          currentMatch = i2;
        }
      }
      if (currentMatch >= 0) {
        r3.push(currentMatch);
        at += this.facenames[currentMatch].length;
      } else {
        throw new Error("Could not split " + s + " into face names.");
      }
    }
    return r3;
  }
  joinByFaceIndices(list) {
    let sep = "";
    const r3 = [];
    for (let i2 = 0; i2 < list.length; i2++) {
      r3.push(sep);
      r3.push(this.facenames[list[i2]]);
      if (!this.prefixFree) {
        sep = "_";
      }
    }
    return r3.join("");
  }
  spinmatch(userinput, longname) {
    if (userinput === longname) {
      return true;
    }
    try {
      const e1 = this.splitByFaceNames(userinput);
      const e2 = this.splitByFaceNames(longname);
      if (e1.length !== e2.length && e1.length < 3) {
        return false;
      }
      for (let i2 = 0; i2 < e1.length; i2++) {
        for (let j = 0; j < i2; j++) {
          if (e1[i2] === e1[j]) {
            return false;
          }
        }
        let found = false;
        for (let j = 0; j < e2.length; j++) {
          if (e1[i2] === e2[j]) {
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  unswizzle(s) {
    if ((s.endsWith("v") || s.endsWith("w")) && s[0] <= "Z") {
      s = s.slice(0, s.length - 1);
    }
    const upperCaseGrip = s.toUpperCase();
    for (let i2 = 0; i2 < this.gripnames.length; i2++) {
      const g = this.gripnames[i2];
      if (this.spinmatch(upperCaseGrip, g)) {
        return g;
      }
    }
    return s;
  }
}

// src/cubing/puzzle-geometry/PuzzleGeometry.ts
const DEFAULT_COLOR_FRACTION = 0.77;
let NEW_FACE_NAMES = true;
function useNewFaceNames(use) {
  NEW_FACE_NAMES = use;
}
const eps3 = 1e-9;
const copyright = "PuzzleGeometry 0.1 Copyright 2018 Tomas Rokicki.";
const permissivieMoveParsing = false;
function defaultnets() {
  return {
    4: [["F", "D", "L", "R"]],
    6: [
      ["F", "D", "L", "U", "R"],
      ["R", "F", "", "B", ""]
    ],
    8: [
      ["F", "D", "L", "R"],
      ["D", "F", "BR", ""],
      ["BR", "D", "", "BB"],
      ["BB", "BR", "U", "BL"]
    ],
    12: [
      ["U", "F", "", "", "", ""],
      ["F", "U", "R", "C", "A", "L"],
      ["R", "F", "", "", "E", ""],
      ["E", "R", "", "BF", "", ""],
      ["BF", "E", "BR", "BL", "I", "D"]
    ],
    20: [
      ["R", "C", "F", "E"],
      ["F", "R", "L", "U"],
      ["L", "F", "A", ""],
      ["E", "R", "G", "I"],
      ["I", "E", "S", "H"],
      ["S", "I", "J", "B"],
      ["B", "S", "K", "D"],
      ["K", "B", "M", "O"],
      ["O", "K", "P", "N"],
      ["P", "O", "Q", ""]
    ]
  };
}
function defaultcolors() {
  return {
    4: {F: "#00ff00", D: "#ffff00", L: "#ff0000", R: "#0000ff"},
    6: {
      U: "#ffffff",
      F: "#00ff00",
      R: "#ff0000",
      D: "#ffff00",
      B: "#0000ff",
      L: "#ff8000"
    },
    8: {
      U: "#ffffff",
      F: "#ff0000",
      R: "#00bb00",
      D: "#ffff00",
      BB: "#1122ff",
      L: "#9524c5",
      BL: "#ff8800",
      BR: "#aaaaaa"
    },
    12: {
      U: "#ffffff",
      F: "#006633",
      R: "#ff0000",
      C: "#ffffd0",
      A: "#3399ff",
      L: "#660099",
      E: "#ff66cc",
      BF: "#99ff00",
      BR: "#0000ff",
      BL: "#ffff00",
      I: "#ff6633",
      D: "#999999"
    },
    20: {
      R: "#db69f0",
      C: "#178fde",
      F: "#23238b",
      E: "#9cc726",
      L: "#2c212d",
      U: "#177fa7",
      A: "#e0de7f",
      G: "#2b57c0",
      I: "#41126b",
      S: "#4b8c28",
      H: "#7c098d",
      J: "#7fe7b4",
      B: "#85fb74",
      K: "#3f4bc3",
      D: "#0ff555",
      M: "#f1c2c8",
      O: "#58d340",
      P: "#c514f2",
      N: "#14494e",
      Q: "#8b1be1"
    }
  };
}
function defaultfaceorders() {
  return {
    4: ["F", "D", "L", "R"],
    6: ["U", "D", "F", "B", "L", "R"],
    8: ["F", "BB", "D", "U", "BR", "L", "R", "BL"],
    12: ["L", "E", "F", "BF", "R", "I", "U", "D", "BR", "A", "BL", "C"],
    20: [
      "L",
      "S",
      "E",
      "O",
      "F",
      "B",
      "I",
      "P",
      "R",
      "K",
      "U",
      "D",
      "J",
      "A",
      "Q",
      "H",
      "G",
      "N",
      "M",
      "C"
    ]
  };
}
function defaultOrientations() {
  return {
    4: ["FLR", [0, 1, 0], "F", [0, 0, 1]],
    6: ["U", [0, 1, 0], "F", [0, 0, 1]],
    8: ["U", [0, 1, 0], "F", [0, 0, 1]],
    12: ["U", [0, 1, 0], "F", [0, 0, 1]],
    20: ["GUQMJ", [0, 1, 0], "F", [0, 0, 1]]
  };
}
function findelement(a, p2) {
  for (let i2 = 0; i2 < a.length; i2++) {
    if (a[i2][0].dist(p2) < eps3) {
      return i2;
    }
  }
  throw new Error("Element not found");
}
function getpuzzles() {
  return Puzzles2;
}
function getpuzzle(puzzleName) {
  return Puzzles2[puzzleName];
}
function parsedesc(s) {
  const a = s.split(/ /).filter(Boolean);
  if (a.length % 2 === 0) {
    return false;
  }
  if (a[0] !== "o" && a[0] !== "c" && a[0] !== "i" && a[0] !== "d" && a[0] !== "t") {
    return false;
  }
  const r3 = [];
  for (let i2 = 1; i2 < a.length; i2 += 2) {
    if (a[i2] !== "f" && a[i2] !== "v" && a[i2] !== "e") {
      return false;
    }
    r3.push([a[i2], a[i2 + 1]]);
  }
  return [a[0], r3];
}
function getPuzzleGeometryByDesc(desc, options = []) {
  const [shape, cuts] = parsedesc(desc);
  const pg = new PuzzleGeometry(shape, cuts, ["allmoves", "true"].concat(options));
  pg.allstickers();
  pg.genperms();
  return pg;
}
function getPuzzleGeometryByName(puzzleName, options = []) {
  return getPuzzleGeometryByDesc(Puzzles2[puzzleName], options);
}
function getmovename(geo, bits, slices) {
  let nbits = 0;
  let inverted = false;
  for (let i2 = 0; i2 <= slices; i2++) {
    if (bits >> i2 & 1) {
      nbits |= 1 << slices - i2;
    }
  }
  if (nbits < bits) {
    geo = [geo[2], geo[3], geo[0], geo[1]];
    bits = nbits;
    inverted = true;
  }
  let movenameFamily = geo[0];
  let movenamePrefix = "";
  let hibit = 0;
  while (bits >> 1 + hibit) {
    hibit++;
  }
  if (bits === (2 << slices) - 1) {
    movenameFamily = movenameFamily + "v";
  } else if (bits === 1 << hibit) {
    if (hibit > 0) {
      movenamePrefix = String(hibit + 1);
    }
  } else if (bits === (2 << hibit) - 1) {
    movenameFamily = movenameFamily.toLowerCase();
    if (hibit > 1) {
      movenamePrefix = String(hibit + 1);
    }
  } else {
    movenamePrefix = "_" + bits + "_";
  }
  return [movenamePrefix + movenameFamily, inverted];
}
function splitByFaceNames(s, facenames) {
  const r3 = [];
  let at = 0;
  while (at < s.length) {
    if (at > 0 && at < s.length && s[at] === "_") {
      at++;
    }
    let currentMatch = "";
    for (let i2 = 0; i2 < facenames.length; i2++) {
      if (s.substr(at).startsWith(facenames[i2][1]) && facenames[i2][1].length > currentMatch.length) {
        currentMatch = facenames[i2][1];
      }
    }
    if (currentMatch !== "") {
      r3.push(currentMatch);
      at += currentMatch.length;
    } else {
      throw new Error("Could not split " + s + " into face names.");
    }
  }
  return r3;
}
function toCoords(q, maxdist) {
  return [q.b / maxdist, -q.c / maxdist, q.d / maxdist];
}
function toFaceCoords(q, maxdist) {
  const r3 = [];
  const n = q.length;
  for (let i2 = 0; i2 < n; i2++) {
    r3[n - i2 - 1] = toCoords(q[i2], maxdist);
  }
  return r3;
}
function trimEdges(face2, tr) {
  const r3 = [];
  for (let iter = 1; iter < 10; iter++) {
    for (let i2 = 0; i2 < face2.length; i2++) {
      const pi = (i2 + face2.length - 1) % face2.length;
      const ni = (i2 + 1) % face2.length;
      const A = face2[pi].sub(face2[i2]).normalize();
      const B = face2[ni].sub(face2[i2]).normalize();
      const d2 = A.dot(B);
      const m2 = tr / Math.sqrt(1 - d2 * d2);
      r3[i2] = face2[i2].sum(A.sum(B).smul(m2));
    }
    let good = true;
    for (let i2 = 0; good && i2 < r3.length; i2++) {
      const pi = (i2 + face2.length - 1) % face2.length;
      const ni = (i2 + 1) % face2.length;
      if (r3[pi].sub(r3[i2]).cross(r3[ni].sub(r3[i2])).dot(r3[i2]) >= 0) {
        good = false;
      }
    }
    if (good) {
      return r3;
    }
    tr /= 2;
  }
  return face2;
}
class PuzzleGeometry {
  constructor(shape, cuts, optionlist) {
    this.args = "";
    this.cmovesbyslice = [];
    this.verbose = 0;
    this.allmoves = false;
    this.cornersets = true;
    this.centersets = true;
    this.edgesets = true;
    this.graycorners = false;
    this.graycenters = false;
    this.grayedges = false;
    this.killorientation = false;
    this.optimize = false;
    this.scramble = 0;
    this.fixPiece = "";
    this.orientCenters = false;
    this.duplicatedFaces = [];
    this.duplicatedCubies = [];
    this.fixedCubie = -1;
    this.net = [];
    this.colors = [];
    this.faceorder = [];
    this.faceprecedence = [];
    this.notationMapper = new NullMapper();
    this.addNotationMapper = "";
    function asstructured(v) {
      if (typeof v === "string") {
        return JSON.parse(v);
      }
      return v;
    }
    function asboolean(v) {
      if (typeof v === "string") {
        if (v === "false") {
          return false;
        }
        return true;
      } else {
        return v ? true : false;
      }
    }
    if (optionlist !== void 0) {
      if (optionlist.length % 2 !== 0) {
        throw new Error("Odd length in option list?");
      }
      for (let i2 = 0; i2 < optionlist.length; i2 += 2) {
        if (optionlist[i2] === "verbose") {
          this.verbose++;
        } else if (optionlist[i2] === "quiet") {
          this.verbose = 0;
        } else if (optionlist[i2] === "allmoves") {
          this.allmoves = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "outerblockmoves") {
          this.outerblockmoves = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "vertexmoves") {
          this.vertexmoves = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "rotations") {
          this.addrotations = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "cornersets") {
          this.cornersets = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "centersets") {
          this.centersets = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "edgesets") {
          this.edgesets = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "graycorners") {
          this.graycorners = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "graycenters") {
          this.graycenters = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "grayedges") {
          this.grayedges = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "movelist") {
          this.movelist = asstructured(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "killorientation") {
          this.killorientation = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "optimize") {
          this.optimize = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "scramble") {
          this.scramble = optionlist[i2 + 1];
        } else if (optionlist[i2] === "fix") {
          this.fixPiece = optionlist[i2 + 1];
        } else if (optionlist[i2] === "orientcenters") {
          this.orientCenters = asboolean(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "puzzleorientation") {
          this.puzzleOrientation = asstructured(optionlist[i2 + 1]);
        } else if (optionlist[i2] === "puzzleorientations") {
          this.puzzleOrientations = asstructured(optionlist[i2 + 1]);
        } else {
          throw new Error("Bad option while processing option list " + optionlist[i2]);
        }
      }
    }
    this.args = shape + " " + cuts.map((_) => _.join(" ")).join(" ");
    if (optionlist) {
      this.args += " " + optionlist.join(" ");
    }
    if (this.verbose > 0) {
      console.log(this.header("# "));
    }
    this.create(shape, cuts);
  }
  create(shape, cuts) {
    this.moveplanes = [];
    this.moveplanes2 = [];
    this.faces = [];
    this.cubies = [];
    let g = null;
    switch (shape) {
      case "c":
        g = cube();
        break;
      case "o":
        g = octahedron();
        break;
      case "i":
        g = icosahedron();
        break;
      case "t":
        g = tetrahedron();
        break;
      case "d":
        g = dodecahedron();
        break;
      default:
        throw new Error("Bad shape argument: " + shape);
    }
    this.rotations = closure(g);
    if (this.verbose) {
      console.log("# Rotations: " + this.rotations.length);
    }
    const baseplane = g[0];
    this.baseplanerot = uniqueplanes(baseplane, this.rotations);
    const baseplanes = this.baseplanerot.map((_) => baseplane.rotateplane(_));
    this.baseplanes = baseplanes;
    this.basefacecount = baseplanes.length;
    const net = defaultnets()[baseplanes.length];
    this.net = net;
    this.colors = defaultcolors()[baseplanes.length];
    this.faceorder = defaultfaceorders()[baseplanes.length];
    if (this.verbose) {
      console.log("# Base planes: " + baseplanes.length);
    }
    const baseface = getface(baseplanes);
    const zero = new Quat(0, 0, 0, 0);
    if (this.verbose) {
      console.log("# Face vertices: " + baseface.length);
    }
    const facenormal = baseplanes[0].makenormal();
    const edgenormal = baseface[0].sum(baseface[1]).makenormal();
    const vertexnormal = baseface[0].makenormal();
    const boundary = new Quat(1, facenormal.b, facenormal.c, facenormal.d);
    if (this.verbose) {
      console.log("# Boundary is " + boundary);
    }
    const planerot = uniqueplanes(boundary, this.rotations);
    const planes = planerot.map((_) => boundary.rotateplane(_));
    let faces = [getface(planes)];
    this.edgedistance = faces[0][0].sum(faces[0][1]).smul(0.5).dist(zero);
    this.vertexdistance = faces[0][0].dist(zero);
    const cutplanes = [];
    const intersects = [];
    let sawface = false;
    let sawedge = false;
    let sawvertex = false;
    for (let i2 = 0; i2 < cuts.length; i2++) {
      let normal = null;
      let distance = 0;
      switch (cuts[i2][0]) {
        case "f":
          normal = facenormal;
          distance = 1;
          sawface = true;
          break;
        case "v":
          normal = vertexnormal;
          distance = this.vertexdistance;
          sawvertex = true;
          break;
        case "e":
          normal = edgenormal;
          distance = this.edgedistance;
          sawedge = true;
          break;
        default:
          throw new Error("Bad cut argument: " + cuts[i2][0]);
      }
      cutplanes.push(normal.makecut(cuts[i2][1]));
      intersects.push(cuts[i2][1] < distance);
    }
    if (this.addrotations) {
      if (!sawface) {
        cutplanes.push(facenormal.makecut(10));
      }
      if (!sawvertex) {
        cutplanes.push(vertexnormal.makecut(10));
      }
      if (!sawedge) {
        cutplanes.push(edgenormal.makecut(10));
      }
    }
    this.basefaces = [];
    for (let i2 = 0; i2 < this.baseplanerot.length; i2++) {
      const face2 = this.baseplanerot[i2].rotateface(faces[0]);
      this.basefaces.push(face2);
    }
    const facenames = [];
    const faceplanes = [];
    const vertexnames = [];
    const edgenames = [];
    const edgesperface = faces[0].length;
    function searchaddelement(a, p2, name6) {
      for (let i2 = 0; i2 < a.length; i2++) {
        if (a[i2][0].dist(p2) < eps3) {
          a[i2].push(name6);
          return;
        }
      }
      a.push([p2, name6]);
    }
    for (let i2 = 0; i2 < this.baseplanerot.length; i2++) {
      const face2 = this.baseplanerot[i2].rotateface(faces[0]);
      for (let j = 0; j < face2.length; j++) {
        const jj = (j + 1) % face2.length;
        const midpoint = face2[j].sum(face2[jj]).smul(0.5);
        searchaddelement(edgenames, midpoint, i2);
      }
    }
    const otherfaces = [];
    for (let i2 = 0; i2 < this.baseplanerot.length; i2++) {
      const face2 = this.baseplanerot[i2].rotateface(faces[0]);
      const facelist = [];
      for (let j = 0; j < face2.length; j++) {
        const jj = (j + 1) % face2.length;
        const midpoint = face2[j].sum(face2[jj]).smul(0.5);
        const el = edgenames[findelement(edgenames, midpoint)];
        if (i2 === el[1]) {
          facelist.push(el[2]);
        } else if (i2 === el[2]) {
          facelist.push(el[1]);
        } else {
          throw new Error("Could not find edge");
        }
      }
      otherfaces.push(facelist);
    }
    const facenametoindex = {};
    const faceindextoname = [];
    faceindextoname.push(net[0][0]);
    facenametoindex[net[0][0]] = 0;
    faceindextoname[otherfaces[0][0]] = net[0][1];
    facenametoindex[net[0][1]] = otherfaces[0][0];
    for (let i2 = 0; i2 < net.length; i2++) {
      const f0 = net[i2][0];
      const fi = facenametoindex[f0];
      if (fi === void 0) {
        throw new Error("Bad edge description; first edge not connected");
      }
      let ii = -1;
      for (let j = 0; j < otherfaces[fi].length; j++) {
        const fn2 = faceindextoname[otherfaces[fi][j]];
        if (fn2 !== void 0 && fn2 === net[i2][1]) {
          ii = j;
          break;
        }
      }
      if (ii < 0) {
        throw new Error("First element of a net not known");
      }
      for (let j = 2; j < net[i2].length; j++) {
        if (net[i2][j] === "") {
          continue;
        }
        const of = otherfaces[fi][(j + ii - 1) % edgesperface];
        const fn2 = faceindextoname[of];
        if (fn2 !== void 0 && fn2 !== net[i2][j]) {
          throw new Error("Face mismatch in net");
        }
        faceindextoname[of] = net[i2][j];
        facenametoindex[net[i2][j]] = of;
      }
    }
    for (let i2 = 0; i2 < faceindextoname.length; i2++) {
      let found = false;
      for (let j = 0; j < this.faceorder.length; j++) {
        if (faceindextoname[i2] === this.faceorder[j]) {
          this.faceprecedence[i2] = j;
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error("Could not find face " + faceindextoname[i2] + " in face order list " + this.faceorder);
      }
    }
    for (let i2 = 0; i2 < this.baseplanerot.length; i2++) {
      const face2 = this.baseplanerot[i2].rotateface(faces[0]);
      const faceplane = boundary.rotateplane(this.baseplanerot[i2]);
      const facename = faceindextoname[i2];
      facenames.push([face2, facename]);
      faceplanes.push([faceplane, facename]);
    }
    for (let i2 = 0; i2 < this.baseplanerot.length; i2++) {
      const face2 = this.baseplanerot[i2].rotateface(faces[0]);
      const facename = faceindextoname[i2];
      for (let j = 0; j < face2.length; j++) {
        const jj = (j + 1) % face2.length;
        const midpoint = face2[j].sum(face2[jj]).smul(0.5);
        const jjj = (j + 2) % face2.length;
        const midpoint2 = face2[jj].sum(face2[jjj]).smul(0.5);
        const e1 = findelement(edgenames, midpoint);
        const e2 = findelement(edgenames, midpoint2);
        searchaddelement(vertexnames, face2[jj], [facename, e2, e1]);
      }
    }
    this.swizzler = new FaceNameSwizzler(facenames.map((_) => _[1]));
    const sep = this.swizzler.prefixFree ? "" : "_";
    for (let i2 = 0; i2 < edgenames.length; i2++) {
      if (edgenames[i2].length !== 3) {
        throw new Error("Bad length in edge names " + edgenames[i2]);
      }
      let c1 = faceindextoname[edgenames[i2][1]];
      const c2 = faceindextoname[edgenames[i2][2]];
      if (this.faceprecedence[edgenames[i2][1]] < this.faceprecedence[edgenames[i2][2]]) {
        c1 = c1 + sep + c2;
      } else {
        c1 = c2 + sep + c1;
      }
      edgenames[i2] = [edgenames[i2][0], c1];
    }
    this.cornerfaces = vertexnames[0].length - 1;
    for (let i2 = 0; i2 < vertexnames.length; i2++) {
      if (vertexnames[i2].length < 4) {
        throw new Error("Bad length in vertex names");
      }
      let st = 1;
      for (let j = 2; j < vertexnames[i2].length; j++) {
        if (this.faceprecedence[facenametoindex[vertexnames[i2][j][0]]] < this.faceprecedence[facenametoindex[vertexnames[i2][st][0]]]) {
          st = j;
        }
      }
      let r3 = "";
      for (let j = 1; j < vertexnames[i2].length; j++) {
        if (j === 1) {
          r3 = vertexnames[i2][st][0];
        } else {
          r3 = r3 + sep + vertexnames[i2][st][0];
        }
        for (let k = 1; k < vertexnames[i2].length; k++) {
          if (vertexnames[i2][st][2] === vertexnames[i2][k][1]) {
            st = k;
            break;
          }
        }
      }
      vertexnames[i2] = [vertexnames[i2][0], r3];
    }
    if (this.verbose > 1) {
      console.log("Face precedence list: " + this.faceorder.join(" "));
      console.log("Face names: " + facenames.map((_) => _[1]).join(" "));
      console.log("Edge names: " + edgenames.map((_) => _[1]).join(" "));
      console.log("Vertex names: " + vertexnames.map((_) => _[1]).join(" "));
    }
    const geonormals = [];
    for (let i2 = 0; i2 < faceplanes.length; i2++) {
      geonormals.push([faceplanes[i2][0].makenormal(), faceplanes[i2][1], "f"]);
    }
    for (let i2 = 0; i2 < edgenames.length; i2++) {
      geonormals.push([edgenames[i2][0].makenormal(), edgenames[i2][1], "e"]);
    }
    for (let i2 = 0; i2 < vertexnames.length; i2++) {
      geonormals.push([vertexnames[i2][0].makenormal(), vertexnames[i2][1], "v"]);
    }
    this.facenames = facenames;
    this.faceplanes = faceplanes;
    this.edgenames = edgenames;
    this.vertexnames = vertexnames;
    this.geonormals = geonormals;
    const geonormalnames = geonormals.map((_) => _[1]);
    this.swizzler.setGripNames(geonormalnames);
    if (this.verbose) {
      console.log("# Distances: face " + 1 + " edge " + this.edgedistance + " vertex " + this.vertexdistance);
    }
    for (let c = 0; c < cutplanes.length; c++) {
      for (let i2 = 0; i2 < this.rotations.length; i2++) {
        const q = cutplanes[c].rotateplane(this.rotations[i2]);
        let wasseen = false;
        for (let j = 0; j < this.moveplanes.length; j++) {
          if (q.sameplane(this.moveplanes[j])) {
            wasseen = true;
            break;
          }
        }
        if (!wasseen) {
          this.moveplanes.push(q);
          faces = q.cutfaces(faces);
          if (intersects[c]) {
            this.moveplanes2.push(q);
          }
        }
      }
    }
    this.faces = faces;
    if (this.verbose) {
      console.log("# Faces is now " + faces.length);
    }
    this.stickersperface = faces.length;
    let shortedge = 1e99;
    for (let i2 = 0; i2 < faces.length; i2++) {
      for (let j = 0; j < faces[i2].length; j++) {
        const k = (j + 1) % faces[i2].length;
        const t2 = faces[i2][j].dist(faces[i2][k]);
        if (t2 < shortedge) {
          shortedge = t2;
        }
      }
    }
    this.shortedge = shortedge;
    if (this.verbose) {
      console.log("# Short edge is " + shortedge);
    }
    if (shape === "c" && sawface) {
      this.addNotationMapper = "NxNxNCubeMapper";
    }
    if (shape === "o" && sawface && NEW_FACE_NAMES) {
      this.notationMapper = new FaceRenamingMapper(this.swizzler, new FaceNameSwizzler(["F", "D", "L", "BL", "R", "U", "BR", "B"]));
    }
    if (shape === "d" && sawface && NEW_FACE_NAMES) {
      this.addNotationMapper = "Megaminx";
      this.notationMapper = new FaceRenamingMapper(this.swizzler, new FaceNameSwizzler([
        "U",
        "F",
        "L",
        "BL",
        "BR",
        "R",
        "FR",
        "FL",
        "DL",
        "B",
        "DR",
        "D"
      ]));
    }
  }
  keyface(face2) {
    let s = "";
    for (let i2 = 0; i2 < this.moveplanesets.length; i2++) {
      let t2 = 0;
      for (let j = 0; j < this.moveplanesets[i2].length; j++) {
        if (this.moveplanesets[i2][j].faceside(face2) > 0) {
          t2++;
        }
      }
      s = s + " " + t2;
    }
    return s;
  }
  findcubie(face2) {
    return this.facetocubies[this.findface(face2)][0];
  }
  findface(face2) {
    const cm = centermassface(face2);
    const key = this.keyface(face2);
    for (let i2 = 0; i2 < this.facelisthash[key].length; i2++) {
      const face22 = this.facelisthash[key][i2];
      if (Math.abs(cm.dist(centermassface(this.faces[face22]))) < eps3) {
        return face22;
      }
    }
    throw new Error("Could not find face.");
  }
  project2d(facen, edgen, targvec) {
    const face2 = this.facenames[facen][0];
    const edgen2 = (edgen + 1) % face2.length;
    const plane = this.baseplanes[facen];
    let x0 = face2[edgen2].sub(face2[edgen]);
    const olen = x0.len();
    x0 = x0.normalize();
    const y0 = x0.cross(plane).normalize();
    let delta = targvec[1].sub(targvec[0]);
    const len = delta.len() / olen;
    delta = delta.normalize();
    const cosr = delta.b;
    const sinr = delta.c;
    const x1 = x0.smul(cosr).sub(y0.smul(sinr)).smul(len);
    const y1 = y0.smul(cosr).sum(x0.smul(sinr)).smul(len);
    const off = new Quat(0, targvec[0].b - x1.dot(face2[edgen]), targvec[0].c - y1.dot(face2[edgen]), 0);
    return [x1, y1, off];
  }
  allstickers() {
    this.faces = expandfaces(this.baseplanerot, this.faces);
    if (this.verbose) {
      console.log("# Total stickers is now " + this.faces.length);
    }
    const moveplanesets = [];
    const moveplanenormals = [];
    for (let i2 = 0; i2 < this.moveplanes.length; i2++) {
      const q = this.moveplanes[i2];
      const qnormal = q.makenormal();
      let wasseen = false;
      for (let j = 0; j < moveplanenormals.length; j++) {
        if (qnormal.sameplane(moveplanenormals[j].makenormal())) {
          wasseen = true;
        }
      }
      if (!wasseen) {
        moveplanenormals.push(qnormal);
        moveplanesets.push([]);
      }
    }
    for (let i2 = 0; i2 < this.moveplanes2.length; i2++) {
      const q = this.moveplanes2[i2];
      const qnormal = q.makenormal();
      for (let j = 0; j < moveplanenormals.length; j++) {
        if (qnormal.sameplane(moveplanenormals[j])) {
          moveplanesets[j].push(q);
          break;
        }
      }
    }
    for (let i2 = 0; i2 < moveplanesets.length; i2++) {
      const q = moveplanesets[i2].map((_) => _.normalizeplane());
      const goodnormal = moveplanenormals[i2];
      for (let j = 0; j < q.length; j++) {
        if (q[j].makenormal().dist(goodnormal) > eps3) {
          q[j] = q[j].smul(-1);
        }
      }
      q.sort((a, b) => a.a - b.a);
      moveplanesets[i2] = q;
    }
    this.moveplanesets = moveplanesets;
    this.moveplanenormals = moveplanenormals;
    const sizes = moveplanesets.map((_) => _.length);
    if (this.verbose) {
      console.log("# Move plane sets: " + sizes);
    }
    const moverotations = [];
    for (let i2 = 0; i2 < moveplanesets.length; i2++) {
      moverotations.push([]);
    }
    for (let i2 = 0; i2 < this.rotations.length; i2++) {
      const q = this.rotations[i2];
      if (Math.abs(Math.abs(q.a) - 1) < eps3) {
        continue;
      }
      const qnormal = q.makenormal();
      for (let j = 0; j < moveplanesets.length; j++) {
        if (qnormal.sameplane(moveplanenormals[j])) {
          moverotations[j].push(q);
          break;
        }
      }
    }
    this.moverotations = moverotations;
    for (let i2 = 0; i2 < moverotations.length; i2++) {
      const r3 = moverotations[i2];
      const goodnormal = r3[0].makenormal();
      for (let j = 0; j < r3.length; j++) {
        if (goodnormal.dist(r3[j].makenormal()) > eps3) {
          r3[j] = r3[j].smul(-1);
        }
      }
      r3.sort((a, b) => a.angle() - b.angle());
      if (moverotations[i2][0].dot(moveplanenormals[i2]) < 0) {
        r3.reverse();
      }
    }
    const sizes2 = moverotations.map((_) => 1 + _.length);
    this.movesetorders = sizes2;
    const movesetgeos = [];
    let gtype = "?";
    for (let i2 = 0; i2 < moveplanesets.length; i2++) {
      const p0 = moveplanenormals[i2];
      let neg = null;
      let pos = null;
      for (let j = 0; j < this.geonormals.length; j++) {
        const d2 = p0.dot(this.geonormals[j][0]);
        if (Math.abs(d2 - 1) < eps3) {
          pos = [this.geonormals[j][1], this.geonormals[j][2]];
          gtype = this.geonormals[j][2];
        } else if (Math.abs(d2 + 1) < eps3) {
          neg = [this.geonormals[j][1], this.geonormals[j][2]];
          gtype = this.geonormals[j][2];
        }
      }
      if (pos === null || neg === null) {
        throw new Error("Saw positive or negative sides as null");
      }
      movesetgeos.push([
        pos[0],
        pos[1],
        neg[0],
        neg[1],
        1 + moveplanesets[i2].length
      ]);
      if (this.addNotationMapper === "NxNxNCubeMapper" && gtype === "f") {
        this.notationMapper = new NxNxNCubeMapper(1 + moveplanesets[i2].length);
        this.addNotationMapper = "";
      }
      if (this.addNotationMapper === "Megaminx" && gtype === "f") {
        if (1 + moveplanesets[i2].length === 3) {
          this.notationMapper = new MegaminxScramblingNotationMapper(this.notationMapper);
        }
        this.addNotationMapper = "";
      }
    }
    this.movesetgeos = movesetgeos;
    const cubiehash = {};
    const facelisthash = {};
    const cubiekey = {};
    const cubiekeys = [];
    const cubies = [];
    const faces = this.faces;
    for (let i2 = 0; i2 < faces.length; i2++) {
      const face2 = faces[i2];
      const s = this.keyface(face2);
      if (!cubiehash[s]) {
        cubiekey[s] = cubies.length;
        cubiekeys.push(s);
        cubiehash[s] = [];
        facelisthash[s] = [];
        cubies.push(cubiehash[s]);
      }
      facelisthash[s].push(i2);
      cubiehash[s].push(face2);
      if (facelisthash[s].length === this.basefacecount) {
        if (this.verbose) {
          console.log("# Splitting core.");
        }
        for (let suff = 0; suff < this.basefacecount; suff++) {
          const s22 = s + " " + suff;
          facelisthash[s22] = [facelisthash[s][suff]];
          cubiehash[s22] = [cubiehash[s][suff]];
          cubiekeys.push(s22);
          cubiekey[s22] = cubies.length;
          cubies.push(cubiehash[s22]);
        }
        cubiehash[s] = [];
        cubies[cubiekey[s]] = [];
      }
    }
    this.cubiekey = cubiekey;
    this.facelisthash = facelisthash;
    this.cubiekeys = cubiekeys;
    if (this.verbose) {
      console.log("# Cubies: " + Object.keys(cubiehash).length);
    }
    this.cubies = cubies;
    for (let k = 0; k < cubies.length; k++) {
      const cubie = cubies[k];
      if (cubie.length < 2) {
        continue;
      }
      if (cubie.length === this.basefacecount) {
        continue;
      }
      if (cubie.length > 5) {
        throw new Error("Bad math; too many faces on this cubie " + cubie.length);
      }
      const s = this.keyface(cubie[0]);
      const facelist = facelisthash[s];
      const cm = cubie.map((_) => centermassface(_));
      const cmall = centermassface(cm);
      for (let looplimit = 0; cubie.length > 2; looplimit++) {
        let changed = false;
        for (let i2 = 0; i2 < cubie.length; i2++) {
          const j = (i2 + 1) % cubie.length;
          if (cmall.dot(cm[i2].cross(cm[j])) < 0) {
            const t2 = cubie[i2];
            cubie[i2] = cubie[j];
            cubie[j] = t2;
            const u = cm[i2];
            cm[i2] = cm[j];
            cm[j] = u;
            const v = facelist[i2];
            facelist[i2] = facelist[j];
            facelist[j] = v;
            changed = true;
          }
        }
        if (!changed) {
          break;
        }
        if (looplimit > 1e3) {
          throw new Error("Bad epsilon math; too close to border");
        }
      }
      let mini = 0;
      let minf = this.findface(cubie[mini]);
      for (let i2 = 1; i2 < cubie.length; i2++) {
        const temp = this.findface(cubie[i2]);
        if (this.faceprecedence[this.getfaceindex(temp)] < this.faceprecedence[this.getfaceindex(minf)]) {
          mini = i2;
          minf = temp;
        }
      }
      if (mini !== 0) {
        const ocubie = cubie.slice();
        const ofacelist = facelist.slice();
        for (let i2 = 0; i2 < cubie.length; i2++) {
          cubie[i2] = ocubie[(mini + i2) % cubie.length];
          facelist[i2] = ofacelist[(mini + i2) % cubie.length];
        }
      }
    }
    const facetocubies = [];
    for (let i2 = 0; i2 < cubies.length; i2++) {
      const facelist = facelisthash[cubiekeys[i2]];
      for (let j = 0; j < facelist.length; j++) {
        facetocubies[facelist[j]] = [i2, j];
      }
    }
    this.facetocubies = facetocubies;
    const typenames = ["?", "CENTERS", "EDGES", "CORNERS", "C4RNER", "C5RNER"];
    const cubiesetnames = [];
    const cubietypecounts = [0, 0, 0, 0, 0, 0];
    const orbitoris = [];
    const seen = [];
    let cubiesetnum = 0;
    const cubiesetnums = [];
    const cubieordnums = [];
    const cubieords = [];
    const cubievaluemap = [];
    const getcolorkey = (cubienum) => {
      return cubies[cubienum].map((_) => this.getfaceindex(this.findface(_))).join(" ");
    };
    const cubiesetcubies = [];
    for (let i2 = 0; i2 < cubies.length; i2++) {
      if (seen[i2]) {
        continue;
      }
      const cubie = cubies[i2];
      if (cubie.length === 0) {
        continue;
      }
      const cubiekeymap = {};
      let cubievalueid = 0;
      cubieords.push(0);
      cubiesetcubies.push([]);
      const facecnt = cubie.length;
      const typectr = cubietypecounts[facecnt]++;
      let typename = typenames[facecnt];
      if (typename === void 0 || facecnt === this.basefacecount) {
        typename = "CORE";
      }
      typename = typename + (typectr === 0 ? "" : typectr + 1);
      cubiesetnames[cubiesetnum] = typename;
      orbitoris[cubiesetnum] = facecnt;
      const queue = [i2];
      let qg = 0;
      seen[i2] = true;
      while (qg < queue.length) {
        const cind = queue[qg++];
        const cubiecolorkey = getcolorkey(cind);
        if (cubie.length > 1 || cubiekeymap[cubiecolorkey] === void 0) {
          cubiekeymap[cubiecolorkey] = cubievalueid++;
        }
        cubievaluemap[cind] = cubiekeymap[cubiecolorkey];
        cubiesetnums[cind] = cubiesetnum;
        cubiesetcubies[cubiesetnum].push(cind);
        cubieordnums[cind] = cubieords[cubiesetnum]++;
        for (let j = 0; j < moverotations.length; j++) {
          const tq = this.findcubie(moverotations[j][0].rotateface(cubies[cind][0]));
          if (!seen[tq]) {
            queue.push(tq);
            seen[tq] = true;
          }
        }
      }
      cubiesetnum++;
    }
    this.orbits = cubieords.length;
    this.cubiesetnums = cubiesetnums;
    this.cubieordnums = cubieordnums;
    this.cubiesetnames = cubiesetnames;
    this.cubieords = cubieords;
    this.orbitoris = orbitoris;
    this.cubievaluemap = cubievaluemap;
    this.cubiesetcubies = cubiesetcubies;
    if (this.fixPiece !== "") {
      for (let i2 = 0; i2 < cubies.length; i2++) {
        if (this.fixPiece === "v" && cubies[i2].length > 2 || this.fixPiece === "e" && cubies[i2].length === 2 || this.fixPiece === "f" && cubies[i2].length === 1) {
          this.fixedCubie = i2;
          break;
        }
      }
      if (this.fixedCubie < 0) {
        throw new Error("Could not find a cubie of type " + this.fixPiece + " to fix.");
      }
    }
    if (this.verbose) {
      console.log("# Cubie orbit sizes " + cubieords);
    }
  }
  unswizzle(mv) {
    const newmv = this.notationMapper.notationToInternal(mv);
    return this.swizzler.unswizzle(newmv.family);
  }
  stringToBlockMove(mv) {
    const re = RegExp("^(([0-9]+)-)?([0-9]+)?([^0-9]+)([0-9]+'?)?$");
    const p2 = mv.match(re);
    if (p2 === null) {
      throw new Error("Bad move passed " + mv);
    }
    const grip = p2[4];
    let loslice = void 0;
    let hislice = void 0;
    if (p2[2] !== void 0) {
      if (p2[3] === void 0) {
        throw new Error("Missing second number in range");
      }
      loslice = parseInt(p2[2], 10);
    }
    if (p2[3] !== void 0) {
      hislice = parseInt(p2[3], 10);
    }
    let amountstr = "1";
    let amount = 1;
    if (p2[5] !== void 0) {
      amountstr = p2[5];
      if (amountstr[0] === "'") {
        amountstr = "-" + amountstr.substring(1);
      }
      amount = parseInt(amountstr, 10);
    }
    return new BlockMove7(loslice, hislice, grip, amount);
  }
  parseBlockMove(blockmove) {
    blockmove = this.notationMapper.notationToInternal(blockmove);
    let grip = blockmove.family;
    let fullrotation = false;
    if (grip.endsWith("v") && grip[0] <= "Z") {
      if (blockmove.innerLayer !== void 0 || blockmove.outerLayer !== void 0) {
        throw new Error("Cannot use a prefix with full cube rotations");
      }
      grip = grip.slice(0, -1);
      fullrotation = true;
    }
    if (grip.endsWith("w") && grip[0] <= "Z") {
      grip = grip.slice(0, -1).toLowerCase();
    }
    let geo;
    let msi = -1;
    const geoname = this.swizzler.unswizzle(grip);
    let firstgrip = false;
    for (let i2 = 0; i2 < this.movesetgeos.length; i2++) {
      const g = this.movesetgeos[i2];
      if (geoname === g[0]) {
        firstgrip = true;
        geo = g;
        msi = i2;
      }
      if (geoname === g[2]) {
        firstgrip = false;
        geo = g;
        msi = i2;
      }
    }
    let loslice = 1;
    let hislice = 1;
    if (grip.toUpperCase() !== grip) {
      hislice = 2;
    }
    if (geo === void 0) {
      throw new Error("Bad grip in move " + blockmove.family);
    }
    if (blockmove.outerLayer !== void 0) {
      loslice = blockmove.outerLayer;
    }
    if (blockmove.innerLayer !== void 0) {
      if (blockmove.outerLayer === void 0) {
        hislice = blockmove.innerLayer;
        if (geoname === grip) {
          loslice = hislice;
        } else {
          loslice = 1;
        }
      } else {
        hislice = blockmove.innerLayer;
      }
    }
    loslice--;
    hislice--;
    if (fullrotation) {
      loslice = 0;
      hislice = this.moveplanesets[msi].length;
    }
    if (loslice < 0 || loslice > this.moveplanesets[msi].length || hislice < 0 || hislice > this.moveplanesets[msi].length) {
      throw new Error("Bad slice spec " + loslice + " " + hislice);
    }
    if (!permissivieMoveParsing && loslice === 0 && hislice === this.moveplanesets[msi].length && !fullrotation) {
      throw new Error("! full puzzle rotations must be specified with v suffix.");
    }
    const r3 = [void 0, msi, loslice, hislice, firstgrip, blockmove.amount];
    return r3;
  }
  parsemove(mv) {
    const r3 = this.parseBlockMove(this.stringToBlockMove(mv));
    r3[0] = mv;
    return r3;
  }
  genperms() {
    if (this.cmovesbyslice.length > 0) {
      return;
    }
    const cmovesbyslice = [];
    if (this.orientCenters) {
      for (let k = 0; k < this.cubies.length; k++) {
        if (this.cubies[k].length === 1) {
          const kk = this.findface(this.cubies[k][0]);
          const i2 = this.getfaceindex(kk);
          if (centermassface(this.basefaces[i2]).dist(centermassface(this.faces[kk])) < eps3) {
            const o2 = this.basefaces[i2].length;
            for (let m2 = 0; m2 < o2; m2++) {
              this.cubies[k].push(this.cubies[k][0]);
            }
            this.duplicatedFaces[kk] = o2;
            this.duplicatedCubies[k] = o2;
            this.orbitoris[this.cubiesetnums[k]] = o2;
          }
        }
      }
    }
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveplaneset = this.moveplanesets[k];
      const slicenum = [];
      const slicecnts = [];
      for (let i2 = 0; i2 < this.faces.length; i2++) {
        const face2 = this.faces[i2];
        let t2 = 0;
        for (let j = 0; j < moveplaneset.length; j++) {
          if (moveplaneset[j].faceside(face2) < 0) {
            t2++;
          }
        }
        slicenum.push(t2);
        while (slicecnts.length <= t2) {
          slicecnts.push(0);
        }
        slicecnts[t2]++;
      }
      const axiscmoves = [];
      for (let sc = 0; sc < slicecnts.length; sc++) {
        const slicecmoves = [];
        const cubiedone = [];
        for (let i2 = 0; i2 < this.faces.length; i2++) {
          if (slicenum[i2] !== sc) {
            continue;
          }
          const b = this.facetocubies[i2].slice();
          let face2 = this.faces[i2];
          let fi2 = i2;
          for (; ; ) {
            slicenum[fi2] = -1;
            const face22 = this.moverotations[k][0].rotateface(face2);
            fi2 = this.findface(face22);
            if (slicenum[fi2] < 0) {
              break;
            }
            if (slicenum[fi2] !== sc) {
              throw new Error("Bad movement?");
            }
            const c = this.facetocubies[fi2];
            b.push(c[0], c[1]);
            face2 = face22;
          }
          if (b.length > 2 && this.orientCenters && (this.cubies[b[0]].length === 1 || this.cubies[b[0]][0] === this.cubies[b[0]][1])) {
            if (centermassface(this.faces[i2]).dist(centermassface(this.basefaces[this.getfaceindex(i2)])) < eps3) {
              let face1 = this.cubies[b[0]][0];
              for (let ii = 0; ii < b.length; ii += 2) {
                const face0 = this.cubies[b[ii]][0];
                let o2 = -1;
                for (let jj = 0; jj < face1.length; jj++) {
                  if (face0[jj].dist(face1[0]) < eps3) {
                    o2 = jj;
                    break;
                  }
                }
                if (o2 < 0) {
                  throw new Error("Couldn't find rotation of center faces; ignoring for now.");
                } else {
                  b[ii + 1] = o2;
                  face1 = this.moverotations[k][0].rotateface(face1);
                }
              }
            }
          }
          if (b.length === 2 && this.orientCenters) {
            for (let ii = 1; ii < this.movesetorders[k]; ii++) {
              if (sc === 0) {
                b.push(b[0], ii);
              } else {
                b.push(b[0], (this.movesetorders[k] - ii) % this.movesetorders[k]);
              }
            }
          }
          if (b.length > 2 && !cubiedone[b[0]]) {
            if (b.length !== 2 * this.movesetorders[k]) {
              throw new Error("Bad length in perm gen");
            }
            for (let j = 0; j < b.length; j++) {
              slicecmoves.push(b[j]);
            }
          }
          for (let j = 0; j < b.length; j += 2) {
            cubiedone[b[j]] = true;
          }
        }
        axiscmoves.push(slicecmoves);
      }
      cmovesbyslice.push(axiscmoves);
    }
    this.cmovesbyslice = cmovesbyslice;
    if (this.movelist !== void 0) {
      const parsedmovelist = [];
      for (let i2 = 0; i2 < this.movelist.length; i2++) {
        parsedmovelist.push(this.parsemove(this.movelist[i2]));
      }
      this.parsedmovelist = parsedmovelist;
    }
  }
  getfaces() {
    return this.faces.map((_) => {
      return _.map((__) => [__.b, __.c, __.d]);
    });
  }
  getboundarygeometry() {
    return {
      baseplanes: this.baseplanes,
      facenames: this.facenames,
      faceplanes: this.faceplanes,
      vertexnames: this.vertexnames,
      edgenames: this.edgenames,
      geonormals: this.geonormals
    };
  }
  getmovesets(k) {
    const slices = this.moveplanesets[k].length;
    if (slices > 30) {
      throw new Error("Too many slices for getmovesets bitmasks");
    }
    let r3 = [];
    if (this.parsedmovelist !== void 0) {
      for (let i2 = 0; i2 < this.parsedmovelist.length; i2++) {
        const parsedmove = this.parsedmovelist[i2];
        if (parsedmove[1] !== k) {
          continue;
        }
        if (parsedmove[4]) {
          r3.push((2 << parsedmove[3]) - (1 << parsedmove[2]));
        } else {
          r3.push((2 << slices - parsedmove[2]) - (1 << slices - parsedmove[3]));
        }
        r3.push(parsedmove[5]);
      }
    } else if (this.vertexmoves && !this.allmoves) {
      const msg = this.movesetgeos[k];
      if (msg[1] !== msg[3]) {
        for (let i2 = 0; i2 < slices; i2++) {
          if (msg[1] !== "v") {
            if (this.outerblockmoves) {
              r3.push((2 << slices) - (2 << i2));
            } else {
              r3.push(2 << i2);
            }
            r3.push(1);
          } else {
            if (this.outerblockmoves) {
              r3.push((2 << i2) - 1);
            } else {
              r3.push(1 << i2);
            }
            r3.push(1);
          }
        }
      }
    } else {
      for (let i2 = 0; i2 <= slices; i2++) {
        if (!this.allmoves && i2 + i2 === slices) {
          continue;
        }
        if (this.outerblockmoves) {
          if (i2 + i2 > slices) {
            r3.push((2 << slices) - (1 << i2));
          } else {
            r3.push((2 << i2) - 1);
          }
        } else {
          r3.push(1 << i2);
        }
        r3.push(1);
      }
    }
    if (this.fixedCubie >= 0) {
      const dep = 1 << +this.cubiekeys[this.fixedCubie].trim().split(" ")[k];
      const newr = [];
      for (let i2 = 0; i2 < r3.length; i2 += 2) {
        let o2 = r3[i2];
        if (o2 & dep) {
          o2 = (2 << slices) - 1 - o2;
        }
        let found = false;
        for (let j = 0; j < newr.length; j += 2) {
          if (newr[j] === o2 && newr[j + 1] === r3[i2 + 1]) {
            found = true;
            break;
          }
        }
        if (!found) {
          newr.push(o2);
          newr.push(r3[i2 + 1]);
        }
      }
      r3 = newr;
    }
    return r3;
  }
  graybyori(cubie) {
    let ori = this.cubies[cubie].length;
    if (this.duplicatedCubies[cubie]) {
      ori = 1;
    }
    return ori === 1 && (this.graycenters || !this.centersets) || ori === 2 && (this.grayedges || !this.edgesets) || ori > 2 && (this.graycorners || !this.cornersets);
  }
  skipbyori(cubie) {
    let ori = this.cubies[cubie].length;
    if (this.duplicatedCubies[cubie]) {
      ori = 1;
    }
    return ori === 1 && !this.centersets || ori === 2 && !this.edgesets || ori > 2 && !this.cornersets;
  }
  skipcubie(fi) {
    return this.skipbyori(fi);
  }
  skipset(set) {
    if (set.length === 0) {
      return true;
    }
    const fi = set[0];
    return this.skipbyori(this.facetocubies[fi][0]);
  }
  header(comment) {
    return comment + copyright + "\n" + comment + this.args + "\n";
  }
  writegap() {
    const os = this.getOrbitsDef(false);
    const r3 = [];
    const mvs = [];
    for (let i2 = 0; i2 < os.moveops.length; i2++) {
      const movename = "M_" + os.movenames[i2];
      mvs.push(movename);
      r3.push(movename + ":=" + os.moveops[i2].toPerm().toGap() + ";");
    }
    r3.push("Gen:=[");
    r3.push(mvs.join(","));
    r3.push("];");
    const ip = os.solved.identicalPieces();
    r3.push("ip:=[" + ip.map((_) => "[" + _.map((__) => __ + 1).join(",") + "]").join(",") + "];");
    r3.push("");
    return this.header("# ") + r3.join("\n");
  }
  writeksolve(name6 = "PuzzleGeometryPuzzle", fortwisty = false) {
    const od = this.getOrbitsDef(fortwisty);
    if (fortwisty) {
      return od.toKsolve(name6, fortwisty).join("\n");
    } else {
      return this.header("# ") + od.toKsolve(name6, fortwisty).join("\n");
    }
  }
  writekpuzzle(fortwisty = true) {
    const od = this.getOrbitsDef(fortwisty);
    const r3 = od.toKpuzzle();
    r3.moveNotation = new PGNotation(this, od);
    return r3;
  }
  getMoveFromBits(movebits, amount, inverted, axiscmoves, setmoves, movesetorder) {
    const moveorbits = [];
    const perms = [];
    const oris = [];
    for (let ii = 0; ii < this.cubiesetnames.length; ii++) {
      perms.push(iota(this.cubieords[ii]));
      oris.push(zeros2(this.cubieords[ii]));
    }
    for (let m2 = 0; m2 < axiscmoves.length; m2++) {
      if ((movebits >> m2 & 1) === 0) {
        continue;
      }
      const slicecmoves = axiscmoves[m2];
      for (let j = 0; j < slicecmoves.length; j += 2 * movesetorder) {
        const mperm = slicecmoves.slice(j, j + 2 * movesetorder);
        const setnum = this.cubiesetnums[mperm[0]];
        for (let ii = 0; ii < mperm.length; ii += 2) {
          mperm[ii] = this.cubieordnums[mperm[ii]];
        }
        let inc = 2;
        let oinc = 3;
        if (inverted) {
          inc = mperm.length - 2;
          oinc = mperm.length - 1;
        }
        if (perms[setnum] === iota(this.cubieords[setnum])) {
          perms[setnum] = perms[setnum].slice();
          if (this.orbitoris[setnum] > 1 && !this.killorientation) {
            oris[setnum] = oris[setnum].slice();
          }
        }
        for (let ii = 0; ii < mperm.length; ii += 2) {
          perms[setnum][mperm[(ii + inc) % mperm.length]] = mperm[ii];
          if (this.orbitoris[setnum] > 1 && !this.killorientation) {
            oris[setnum][mperm[ii]] = (mperm[(ii + oinc) % mperm.length] - mperm[(ii + 1) % mperm.length] + 2 * this.orbitoris[setnum]) % this.orbitoris[setnum];
          }
        }
      }
    }
    for (let ii = 0; ii < this.cubiesetnames.length; ii++) {
      if (setmoves && !setmoves[ii]) {
        continue;
      }
      if (this.orbitoris[ii] === 1 || this.killorientation) {
        moveorbits.push(new Orbit(perms[ii], oris[ii], 1));
      } else {
        const no = new Array(oris[ii].length);
        for (let jj = 0; jj < perms[ii].length; jj++) {
          no[jj] = oris[ii][perms[ii][jj]];
        }
        moveorbits.push(new Orbit(perms[ii], no, this.orbitoris[ii]));
      }
    }
    let mv = new Transformation3(moveorbits);
    if (amount !== 1) {
      mv = mv.mulScalar(amount);
    }
    return mv;
  }
  getOrbitsDef(fortwisty) {
    const setmoves = [];
    const setnames = [];
    const setdefs = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveset = this.getmovesets(k);
      const movesetorder = this.movesetorders[k];
      for (let i2 = 0; i2 < moveset.length; i2 += 2) {
        for (let j = 0; j < i2; j += 2) {
          if (moveset[i2] === moveset[j] && moveset[i2 + 1] === moveset[j + 1]) {
            throw new Error("Redundant moves in moveset.");
          }
        }
      }
      let allbits = 0;
      for (let i2 = 0; i2 < moveset.length; i2 += 2) {
        allbits |= moveset[i2];
      }
      const axiscmoves = this.cmovesbyslice[k];
      for (let i2 = 0; i2 < axiscmoves.length; i2++) {
        if ((allbits >> i2 & 1) === 0) {
          continue;
        }
        const slicecmoves = axiscmoves[i2];
        for (let j = 0; j < slicecmoves.length; j += 2 * movesetorder) {
          if (this.skipcubie(slicecmoves[j])) {
            continue;
          }
          const ind = this.cubiesetnums[slicecmoves[j]];
          setmoves[ind] = 1;
        }
      }
    }
    for (let i2 = 0; i2 < this.cubiesetnames.length; i2++) {
      if (!setmoves[i2]) {
        continue;
      }
      setnames.push(this.cubiesetnames[i2]);
      setdefs.push(new OrbitDef(this.cubieords[i2], this.killorientation ? 1 : this.orbitoris[i2]));
    }
    const solved = [];
    for (let i2 = 0; i2 < this.cubiesetnames.length; i2++) {
      if (!setmoves[i2]) {
        continue;
      }
      const p2 = [];
      const o2 = [];
      for (let j = 0; j < this.cubieords[i2]; j++) {
        if (fortwisty) {
          p2.push(j);
        } else {
          const cubie = this.cubiesetcubies[i2][j];
          p2.push(this.cubievaluemap[cubie]);
        }
        o2.push(0);
      }
      solved.push(new Orbit(p2, o2, this.killorientation ? 1 : this.orbitoris[i2]));
    }
    const movenames = [];
    const moves6 = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveplaneset = this.moveplanesets[k];
      const slices = moveplaneset.length;
      const moveset = this.getmovesets(k);
      const movesetgeo = this.movesetgeos[k];
      for (let i2 = 0; i2 < moveset.length; i2 += 2) {
        const movebits = moveset[i2];
        const mna = getmovename(movesetgeo, movebits, slices);
        const movename = mna[0];
        const inverted = mna[1];
        if (moveset[i2 + 1] === 1) {
          movenames.push(movename);
        } else {
          movenames.push(movename + moveset[i2 + 1]);
        }
        const mv = this.getMoveFromBits(movebits, moveset[i2 + 1], inverted, this.cmovesbyslice[k], setmoves, this.movesetorders[k]);
        moves6.push(mv);
      }
    }
    this.ksolvemovenames = movenames;
    let r3 = new OrbitsDef(setnames, setdefs, new VisibleState(solved), movenames, moves6);
    if (this.optimize) {
      r3 = r3.optimize();
    }
    if (this.scramble !== 0) {
      r3.scramble(this.scramble);
    }
    return r3;
  }
  getMovesAsPerms() {
    return this.getOrbitsDef(false).moveops.map((_) => _.toPerm());
  }
  showcanon(disp) {
    showcanon(this.getOrbitsDef(false), disp);
  }
  getsolved() {
    const r3 = [];
    for (let i2 = 0; i2 < this.basefacecount; i2++) {
      for (let j = 0; j < this.stickersperface; j++) {
        r3.push(i2);
      }
    }
    return new Perm(r3);
  }
  getOrientationRotation(desiredRotation) {
    const feature1name = desiredRotation[0];
    const direction1 = new Quat(0, desiredRotation[1][0], -desiredRotation[1][1], desiredRotation[1][2]);
    const feature2name = desiredRotation[2];
    const direction2 = new Quat(0, desiredRotation[3][0], -desiredRotation[3][1], desiredRotation[3][2]);
    let feature1 = null;
    let feature2 = null;
    const feature1geoname = this.swizzler.unswizzle(feature1name);
    const feature2geoname = this.swizzler.unswizzle(feature2name);
    for (const gn of this.geonormals) {
      if (feature1geoname === gn[1]) {
        feature1 = gn[0];
      }
      if (feature2geoname === gn[1]) {
        feature2 = gn[0];
      }
    }
    if (!feature1) {
      throw new Error("Could not find feature " + feature1name);
    }
    if (!feature2) {
      throw new Error("Could not find feature " + feature2name);
    }
    const r1 = feature1.pointrotation(direction1);
    const feature2rot = feature2.rotatepoint(r1);
    const r22 = feature2rot.unproject(direction1).pointrotation(direction2.unproject(direction1));
    return r22.mul(r1);
  }
  getInitial3DRotation() {
    const basefacecount = this.basefacecount;
    let rotDesc = null;
    if (this.puzzleOrientation) {
      rotDesc = this.puzzleOrientation;
    } else if (this.puzzleOrientations) {
      rotDesc = this.puzzleOrientations[basefacecount];
    }
    if (!rotDesc) {
      rotDesc = defaultOrientations()[basefacecount];
    }
    if (!rotDesc) {
      throw new Error("No default orientation?");
    }
    return this.getOrientationRotation(rotDesc);
  }
  generatesvg(w = 800, h = 500, trim = 10, threed = false) {
    w -= 2 * trim;
    h -= 2 * trim;
    function extendedges(a, n) {
      let dx = a[1][0] - a[0][0];
      let dy = a[1][1] - a[0][1];
      const ang = 2 * Math.PI / n;
      const cosa = Math.cos(ang);
      const sina = Math.sin(ang);
      for (let i2 = 2; i2 < n; i2++) {
        const ndx = dx * cosa + dy * sina;
        dy = dy * cosa - dx * sina;
        dx = ndx;
        a.push([a[i2 - 1][0] + dx, a[i2 - 1][1] + dy]);
      }
    }
    function noise(c) {
      return c + 0 * (Math.random() - 0.5);
    }
    function drawedges(id, pts, color) {
      return '<polygon id="' + id + '" class="sticker" style="fill: ' + color + '" points="' + pts.map((p2) => noise(p2[0]) + " " + noise(p2[1])).join(" ") + '"/>\n';
    }
    let needvertexgrips = this.addrotations;
    let neededgegrips = this.addrotations;
    let needfacegrips = this.addrotations;
    for (let i2 = 0; i2 < this.movesetgeos.length; i2++) {
      const msg = this.movesetgeos[i2];
      for (let j = 1; j <= 3; j += 2) {
        if (msg[j] === "v") {
          needvertexgrips = true;
        }
        if (msg[j] === "f") {
          needfacegrips = true;
        }
        if (msg[j] === "e") {
          neededgegrips = true;
        }
      }
    }
    this.genperms();
    const boundarygeo = this.getboundarygeometry();
    const face0 = boundarygeo.facenames[0][0];
    const polyn = face0.length;
    const net = this.net;
    if (net === null) {
      throw new Error("No net?");
    }
    const edges = {};
    let minx = 0;
    let miny = 0;
    let maxx = 1;
    let maxy = 0;
    edges[net[0][0]] = [
      [1, 0],
      [0, 0]
    ];
    extendedges(edges[net[0][0]], polyn);
    for (let i2 = 0; i2 < net.length; i2++) {
      const f0 = net[i2][0];
      if (!edges[f0]) {
        throw new Error("Bad edge description; first edge not connected.");
      }
      for (let j = 1; j < net[i2].length; j++) {
        const f1 = net[i2][j];
        if (f1 === "" || edges[f1]) {
          continue;
        }
        edges[f1] = [edges[f0][j % polyn], edges[f0][(j + polyn - 1) % polyn]];
        extendedges(edges[f1], polyn);
      }
    }
    for (const f in edges) {
      const es = edges[f];
      for (let i2 = 0; i2 < es.length; i2++) {
        minx = Math.min(minx, es[i2][0]);
        maxx = Math.max(maxx, es[i2][0]);
        miny = Math.min(miny, es[i2][1]);
        maxy = Math.max(maxy, es[i2][1]);
      }
    }
    const sc = Math.min(w / (maxx - minx), h / (maxy - miny));
    const xoff = 0.5 * (w - sc * (maxx + minx));
    const yoff = 0.5 * (h - sc * (maxy + miny));
    const geos = {};
    const bg = this.getboundarygeometry();
    const edges2 = {};
    const initv = [
      [sc + xoff, yoff],
      [xoff, yoff]
    ];
    edges2[net[0][0]] = initv;
    extendedges(edges2[net[0][0]], polyn);
    geos[this.facenames[0][1]] = this.project2d(0, 0, [
      new Quat(0, initv[0][0], initv[0][1], 0),
      new Quat(0, initv[1][0], initv[1][1], 0)
    ]);
    const connectat = [];
    connectat[0] = 0;
    for (let i2 = 0; i2 < net.length; i2++) {
      const f0 = net[i2][0];
      if (!edges2[f0]) {
        throw new Error("Bad edge description; first edge not connected.");
      }
      let gfi = -1;
      for (let j = 0; j < bg.facenames.length; j++) {
        if (f0 === bg.facenames[j][1]) {
          gfi = j;
          break;
        }
      }
      if (gfi < 0) {
        throw new Error("Could not find first face name " + f0);
      }
      const thisface = bg.facenames[gfi][0];
      for (let j = 1; j < net[i2].length; j++) {
        const f1 = net[i2][j];
        if (f1 === "" || edges2[f1]) {
          continue;
        }
        edges2[f1] = [
          edges2[f0][j % polyn],
          edges2[f0][(j + polyn - 1) % polyn]
        ];
        extendedges(edges2[f1], polyn);
        const caf0 = connectat[gfi];
        const mp = thisface[(caf0 + j) % polyn].sum(thisface[(caf0 + j + polyn - 1) % polyn]).smul(0.5);
        const epi = findelement(bg.edgenames, mp);
        const edgename = bg.edgenames[epi][1];
        const el = splitByFaceNames(edgename, this.facenames);
        const gf1 = el[f0 === el[0] ? 1 : 0];
        let gf1i = -1;
        for (let k = 0; k < bg.facenames.length; k++) {
          if (gf1 === bg.facenames[k][1]) {
            gf1i = k;
            break;
          }
        }
        if (gf1i < 0) {
          throw new Error("Could not find second face name");
        }
        const otherface = bg.facenames[gf1i][0];
        for (let k = 0; k < otherface.length; k++) {
          const mp2 = otherface[k].sum(otherface[(k + 1) % polyn]).smul(0.5);
          if (mp2.dist(mp) <= eps3) {
            const p1 = edges2[f0][(j + polyn - 1) % polyn];
            const p2 = edges2[f0][j % polyn];
            connectat[gf1i] = k;
            geos[gf1] = this.project2d(gf1i, k, [
              new Quat(0, p2[0], p2[1], 0),
              new Quat(0, p1[0], p1[1], 0)
            ]);
            break;
          }
        }
      }
    }
    const pos = this.getsolved();
    const colormap = [];
    const facegeo = [];
    for (let i2 = 0; i2 < this.basefacecount; i2++) {
      colormap[i2] = this.colors[this.facenames[i2][1]];
    }
    let hix = 0;
    let hiy = 0;
    const rot = this.getInitial3DRotation();
    for (let i2 = 0; i2 < this.faces.length; i2++) {
      let face2 = this.faces[i2];
      face2 = rot.rotateface(face2);
      for (let j = 0; j < face2.length; j++) {
        hix = Math.max(hix, Math.abs(face2[j].b));
        hiy = Math.max(hiy, Math.abs(face2[j].c));
      }
    }
    const sc2 = Math.min(h / hiy / 2, (w - trim) / hix / 4);
    const mappt2d = (fn, q) => {
      if (threed) {
        const xoff2 = 0.5 * trim + 0.25 * w;
        const xmul = this.baseplanes[fn].rotateplane(rot).d < 0 ? 1 : -1;
        return [
          trim + w * 0.5 + xmul * (xoff2 - q.b * sc2),
          trim + h * 0.5 + q.c * sc2
        ];
      } else {
        const g = geos[this.facenames[fn][1]];
        return [trim + q.dot(g[0]) + g[2].b, trim + h - q.dot(g[1]) - g[2].c];
      }
    };
    for (let i2 = 0; i2 < this.faces.length; i2++) {
      let face2 = this.faces[i2];
      const facenum = Math.floor(i2 / this.stickersperface);
      if (threed) {
        face2 = rot.rotateface(face2);
      }
      facegeo.push(face2.map((_) => mappt2d(facenum, _)));
    }
    const svg2 = [];
    for (let j = 0; j < this.basefacecount; j++) {
      svg2.push("<g>");
      svg2.push("<title>" + this.facenames[j][1] + "</title>\n");
      for (let ii = 0; ii < this.stickersperface; ii++) {
        const i2 = j * this.stickersperface + ii;
        const cubie = this.facetocubies[i2][0];
        const cubieori = this.facetocubies[i2][1];
        const cubiesetnum = this.cubiesetnums[cubie];
        const cubieord = this.cubieordnums[cubie];
        const color = this.graybyori(cubie) ? "#808080" : colormap[pos.p[i2]];
        let id = this.cubiesetnames[cubiesetnum] + "-l" + cubieord + "-o" + cubieori;
        svg2.push(drawedges(id, facegeo[i2], color));
        if (this.duplicatedFaces[i2]) {
          for (let jj = 1; jj < this.duplicatedFaces[i2]; jj++) {
            id = this.cubiesetnames[cubiesetnum] + "-l" + cubieord + "-o" + jj;
            svg2.push(drawedges(id, facegeo[i2], color));
          }
        }
      }
      svg2.push("</g>");
    }
    const svggrips = [];
    function addgrip(onface, name6, pt, order) {
      const pt2 = mappt2d(onface, pt);
      for (let i2 = 0; i2 < svggrips.length; i2++) {
        if (Math.hypot(pt2[0] - svggrips[i2][0], pt2[1] - svggrips[i2][1]) < eps3) {
          return;
        }
      }
      svggrips.push([pt2[0], pt2[1], name6, order]);
    }
    for (let i2 = 0; i2 < this.faceplanes.length; i2++) {
      const baseface = this.facenames[i2][0];
      let facecoords = baseface;
      if (threed) {
        facecoords = rot.rotateface(facecoords);
      }
      if (needfacegrips) {
        let pt = this.faceplanes[i2][0];
        if (threed) {
          pt = pt.rotatepoint(rot);
        }
        addgrip(i2, this.faceplanes[i2][1], pt, polyn);
      }
      for (let j = 0; j < baseface.length; j++) {
        if (neededgegrips) {
          const mp = baseface[j].sum(baseface[(j + 1) % baseface.length]).smul(0.5);
          const ep = findelement(this.edgenames, mp);
          const mpc = facecoords[j].sum(facecoords[(j + 1) % baseface.length]).smul(0.5);
          addgrip(i2, this.edgenames[ep][1], mpc, 2);
        }
        if (needvertexgrips) {
          const vp = findelement(this.vertexnames, baseface[j]);
          addgrip(i2, this.vertexnames[vp][1], facecoords[j], this.cornerfaces);
        }
      }
    }
    const html = '<svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 500">\n<style type="text/css"><![CDATA[.sticker { stroke: #000000; stroke-width: 1px; }]]></style>\n' + svg2.join("") + "</svg>";
    this.svggrips = svggrips;
    return html;
  }
  dist(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }
  triarea(a, b, c) {
    const ab = this.dist(a, b);
    const bc = this.dist(b, c);
    const ac = this.dist(a, c);
    const p2 = (ab + bc + ac) / 2;
    return Math.sqrt(p2 * (p2 - ab) * (p2 - bc) * (p2 - ac));
  }
  polyarea(coords) {
    let sum = 0;
    for (let i2 = 2; i2 < coords.length; i2++) {
      sum += this.triarea(coords[0], coords[1], coords[i2]);
    }
    return sum;
  }
  get3d(colorfrac = DEFAULT_COLOR_FRACTION) {
    const stickers = [];
    const foundations = [];
    const rot = this.getInitial3DRotation();
    const faces = [];
    const maxdist = 0.52 * this.basefaces[0][0].len();
    let avgstickerarea = 0;
    for (let i2 = 0; i2 < this.basefaces.length; i2++) {
      const coords = rot.rotateface(this.basefaces[i2]);
      const name6 = this.facenames[i2][1];
      faces.push({coords: toFaceCoords(coords, maxdist), name: name6});
      avgstickerarea += this.polyarea(faces[i2].coords);
    }
    avgstickerarea /= this.faces.length;
    const trim = Math.sqrt(avgstickerarea) * (1 - Math.sqrt(colorfrac)) / 2;
    for (let i2 = 0; i2 < this.faces.length; i2++) {
      const facenum = Math.floor(i2 / this.stickersperface);
      const cubie = this.facetocubies[i2][0];
      const cubieori = this.facetocubies[i2][1];
      const cubiesetnum = this.cubiesetnums[cubie];
      const cubieord = this.cubieordnums[cubie];
      const color = this.graybyori(cubie) ? "#808080" : this.colors[this.facenames[facenum][1]];
      let coords = rot.rotateface(this.faces[i2]);
      foundations.push({
        coords: toFaceCoords(coords, maxdist),
        color,
        orbit: this.cubiesetnames[cubiesetnum],
        ord: cubieord,
        ori: cubieori
      });
      const fcoords = coords;
      if (trim && trim > 0) {
        coords = trimEdges(coords, trim);
      }
      stickers.push({
        coords: toFaceCoords(coords, maxdist),
        color,
        orbit: this.cubiesetnames[cubiesetnum],
        ord: cubieord,
        ori: cubieori
      });
      if (this.duplicatedFaces[i2]) {
        for (let jj = 1; jj < this.duplicatedFaces[i2]; jj++) {
          stickers.push({
            coords: toFaceCoords(coords, maxdist),
            color,
            orbit: this.cubiesetnames[cubiesetnum],
            ord: cubieord,
            ori: jj
          });
          foundations.push({
            coords: toFaceCoords(fcoords, maxdist),
            color,
            orbit: this.cubiesetnames[cubiesetnum],
            ord: cubieord,
            ori: jj
          });
        }
      }
    }
    const grips = [];
    for (let i2 = 0; i2 < this.movesetgeos.length; i2++) {
      const msg = this.movesetgeos[i2];
      const order = this.movesetorders[i2];
      for (let j = 0; j < this.geonormals.length; j++) {
        const gn = this.geonormals[j];
        if (msg[0] === gn[1] && msg[1] === gn[2]) {
          grips.push([toCoords(gn[0].rotatepoint(rot), 1), msg[0], order]);
          grips.push([
            toCoords(gn[0].rotatepoint(rot).smul(-1), 1),
            msg[2],
            order
          ]);
        }
      }
    }
    const f = function() {
      return function(mv) {
        return this.unswizzle(mv);
      };
    }().bind(this);
    return {
      stickers,
      foundations,
      faces,
      axis: grips,
      unswizzle: f,
      notationMapper: this.notationMapper
    };
  }
  getGeoNormal(geoname) {
    const rot = this.getInitial3DRotation();
    const grip = this.swizzler.unswizzle(geoname);
    for (let j = 0; j < this.geonormals.length; j++) {
      const gn = this.geonormals[j];
      if (grip === gn[1]) {
        const r3 = toCoords(gn[0].rotatepoint(rot), 1);
        if (Math.abs(r3[0]) < eps3 && Math.abs(r3[2]) < eps3) {
          r3[0] = 0;
          r3[2] = 1e-6;
        }
        return r3;
      }
    }
    return void 0;
  }
  getfaceindex(facenum) {
    const divid = this.stickersperface;
    return Math.floor(facenum / divid);
  }
}
class PGNotation {
  constructor(pg, od) {
    this.pg = pg;
    this.od = od;
    this.cache = {};
  }
  lookupMove(move) {
    const key = this.blockMoveToString(move);
    if (key in this.cache) {
      return this.cache[key];
    }
    const mv = this.pg.parseBlockMove(move);
    let bits = (2 << mv[3]) - (1 << mv[2]);
    if (!mv[4]) {
      const slices = this.pg.moveplanesets[mv[1]].length;
      bits = (2 << slices - mv[2]) - (1 << slices - mv[3]);
    }
    const pgmv = this.pg.getMoveFromBits(bits, mv[5], !mv[4], this.pg.cmovesbyslice[mv[1]], void 0, this.pg.movesetorders[mv[1]]);
    const r3 = this.od.transformToKPuzzle(pgmv);
    this.cache[key] = r3;
    return r3;
  }
  blockMoveToString(mv) {
    let r3 = "";
    if (mv.outerLayer) {
      r3 = r3 + mv.outerLayer + ",";
    }
    if (mv.innerLayer) {
      r3 = r3 + mv.innerLayer + ",";
    }
    r3 = r3 + mv.family + "," + mv.amount;
    return r3;
  }
}

// src/cubing/puzzle-geometry/SchreierSims.ts
class FactoredNumber {
  constructor() {
    this.mult = [];
  }
  multiply(n) {
    for (let f = 2; f * f <= n; f++) {
      while (n % f === 0) {
        if (this.mult[f] !== void 0) {
          this.mult[f]++;
        } else {
          this.mult[f] = 1;
        }
        n /= f;
      }
    }
    if (n > 1) {
      if (this.mult[n] !== void 0) {
        this.mult[n]++;
      } else {
        this.mult[n] = 1;
      }
    }
  }
  toString() {
    let r3 = "";
    for (let i2 = 0; i2 < this.mult.length; i2++) {
      if (this.mult[i2] !== void 0) {
        if (r3 !== "") {
          r3 += "*";
        }
        r3 += i2;
        if (this.mult[i2] > 1) {
          r3 += "^" + this.mult[i2];
        }
      }
    }
    return r3;
  }
}
function schreierSims(g, disp) {
  const n = g[0].p.length;
  const e = identity(n);
  let sgs = [];
  let sgsi = [];
  let sgslen = [];
  let Tk = [];
  let Tklen = [];
  function resolve(p2) {
    for (let i2 = p2.p.length - 1; i2 >= 0; i2--) {
      const j = p2.p[i2];
      if (j !== i2) {
        if (!sgs[i2][j]) {
          return false;
        }
        p2 = p2.mul(sgsi[i2][j]);
      }
    }
    return true;
  }
  function knutha(k, p2, len) {
    Tk[k].push(p2);
    Tklen[k].push(len);
    for (let i2 = 0; i2 < sgs[k].length; i2++) {
      if (sgs[k][i2]) {
        knuthb(k, sgs[k][i2].mul(p2), len + sgslen[k][i2]);
      }
    }
  }
  function knuthb(k, p2, len) {
    const j = p2.p[k];
    if (!sgs[k][j]) {
      sgs[k][j] = p2;
      sgsi[k][j] = p2.inv();
      sgslen[k][j] = len;
      for (let i2 = 0; i2 < Tk[k].length; i2++) {
        knuthb(k, p2.mul(Tk[k][i2]), len + Tklen[k][i2]);
      }
      return;
    }
    const p22 = p2.mul(sgsi[k][j]);
    if (!resolve(p22)) {
      knutha(k - 1, p22, len + sgslen[k][j]);
    }
  }
  function getsgs() {
    sgs = [];
    sgsi = [];
    Tk = [];
    sgslen = [];
    Tklen = [];
    for (let i2 = 0; i2 < n; i2++) {
      sgs.push([]);
      sgsi.push([]);
      sgslen.push([]);
      Tk.push([]);
      Tklen.push([]);
      sgs[i2][i2] = e;
      sgsi[i2][i2] = e;
      sgslen[i2][i2] = 0;
    }
    let none = 0;
    let sz = 1;
    for (let i2 = 0; i2 < g.length; i2++) {
      knutha(n - 1, g[i2], 1);
      sz = 1;
      let tks = 0;
      let sollen = 0;
      const avgs = [];
      const mults = new FactoredNumber();
      for (let j = 0; j < n; j++) {
        let cnt = 0;
        let lensum = 0;
        for (let k = 0; k < n; k++) {
          if (sgs[j][k]) {
            cnt++;
            lensum += sgslen[j][k];
            if (j !== k) {
              none++;
            }
          }
        }
        tks += Tk[j].length;
        sz *= cnt;
        if (cnt > 1) {
          mults.multiply(cnt);
        }
        const avg = lensum / cnt;
        avgs.push(avg);
        sollen += avg;
      }
      disp("" + i2 + ": sz " + sz + " T " + tks + " sol " + sollen + " none " + none + " mults " + mults);
    }
    return sz;
  }
  return getsgs();
}

// src/cubing/stream/index.ts
const stream_exports = {};
__export(stream_exports, {
  WebSocketProxyReceiver: () => WebSocketProxyReceiver,
  WebSocketProxySender: () => WebSocketProxySender
});

// src/cubing/stream/websocket-proxy.ts
class WebSocketProxySender {
  constructor(url2) {
    this.websocket = new WebSocket(url2);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onerror = this.onerror.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
  }
  sendMoveEvent(e) {
    this.sendProxyEvent({
      event: "move",
      data: e
    });
  }
  sendOrientationEvent(e) {
    this.sendProxyEvent({
      event: "orientation",
      data: e
    });
  }
  sendResetEvent() {
    this.sendProxyEvent({event: "reset"});
  }
  sendProxyEvent(proxyEvent) {
    this.websocket.send(JSON.stringify(proxyEvent));
  }
  onopen() {
    console.log("Sending socket is open!");
  }
  onerror(error) {
    console.error("WebSocket sender error:", error);
  }
  onmessage(e) {
  }
}
class WebSocketProxyReceiver {
  constructor(url2, socketOrigin) {
    if (!socketOrigin) {
      console.log("No socket origin specified. Will not attempt to connect.");
      return;
    }
    this.websocket = new WebSocket(url2);
    console.log(this.websocket);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onerror = this.onerror.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
  }
  onopen() {
    console.log("Receiving socket is open!");
  }
  onerror(error) {
    console.error("WebSocket receiver error:", error);
  }
  onmessage(e) {
    this.onProxyEvent(JSON.parse(e.data));
  }
}

// src/cubing/twisty/index.ts
const twisty_exports = {};
__export(twisty_exports, {
  Cube3D: () => Cube3D,
  KSolvePuzzle: () => KPuzzleWrapper,
  PG3D: () => PG3D,
  SimpleAlgIndexer: () => SimpleAlgIndexer,
  TreeAlgIndexer: () => TreeAlgIndexer,
  Twisty3DCanvas: () => Twisty3DCanvas2,
  TwistyPlayer: () => TwistyPlayer2,
  experimentalSetShareAllNewRenderers: () => experimentalSetShareAllNewRenderers,
  experimentalShowRenderStats: () => experimentalShowRenderStats,
  toTimeline: () => toTimeline
});

// src/cubing/twisty/dom/viewers/Twisty3DCanvas.ts
const three5 = __toModule(require("three"));

// src/cubing/twisty/animation/RenderScheduler.ts
class RenderScheduler {
  constructor(callback) {
    this.callback = callback;
    this.animFrameID = null;
    this.animFrame = this.animFrameWrapper.bind(this);
  }
  requestAnimFrame() {
    if (!this.animFrameID) {
      this.animFrameID = requestAnimationFrame(this.animFrame);
    }
  }
  cancelAnimFrame() {
    if (this.animFrameID) {
      cancelAnimationFrame(this.animFrameID);
      this.animFrameID = 0;
    }
  }
  animFrameWrapper(timestamp) {
    this.animFrameID = 0;
    this.callback(timestamp);
  }
}

// src/cubing/twisty/dom/element/node-custom-element-shims.ts
class HTMLElementStub {
}
let HTMLElementShim;
if (typeof HTMLElement !== "undefined") {
  HTMLElementShim = HTMLElement;
} else {
  HTMLElementShim = HTMLElementStub;
}
class CustomElementsStub {
  define() {
  }
}
let customElementsShim;
if (typeof customElements !== "undefined") {
  customElementsShim = customElements;
} else {
  customElementsShim = new CustomElementsStub();
}

// src/cubing/twisty/dom/element/ManagedCustomElement.ts
class CSSSource {
  constructor(sourceText) {
    this.sourceText = sourceText;
  }
  getAsString() {
    return this.sourceText;
  }
}
class ManagedCustomElement extends HTMLElementShim {
  constructor() {
    super();
    this.cssSourceMap = new Map();
    this.shadow = this.attachShadow({mode: "closed"});
    this.contentWrapper = document.createElement("div");
    this.contentWrapper.classList.add("wrapper");
    this.shadow.appendChild(this.contentWrapper);
  }
  addCSS(cssSource) {
    if (this.cssSourceMap.get(cssSource)) {
      return;
    }
    const cssElem = document.createElement("style");
    cssElem.textContent = cssSource.getAsString();
    this.cssSourceMap.set(cssSource, cssElem);
    this.shadow.appendChild(cssElem);
  }
  removeCSS(cssSource) {
    const cssElem = this.cssSourceMap.get(cssSource);
    if (!cssElem) {
      return;
    }
    this.shadow.removeChild(cssElem);
    this.cssSourceMap.delete(cssSource);
  }
  addElement(element) {
    return this.contentWrapper.appendChild(element);
  }
  prependElement(element) {
    this.contentWrapper.prepend(element);
  }
  removeElement(element) {
    return this.contentWrapper.removeChild(element);
  }
}
customElementsShim.define("twisty-managed-custom-element", ManagedCustomElement);

// src/cubing/twisty/dom/viewers/canvas.ts
function pixelRatio() {
  return devicePixelRatio || 1;
}

// src/cubing/twisty/dom/viewers/Twisty3DCanvas.css.ts
const twisty3DCanvasCSS = new CSSSource(`
:host(twisty-3d-canvas) {
  contain: content;
  overflow: hidden;
}

.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  contain: content;
}

/* TODO: This is due to stats hack. Replace with \`canvas\`. */
.wrapper > canvas {
  position: absolute;
  max-width: 100%;
  max-height: 100%;
}

.wrapper.invisible {
  opacity: 0;
}
`);

// src/cubing/twisty/dom/viewers/vendor/OrbitControls.js
const three4 = __toModule(require("three"));
const OrbitControls = function(object, domElement) {
  if (domElement === void 0)
    console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.');
  if (domElement === document)
    console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');
  this.object = object;
  this.domElement = domElement;
  this.enabled = true;
  this.target = new three4.Vector3();
  this.minDistance = 0;
  this.maxDistance = Infinity;
  this.minZoom = 0;
  this.maxZoom = Infinity;
  this.minPolarAngle = 0;
  this.maxPolarAngle = Math.PI;
  this.minAzimuthAngle = -Infinity;
  this.maxAzimuthAngle = Infinity;
  this.enableDamping = false;
  this.dampingFactor = 0.05;
  this.enableZoom = true;
  this.zoomSpeed = 1;
  this.enableRotate = true;
  this.rotateSpeed = 1;
  this.enablePan = true;
  this.panSpeed = 1;
  this.screenSpacePanning = true;
  this.keyPanSpeed = 7;
  this.autoRotate = false;
  this.autoRotateSpeed = 2;
  this.enableKeys = true;
  this.keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};
  this.mouseButtons = {
    LEFT: three4.MOUSE.ROTATE,
    MIDDLE: three4.MOUSE.DOLLY,
    RIGHT: three4.MOUSE.PAN
  };
  this.touches = {ONE: three4.TOUCH.ROTATE, TWO: three4.TOUCH.DOLLY_PAN};
  this.target0 = this.target.clone();
  this.position0 = this.object.position.clone();
  this.zoom0 = this.object.zoom;
  this.getPolarAngle = function() {
    return spherical.phi;
  };
  this.getAzimuthalAngle = function() {
    return spherical.theta;
  };
  this.saveState = function() {
    scope.target0.copy(scope.target);
    scope.position0.copy(scope.object.position);
    scope.zoom0 = scope.object.zoom;
  };
  this.reset = function() {
    scope.target.copy(scope.target0);
    scope.object.position.copy(scope.position0);
    scope.object.zoom = scope.zoom0;
    scope.object.updateProjectionMatrix();
    scope.dispatchEvent(changeEvent);
    scope.update();
    state = STATE.NONE;
  };
  this.update = function() {
    const offset = new three4.Vector3();
    const quat = new three4.Quaternion().setFromUnitVectors(object.up, new three4.Vector3(0, 1, 0));
    const quatInverse = quat.clone().inverse();
    const lastPosition = new three4.Vector3();
    const lastQuaternion = new three4.Quaternion();
    const twoPI = 2 * Math.PI;
    return function update() {
      const position = scope.object.position;
      offset.copy(position).sub(scope.target);
      offset.applyQuaternion(quat);
      spherical.setFromVector3(offset);
      if (scope.autoRotate && state === STATE.NONE) {
        rotateLeft2(getAutoRotationAngle());
      }
      if (scope.enableDamping) {
        spherical.theta += sphericalDelta.theta * scope.dampingFactor;
        spherical.phi += sphericalDelta.phi * scope.dampingFactor;
      } else {
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;
      }
      let min = scope.minAzimuthAngle;
      let max = scope.maxAzimuthAngle;
      if (isFinite(min) && isFinite(max)) {
        if (min < -Math.PI)
          min += twoPI;
        else if (min > Math.PI)
          min -= twoPI;
        if (max < -Math.PI)
          max += twoPI;
        else if (max > Math.PI)
          max -= twoPI;
        if (min < max) {
          spherical.theta = Math.max(min, Math.min(max, spherical.theta));
        } else {
          spherical.theta = spherical.theta > (min + max) / 2 ? Math.max(min, spherical.theta) : Math.min(max, spherical.theta);
        }
      }
      spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
      spherical.makeSafe();
      spherical.radius *= scale;
      spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
      if (scope.enableDamping === true) {
        scope.target.addScaledVector(panOffset, scope.dampingFactor);
      } else {
        scope.target.add(panOffset);
      }
      offset.setFromSpherical(spherical);
      offset.applyQuaternion(quatInverse);
      position.copy(scope.target).add(offset);
      scope.object.lookAt(scope.target);
      if (scope.enableDamping === true) {
        sphericalDelta.theta *= 1 - scope.dampingFactor;
        sphericalDelta.phi *= 1 - scope.dampingFactor;
        panOffset.multiplyScalar(1 - scope.dampingFactor);
      } else {
        sphericalDelta.set(0, 0, 0);
        panOffset.set(0, 0, 0);
      }
      scale = 1;
      if (zoomChanged || lastPosition.distanceToSquared(scope.object.position) > EPS || 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
        scope.dispatchEvent(changeEvent);
        lastPosition.copy(scope.object.position);
        lastQuaternion.copy(scope.object.quaternion);
        zoomChanged = false;
        return true;
      }
      return false;
    };
  }();
  this.dispose = function() {
    scope.domElement.removeEventListener("contextmenu", onContextMenu, false);
    scope.domElement.removeEventListener("mousedown", onMouseDown, false);
    scope.domElement.removeEventListener("wheel", onMouseWheel, false);
    scope.domElement.removeEventListener("touchstart", onTouchStart, false);
    scope.domElement.removeEventListener("touchend", onTouchEnd, false);
    scope.domElement.removeEventListener("touchmove", onTouchMove, false);
    scope.domElement.ownerDocument.removeEventListener("mousemove", onMouseMove, false);
    scope.domElement.ownerDocument.removeEventListener("mouseup", onMouseUp, false);
    scope.domElement.removeEventListener("keydown", onKeyDown, false);
  };
  var scope = this;
  var changeEvent = {type: "change"};
  const startEvent = {type: "start"};
  const endEvent = {type: "end"};
  var STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  };
  var state = STATE.NONE;
  var EPS = 1e-6;
  var spherical = new three4.Spherical();
  var sphericalDelta = new three4.Spherical();
  var scale = 1;
  var panOffset = new three4.Vector3();
  var zoomChanged = false;
  const rotateStart = new three4.Vector2();
  const rotateEnd = new three4.Vector2();
  const rotateDelta = new three4.Vector2();
  const panStart = new three4.Vector2();
  const panEnd = new three4.Vector2();
  const panDelta = new three4.Vector2();
  const dollyStart = new three4.Vector2();
  const dollyEnd = new three4.Vector2();
  const dollyDelta = new three4.Vector2();
  function getAutoRotationAngle() {
    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
  }
  function getZoomScale() {
    return Math.pow(0.95, scope.zoomSpeed);
  }
  function rotateLeft2(angle) {
    sphericalDelta.theta -= angle;
  }
  function rotateUp(angle) {
    sphericalDelta.phi -= angle;
  }
  const panLeft = function() {
    const v = new three4.Vector3();
    return function panLeft2(distance, objectMatrix) {
      v.setFromMatrixColumn(objectMatrix, 0);
      v.multiplyScalar(-distance);
      panOffset.add(v);
    };
  }();
  const panUp = function() {
    const v = new three4.Vector3();
    return function panUp2(distance, objectMatrix) {
      if (scope.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1);
      } else {
        v.setFromMatrixColumn(objectMatrix, 0);
        v.crossVectors(scope.object.up, v);
      }
      v.multiplyScalar(distance);
      panOffset.add(v);
    };
  }();
  const pan = function() {
    const offset = new three4.Vector3();
    return function pan2(deltaX, deltaY) {
      const element = scope.domElement;
      if (scope.object.isPerspectiveCamera) {
        const position = scope.object.position;
        offset.copy(position).sub(scope.target);
        let targetDistance = offset.length();
        targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180);
        panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
        panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
      } else if (scope.object.isOrthographicCamera) {
        panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
        panUp(deltaY * (scope.object.top - scope.object.bottom) / scope.object.zoom / element.clientHeight, scope.object.matrix);
      } else {
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
        scope.enablePan = false;
      }
    };
  }();
  function dollyOut(dollyScale) {
    if (scope.object.isPerspectiveCamera) {
      scale /= dollyScale;
    } else if (scope.object.isOrthographicCamera) {
      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      scope.enableZoom = false;
    }
  }
  function dollyIn(dollyScale) {
    if (scope.object.isPerspectiveCamera) {
      scale *= dollyScale;
    } else if (scope.object.isOrthographicCamera) {
      scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
      scope.object.updateProjectionMatrix();
      zoomChanged = true;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      scope.enableZoom = false;
    }
  }
  function handleMouseDownRotate(event) {
    rotateStart.set(event.clientX, event.clientY);
  }
  function handleMouseDownDolly(event) {
    dollyStart.set(event.clientX, event.clientY);
  }
  function handleMouseDownPan(event) {
    panStart.set(event.clientX, event.clientY);
  }
  function handleMouseMoveRotate(event) {
    rotateEnd.set(event.clientX, event.clientY);
    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
    const element = scope.domElement;
    rotateLeft2(2 * Math.PI * rotateDelta.x / element.clientHeight);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
    rotateStart.copy(rotateEnd);
    scope.update();
  }
  function handleMouseMoveDolly(event) {
    dollyEnd.set(event.clientX, event.clientY);
    dollyDelta.subVectors(dollyEnd, dollyStart);
    if (dollyDelta.y > 0) {
      dollyOut(getZoomScale());
    } else if (dollyDelta.y < 0) {
      dollyIn(getZoomScale());
    }
    dollyStart.copy(dollyEnd);
    scope.update();
  }
  function handleMouseMovePan(event) {
    panEnd.set(event.clientX, event.clientY);
    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
    pan(panDelta.x, panDelta.y);
    panStart.copy(panEnd);
    scope.update();
  }
  function handleMouseUp() {
  }
  function handleMouseWheel(event) {
    if (event.deltaY < 0) {
      dollyIn(getZoomScale());
    } else if (event.deltaY > 0) {
      dollyOut(getZoomScale());
    }
    scope.update();
  }
  function handleKeyDown(event) {
    let needsUpdate = false;
    switch (event.keyCode) {
      case scope.keys.UP:
        pan(0, scope.keyPanSpeed);
        needsUpdate = true;
        break;
      case scope.keys.BOTTOM:
        pan(0, -scope.keyPanSpeed);
        needsUpdate = true;
        break;
      case scope.keys.LEFT:
        pan(scope.keyPanSpeed, 0);
        needsUpdate = true;
        break;
      case scope.keys.RIGHT:
        pan(-scope.keyPanSpeed, 0);
        needsUpdate = true;
        break;
    }
    if (needsUpdate) {
      event.preventDefault();
      scope.update();
    }
  }
  function handleTouchStartRotate(event) {
    if (event.touches.length == 1) {
      rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      rotateStart.set(x, y);
    }
  }
  function handleTouchStartPan(event) {
    if (event.touches.length == 1) {
      panStart.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      panStart.set(x, y);
    }
  }
  function handleTouchStartDolly(event) {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    dollyStart.set(0, distance);
  }
  function handleTouchStartDollyPan(event) {
    if (scope.enableZoom)
      handleTouchStartDolly(event);
    if (scope.enablePan)
      handleTouchStartPan(event);
  }
  function handleTouchStartDollyRotate(event) {
    if (scope.enableZoom)
      handleTouchStartDolly(event);
    if (scope.enableRotate)
      handleTouchStartRotate(event);
  }
  function handleTouchMoveRotate(event) {
    if (event.touches.length == 1) {
      rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      rotateEnd.set(x, y);
    }
    rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);
    const element = scope.domElement;
    rotateLeft2(2 * Math.PI * rotateDelta.x / element.clientHeight);
    rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
    rotateStart.copy(rotateEnd);
  }
  function handleTouchMovePan(event) {
    if (event.touches.length == 1) {
      panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
      panEnd.set(x, y);
    }
    panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
    pan(panDelta.x, panDelta.y);
    panStart.copy(panEnd);
  }
  function handleTouchMoveDolly(event) {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    dollyEnd.set(0, distance);
    dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
    dollyOut(dollyDelta.y);
    dollyStart.copy(dollyEnd);
  }
  function handleTouchMoveDollyPan(event) {
    if (scope.enableZoom)
      handleTouchMoveDolly(event);
    if (scope.enablePan)
      handleTouchMovePan(event);
  }
  function handleTouchMoveDollyRotate(event) {
    if (scope.enableZoom)
      handleTouchMoveDolly(event);
    if (scope.enableRotate)
      handleTouchMoveRotate(event);
  }
  function handleTouchEnd() {
  }
  function onMouseDown(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
    scope.domElement.focus ? scope.domElement.focus() : window.focus();
    let mouseAction;
    switch (event.button) {
      case 0:
        mouseAction = scope.mouseButtons.LEFT;
        break;
      case 1:
        mouseAction = scope.mouseButtons.MIDDLE;
        break;
      case 2:
        mouseAction = scope.mouseButtons.RIGHT;
        break;
      default:
        mouseAction = -1;
    }
    switch (mouseAction) {
      case three4.MOUSE.DOLLY:
        if (scope.enableZoom === false)
          return;
        handleMouseDownDolly(event);
        state = STATE.DOLLY;
        break;
      case three4.MOUSE.ROTATE:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (scope.enablePan === false)
            return;
          handleMouseDownPan(event);
          state = STATE.PAN;
        } else {
          if (scope.enableRotate === false)
            return;
          handleMouseDownRotate(event);
          state = STATE.ROTATE;
        }
        break;
      case three4.MOUSE.PAN:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (scope.enableRotate === false)
            return;
          handleMouseDownRotate(event);
          state = STATE.ROTATE;
        } else {
          if (scope.enablePan === false)
            return;
          handleMouseDownPan(event);
          state = STATE.PAN;
        }
        break;
      default:
        state = STATE.NONE;
    }
    if (state !== STATE.NONE) {
      scope.domElement.ownerDocument.addEventListener("mousemove", onMouseMove, false);
      scope.domElement.ownerDocument.addEventListener("mouseup", onMouseUp, false);
      scope.dispatchEvent(startEvent);
    }
  }
  function onMouseMove(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
    switch (state) {
      case STATE.ROTATE:
        if (scope.enableRotate === false)
          return;
        handleMouseMoveRotate(event);
        break;
      case STATE.DOLLY:
        if (scope.enableZoom === false)
          return;
        handleMouseMoveDolly(event);
        break;
      case STATE.PAN:
        if (scope.enablePan === false)
          return;
        handleMouseMovePan(event);
        break;
    }
  }
  function onMouseUp(event) {
    if (scope.enabled === false)
      return;
    handleMouseUp(event);
    scope.domElement.ownerDocument.removeEventListener("mousemove", onMouseMove, false);
    scope.domElement.ownerDocument.removeEventListener("mouseup", onMouseUp, false);
    scope.dispatchEvent(endEvent);
    state = STATE.NONE;
  }
  function onMouseWheel(event) {
    if (scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE && state !== STATE.ROTATE)
      return;
    event.preventDefault();
    event.stopPropagation();
    scope.dispatchEvent(startEvent);
    handleMouseWheel(event);
    scope.dispatchEvent(endEvent);
  }
  function onKeyDown(event) {
    if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false)
      return;
    handleKeyDown(event);
  }
  function onTouchStart(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
    switch (event.touches.length) {
      case 1:
        switch (scope.touches.ONE) {
          case three4.TOUCH.ROTATE:
            if (scope.enableRotate === false)
              return;
            handleTouchStartRotate(event);
            state = STATE.TOUCH_ROTATE;
            break;
          case three4.TOUCH.PAN:
            if (scope.enablePan === false)
              return;
            handleTouchStartPan(event);
            state = STATE.TOUCH_PAN;
            break;
          default:
            state = STATE.NONE;
        }
        break;
      case 2:
        switch (scope.touches.TWO) {
          case three4.TOUCH.DOLLY_PAN:
            if (scope.enableZoom === false && scope.enablePan === false)
              return;
            handleTouchStartDollyPan(event);
            state = STATE.TOUCH_DOLLY_PAN;
            break;
          case three4.TOUCH.DOLLY_ROTATE:
            if (scope.enableZoom === false && scope.enableRotate === false)
              return;
            handleTouchStartDollyRotate(event);
            state = STATE.TOUCH_DOLLY_ROTATE;
            break;
          default:
            state = STATE.NONE;
        }
        break;
      default:
        state = STATE.NONE;
    }
    if (state !== STATE.NONE) {
      scope.dispatchEvent(startEvent);
    }
  }
  function onTouchMove(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
    event.stopPropagation();
    switch (state) {
      case STATE.TOUCH_ROTATE:
        if (scope.enableRotate === false)
          return;
        handleTouchMoveRotate(event);
        scope.update();
        break;
      case STATE.TOUCH_PAN:
        if (scope.enablePan === false)
          return;
        handleTouchMovePan(event);
        scope.update();
        break;
      case STATE.TOUCH_DOLLY_PAN:
        if (scope.enableZoom === false && scope.enablePan === false)
          return;
        handleTouchMoveDollyPan(event);
        scope.update();
        break;
      case STATE.TOUCH_DOLLY_ROTATE:
        if (scope.enableZoom === false && scope.enableRotate === false)
          return;
        handleTouchMoveDollyRotate(event);
        scope.update();
        break;
      default:
        state = STATE.NONE;
    }
  }
  function onTouchEnd(event) {
    if (scope.enabled === false)
      return;
    handleTouchEnd(event);
    scope.dispatchEvent(endEvent);
    state = STATE.NONE;
  }
  function onContextMenu(event) {
    if (scope.enabled === false)
      return;
    event.preventDefault();
  }
  scope.domElement.addEventListener("contextmenu", onContextMenu, false);
  scope.domElement.addEventListener("mousedown", onMouseDown, false);
  scope.domElement.addEventListener("wheel", onMouseWheel, false);
  scope.domElement.addEventListener("touchstart", onTouchStart, false);
  scope.domElement.addEventListener("touchend", onTouchEnd, false);
  scope.domElement.addEventListener("touchmove", onTouchMove, false);
  scope.domElement.addEventListener("keydown", onKeyDown, false);
  if (scope.domElement.tabIndex === -1) {
    scope.domElement.tabIndex = 0;
  }
  this.update();
};
OrbitControls.prototype = Object.create(three4.EventDispatcher.prototype);
OrbitControls.prototype.constructor = OrbitControls;
const MapControls = function(object, domElement) {
  OrbitControls.call(this, object, domElement);
  this.screenSpacePanning = false;
  this.mouseButtons.LEFT = three4.MOUSE.PAN;
  this.mouseButtons.RIGHT = three4.MOUSE.ROTATE;
  this.touches.ONE = three4.TOUCH.PAN;
  this.touches.TWO = three4.TOUCH.DOLLY_ROTATE;
};
MapControls.prototype = Object.create(three4.EventDispatcher.prototype);
MapControls.prototype.constructor = MapControls;

// src/cubing/twisty/dom/viewers/TwistyOrbitControls.ts
const INERTIA_DEFAULT = true;
class TwistyOrbitControls {
  constructor(camera, canvas2, scheduleRender) {
    this.camera = camera;
    this.scheduleRender = scheduleRender;
    this.threeOrbitControls = new OrbitControls(camera, canvas2);
    this.threeOrbitControls.enableDamping = INERTIA_DEFAULT;
    this.threeOrbitControls.rotateSpeed = 0.5;
    this.threeOrbitControls.enablePan = false;
    this.threeOrbitControls.enableZoom = false;
    const eventHandler = this.onOrbitControlEvent.bind(this);
    this.threeOrbitControls.addEventListener("start", eventHandler);
    this.threeOrbitControls.addEventListener("change", eventHandler);
    this.threeOrbitControls.addEventListener("end", eventHandler);
  }
  setInertia(enabled) {
    this.threeOrbitControls.enableDamping = enabled;
  }
  onOrbitControlEvent() {
    this.scheduleRender();
    this.mirrorControls?.updateMirroredCamera(this.camera);
  }
  setMirror(m2) {
    this.mirrorControls = m2;
  }
  updateMirroredCamera(c) {
    this.camera.position.copy(c.position);
    this.camera.position.multiplyScalar(-1);
    this.scheduleRender();
  }
  updateAndSchedule() {
    if (this.threeOrbitControls.update()) {
      this.scheduleRender();
    }
  }
}

// src/vendor/node_modules/three/examples/jsm/libs/stats.module.js
var Stats = function() {
  var mode = 0;
  var container = document.createElement("div");
  container.style.cssText = "position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";
  container.addEventListener("click", function(event) {
    event.preventDefault();
    showPanel(++mode % container.children.length);
  }, false);
  function addPanel(panel) {
    container.appendChild(panel.dom);
    return panel;
  }
  function showPanel(id) {
    for (var i2 = 0; i2 < container.children.length; i2++) {
      container.children[i2].style.display = i2 === id ? "block" : "none";
    }
    mode = id;
  }
  var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;
  var fpsPanel = addPanel(new Stats.Panel("FPS", "#0ff", "#002"));
  var msPanel = addPanel(new Stats.Panel("MS", "#0f0", "#020"));
  if (self.performance && self.performance.memory) {
    var memPanel = addPanel(new Stats.Panel("MB", "#f08", "#201"));
  }
  showPanel(0);
  return {
    REVISION: 16,
    dom: container,
    addPanel,
    showPanel,
    begin: function() {
      beginTime = (performance || Date).now();
    },
    end: function() {
      frames++;
      var time = (performance || Date).now();
      msPanel.update(time - beginTime, 200);
      if (time >= prevTime + 1e3) {
        fpsPanel.update(frames * 1e3 / (time - prevTime), 100);
        prevTime = time;
        frames = 0;
        if (memPanel) {
          var memory = performance.memory;
          memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
        }
      }
      return time;
    },
    update: function() {
      beginTime = this.end();
    },
    domElement: container,
    setMode: showPanel
  };
};
Stats.Panel = function(name6, fg, bg) {
  var min = Infinity, max = 0, round = Math.round;
  var PR = round(window.devicePixelRatio || 1);
  var WIDTH = 80 * PR, HEIGHT = 48 * PR, TEXT_X = 3 * PR, TEXT_Y = 2 * PR, GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR, GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;
  var canvas2 = document.createElement("canvas");
  canvas2.width = WIDTH;
  canvas2.height = HEIGHT;
  canvas2.style.cssText = "width:80px;height:48px";
  var context = canvas2.getContext("2d");
  context.font = "bold " + 9 * PR + "px Helvetica,Arial,sans-serif";
  context.textBaseline = "top";
  context.fillStyle = bg;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = fg;
  context.fillText(name6, TEXT_X, TEXT_Y);
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
  context.fillStyle = bg;
  context.globalAlpha = 0.9;
  context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
  return {
    dom: canvas2,
    update: function(value, maxValue) {
      min = Math.min(min, value);
      max = Math.max(max, value);
      context.fillStyle = bg;
      context.globalAlpha = 1;
      context.fillRect(0, 0, WIDTH, GRAPH_Y);
      context.fillStyle = fg;
      context.fillText(round(value) + " " + name6 + " (" + round(min) + "-" + round(max) + ")", TEXT_X, TEXT_Y);
      context.drawImage(canvas2, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
      context.fillStyle = bg;
      context.globalAlpha = 0.9;
      context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
    }
  };
};
var stats_module_default = Stats;

// src/cubing/twisty/dom/viewers/Twisty3DCanvas.ts
let SHOW_STATS = false;
function experimentalShowRenderStats(show) {
  SHOW_STATS = show;
}
let resizeObserverWarningShown = false;
let shareAllNewRenderers = false;
function experimentalSetShareAllNewRenderers(share) {
  shareAllNewRenderers = share;
}
let sharedRenderer = null;
function newRenderer() {
  return new three5.WebGLRenderer({
    antialias: true,
    alpha: true
  });
}
function newSharedRenderer() {
  return sharedRenderer ?? (sharedRenderer = newRenderer());
}
class Twisty3DCanvas2 extends ManagedCustomElement {
  constructor(scene, options = {}) {
    super();
    this.legacyExperimentalShift = 0;
    this.scheduler = new RenderScheduler(this.render.bind(this));
    this.resizePending = false;
    this.stats = null;
    this.#invisible = false;
    this.addCSS(twisty3DCanvasCSS);
    this.scene = scene;
    this.scene.addRenderTarget(this);
    if (SHOW_STATS) {
      this.stats = stats_module_default();
      this.stats.dom.style.position = "absolute";
      this.addElement(this.stats.dom);
    }
    this.rendererIsShared = shareAllNewRenderers;
    this.renderer = this.rendererIsShared ? newSharedRenderer() : newRenderer();
    this.canvas = this.rendererIsShared ? document.createElement("canvas") : this.renderer.domElement;
    this.canvas2DContext = this.canvas.getContext("2d");
    this.addElement(this.canvas);
    this.camera = new three5.PerspectiveCamera(20, 1, 0.1, 1e3);
    this.camera.position.copy(options.cameraPosition ?? new three5.Vector3(2, 4, 4));
    if (options.negateCameraPosition) {
      this.camera.position.multiplyScalar(-1);
    }
    this.camera.lookAt(new three5.Vector3(0, 0, 0));
    this.orbitControls = new TwistyOrbitControls(this.camera, this.canvas, this.scheduleRender.bind(this));
    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(this.onResize.bind(this));
      observer.observe(this.contentWrapper);
    } else {
      this.scheduleRender();
      if (!resizeObserverWarningShown) {
        console.warn("You are using an older browser that does not support `ResizeObserver`. Displayed puzzles will not be rescaled.");
        resizeObserverWarningShown = true;
      }
    }
  }
  #invisible;
  setMirror(partner) {
    this.orbitControls.setMirror(partner.orbitControls);
    partner.orbitControls.setMirror(this.orbitControls);
  }
  connectedCallback() {
    this.resize();
    this.render();
  }
  scheduleRender() {
    this.scheduler.requestAnimFrame();
  }
  makeInvisibleUntilRender() {
    this.contentWrapper.classList.add("invisible");
    this.#invisible = true;
  }
  render() {
    this.stats?.begin();
    this.scheduler.cancelAnimFrame();
    if (this.resizePending) {
      this.resize();
    }
    this.orbitControls.updateAndSchedule();
    if (this.rendererIsShared) {
      this.renderer.setSize(this.canvas.width, this.canvas.height, false);
      this.canvas2DContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.renderer.render(this.scene, this.camera);
    if (this.rendererIsShared) {
      this.canvas2DContext.drawImage(this.renderer.domElement, 0, 0);
    }
    if (this.#invisible) {
      this.contentWrapper.classList.remove("invisible");
    }
    this.stats?.end();
  }
  onResize() {
    this.resizePending = true;
    this.scheduleRender();
  }
  resize() {
    this.resizePending = false;
    const w = this.contentWrapper.clientWidth;
    const h = this.contentWrapper.clientHeight;
    let off = 0;
    if (this.legacyExperimentalShift > 0) {
      off = Math.max(0, Math.floor((w - h) * 0.5));
    } else if (this.legacyExperimentalShift < 0) {
      off = -Math.max(0, Math.floor((w - h) * 0.5));
    }
    let yoff = 0;
    let excess = 0;
    if (h > w) {
      excess = h - w;
      yoff = -Math.floor(0.5 * excess);
    }
    this.camera.aspect = w / h;
    this.camera.setViewOffset(w, h - excess, off, yoff, w, h);
    this.camera.updateProjectionMatrix();
    if (this.rendererIsShared) {
      this.canvas.width = w * pixelRatio();
      this.canvas.height = h * pixelRatio();
      this.canvas.style.width = w.toString();
      this.canvas.style.height = w.toString();
    } else {
      this.renderer.setPixelRatio(pixelRatio());
      this.renderer.setSize(w, h, true);
    }
    this.scheduleRender();
  }
  renderToDataURL(options = {}) {
    this.render();
    if (!options.squareCrop || this.canvas.width === this.canvas.height) {
      return this.canvas.toDataURL();
    } else {
      const tempCanvas = document.createElement("canvas");
      const squareSize = Math.min(this.canvas.width, this.canvas.height);
      tempCanvas.width = squareSize;
      tempCanvas.height = squareSize;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(this.canvas, -(this.canvas.width - squareSize) / 2, -(this.canvas.height - squareSize) / 2);
      return tempCanvas.toDataURL();
    }
  }
}
customElementsShim.define("twisty-3d-canvas", Twisty3DCanvas2);

// app/twizzle/move-counter.ts
class MoveCounter extends TraversalUp {
  constructor(metric) {
    super();
    this.metric = metric;
  }
  traverseSequence(sequence) {
    let r3 = 0;
    for (let i2 = 0; i2 < sequence.nestedUnits.length; i2++) {
      r3 += this.traverse(sequence.nestedUnits[i2]);
    }
    return r3;
  }
  traverseGroup(group) {
    return this.traverse(group.nestedSequence) * Math.abs(group.amount);
  }
  traverseBlockMove(move) {
    return this.metric(move);
  }
  traverseCommutator(commutator) {
    return Math.abs(commutator.amount) * 2 * (this.traverse(commutator.A) + this.traverse(commutator.B));
  }
  traverseConjugate(conjugate) {
    return Math.abs(conjugate.amount) * (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B));
  }
  traversePause(_pause) {
    return 0;
  }
  traverseNewLine(_newLine) {
    return 0;
  }
  traverseComment(_comment) {
    return 0;
  }
}
function isCharUppercase(c) {
  return "A" <= c && c <= "Z";
}
function baseMetric(move) {
  const fam = move.family;
  if (isCharUppercase(fam[0]) && fam[fam.length - 1] === "v" || fam === "x" || fam === "y" || fam === "z") {
    return 0;
  } else {
    return 1;
  }
}
const baseCounter = new MoveCounter(baseMetric);
const countMoves = baseCounter.traverse.bind(baseCounter);

// src/cubing/twisty/3D/puzzles/Cube3D.ts
const three8 = __toModule(require("three"));

// src/cubing/twisty/animation/easing.ts
function smootherStep(x) {
  return x * x * x * (10 - x * (15 - 6 * x));
}

// src/cubing/twisty/dom/TwistyPlayerConfig.ts
const three7 = __toModule(require("three"));

// src/cubing/twisty/dom/element/ElementConfig.ts
const three6 = __toModule(require("three"));
class AlgAttribute {
  constructor(initialValue) {
    this.setValue(initialValue ?? this.defaultValue());
  }
  setString(str) {
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = this.toValue(str);
    return true;
  }
  setValue(val) {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }
  defaultValue() {
    return new Sequence([]);
  }
  toValue(s) {
    return parse2(s);
  }
  toString(s) {
    return algToString(s);
  }
}
class StringEnumAttribute {
  constructor(enumVal, initialValue) {
    this.enumVal = enumVal;
    this.setString(initialValue ?? this.defaultValue());
  }
  setString(str) {
    if (this.string === str) {
      return false;
    }
    if (!(str in this.enumVal)) {
      throw new Error(`Invalid string for attribute!: ${str}`);
    }
    this.string = str;
    this.value = this.toValue(str);
    return true;
  }
  setValue(val) {
    return this.setString(val);
  }
  defaultValue() {
    return Object.keys(this.enumVal)[0];
  }
  toValue(s) {
    return s;
  }
}
class Vector3Attribute {
  #defaultValue;
  constructor(defaultValue, initialValue) {
    this.#defaultValue = defaultValue;
    this.setValue(initialValue ?? this.defaultValue());
  }
  setString(str) {
    return this.setValue(str === "" ? null : this.toValue(str));
  }
  setValue(val) {
    const str = this.toString(val);
    if (this.string === str) {
      return false;
    }
    this.string = str;
    this.value = val;
    return true;
  }
  defaultValue() {
    return this.#defaultValue;
  }
  toValue(s) {
    if (!s.startsWith("[")) {
      throw new Error("TODO");
    }
    if (!s.endsWith("]")) {
      throw new Error("TODO");
    }
    const coords = s.slice(1, s.length - 1).split(",");
    if (coords.length !== 3) {
      throw new Error("TODO");
    }
    const [x, y, z] = coords.map((c) => parseInt(c, 10));
    return new three6.Vector3(x, y, z);
  }
  toString(v) {
    return v ? `[${v.x}, ${v.y}, ${v.z}]` : "";
  }
}

// src/cubing/twisty/dom/element/ClassListManager.ts
class ClassListManager {
  constructor(elem, prefix, validSuffixes) {
    this.elem = elem;
    this.prefix = prefix;
    this.validSuffixes = validSuffixes;
    this.#currentClassName = null;
  }
  #currentClassName;
  clearValue() {
    if (this.#currentClassName) {
      this.elem.contentWrapper.classList.remove(this.#currentClassName);
    }
    this.#currentClassName = null;
  }
  setValue(suffix) {
    if (!this.validSuffixes.includes(suffix)) {
      throw new Error(`Invalid suffix: ${suffix}`);
    }
    const newClassName = `${this.prefix}${suffix}`;
    const changed = this.#currentClassName !== newClassName;
    if (changed) {
      this.clearValue();
      this.elem.contentWrapper.classList.add(newClassName);
      this.#currentClassName = newClassName;
    }
    return changed;
  }
}

// src/cubing/twisty/dom/viewers/TwistyViewerWrapper.css.ts
const twistyViewerWrapperCSS = new CSSSource(`
.wrapper {
  display: grid;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.wrapper.back-view-side-by-side {
  grid-template-columns: 1fr 1fr;
}

.wrapper > * {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wrapper.back-view-upper-right > :nth-child(2) {
  position: absolute;
  right: 0;
  top: 0;
  width: 25%;
  height: 25%;
}
`);

// src/cubing/twisty/dom/viewers/TwistyViewerWrapper.ts
const backViewLayouts = {
  none: true,
  "side-by-side": true,
  "upper-right": true
};
class TwistyViewerWrapper2 extends ManagedCustomElement {
  constructor(config = {}) {
    super();
    this.#backViewClassListManager = new ClassListManager(this, "back-view-", [
      "none",
      "side-by-side",
      "upper-right"
    ]);
    this.addCSS(twistyViewerWrapperCSS);
    if (config.backView && config.backView in backViewLayouts) {
      this.#backViewClassListManager.setValue(config.backView);
    }
  }
  #backViewClassListManager;
  setBackView(backView) {
    return this.#backViewClassListManager.setValue(backView);
  }
}
customElementsShim.define("twisty-viewer-wrapper", TwistyViewerWrapper2);

// src/cubing/twisty/dom/TwistyPlayerConfig.ts
const DEFAULT_CAMERA_Z = 5;
const DEFAULT_CAMERA_Y = DEFAULT_CAMERA_Z * (2 / (1 + Math.sqrt(5)));
const centeredCameraPosition = new three7.Vector3(0, DEFAULT_CAMERA_Y, DEFAULT_CAMERA_Z);
const cubeCameraPosition = new three7.Vector3(3, 4, 5);
const visualizationFormats = {
  "3D": true,
  "2D": true,
  PG3D: true
};
const backgroundThemes = {
  checkered: true,
  none: true
};
const hintFaceletStyles = {
  floating: true,
  none: true
};
const experimentalStickerings = {
  full: true,
  "centers-only": true,
  PLL: true,
  CLS: true,
  OLL: true,
  ELS: true,
  LL: true,
  F2L: true,
  ZBLL: true,
  ZBLS: true,
  WVLS: true,
  VLS: true,
  LS: true,
  EO: true,
  CMLL: true,
  L6E: true,
  L6EO: true,
  Daisy: true,
  Cross: true,
  "2x2x2": true,
  "2x2x3": true,
  "Void Cube": true
};
const controlsLocations = {
  "bottom-row": true,
  none: true
};
const puzzleIDs = {
  "3x3x3": true,
  custom: true,
  "2x2x2": true,
  "4x4x4": true,
  "5x5x5": true,
  "6x6x6": true,
  "7x7x7": true,
  megaminx: true,
  pyraminx: true,
  sq1: true,
  clock: true,
  skewb: true,
  FTO: true
};
const twistyPlayerAttributeMap = {
  alg: "alg",
  "experimental-start-setup": "experimentalStartSetup",
  puzzle: "puzzle",
  visualization: "visualization",
  "hint-facelets": "hintFacelets",
  "experimental-stickering": "experimentalStickering",
  background: "background",
  controls: "controls",
  "back-view": "backView",
  "camera-position": "cameraPosition"
};
class TwistyPlayerConfig {
  constructor(twistyPlayer, initialValues) {
    this.twistyPlayer = twistyPlayer;
    this.attributes = {
      alg: new AlgAttribute(initialValues.alg),
      "experimental-start-setup": new AlgAttribute(initialValues.experimentalStartSetup),
      puzzle: new StringEnumAttribute(puzzleIDs, initialValues.puzzle),
      visualization: new StringEnumAttribute(visualizationFormats, initialValues.visualization),
      "hint-facelets": new StringEnumAttribute(hintFaceletStyles, initialValues.hintFacelets),
      "experimental-stickering": new StringEnumAttribute(experimentalStickerings, initialValues.experimentalStickering),
      background: new StringEnumAttribute(backgroundThemes, initialValues.background),
      controls: new StringEnumAttribute(controlsLocations, initialValues.controls),
      "back-view": new StringEnumAttribute(backViewLayouts, initialValues["backView"]),
      "camera-position": new Vector3Attribute(null, initialValues["cameraPosition"])
    };
  }
  static get observedAttributes() {
    return Object.keys(twistyPlayerAttributeMap);
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    const managedAttribute = this.attributes[attributeName];
    if (managedAttribute) {
      if (oldValue !== null && managedAttribute.string !== oldValue) {
        console.warn("Attribute out of sync!", attributeName, managedAttribute.string, oldValue);
      }
      managedAttribute.setString(newValue);
      const propertyName = twistyPlayerAttributeMap[attributeName];
      this.twistyPlayer[propertyName] = managedAttribute.value;
    }
  }
}

// src/cubing/twisty/3D/TAU.ts
const TAU = Math.PI * 2;

// src/cubing/twisty/3D/puzzles/stickerings.ts
const r = {
  facelets: ["regular", "regular", "regular"]
};
const d = {
  facelets: ["dim", "dim", "dim"]
};
const di = {
  facelets: ["dim", "ignored", "ignored"]
};
const p = {
  facelets: ["dim", "regular", "regular"]
};
const o = {
  facelets: ["regular", "ignored", "ignored"]
};
const i = {
  facelets: ["ignored", "ignored", "ignored"]
};
const oi = {
  facelets: ["oriented", "ignored", "ignored"]
};
const invis = {
  facelets: ["invisible", "invisible", "invisible"]
};
const stickerings = {
  full: {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, r, r, r, r, r, r, r]
      },
      CORNERS: {
        pieces: [r, r, r, r, r, r, r, r]
      },
      CENTERS: {
        pieces: [r, r, r, r, r, r]
      }
    }
  },
  "centers-only": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, i, i, i, i, i, i, i]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i]
      },
      CENTERS: {
        pieces: [r, r, r, r, r, r]
      }
    }
  },
  PLL: {
    orbits: {
      EDGES: {
        pieces: [p, p, p, p, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [p, p, p, p, d, d, d, d]
      },
      CENTERS: {
        pieces: [p, d, d, d, d, d]
      }
    }
  },
  CLS: {
    orbits: {
      EDGES: {
        pieces: [di, di, di, di, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [o, o, o, o, o, d, d, d]
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d]
      }
    }
  },
  OLL: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [o, o, o, o, d, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  ELS: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  LL: {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  F2L: {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, r, r, r, r, r, r, r]
      },
      CORNERS: {
        pieces: [i, i, i, i, r, r, r, r]
      },
      CENTERS: {
        pieces: [d, r, r, r, r, r]
      }
    }
  },
  ZBLL: {
    orbits: {
      EDGES: {
        pieces: [p, p, p, p, d, d, d, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  ZBLS: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [i, i, i, i, r, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  WVLS: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [o, o, o, o, r, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  VLS: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [o, o, o, o, r, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d]
      }
    }
  },
  LS: {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, d, d, d, d, r, d, d, d]
      },
      CORNERS: {
        pieces: [i, i, i, i, r, d, d, d]
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d]
      }
    }
  },
  EO: {
    orbits: {
      EDGES: {
        pieces: [oi, oi, oi, oi, oi, oi, oi, oi, oi, oi, oi, oi]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i]
      }
    }
  },
  CMLL: {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, d, i, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d]
      },
      CENTERS: {
        pieces: [i, d, i, d, i, i]
      }
    }
  },
  L6E: {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, d, r, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [d, d, d, d, d, d, d, d]
      },
      CENTERS: {
        pieces: [r, d, r, d, r, r]
      }
    }
  },
  L6EO: {
    orbits: {
      EDGES: {
        pieces: [oi, oi, oi, oi, oi, d, oi, d, d, d, d, d]
      },
      CORNERS: {
        pieces: [d, d, d, d, d, d, d, d]
      },
      CENTERS: {
        pieces: [oi, d, i, d, i, oi]
      }
    }
  },
  Daisy: {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, i, i, i, i, i, i, i, i]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i]
      },
      CENTERS: {
        pieces: [d, d, d, d, d, o]
      }
    }
  },
  Cross: {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, r, r, r, i, i, i, i]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i]
      },
      CENTERS: {
        pieces: [d, d, d, d, d, r]
      }
    }
  },
  "2x2x2": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, i, r, r, i, i, i, r]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, r, i]
      },
      CENTERS: {
        pieces: [d, r, d, d, r, r]
      }
    }
  },
  "2x2x3": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, i, d, d, i, r, i, d]
      },
      CORNERS: {
        pieces: [i, i, i, i, i, r, d, i]
      },
      CENTERS: {
        pieces: [d, d, r, d, d, d]
      }
    }
  },
  "Void Cube": {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, r, r, r, r, r, r, r]
      },
      CORNERS: {
        pieces: [r, r, r, r, r, r, r, r]
      },
      CENTERS: {
        pieces: [invis, invis, invis, invis, invis, invis]
      }
    }
  }
};

// src/cubing/twisty/3D/puzzles/Cube3D.ts
const ignoredMaterial = new three8.MeshBasicMaterial({
  color: 4473924,
  side: three8.DoubleSide
});
const ignoredMaterialHint = new three8.MeshBasicMaterial({
  color: 13421772,
  side: three8.BackSide
});
const invisibleMaterial = new three8.MeshBasicMaterial({
  visible: false
});
const orientedMaterial = new three8.MeshBasicMaterial({
  color: 16746751
});
const orientedMaterialHint = new three8.MeshBasicMaterial({
  color: 16746751,
  side: three8.BackSide
});
class AxisInfo {
  constructor(vector, fromZ, color, dimColor) {
    this.vector = vector;
    this.fromZ = fromZ;
    this.color = color;
    this.dimColor = dimColor;
    this.stickerMaterial = {
      regular: new three8.MeshBasicMaterial({
        color,
        side: three8.DoubleSide
      }),
      dim: new three8.MeshBasicMaterial({
        color: dimColor,
        side: three8.DoubleSide
      }),
      oriented: orientedMaterial,
      ignored: ignoredMaterial,
      invisible: invisibleMaterial
    };
    this.hintStickerMaterial = {
      regular: new three8.MeshBasicMaterial({
        color,
        side: three8.BackSide
      }),
      dim: new three8.MeshBasicMaterial({
        color: dimColor,
        side: three8.BackSide,
        transparent: true,
        opacity: 0.75
      }),
      oriented: orientedMaterialHint,
      ignored: ignoredMaterialHint,
      invisible: invisibleMaterial
    };
  }
}
const axesInfo = [
  new AxisInfo(new three8.Vector3(0, 1, 0), new three8.Euler(-TAU / 4, 0, 0), 16777215, 14540253),
  new AxisInfo(new three8.Vector3(-1, 0, 0), new three8.Euler(0, -TAU / 4, 0), 16746496, 8930304),
  new AxisInfo(new three8.Vector3(0, 0, 1), new three8.Euler(0, 0, 0), 65280, 34816),
  new AxisInfo(new three8.Vector3(1, 0, 0), new three8.Euler(0, TAU / 4, 0), 16711680, 6684672),
  new AxisInfo(new three8.Vector3(0, 0, -1), new three8.Euler(0, TAU / 2, 0), 255, 136),
  new AxisInfo(new three8.Vector3(0, -1, 0), new three8.Euler(TAU / 4, 0, 0), 16776960, 8947712)
];
const face = {
  U: 0,
  L: 1,
  F: 2,
  R: 3,
  B: 4,
  D: 5
};
const familyToAxis = {
  U: face.U,
  u: face.U,
  y: face.U,
  L: face.L,
  l: face.L,
  M: face.L,
  F: face.F,
  f: face.F,
  S: face.F,
  z: face.F,
  R: face.R,
  r: face.R,
  x: face.R,
  B: face.B,
  b: face.B,
  D: face.D,
  d: face.D,
  E: face.D
};
const cubieDimensions = {
  stickerWidth: 0.85,
  stickerElevation: 0.501,
  foundationWidth: 1,
  hintStickerElevation: 1.45
};
const cube3DOptionsDefaults = {
  showMainStickers: true,
  hintFacelets: "floating",
  showFoundation: true,
  experimentalStickering: "full"
};
const blackMesh = new three8.MeshBasicMaterial({
  color: 0,
  opacity: 0.3,
  transparent: true
});
class CubieDef {
  constructor(orbit, stickerFaceNames, q) {
    this.orbit = orbit;
    const individualStickerFaceNames = typeof stickerFaceNames === "string" ? stickerFaceNames.split("") : stickerFaceNames;
    this.stickerFaces = individualStickerFaceNames.map((s) => face[s]);
    this.matrix = new three8.Matrix4();
    this.matrix.setPosition(firstPiecePosition[orbit]);
    this.matrix.premultiply(new three8.Matrix4().makeRotationFromQuaternion(q));
  }
}
function t(v, t4) {
  return new three8.Quaternion().setFromAxisAngle(v, TAU * t4 / 4);
}
const r2 = {
  O: new three8.Vector3(0, 0, 0),
  U: new three8.Vector3(0, -1, 0),
  L: new three8.Vector3(1, 0, 0),
  F: new three8.Vector3(0, 0, -1),
  R: new three8.Vector3(-1, 0, 0),
  B: new three8.Vector3(0, 0, 1),
  D: new three8.Vector3(0, 1, 0)
};
const firstPiecePosition = {
  EDGES: new three8.Vector3(0, 1, 1),
  CORNERS: new three8.Vector3(1, 1, 1),
  CENTERS: new three8.Vector3(0, 1, 0)
};
const orientationRotation = {
  EDGES: [0, 1].map((i2) => new three8.Matrix4().makeRotationAxis(firstPiecePosition.EDGES.clone().normalize(), -i2 * TAU / 2)),
  CORNERS: [0, 1, 2].map((i2) => new three8.Matrix4().makeRotationAxis(firstPiecePosition.CORNERS.clone().normalize(), -i2 * TAU / 3)),
  CENTERS: [0, 1, 2, 3].map((i2) => new three8.Matrix4().makeRotationAxis(firstPiecePosition.CENTERS.clone().normalize(), -i2 * TAU / 4))
};
const cubieStickerOrder = [face.U, face.F, face.R];
const pieceDefs = {
  EDGES: [
    new CubieDef("EDGES", "UF", t(r2.O, 0)),
    new CubieDef("EDGES", "UR", t(r2.U, 3)),
    new CubieDef("EDGES", "UB", t(r2.U, 2)),
    new CubieDef("EDGES", "UL", t(r2.U, 1)),
    new CubieDef("EDGES", "DF", t(r2.F, 2)),
    new CubieDef("EDGES", "DR", t(r2.F, 2).premultiply(t(r2.D, 1))),
    new CubieDef("EDGES", "DB", t(r2.F, 2).premultiply(t(r2.D, 2))),
    new CubieDef("EDGES", "DL", t(r2.F, 2).premultiply(t(r2.D, 3))),
    new CubieDef("EDGES", "FR", t(r2.U, 3).premultiply(t(r2.R, 3))),
    new CubieDef("EDGES", "FL", t(r2.U, 1).premultiply(t(r2.R, 3))),
    new CubieDef("EDGES", "BR", t(r2.U, 3).premultiply(t(r2.R, 1))),
    new CubieDef("EDGES", "BL", t(r2.U, 1).premultiply(t(r2.R, 1)))
  ],
  CORNERS: [
    new CubieDef("CORNERS", "UFR", t(r2.O, 0)),
    new CubieDef("CORNERS", "URB", t(r2.U, 3)),
    new CubieDef("CORNERS", "UBL", t(r2.U, 2)),
    new CubieDef("CORNERS", "ULF", t(r2.U, 1)),
    new CubieDef("CORNERS", "DRF", t(r2.F, 2).premultiply(t(r2.D, 1))),
    new CubieDef("CORNERS", "DFL", t(r2.F, 2).premultiply(t(r2.D, 0))),
    new CubieDef("CORNERS", "DLB", t(r2.F, 2).premultiply(t(r2.D, 3))),
    new CubieDef("CORNERS", "DBR", t(r2.F, 2).premultiply(t(r2.D, 2)))
  ],
  CENTERS: [
    new CubieDef("CENTERS", "U", t(r2.O, 0)),
    new CubieDef("CENTERS", "L", t(r2.R, 3).premultiply(t(r2.U, 1))),
    new CubieDef("CENTERS", "F", t(r2.R, 3)),
    new CubieDef("CENTERS", "R", t(r2.R, 3).premultiply(t(r2.D, 1))),
    new CubieDef("CENTERS", "B", t(r2.R, 3).premultiply(t(r2.D, 2))),
    new CubieDef("CENTERS", "D", t(r2.R, 2))
  ]
};
const CUBE_SCALE = 1 / 3;
class Cube3D extends three8.Object3D {
  constructor(cursor, scheduleRenderCallback, options = {}) {
    super();
    this.scheduleRenderCallback = scheduleRenderCallback;
    this.pieces = {};
    this.experimentalHintStickerMeshes = [];
    this.experimentalFoundationMeshes = [];
    const def2 = Puzzles["3x3x3"];
    this.options = {};
    for (const key in cube3DOptionsDefaults) {
      this.options[key] = key in options ? options[key] : cube3DOptionsDefaults[key];
    }
    if (def2.name !== "3x3x3") {
      throw new Error("Invalid puzzle for this Cube3D implementation.");
    }
    this.kpuzzleFaceletInfo = {};
    for (const orbit in pieceDefs) {
      const orbitFaceletInfo = [];
      this.kpuzzleFaceletInfo[orbit] = orbitFaceletInfo;
      this.pieces[orbit] = pieceDefs[orbit].map(this.createCubie.bind(this, orbitFaceletInfo));
    }
    this.scale.set(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE);
    if (options.experimentalStickering) {
      this.setAppearance(stickerings[options.experimentalStickering]);
    }
    cursor.addPositionListener(this);
  }
  setAppearance(appearance) {
    for (const [orbitName, orbitAppearance] of Object.entries(appearance.orbits)) {
      for (let pieceIdx = 0; pieceIdx < orbitAppearance.pieces.length; pieceIdx++) {
        const pieceAppearance = orbitAppearance.pieces[pieceIdx];
        if (pieceAppearance) {
          const pieceInfo = this.kpuzzleFaceletInfo[orbitName][pieceIdx];
          for (let faceletIdx = 0; faceletIdx < pieceInfo.length; faceletIdx++) {
            const faceletAppearance = pieceAppearance.facelets[faceletIdx];
            if (faceletAppearance) {
              const faceletInfo = pieceInfo[faceletIdx];
              const appearance2 = typeof faceletAppearance === "string" ? faceletAppearance : faceletAppearance?.appearance;
              faceletInfo.facelet.material = axesInfo[faceletInfo.faceIdx].stickerMaterial[appearance2];
              const hintAppearance = typeof faceletAppearance === "string" ? appearance2 : faceletAppearance.hintAppearance ?? appearance2;
              if (faceletInfo.hintFacelet) {
                faceletInfo.hintFacelet.material = axesInfo[faceletInfo.faceIdx].hintStickerMaterial[hintAppearance];
              }
            }
          }
        }
      }
    }
    if (this.scheduleRenderCallback) {
      this.scheduleRenderCallback();
    }
  }
  experimentalUpdateOptions(options) {
    if ("showMainStickers" in options) {
      throw new Error("Unimplemented");
    }
    const showFoundation = options.showFoundation;
    if (typeof showFoundation !== "undefined" && this.options.showFoundation !== showFoundation) {
      this.options.showFoundation = showFoundation;
      for (const foundation of this.experimentalFoundationMeshes) {
        foundation.visible = showFoundation;
      }
    }
    const hintFacelets = options.hintFacelets;
    if (typeof hintFacelets !== "undefined" && this.options.hintFacelets !== hintFacelets && hintFaceletStyles[hintFacelets]) {
      this.options.hintFacelets = hintFacelets;
      for (const hintSticker of this.experimentalHintStickerMeshes) {
        hintSticker.visible = hintFacelets === "floating";
      }
      this.scheduleRenderCallback();
    }
    const experimentalStickering = options.experimentalStickering;
    if (typeof experimentalStickering !== "undefined" && this.options.experimentalStickering !== experimentalStickering && experimentalStickerings[experimentalStickering]) {
      this.options.experimentalStickering = experimentalStickering;
      this.setAppearance(stickerings[experimentalStickering]);
      this.scheduleRenderCallback();
    }
  }
  onPositionChange(p2) {
    const reid333 = p2.state;
    for (const orbit in pieceDefs) {
      const pieces = pieceDefs[orbit];
      for (let i2 = 0; i2 < pieces.length; i2++) {
        const j = reid333[orbit].permutation[i2];
        this.pieces[orbit][j].matrix.copy(pieceDefs[orbit][i2].matrix);
        this.pieces[orbit][j].matrix.multiply(orientationRotation[orbit][reid333[orbit].orientation[i2]]);
      }
      for (const moveProgress of p2.movesInProgress) {
        const blockMove = moveProgress.move;
        const turnNormal = axesInfo[familyToAxis[blockMove.family]].vector;
        const moveMatrix = new three8.Matrix4().makeRotationAxis(turnNormal, -this.ease(moveProgress.fraction) * moveProgress.direction * blockMove.amount * TAU / 4);
        for (let i2 = 0; i2 < pieces.length; i2++) {
          const k = Puzzles["3x3x3"].moves[blockMove.family][orbit].permutation[i2];
          if (i2 !== k || Puzzles["3x3x3"].moves[blockMove.family][orbit].orientation[i2] !== 0) {
            const j = reid333[orbit].permutation[i2];
            this.pieces[orbit][j].matrix.premultiply(moveMatrix);
          }
        }
      }
    }
    this.scheduleRenderCallback();
  }
  createCubie(orbitFacelets, piece) {
    const cubieFaceletInfo = [];
    orbitFacelets.push(cubieFaceletInfo);
    const cubie = new three8.Group();
    if (this.options.showFoundation) {
      const foundation = this.createCubieFoundation();
      cubie.add(foundation);
      this.experimentalFoundationMeshes.push(foundation);
    }
    for (let i2 = 0; i2 < piece.stickerFaces.length; i2++) {
      const sticker = this.createSticker(axesInfo[cubieStickerOrder[i2]], axesInfo[piece.stickerFaces[i2]], false);
      const faceletInfo = {
        faceIdx: piece.stickerFaces[i2],
        facelet: sticker
      };
      cubie.add(sticker);
      if (this.options.hintFacelets === "floating") {
        const hintSticker = this.createSticker(axesInfo[cubieStickerOrder[i2]], axesInfo[piece.stickerFaces[i2]], true);
        cubie.add(hintSticker);
        faceletInfo.hintFacelet = hintSticker;
        this.experimentalHintStickerMeshes.push(hintSticker);
      }
      cubieFaceletInfo.push(faceletInfo);
    }
    cubie.matrix.copy(piece.matrix);
    cubie.matrixAutoUpdate = false;
    this.add(cubie);
    return cubie;
  }
  createCubieFoundation() {
    const box = new three8.BoxGeometry(cubieDimensions.foundationWidth, cubieDimensions.foundationWidth, cubieDimensions.foundationWidth);
    return new three8.Mesh(box, blackMesh);
  }
  createSticker(posAxisInfo, materialAxisInfo, isHint) {
    const geo = new three8.PlaneGeometry(cubieDimensions.stickerWidth, cubieDimensions.stickerWidth);
    const stickerMesh = new three8.Mesh(geo, isHint ? materialAxisInfo.hintStickerMaterial.regular : materialAxisInfo.stickerMaterial.regular);
    stickerMesh.setRotationFromEuler(posAxisInfo.fromZ);
    stickerMesh.position.copy(posAxisInfo.vector);
    stickerMesh.position.multiplyScalar(isHint ? cubieDimensions.hintStickerElevation : cubieDimensions.stickerElevation);
    return stickerMesh;
  }
  ease(fraction) {
    return smootherStep(fraction);
  }
}

// src/cubing/twisty/3D/puzzles/PG3D.ts
const three9 = __toModule(require("three"));
const foundationMaterial = new three9.MeshBasicMaterial({
  side: three9.DoubleSide,
  color: 0
});
const stickerMaterial = new three9.MeshBasicMaterial({
  vertexColors: true
});
const polyMaterial = new three9.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  color: 0
});
function makePoly(coords, color) {
  const geo = new three9.Geometry();
  const vertind = [];
  for (const coord of coords) {
    const v = new three9.Vector3(coord[0], coord[1], coord[2]);
    vertind.push(geo.vertices.length);
    geo.vertices.push(v);
  }
  for (let g = 1; g + 1 < vertind.length; g++) {
    const face2 = new three9.Face3(vertind[0], vertind[g], vertind[g + 1]);
    face2.color = color;
    geo.faces.push(face2);
  }
  geo.computeFaceNormals();
  return geo;
}
class StickerDef {
  constructor(stickerDat, foundationDat) {
    this.origColor = new three9.Color(stickerDat.color);
    this.faceColor = new three9.Color(stickerDat.color);
    this.cubie = new three9.Group();
    this.geo = makePoly(stickerDat.coords, this.faceColor);
    const obj = new three9.Mesh(this.geo, stickerMaterial);
    obj.userData.name = stickerDat.orbit + " " + (1 + stickerDat.ord) + " " + stickerDat.ori;
    this.cubie.add(obj);
    if (foundationDat) {
      const fgeo = makePoly(foundationDat.coords, this.faceColor);
      const foundation = new three9.Mesh(fgeo, foundationMaterial);
      foundation.scale.setScalar(0.999);
      this.cubie.add(foundation);
    }
  }
  setColor(c) {
    this.geo.colorsNeedUpdate = true;
    this.faceColor.copy(c);
  }
}
class HitPlaneDef {
  constructor(hitface) {
    this.cubie = new three9.Group();
    this.geo = new three9.Geometry();
    const coords = hitface.coords;
    const vertind = [];
    for (const coord of coords) {
      const v = new three9.Vector3(coord[0], coord[1], coord[2]);
      vertind.push(this.geo.vertices.length);
      this.geo.vertices.push(v);
    }
    for (let g = 1; g + 1 < vertind.length; g++) {
      const face2 = new three9.Face3(vertind[0], vertind[g], vertind[g + 1]);
      this.geo.faces.push(face2);
    }
    this.geo.computeFaceNormals();
    const obj = new three9.Mesh(this.geo, polyMaterial);
    obj.userData.name = hitface.name;
    this.cubie.scale.setScalar(0.99);
    this.cubie.add(obj);
  }
}
class AxisInfo2 {
  constructor(axisDat) {
    const vec = axisDat[0];
    this.axis = new three9.Vector3(vec[0], vec[1], vec[2]);
    this.order = axisDat[2];
  }
}
const PG_SCALE = 0.5;
class PG3D extends three9.Object3D {
  constructor(cursor, scheduleRenderCallback, definition, pgdat, showFoundation = false) {
    super();
    this.scheduleRenderCallback = scheduleRenderCallback;
    this.definition = definition;
    this.pgdat = pgdat;
    this.stickerTargets = [];
    this.controlTargets = [];
    this.axesInfo = {};
    const axesDef = this.pgdat.axis;
    for (const axis of axesDef) {
      this.axesInfo[axis[1]] = new AxisInfo2(axis);
    }
    const stickers = this.pgdat.stickers;
    this.stickers = {};
    for (let si = 0; si < stickers.length; si++) {
      const sticker = stickers[si];
      const foundation = showFoundation ? this.pgdat.foundations[si] : void 0;
      const orbit = sticker.orbit;
      const ord = sticker.ord;
      const ori = sticker.ori;
      if (!this.stickers[orbit]) {
        this.stickers[orbit] = [];
      }
      if (!this.stickers[orbit][ori]) {
        this.stickers[orbit][ori] = [];
      }
      const stickerdef = new StickerDef(sticker, foundation);
      stickerdef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
      this.stickers[orbit][ori][ord] = stickerdef;
      this.add(stickerdef.cubie);
      this.stickerTargets.push(stickerdef.cubie.children[0]);
    }
    const hitfaces = this.pgdat.faces;
    for (const hitface of hitfaces) {
      const facedef = new HitPlaneDef(hitface);
      facedef.cubie.scale.set(PG_SCALE, PG_SCALE, PG_SCALE);
      this.add(facedef.cubie);
      this.controlTargets.push(facedef.cubie.children[0]);
    }
    cursor.addPositionListener(this);
  }
  experimentalGetStickerTargets() {
    return this.stickerTargets;
  }
  experimentalGetControlTargets() {
    return this.controlTargets;
  }
  onPositionChange(p2) {
    const pos = p2.state;
    const noRotation = new three9.Euler();
    for (const orbit in this.stickers) {
      const pieces = this.stickers[orbit];
      const pos2 = pos[orbit];
      const orin = pieces.length;
      for (let ori = 0; ori < orin; ori++) {
        const pieces2 = pieces[ori];
        for (let i2 = 0; i2 < pieces2.length; i2++) {
          pieces2[i2].cubie.rotation.copy(noRotation);
          const nori = (ori + orin - pos2.orientation[i2]) % orin;
          const ni = pos2.permutation[i2];
          pieces2[i2].setColor(pieces[nori][ni].origColor);
        }
      }
    }
    for (const moveProgress of p2.movesInProgress) {
      const externalBlockMove = moveProgress.move;
      const unswizzled = this.pgdat.unswizzle(externalBlockMove);
      const blockMove = this.pgdat.notationMapper.notationToInternal(externalBlockMove);
      const simpleMove = modifiedBlockMove(externalBlockMove, {amount: 1});
      const baseMove = stateForBlockMove(this.definition, simpleMove);
      const ax = this.axesInfo[unswizzled];
      const turnNormal = ax.axis;
      const angle = -this.ease(moveProgress.fraction) * moveProgress.direction * blockMove.amount * TAU / ax.order;
      for (const orbit in this.stickers) {
        const pieces = this.stickers[orbit];
        const orin = pieces.length;
        const bmv = baseMove[orbit];
        for (let ori = 0; ori < orin; ori++) {
          const pieces2 = pieces[ori];
          for (let i2 = 0; i2 < pieces2.length; i2++) {
            const ni = bmv.permutation[i2];
            if (ni !== i2 || bmv.orientation[i2] !== 0) {
              pieces2[i2].cubie.rotateOnAxis(turnNormal, angle);
            }
          }
        }
      }
    }
    this.scheduleRenderCallback();
  }
  ease(fraction) {
    return smootherStep(fraction);
  }
}

// src/cubing/twisty/3D/Twisty3DScene.ts
const three10 = __toModule(require("three"));
class Twisty3DScene extends three10.Scene {
  constructor() {
    super();
    this.renderTargets = new Set();
    this.twisty3Ds = new Set();
    const lights = [];
    lights[0] = new three10.PointLight(16777215, 1, 0);
    lights[1] = new three10.PointLight(16777215, 1, 0);
    lights[2] = new three10.PointLight(16777215, 1, 0);
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);
    this.add(lights[0]);
    this.add(lights[1]);
    this.add(lights[2]);
  }
  addRenderTarget(renderTarget) {
    this.renderTargets.add(renderTarget);
  }
  scheduleRender() {
    for (const renderTarget of this.renderTargets) {
      renderTarget.scheduleRender();
    }
  }
  addTwisty3DPuzzle(twisty3DPuzzle) {
    this.twisty3Ds.add(twisty3DPuzzle);
    this.add(twisty3DPuzzle);
  }
  removeTwisty3DPuzzle(twisty3DPuzzle) {
    this.twisty3Ds.delete(twisty3DPuzzle);
    this.remove(twisty3DPuzzle);
  }
}

// src/cubing/twisty/3D/puzzles/KPuzzleWrapper.ts
class PuzzleWrapper {
  multiply(state, amount) {
    if (amount < 0) {
      return this.invert(this.multiply(state, -amount));
    }
    let newState = this.identity();
    while (amount > 0) {
      if (amount % 2 === 1) {
        newState = this.combine(newState, state);
      }
      amount = Math.floor(amount / 2);
      state = this.combine(state, state);
    }
    return newState;
  }
}
class KPuzzleWrapper extends PuzzleWrapper {
  constructor(definition) {
    super();
    this.definition = definition;
    this.moveStash = {};
  }
  static fromID(id) {
    return new KPuzzleWrapper(Puzzles[id]);
  }
  startState() {
    return this.definition.startPieces;
  }
  invert(state) {
    return Invert2(this.definition, state);
  }
  combine(s1, s22) {
    return Combine(this.definition, s1, s22);
  }
  stateFromMove(blockMove) {
    const key = blockMoveToString(blockMove);
    if (!this.moveStash[key]) {
      this.moveStash[key] = stateForBlockMove(this.definition, blockMove);
    }
    return this.moveStash[key];
  }
  identity() {
    return IdentityTransformation(this.definition);
  }
  equivalent(s1, s22) {
    return EquivalentStates(this.definition, s1, s22);
  }
}

// src/cubing/twisty/animation/alg/CursorTypes.ts
var Direction;
(function(Direction2) {
  Direction2[Direction2["Forwards"] = 1] = "Forwards";
  Direction2[Direction2["Paused"] = 0] = "Paused";
  Direction2[Direction2["Backwards"] = -1] = "Backwards";
})(Direction || (Direction = {}));
function directionScalar(direction) {
  return direction;
}
var BoundaryType;
(function(BoundaryType2) {
  BoundaryType2[BoundaryType2["Move"] = 0] = "Move";
  BoundaryType2[BoundaryType2["EntireTimeline"] = 1] = "EntireTimeline";
})(BoundaryType || (BoundaryType = {}));
function DefaultDurationForAmount(amount) {
  switch (Math.abs(amount)) {
    case 0:
      return 0;
    case 1:
      return 1e3;
    case 2:
      return 1500;
    default:
      return 2e3;
  }
}

// src/cubing/twisty/animation/alg/AlgDuration.ts
class AlgDuration extends TraversalUp {
  constructor(durationForAmount = DefaultDurationForAmount) {
    super();
    this.durationForAmount = durationForAmount;
  }
  traverseSequence(sequence) {
    let total = 0;
    for (const alg18 of sequence.nestedUnits) {
      total += this.traverse(alg18);
    }
    return total;
  }
  traverseGroup(group) {
    return group.amount * this.traverse(group.nestedSequence);
  }
  traverseBlockMove(blockMove) {
    return this.durationForAmount(blockMove.amount);
  }
  traverseCommutator(commutator) {
    return commutator.amount * 2 * (this.traverse(commutator.A) + this.traverse(commutator.B));
  }
  traverseConjugate(conjugate) {
    return conjugate.amount * (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B));
  }
  traversePause(_pause) {
    return this.durationForAmount(1);
  }
  traverseNewLine(_newLine) {
    return this.durationForAmount(1);
  }
  traverseComment(_comment) {
    return this.durationForAmount(0);
  }
}

// src/cubing/twisty/animation/alg/AlgIndexer.ts
class CountAnimatedMoves extends TraversalUp {
  traverseSequence(sequence) {
    let total = 0;
    for (const part of sequence.nestedUnits) {
      total += this.traverse(part);
    }
    return total;
  }
  traverseGroup(group) {
    return this.traverseSequence(group.nestedSequence);
  }
  traverseBlockMove(_blockMove) {
    return 1;
  }
  traverseCommutator(commutator) {
    return 2 * (this.traverseSequence(commutator.A) + this.traverseSequence(commutator.B));
  }
  traverseConjugate(conjugate) {
    return 2 * this.traverseSequence(conjugate.A) + this.traverseSequence(conjugate.B);
  }
  traversePause(_pause) {
    return 0;
  }
  traverseNewLine(_newLine) {
    return 0;
  }
  traverseComment(_comment) {
    return 0;
  }
}
class AlgPartDecoration {
  constructor(_puz, moveCount, duration, forward, backward, children = []) {
    this.moveCount = moveCount;
    this.duration = duration;
    this.forward = forward;
    this.backward = backward;
    this.children = children;
  }
}
class DecoratorConstructor extends TraversalUp {
  constructor(puz) {
    super();
    this.puz = puz;
    this.durationFn = new AlgDuration(DefaultDurationForAmount);
    this.identity = puz.identity();
    this.dummyLeaf = new AlgPartDecoration(puz, 0, 0, this.identity, this.identity, []);
  }
  traverseSequence(sequence) {
    let moveCount = 0;
    let duration = 0;
    let state = this.identity;
    const child = [];
    for (const part of sequence.nestedUnits) {
      const apd = this.traverse(part);
      moveCount += apd.moveCount;
      duration += apd.duration;
      state = this.puz.combine(state, apd.forward);
      child.push(apd);
    }
    return new AlgPartDecoration(this.puz, moveCount, duration, state, this.puz.invert(state), child);
  }
  traverseGroup(group) {
    const dec = this.traverseSequence(group.nestedSequence);
    return this.mult(dec, group.amount, [dec]);
  }
  traverseBlockMove(blockMove) {
    return new AlgPartDecoration(this.puz, 1, this.durationFn.traverse(blockMove), this.puz.stateFromMove(blockMove), this.puz.stateFromMove(invertBlockMove(blockMove)));
  }
  traverseCommutator(commutator) {
    const decA = this.traverseSequence(commutator.A);
    const decB = this.traverseSequence(commutator.B);
    const AB = this.puz.combine(decA.forward, decB.forward);
    const ApBp = this.puz.combine(decA.backward, decB.backward);
    const ABApBp = this.puz.combine(AB, ApBp);
    const dec = new AlgPartDecoration(this.puz, 2 * (decA.moveCount + decB.moveCount), 2 * (decA.duration + decB.duration), ABApBp, this.puz.invert(ABApBp), [decA, decB]);
    return this.mult(dec, commutator.amount, [dec, decA, decB]);
  }
  traverseConjugate(conjugate) {
    const decA = this.traverseSequence(conjugate.A);
    const decB = this.traverseSequence(conjugate.B);
    const AB = this.puz.combine(decA.forward, decB.forward);
    const ABAp = this.puz.combine(AB, decA.backward);
    const dec = new AlgPartDecoration(this.puz, 2 * decA.moveCount + decB.moveCount, 2 * decA.duration + decB.duration, ABAp, this.puz.invert(ABAp), [decA, decB]);
    return this.mult(dec, conjugate.amount, [dec, decA, decB]);
  }
  traversePause(pause) {
    return new AlgPartDecoration(this.puz, 1, this.durationFn.traverse(pause), this.identity, this.identity);
  }
  traverseNewLine(_newLine) {
    return this.dummyLeaf;
  }
  traverseComment(_comment) {
    return this.dummyLeaf;
  }
  mult(apd, n, child) {
    const absn = Math.abs(n);
    const st = this.puz.multiply(apd.forward, n);
    return new AlgPartDecoration(this.puz, apd.moveCount * absn, apd.duration * absn, st, this.puz.invert(st), child);
  }
}
class WalkerDown {
  constructor(apd, back) {
    this.apd = apd;
    this.back = back;
  }
}
class AlgWalker extends TraversalDownUp {
  constructor(puz, alg18, apd) {
    super();
    this.puz = puz;
    this.alg = alg18;
    this.apd = apd;
    this.i = -1;
    this.dur = -1;
    this.goali = -1;
    this.goaldur = -1;
    this.mv = void 0;
    this.back = false;
    this.moveDur = 0;
    this.st = this.puz.identity();
    this.root = new WalkerDown(this.apd, false);
  }
  moveByIndex(loc) {
    if (this.i >= 0 && this.i === loc) {
      return this.mv !== void 0;
    }
    return this.dosearch(loc, Infinity);
  }
  moveByDuration(dur) {
    if (this.dur >= 0 && this.dur < dur && this.dur + this.moveDur >= dur) {
      return this.mv !== void 0;
    }
    return this.dosearch(Infinity, dur);
  }
  dosearch(loc, dur) {
    this.goali = loc;
    this.goaldur = dur;
    this.i = 0;
    this.dur = 0;
    this.mv = void 0;
    this.moveDur = 0;
    this.back = false;
    this.st = this.puz.identity();
    const r3 = this.traverse(this.alg, this.root);
    return r3;
  }
  traverseSequence(sequence, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    if (wd.back) {
      for (let i2 = sequence.nestedUnits.length - 1; i2 >= 0; i2--) {
        const part = sequence.nestedUnits[i2];
        if (this.traverse(part, new WalkerDown(wd.apd.children[i2], wd.back))) {
          return true;
        }
      }
    } else {
      for (let i2 = 0; i2 < sequence.nestedUnits.length; i2++) {
        const part = sequence.nestedUnits[i2];
        if (this.traverse(part, new WalkerDown(wd.apd.children[i2], wd.back))) {
          return true;
        }
      }
    }
    return false;
  }
  traverseGroup(group, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, group.amount);
    return this.traverse(group.nestedSequence, new WalkerDown(wd.apd.children[0], back));
  }
  traverseBlockMove(blockMove, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.mv = blockMove;
    this.moveDur = wd.apd.duration;
    this.back = wd.back;
    return true;
  }
  traverseCommutator(commutator, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, commutator.amount);
    if (back) {
      return this.traverse(commutator.B, new WalkerDown(wd.apd.children[2], !back)) || this.traverse(commutator.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverse(commutator.B, new WalkerDown(wd.apd.children[2], back)) || this.traverse(commutator.A, new WalkerDown(wd.apd.children[1], back));
    } else {
      return this.traverse(commutator.A, new WalkerDown(wd.apd.children[1], back)) || this.traverse(commutator.B, new WalkerDown(wd.apd.children[2], back)) || this.traverse(commutator.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverse(commutator.B, new WalkerDown(wd.apd.children[2], !back));
    }
  }
  traverseConjugate(conjugate, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, conjugate.amount);
    if (back) {
      return this.traverse(conjugate.A, new WalkerDown(wd.apd.children[1], !back)) || this.traverse(conjugate.B, new WalkerDown(wd.apd.children[2], back)) || this.traverse(conjugate.A, new WalkerDown(wd.apd.children[1], back));
    } else {
      return this.traverse(conjugate.A, new WalkerDown(wd.apd.children[1], back)) || this.traverse(conjugate.B, new WalkerDown(wd.apd.children[2], back)) || this.traverse(conjugate.A, new WalkerDown(wd.apd.children[1], !back));
    }
  }
  traversePause(pause, wd) {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.mv = pause;
    this.moveDur = wd.apd.duration;
    this.back = wd.back;
    return true;
  }
  traverseNewLine(_newLine, _wd) {
    return false;
  }
  traverseComment(_comment, _wd) {
    return false;
  }
  firstcheck(wd) {
    if (wd.apd.moveCount + this.i <= this.goali && wd.apd.duration + this.dur < this.goaldur) {
      return this.keepgoing(wd);
    }
    return true;
  }
  domult(wd, amount) {
    let back = wd.back;
    if (amount === 0) {
      return back;
    }
    if (amount < 0) {
      back = !back;
      amount = -amount;
    }
    const base = wd.apd.children[0];
    const full = Math.min(Math.floor((this.goali - this.i) / base.moveCount), Math.ceil((this.goaldur - this.dur) / base.duration - 1));
    if (full > 0) {
      this.keepgoing(new WalkerDown(base, back), full);
    }
    return back;
  }
  keepgoing(wd, mul = 1) {
    this.i += mul * wd.apd.moveCount;
    this.dur += mul * wd.apd.duration;
    if (mul !== 1) {
      if (wd.back) {
        this.st = this.puz.combine(this.st, this.puz.multiply(wd.apd.backward, mul));
      } else {
        this.st = this.puz.combine(this.st, this.puz.multiply(wd.apd.forward, mul));
      }
    } else {
      if (wd.back) {
        this.st = this.puz.combine(this.st, wd.apd.backward);
      } else {
        this.st = this.puz.combine(this.st, wd.apd.forward);
      }
    }
    return false;
  }
}
function invertBlockMove(bm) {
  return new BlockMove(bm.outerLayer, bm.innerLayer, bm.family, -bm.amount);
}
const countAnimatedMovesInstance = new CountAnimatedMoves();
const countAnimatedMoves = countAnimatedMovesInstance.traverse.bind(countAnimatedMovesInstance);

// src/cubing/twisty/animation/alg/TreeAlgIndexer.ts
class TreeAlgIndexer {
  constructor(puzzle, alg18) {
    this.puzzle = puzzle;
    const deccon = new DecoratorConstructor(this.puzzle);
    this.decoration = deccon.traverse(alg18);
    this.walker = new AlgWalker(this.puzzle, alg18, this.decoration);
  }
  getMove(index) {
    if (this.walker.moveByIndex(index)) {
      if (!this.walker.mv) {
        throw new Error("`this.walker.mv` missing");
      }
      const bm = this.walker.mv;
      if (this.walker.back) {
        return invertBlockMove(bm);
      }
      return bm;
    }
    throw new Error("Out of algorithm: index " + index);
  }
  indexToMoveStartTimestamp(index) {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }
  stateAtIndex(index, startTransformation) {
    this.walker.moveByIndex(index);
    return this.puzzle.combine(startTransformation ?? this.puzzle.startState(), this.walker.st);
  }
  transformAtIndex(index) {
    this.walker.moveByIndex(index);
    return this.walker.st;
  }
  numMoves() {
    return this.decoration.moveCount;
  }
  timestampToIndex(timestamp) {
    this.walker.moveByDuration(timestamp);
    return this.walker.i;
  }
  algDuration() {
    return this.decoration.duration;
  }
  moveDuration(index) {
    this.walker.moveByIndex(index);
    return this.walker.moveDur;
  }
}

// src/cubing/twisty/animation/alg/AlgCursor.ts
class AlgCursor {
  constructor(timeline, def2, alg18, startStateSequence) {
    this.timeline = timeline;
    this.def = def2;
    this.alg = alg18;
    this.positionListeners = new Set();
    timeline.addTimestampListener(this);
    this.ksolvePuzzle = new KPuzzleWrapper(def2);
    this.todoIndexer = new TreeAlgIndexer(this.ksolvePuzzle, alg18);
    this.startState = startStateSequence ? this.algToState(startStateSequence) : this.ksolvePuzzle.startState();
  }
  setStartState(startState) {
    this.startState = startState;
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }
  algToState(s) {
    const kpuzzle11 = new KPuzzle(this.def);
    kpuzzle11.applyAlg(s);
    return this.ksolvePuzzle.combine(this.def.startPieces, kpuzzle11.state);
  }
  timeRange() {
    return {
      start: 0,
      end: this.todoIndexer.algDuration()
    };
  }
  experimentalTimestampForStartOfLastMove() {
    const numMoves = this.todoIndexer.numMoves();
    if (numMoves > 0) {
      return this.todoIndexer.indexToMoveStartTimestamp(numMoves - 1);
    }
    return 0;
  }
  addPositionListener(positionListener) {
    this.positionListeners.add(positionListener);
    this.dispatchPositionForTimestamp(this.timeline.timestamp, [
      positionListener
    ]);
  }
  removePositionListener(positionListener) {
    this.positionListeners.delete(positionListener);
  }
  onTimelineTimestampChange(timestamp) {
    this.dispatchPositionForTimestamp(timestamp);
  }
  dispatchPositionForTimestamp(timestamp, listeners = this.positionListeners) {
    const idx = this.todoIndexer.timestampToIndex(timestamp);
    const state = this.todoIndexer.stateAtIndex(idx, this.startState);
    const position = {
      state,
      movesInProgress: []
    };
    if (this.todoIndexer.numMoves() > 0) {
      const fraction = (timestamp - this.todoIndexer.indexToMoveStartTimestamp(idx)) / this.todoIndexer.moveDuration(idx);
      if (fraction === 1) {
        position.state = this.ksolvePuzzle.combine(state, this.ksolvePuzzle.stateFromMove(this.todoIndexer.getMove(idx)));
      } else if (fraction > 0) {
        position.movesInProgress.push({
          move: this.todoIndexer.getMove(idx),
          direction: Direction.Forwards,
          fraction
        });
      }
    }
    for (const listener of listeners) {
      listener.onPositionChange(position);
    }
  }
  onTimeRangeChange(_timeRange) {
  }
  setAlg(alg18) {
    this.todoIndexer = new TreeAlgIndexer(this.ksolvePuzzle, alg18);
    this.timeline.onCursorChange(this);
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }
  moveBoundary(timestamp, direction) {
    if (this.todoIndexer.numMoves() === 0) {
      return null;
    }
    const offsetHack = directionScalar(direction) * 1e-3;
    const idx = this.todoIndexer.timestampToIndex(timestamp + offsetHack);
    const moveStart = this.todoIndexer.indexToMoveStartTimestamp(idx);
    if (direction === Direction.Backwards) {
      return timestamp >= moveStart ? moveStart : null;
    } else {
      const moveEnd = moveStart + this.todoIndexer.moveDuration(idx);
      return timestamp <= moveEnd ? moveEnd : null;
    }
  }
  setPuzzle(def2, alg18 = this.alg, startStateSequence) {
    this.ksolvePuzzle = new KPuzzleWrapper(def2);
    this.def = def2;
    this.todoIndexer = new TreeAlgIndexer(this.ksolvePuzzle, alg18);
    if (alg18 !== this.alg) {
      this.timeline.onCursorChange(this);
    }
    this.setStartState(startStateSequence ? this.algToState(startStateSequence) : this.ksolvePuzzle.startState());
    this.alg = alg18;
  }
}

// src/cubing/twisty/animation/Timeline.ts
var TimelineAction;
(function(TimelineAction2) {
  TimelineAction2["StartingToPlay"] = "StartingToPlay";
  TimelineAction2["Pausing"] = "Pausing";
  TimelineAction2["Jumping"] = "Jumping";
})(TimelineAction || (TimelineAction = {}));
var TimestampLocationType;
(function(TimestampLocationType2) {
  TimestampLocationType2["StartOfTimeline"] = "Start";
  TimestampLocationType2["EndOfTimeline"] = "End";
  TimestampLocationType2["StartOfMove"] = "StartOfMove";
  TimestampLocationType2["EndOfMove"] = "EndOfMove";
  TimestampLocationType2["MiddleOfMove"] = "MiddleOfMove";
  TimestampLocationType2["BetweenMoves"] = "BetweenMoves";
})(TimestampLocationType || (TimestampLocationType = {}));
function getNow() {
  return Math.round(performance.now());
}
class Timeline {
  constructor() {
    this.animating = false;
    this.tempoScale = 1;
    this.cursors = new Set();
    this.timestampListeners = new Set();
    this.actionListeners = new Set();
    this.timestamp = 0;
    this.lastAnimFrameNow = 0;
    this.direction = Direction.Forwards;
    this.boundaryType = BoundaryType.EntireTimeline;
    const animFrame = (_now) => {
      if (this.animating) {
        const now = getNow();
        this.timestamp = this.timestamp + this.tempoScale * directionScalar(this.direction) * (now - this.lastAnimFrameNow);
        this.lastAnimFrameNow = now;
        const atOrPastBoundary = this.direction === Direction.Backwards ? this.timestamp <= this.cachedNextBoundary : this.timestamp >= this.cachedNextBoundary;
        if (atOrPastBoundary) {
          this.timestamp = this.cachedNextBoundary;
          if (this.animating) {
            this.animating = false;
            this.dispatchAction(TimelineAction.Pausing);
          }
        }
      }
      if (this.timestamp !== this.lastAnimFrameTimestamp) {
        this.dispatchTimestamp();
        this.lastAnimFrameTimestamp = this.timestamp;
      }
      if (this.animating) {
        this.scheduler.requestAnimFrame();
      }
    };
    this.scheduler = new RenderScheduler(animFrame);
  }
  addCursor(cursor) {
    this.cursors.add(cursor);
    this.dispatchTimeRange();
  }
  removeCursor(cursor) {
    this.cursors.delete(cursor);
    this.clampTimestampToRange();
    this.dispatchTimeRange();
  }
  clampTimestampToRange() {
    const timeRange = this.timeRange();
    if (this.timestamp < timeRange.start) {
      this.setTimestamp(timeRange.start);
    }
    if (this.timestamp > timeRange.end) {
      this.setTimestamp(timeRange.end);
    }
  }
  onCursorChange(_cursor) {
    if (this.timestamp > this.maxTimestamp()) {
      this.timestamp = this.maxTimestamp();
    }
    this.dispatchTimeRange();
  }
  timeRange() {
    let start = 0;
    let end = 0;
    for (const cursor of this.cursors) {
      const cursorTimeRange = cursor.timeRange();
      start = Math.min(start, cursorTimeRange.start);
      end = Math.max(end, cursorTimeRange.end);
    }
    return {start, end};
  }
  minTimestamp() {
    return this.timeRange().start;
  }
  maxTimestamp() {
    return this.timeRange().end;
  }
  dispatchTimeRange() {
    const timeRange = this.timeRange();
    for (const listener of this.cursors) {
      listener.onTimeRangeChange(timeRange);
    }
    for (const listener of this.timestampListeners) {
      listener.onTimeRangeChange(timeRange);
    }
  }
  dispatchTimestamp() {
    for (const listener of this.cursors) {
      listener.onTimelineTimestampChange(this.timestamp);
    }
    for (const listener of this.timestampListeners) {
      listener.onTimelineTimestampChange(this.timestamp);
    }
  }
  addTimestampListener(timestampListener) {
    this.timestampListeners.add(timestampListener);
  }
  removeTimestampListener(timestampListener) {
    this.timestampListeners.delete(timestampListener);
  }
  addActionListener(actionListener) {
    this.actionListeners.add(actionListener);
  }
  removeActionListener(actionListener) {
    this.actionListeners.delete(actionListener);
  }
  play() {
    this.experimentalPlay(Direction.Forwards, BoundaryType.EntireTimeline);
  }
  experimentalPlay(direction, boundaryType = BoundaryType.EntireTimeline) {
    this.direction = direction;
    this.boundaryType = boundaryType;
    const nextBoundary = this.nextBoundary(this.timestamp, direction, this.boundaryType);
    if (nextBoundary === null) {
      return;
    }
    this.cachedNextBoundary = nextBoundary;
    if (!this.animating) {
      this.animating = true;
      this.lastAnimFrameNow = getNow();
      this.dispatchAction(TimelineAction.StartingToPlay);
      this.scheduler.requestAnimFrame();
    }
  }
  nextBoundary(timestamp, direction, boundaryType = BoundaryType.EntireTimeline) {
    switch (boundaryType) {
      case BoundaryType.EntireTimeline: {
        switch (direction) {
          case Direction.Backwards:
            return timestamp <= this.minTimestamp() ? null : this.minTimestamp();
          case Direction.Forwards:
            return timestamp >= this.maxTimestamp() ? null : this.maxTimestamp();
          default:
            throw new Error("invalid direction");
        }
      }
      case BoundaryType.Move: {
        let result = null;
        for (const cursor of this.cursors) {
          const boundaryTimestamp = cursor.moveBoundary(timestamp, direction);
          if (boundaryTimestamp !== null) {
            switch (direction) {
              case Direction.Backwards: {
                result = Math.min(result ?? boundaryTimestamp, boundaryTimestamp);
                break;
              }
              case Direction.Forwards: {
                result = Math.max(result ?? boundaryTimestamp, boundaryTimestamp);
                break;
              }
              default:
                throw new Error("invalid direction");
            }
          }
        }
        return result;
      }
      default:
        throw new Error("invalid boundary type");
    }
  }
  pause() {
    if (this.animating) {
      this.animating = false;
      this.dispatchAction(TimelineAction.Pausing);
      this.scheduler.requestAnimFrame();
    }
  }
  playPause() {
    if (this.animating) {
      this.pause();
    } else {
      if (this.timestamp >= this.maxTimestamp()) {
        this.timestamp = 0;
      }
      this.experimentalPlay(Direction.Forwards, BoundaryType.EntireTimeline);
    }
  }
  setTimestamp(timestamp) {
    this.animating = false;
    const oldTimestamp = this.timestamp;
    this.timestamp = timestamp;
    this.lastAnimFrameNow = getNow();
    if (oldTimestamp !== timestamp) {
      this.dispatchAction(TimelineAction.Jumping);
      this.scheduler.requestAnimFrame();
    }
  }
  jumpToStart() {
    this.setTimestamp(this.minTimestamp());
  }
  jumpToEnd() {
    this.setTimestamp(this.maxTimestamp());
  }
  experimentalJumpToLastMove() {
    let max = 0;
    for (const cursor of this.cursors) {
      max = Math.max(max, cursor.experimentalTimestampForStartOfLastMove() ?? 0);
    }
    this.setTimestamp(max);
  }
  dispatchAction(event) {
    let locationType = TimestampLocationType.MiddleOfMove;
    switch (this.timestamp) {
      case this.minTimestamp():
        locationType = TimestampLocationType.StartOfTimeline;
        break;
      case this.maxTimestamp():
        locationType = TimestampLocationType.EndOfTimeline;
        break;
    }
    const actionEvent = {
      action: event,
      locationType
    };
    for (const listener of this.actionListeners) {
      listener.onTimelineAction(actionEvent);
    }
  }
}

// src/cubing/twisty/dom/controls/buttons.css.ts
const buttonGridCSS = new CSSSource(`
.wrapper {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: repeat(6, 1fr);
}
`);
const buttonCSS = new CSSSource(`
.wrapper {
  width: 100%;
  height: 100%;
}

button {
  width: 100%;
  height: 100%;
  border: none;
  
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;

  background-color: rgba(196, 196, 196, 0.75);
}

button:enabled {
  background-color: rgba(196, 196, 196, 0.75)
}

button:disabled {
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0.25;
}

button:enabled:hover {
  background-color: rgba(255, 255, 255, 0.75);
  box-shadow: 0 0 1em rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

/* TODO: fullscreen icons have too much padding?? */
button.svg-skip-to-start {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjQzIDEwMzdxMTktMTkgMzItMTN0MTMgMzJ2MTQ3MnEwIDI2LTEzIDMydC0zMi0xM2wtNzEwLTcxMHEtOS05LTEzLTE5djcxMHEwIDI2LTEzIDMydC0zMi0xM2wtNzEwLTcxMHEtOS05LTEzLTE5djY3OHEwIDI2LTE5IDQ1dC00NSAxOUg5NjBxLTI2IDAtNDUtMTl0LTE5LTQ1VjEwODhxMC0yNiAxOS00NXQ0NS0xOWgxMjhxMjYgMCA0NSAxOXQxOSA0NXY2NzhxNC0xMSAxMy0xOWw3MTAtNzEwcTE5LTE5IDMyLTEzdDEzIDMydjcxMHE0LTExIDEzLTE5eiIvPjwvc3ZnPg==");
}

button.svg-skip-to-end {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik05NDEgMjU0N3EtMTkgMTktMzIgMTN0LTEzLTMyVjEwNTZxMC0yNiAxMy0zMnQzMiAxM2w3MTAgNzEwcTggOCAxMyAxOXYtNzEwcTAtMjYgMTMtMzJ0MzIgMTNsNzEwIDcxMHE4IDggMTMgMTl2LTY3OHEwLTI2IDE5LTQ1dDQ1LTE5aDEyOHEyNiAwIDQ1IDE5dDE5IDQ1djE0MDhxMCAyNi0xOSA0NXQtNDUgMTloLTEyOHEtMjYgMC00NS0xOXQtMTktNDV2LTY3OHEtNSAxMC0xMyAxOWwtNzEwIDcxMHEtMTkgMTktMzIgMTN0LTEzLTMydi03MTBxLTUgMTAtMTMgMTl6Ii8+PC9zdmc+");
}

button.svg-step-forward {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjg4IDE1NjhxMCAyNi0xOSA0NWwtNTEyIDUxMnEtMTkgMTktNDUgMTl0LTQ1LTE5cS0xOS0xOS0xOS00NXYtMjU2aC0yMjRxLTk4IDAtMTc1LjUgNnQtMTU0IDIxLjVxLTc2LjUgMTUuNS0xMzMgNDIuNXQtMTA1LjUgNjkuNXEtNDkgNDIuNS04MCAxMDF0LTQ4LjUgMTM4LjVxLTE3LjUgODAtMTcuNSAxODEgMCA1NSA1IDEyMyAwIDYgMi41IDIzLjV0Mi41IDI2LjVxMCAxNS04LjUgMjV0LTIzLjUgMTBxLTE2IDAtMjgtMTctNy05LTEzLTIydC0xMy41LTMwcS03LjUtMTctMTAuNS0yNC0xMjctMjg1LTEyNy00NTEgMC0xOTkgNTMtMzMzIDE2Mi00MDMgODc1LTQwM2gyMjR2LTI1NnEwLTI2IDE5LTQ1dDQ1LTE5cTI2IDAgNDUgMTlsNTEyIDUxMnExOSAxOSAxOSA0NXoiLz48L3N2Zz4=");
}

button.svg-step-backward {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNjg4IDIwNDhxMCAxNjYtMTI3IDQ1MS0zIDctMTAuNSAyNHQtMTMuNSAzMHEtNiAxMy0xMyAyMi0xMiAxNy0yOCAxNy0xNSAwLTIzLjUtMTB0LTguNS0yNXEwLTkgMi41LTI2LjV0Mi41LTIzLjVxNS02OCA1LTEyMyAwLTEwMS0xNy41LTE4MXQtNDguNS0xMzguNXEtMzEtNTguNS04MC0xMDF0LTEwNS41LTY5LjVxLTU2LjUtMjctMTMzLTQyLjV0LTE1NC0yMS41cS03Ny41LTYtMTc1LjUtNmgtMjI0djI1NnEwIDI2LTE5IDQ1dC00NSAxOXEtMjYgMC00NS0xOWwtNTEyLTUxMnEtMTktMTktMTktNDV0MTktNDVsNTEyLTUxMnExOS0xOSA0NS0xOXQ0NSAxOXExOSAxOSAxOSA0NXYyNTZoMjI0cTcxMyAwIDg3NSA0MDMgNTMgMTM0IDUzIDMzM3oiLz48L3N2Zz4=");
}

button.svg-pause {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNTYwIDEwODh2MTQwOHEwIDI2LTE5IDQ1dC00NSAxOWgtNTEycS0yNiAwLTQ1LTE5dC0xOS00NVYxMDg4cTAtMjYgMTktNDV0NDUtMTloNTEycTI2IDAgNDUgMTl0MTkgNDV6bS04OTYgMHYxNDA4cTAgMjYtMTkgNDV0LTQ1IDE5aC01MTJxLTI2IDAtNDUtMTl0LTE5LTQ1VjEwODhxMC0yNiAxOS00NXQ0NS0xOWg1MTJxMjYgMCA0NSAxOXQxOSA0NXoiLz48L3N2Zz4=");
}

button.svg-play {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNTg0IiBoZWlnaHQ9IjM1ODQiIHZpZXdCb3g9IjAgMCAzNTg0IDM1ODQiPjxwYXRoIGQ9Ik0yNDcyLjUgMTgyM2wtMTMyOCA3MzhxLTIzIDEzLTM5LjUgM3QtMTYuNS0zNlYxMDU2cTAtMjYgMTYuNS0zNnQzOS41IDNsMTMyOCA3MzhxMjMgMTMgMjMgMzF0LTIzIDMxeiIvPjwvc3ZnPg==");
}

button.svg-enter-fullscreen {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgd2lkdGg9IjI4Ij48cGF0aCBkPSJNMiAyaDI0djI0SDJ6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTkgMTZIN3Y1aDV2LTJIOXYtM3ptLTItNGgyVjloM1Y3SDd2NXptMTIgN2gtM3YyaDV2LTVoLTJ2M3pNMTYgN3YyaDN2M2gyVjdoLTV6Ii8+PC9zdmc+");
}

button.svg-exit-fullscreen {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgd2lkdGg9IjI4Ij48cGF0aCBkPSJNMiAyaDI0djI0SDJ6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTcgMThoM3YzaDJ2LTVIN3Yyem0zLThIN3YyaDVWN2gtMnYzem02IDExaDJ2LTNoM3YtMmgtNXY1em0yLTExVjdoLTJ2NWg1di0yaC0zeiIvPjwvc3ZnPg==");
}
`);

// src/cubing/twisty/dom/controls/buttons.ts
class TwistyControlButton extends ManagedCustomElement {
  constructor(timeline, timelineCommand, fullscreenElement) {
    super();
    this.fullscreenElement = fullscreenElement;
    this.currentIconName = null;
    this.button = document.createElement("button");
    if (!timeline) {
      console.log("Must have timeline!");
    }
    this.timeline = timeline;
    if (!timelineCommand) {
      console.log("Must have timelineCommand!");
    }
    this.timelineCommand = timelineCommand;
    this.addCSS(buttonCSS);
    this.setIcon(this.initialIcon());
    this.setHoverTitle(this.initialHoverTitle());
    this.addElement(this.button);
    this.addEventListener("click", this.onPress.bind(this));
    switch (this.timelineCommand) {
      case "fullscreen":
        if (!document.fullscreenEnabled) {
          this.button.disabled = true;
        }
        break;
      case "jump-to-start":
      case "play-step-backwards":
        this.button.disabled = true;
        break;
    }
    this.timeline.addActionListener(this);
    switch (this.timelineCommand) {
      case "play-pause":
      case "play-step-backwards":
      case "play-step":
        this.timeline.addTimestampListener(this);
        break;
    }
    this.autoSetTimelineBasedDisabled();
  }
  autoSetTimelineBasedDisabled() {
    switch (this.timelineCommand) {
      case "jump-to-start":
      case "play-pause":
      case "play-step-backwards":
      case "play-step":
      case "jump-to-end": {
        const timeRange = this.timeline.timeRange();
        if (timeRange.start === timeRange.end) {
          this.button.disabled = true;
          return;
        }
        switch (this.timelineCommand) {
          case "jump-to-start":
          case "play-step-backwards":
            this.button.disabled = this.timeline.timestamp < this.timeline.maxTimestamp();
            break;
          case "jump-to-end":
          case "play-step":
            this.button.disabled = this.timeline.timestamp > this.timeline.minTimestamp();
            break;
          default:
            this.button.disabled = false;
        }
        break;
      }
    }
  }
  setIcon(buttonIconName) {
    if (this.currentIconName === buttonIconName) {
      return;
    }
    if (this.currentIconName) {
      this.button.classList.remove(`svg-${this.currentIconName}`);
    }
    this.button.classList.add(`svg-${buttonIconName}`);
    this.currentIconName = buttonIconName;
  }
  initialIcon() {
    const map = {
      "jump-to-start": "skip-to-start",
      "play-pause": "play",
      "play-step": "step-forward",
      "play-step-backwards": "step-backward",
      "jump-to-end": "skip-to-end",
      fullscreen: "enter-fullscreen"
    };
    return map[this.timelineCommand];
  }
  initialHoverTitle() {
    const map = {
      "jump-to-start": "Restart",
      "play-pause": "Play",
      "play-step": "Step forward",
      "play-step-backwards": "Step backward",
      "jump-to-end": "Skip to End",
      fullscreen: "Enter fullscreen"
    };
    return map[this.timelineCommand];
  }
  setHoverTitle(title) {
    this.button.title = title;
  }
  onPress() {
    switch (this.timelineCommand) {
      case "fullscreen":
        if (document.fullscreenElement === this.fullscreenElement) {
          document.exitFullscreen();
        } else {
          this.setIcon("exit-fullscreen");
          this.fullscreenElement.requestFullscreen().then(() => {
            const onFullscreen = () => {
              if (document.fullscreenElement !== this.fullscreenElement) {
                this.setIcon("enter-fullscreen");
                window.removeEventListener("fullscreenchange", onFullscreen);
              }
            };
            window.addEventListener("fullscreenchange", onFullscreen);
          });
        }
        break;
      case "jump-to-start":
        this.timeline.setTimestamp(0);
        break;
      case "jump-to-end":
        this.timeline.jumpToEnd();
        break;
      case "play-pause":
        this.timeline.playPause();
        break;
      case "play-step":
        this.timeline.experimentalPlay(Direction.Forwards, BoundaryType.Move);
        break;
      case "play-step-backwards":
        this.timeline.experimentalPlay(Direction.Backwards, BoundaryType.Move);
        break;
    }
  }
  onTimelineAction(actionEvent) {
    switch (this.timelineCommand) {
      case "jump-to-start":
        this.button.disabled = actionEvent.locationType === TimestampLocationType.StartOfTimeline && actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "jump-to-end":
        this.button.disabled = actionEvent.locationType === TimestampLocationType.EndOfTimeline && actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "play-pause":
        switch (actionEvent.action) {
          case TimelineAction.Pausing:
            this.setIcon("play");
            this.setHoverTitle("Play");
            break;
          case TimelineAction.StartingToPlay:
            this.setIcon("pause");
            this.setHoverTitle("Pause");
            break;
        }
        break;
      case "play-step":
        this.button.disabled = actionEvent.locationType === TimestampLocationType.EndOfTimeline && actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "play-step-backwards":
        this.button.disabled = actionEvent.locationType === TimestampLocationType.StartOfTimeline && actionEvent.action !== TimelineAction.StartingToPlay;
        break;
    }
  }
  onTimelineTimestampChange(_timestamp) {
  }
  onTimeRangeChange(_timeRange) {
    this.autoSetTimelineBasedDisabled();
  }
}
customElementsShim.define("twisty-control-button", TwistyControlButton);
class TwistyControlButtonPanel extends ManagedCustomElement {
  constructor(timeline, fullscreenElement) {
    super();
    this.addCSS(buttonGridCSS);
    this.addElement(new TwistyControlButton(timeline, "fullscreen", fullscreenElement));
    this.addElement(new TwistyControlButton(timeline, "jump-to-start"));
    this.addElement(new TwistyControlButton(timeline, "play-step-backwards"));
    this.addElement(new TwistyControlButton(timeline, "play-pause"));
    this.addElement(new TwistyControlButton(timeline, "play-step"));
    this.addElement(new TwistyControlButton(timeline, "jump-to-end"));
  }
}
customElementsShim.define("twisty-control-button-panel", TwistyControlButtonPanel);

// src/cubing/twisty/dom/controls/TwistyScrubber.css.ts
const twistyScrubberCSS = new CSSSource(`
:host(twisty-scrubber) {
  width: 384px;
  height: 16px;
  contain: content;
  display: grid;

  background: rgba(196, 196, 196, 0.5);
}

input {
  margin: 0; width: 100%;
}
`);

// src/cubing/twisty/dom/controls/TwistyScrubber.ts
class TwistyScrubber2 extends ManagedCustomElement {
  constructor(timeline) {
    super();
    this.range = document.createElement("input");
    this.timeline = timeline;
    this.addCSS(twistyScrubberCSS);
    this.timeline.addTimestampListener(this);
    this.range.type = "range";
    this.range.step = 1 .toString();
    this.range.min = this.timeline.minTimestamp().toString();
    this.range.max = this.timeline.maxTimestamp().toString();
    this.range.value = this.timeline.timestamp.toString();
    this.range.addEventListener("input", this.onInput.bind(this));
    this.addElement(this.range);
  }
  onTimelineTimestampChange(timestamp) {
    this.range.value = timestamp.toString();
  }
  onTimeRangeChange(timeRange) {
    this.range.min = timeRange.start.toString();
    this.range.max = timeRange.end.toString();
  }
  onInput() {
    this.timeline.setTimestamp(parseInt(this.range.value, 10));
  }
}
customElementsShim.define("twisty-scrubber", TwistyScrubber2);

// src/cubing/twisty/dom/TwistyPlayer.css.ts
const twistyPlayerCSS = new CSSSource(`
:host(twisty-player) {
  width: 384px;
  height: 256px;
  contain: content;
  display: grid;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.wrapper {
  display: grid;
  grid-template-rows: 7fr 1em 1fr;
  overflow: hidden;
}

.wrapper.controls-none {
  grid-template-rows: 7fr;
}

.wrapper.controls-none twisty-scrubber,
.wrapper.controls-none twisty-control-button-panel {
  display: none;
}

twisty-viewer-wrapper {
  overflow: hidden;
}

twisty-scrubber {
  width: 100%;
}

.wrapper.checkered {
  background-color: #EAEAEA;
  background-image: linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD),
    linear-gradient(45deg, #DDD 25%, transparent 25%, transparent 75%, #DDD 75%, #DDD);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
}
`);

// src/cubing/twisty/dom/viewers/Twisty2DSVGView.css.ts
const twisty2DSVGCSS = new CSSSource(`
.wrapper,
.svg-wrapper,
twisty-2d-svg,
svg {
  width: 100%;
  height: 100%;
  display: grid;
  min-height: 0;
}
`);

// src/cubing/twisty/dom/viewers/Twisty2DSVG.ts
class Twisty2DSVG extends ManagedCustomElement {
  constructor(cursor, def2 = Puzzles["3x3x3"]) {
    super();
    this.scheduler = new RenderScheduler(this.render.bind(this));
    this.addCSS(twisty2DSVGCSS);
    this.definition = def2;
    this.svg = new SVG(this.definition);
    this.addElement(this.svg.element);
    cursor.addPositionListener(this);
  }
  onPositionChange(position) {
    if (position.movesInProgress.length > 0) {
      const move = position.movesInProgress[0].move;
      const def2 = this.definition;
      const partialMove = new BlockMove(move.outerLayer, move.innerLayer, move.family, move.amount * position.movesInProgress[0].direction);
      const newState = Combine(def2, position.state, stateForBlockMove(def2, partialMove));
      this.svg.draw(this.definition, position.state, newState, position.movesInProgress[0].fraction);
    } else {
      this.svg.draw(this.definition, position.state);
    }
  }
  scheduleRender() {
    this.scheduler.requestAnimFrame();
  }
  render() {
  }
}
customElementsShim.define("twisty-2d-svg", Twisty2DSVG);

// src/cubing/twisty/dom/TwistyPlayer.ts
function createPG(puzzleName) {
  const pg = getPuzzleGeometryByName(puzzleName, [
    "allmoves",
    "true",
    "orientcenters",
    "true"
  ]);
  return pg;
}
function is3DVisualization(visualizationFormat) {
  return ["3D", "PG3D"].includes(visualizationFormat);
}
class TwistyPlayer2 extends ManagedCustomElement {
  constructor(initialConfig = {}, legacyExperimentalPG3DViewConfig = null) {
    super();
    this.scene = null;
    this.twisty3D = null;
    this.viewerElems = [];
    this.controlElems = [];
    this.#hackyPendingFinalMoveCoalesce = false;
    this.legacyExperimentalCoalesceModFunc = (_mv) => 0;
    this.#controlsClassListManager = new ClassListManager(this, "controls-", ["none", "bottom-row"]);
    this.legacyExperimentalPG3D = null;
    this.addCSS(twistyPlayerCSS);
    this.#config = new TwistyPlayerConfig(this, initialConfig);
    this.contentWrapper.classList.add("checkered");
    this.legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig;
  }
  #config;
  #hackyPendingFinalMoveCoalesce;
  #viewerWrapper;
  #controlsClassListManager;
  set alg(seq) {
    if (seq?.type !== "sequence") {
      console.warn("`alg` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!");
      seq = parser_pegjs.parse(seq);
    }
    this.#config.attributes["alg"].setValue(seq);
    this.cursor?.setAlg(seq);
  }
  get alg() {
    return this.#config.attributes["alg"].value;
  }
  set experimentalStartSetup(seq) {
    if (seq?.type !== "sequence") {
      console.warn("`experimentalStartSetup` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!");
      seq = parser_pegjs.parse(seq);
    }
    this.#config.attributes["experimental-start-setup"].setValue(seq);
    if (this.cursor) {
      this.cursor.setStartState(this.cursor.algToState(seq));
    }
  }
  get experimentalStartSetup() {
    return this.#config.attributes["experimental-start-setup"].value;
  }
  set puzzle(puzzle) {
    if (this.#config.attributes["puzzle"].setValue(puzzle)) {
      this.setPuzzle(puzzle);
    }
  }
  get puzzle() {
    return this.#config.attributes["puzzle"].value;
  }
  set visualization(visualization) {
    if (this.#config.attributes["visualization"].setValue(visualization)) {
      this.setPuzzle(this.puzzle);
    }
  }
  get visualization() {
    return this.#config.attributes["visualization"].value;
  }
  set hintFacelets(hintFacelets) {
    if (this.#config.attributes["hint-facelets"].setValue(hintFacelets)) {
      if (this.twisty3D instanceof Cube3D) {
        this.twisty3D.experimentalUpdateOptions({hintFacelets});
      }
    }
  }
  get hintFacelets() {
    return this.#config.attributes["hint-facelets"].value;
  }
  get experimentalStickering() {
    return this.#config.attributes["experimental-stickering"].value;
  }
  set experimentalStickering(experimentalStickering) {
    if (this.#config.attributes["experimental-stickering"].setValue(experimentalStickering)) {
      if (this.twisty3D instanceof Cube3D) {
        this.twisty3D.experimentalUpdateOptions({
          experimentalStickering
        });
      }
    }
  }
  set background(background) {
    if (this.#config.attributes["background"].setValue(background)) {
      this.contentWrapper.classList.toggle("checkered", background === "checkered");
    }
  }
  get background() {
    return this.#config.attributes["background"].value;
  }
  set controls(controls) {
    this.#controlsClassListManager.setValue(controls);
  }
  get controls() {
    return this.#config.attributes["controls"].value;
  }
  set backView(backView) {
    if (backView !== "none" && this.viewerElems.length === 1) {
      this.createBackViewer();
    }
    if (backView === "none" && this.viewerElems.length > 1) {
      this.removeBackViewerElem();
    }
    if (this.#viewerWrapper && this.#viewerWrapper.setBackView(backView)) {
      for (const viewer of this.viewerElems) {
        viewer.makeInvisibleUntilRender();
      }
    }
  }
  get backView() {
    return this.#config.attributes["back-view"].value;
  }
  set cameraPosition(cameraPosition) {
    this.#config.attributes["camera-position"].setValue(cameraPosition);
    if (this.viewerElems && ["3D", "PG3D"].includes(this.#config.attributes["visualization"].value)) {
      this.viewerElems[0]?.camera.position.copy(this.effectiveCameraPosition);
      this.viewerElems[0]?.scheduleRender();
      this.viewerElems[1]?.camera.position.copy(this.effectiveCameraPosition).multiplyScalar(-1);
      this.viewerElems[1]?.scheduleRender();
    }
  }
  get cameraPosition() {
    return this.#config.attributes["camera-position"].value;
  }
  get effectiveCameraPosition() {
    return this.cameraPosition ?? this.defaultCameraPosition;
  }
  get defaultCameraPosition() {
    return this.puzzle[1] === "x" ? cubeCameraPosition : centeredCameraPosition;
  }
  static get observedAttributes() {
    return TwistyPlayerConfig.observedAttributes;
  }
  attributeChangedCallback(attributeName, oldValue, newValue) {
    this.#config.attributeChangedCallback(attributeName, oldValue, newValue);
  }
  connectedCallback() {
    this.timeline = new Timeline();
    this.timeline.addActionListener(this);
    this.contentWrapper.classList.toggle("checkered", this.background === "checkered");
    const setBackView = this.backView && this.visualization !== "2D";
    const backView = setBackView ? this.backView : "none";
    this.#viewerWrapper = new TwistyViewerWrapper2({
      backView
    });
    this.addElement(this.#viewerWrapper);
    this.createViewers(this.timeline, this.alg, this.visualization, this.puzzle, this.backView !== "none");
    const scrubber = new TwistyScrubber2(this.timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(this.timeline, this);
    this.controlElems = [scrubber, controlButtonGrid];
    this.#controlsClassListManager.setValue(this.controls);
    this.addElement(this.controlElems[0]);
    this.addElement(this.controlElems[1]);
  }
  createViewers(timeline, alg18, visualization, puzzleName, backView) {
    switch (visualization) {
      case "2D": {
        try {
          this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg18, this.experimentalStartSetup);
        } catch (e) {
          this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], new Sequence([]), this.experimentalStartSetup);
        }
        this.cursor.setStartState(this.cursor.algToState(this.experimentalStartSetup));
        this.timeline.addCursor(this.cursor);
        if (this.experimentalStartSetup.nestedUnits.length === 0) {
          this.timeline.jumpToEnd();
        }
        const mainViewer = new Twisty2DSVG(this.cursor, Puzzles[puzzleName]);
        this.viewerElems = [mainViewer];
        this.#viewerWrapper.addElement(mainViewer);
        return;
      }
      case "3D":
        if (puzzleName === "3x3x3") {
          try {
            this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg18, this.experimentalStartSetup);
          } catch (e) {
            this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], new Sequence([]), this.experimentalStartSetup);
          }
          this.cursor.setStartState(this.cursor.algToState(this.experimentalStartSetup));
          this.scene = new Twisty3DScene();
          this.twisty3D = new Cube3D(this.cursor, this.scene.scheduleRender.bind(this.scene), {
            hintFacelets: this.hintFacelets,
            experimentalStickering: this.experimentalStickering
          });
          this.scene.addTwisty3DPuzzle(this.twisty3D);
          const mainViewer = new Twisty3DCanvas2(this.scene, {
            cameraPosition: this.effectiveCameraPosition
          });
          this.#viewerWrapper.addElement(mainViewer);
          this.viewerElems = [mainViewer];
          if (backView) {
            this.createBackViewer();
          }
          this.timeline.addCursor(this.cursor);
          if (this.experimentalStartSetup.nestedUnits.length === 0) {
            this.timeline.jumpToEnd();
          }
          return;
        }
      case "PG3D": {
        const [kpuzzleDef, stickerDat] = this.pgHelper(puzzleName);
        try {
          this.cursor = new AlgCursor(timeline, kpuzzleDef, alg18, this.experimentalStartSetup);
        } catch (e) {
          this.cursor = new AlgCursor(timeline, kpuzzleDef, new Sequence([]), this.experimentalStartSetup);
        }
        this.scene = new Twisty3DScene();
        const pg3d = new PG3D(this.cursor, this.scene.scheduleRender.bind(this.scene), kpuzzleDef, stickerDat, this.legacyExperimentalPG3DViewConfig?.showFoundation ?? true);
        this.twisty3D = pg3d;
        this.legacyExperimentalPG3D = pg3d;
        this.scene.addTwisty3DPuzzle(this.twisty3D);
        const mainViewer = new Twisty3DCanvas2(this.scene, {
          cameraPosition: this.effectiveCameraPosition
        });
        this.viewerElems = [mainViewer];
        this.#viewerWrapper.addElement(mainViewer);
        if (backView) {
          this.createBackViewer();
        }
        this.timeline.addCursor(this.cursor);
        if (this.experimentalStartSetup.nestedUnits.length === 0) {
          this.timeline.jumpToEnd();
        }
        return;
      }
      default:
        throw new Error("Unknown visualization");
    }
  }
  pgHelper(puzzleName) {
    let kpuzzleDef;
    let stickerDat;
    if (this.legacyExperimentalPG3DViewConfig) {
      kpuzzleDef = this.legacyExperimentalPG3DViewConfig.def;
      stickerDat = this.legacyExperimentalPG3DViewConfig.stickerDat;
    } else {
      const pg = createPG(puzzleName);
      stickerDat = pg.get3d();
      kpuzzleDef = pg.writekpuzzle();
    }
    return [kpuzzleDef, stickerDat];
  }
  createBackViewer() {
    if (!is3DVisualization(this.visualization)) {
      throw new Error("Back viewer requires a 3D visualization");
    }
    const backViewer = new Twisty3DCanvas2(this.scene, {
      cameraPosition: this.effectiveCameraPosition,
      negateCameraPosition: true
    });
    this.viewerElems.push(backViewer);
    this.viewerElems[0].setMirror(backViewer);
    this.#viewerWrapper.addElement(backViewer);
  }
  removeBackViewerElem() {
    if (this.viewerElems.length !== 2) {
      throw new Error("Tried to remove non-existent back view!");
    }
    this.#viewerWrapper.removeElement(this.viewerElems.pop());
  }
  setPuzzle(puzzleName, legacyExperimentalPG3DViewConfig) {
    this.puzzle = puzzleName;
    this.legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig ?? null;
    switch (this.visualization) {
      case "PG3D": {
        const scene = this.scene;
        scene.remove(this.twisty3D);
        this.cursor.removePositionListener(this.twisty3D);
        const [def2, dat] = this.pgHelper(this.puzzle);
        this.cursor.setPuzzle(def2, void 0, this.experimentalStartSetup);
        const pg3d = new PG3D(this.cursor, scene.scheduleRender.bind(scene), def2, dat, this.legacyExperimentalPG3DViewConfig?.showFoundation);
        scene.addTwisty3DPuzzle(pg3d);
        this.twisty3D = pg3d;
        this.legacyExperimentalPG3D = pg3d;
        for (const viewer of this.viewerElems) {
          viewer.scheduleRender();
        }
        return;
      }
    }
    const oldCursor = this.cursor;
    for (const oldViewer of this.viewerElems) {
      this.#viewerWrapper.removeElement(oldViewer);
    }
    this.createViewers(this.timeline, this.alg, this.visualization, puzzleName, this.backView !== "none");
    this.timeline.removeCursor(oldCursor);
    this.timeline.removeTimestampListener(oldCursor);
  }
  experimentalAddMove(move, coalesce = false, coalesceDelayed = false) {
    if (this.#hackyPendingFinalMoveCoalesce) {
      this.hackyCoalescePending();
    }
    const oldNumMoves = countMoves(this.alg);
    const newAlg = experimentalAppendBlockMove(this.alg, move, coalesce && !coalesceDelayed, this.legacyExperimentalCoalesceModFunc(move));
    if (coalesce && coalesceDelayed) {
      this.#hackyPendingFinalMoveCoalesce = true;
    }
    this.alg = newAlg;
    if (oldNumMoves <= countMoves(newAlg)) {
      this.timeline.experimentalJumpToLastMove();
    } else {
      this.timeline.jumpToEnd();
    }
    this.timeline.play();
  }
  onTimelineAction(actionEvent) {
    if (actionEvent.action === TimelineAction.Pausing && actionEvent.locationType === TimestampLocationType.EndOfTimeline && this.#hackyPendingFinalMoveCoalesce) {
      this.hackyCoalescePending();
      this.timeline.jumpToEnd();
    }
  }
  hackyCoalescePending() {
    const units = this.alg.nestedUnits;
    const length = units.length;
    const pending = this.#hackyPendingFinalMoveCoalesce;
    this.#hackyPendingFinalMoveCoalesce = false;
    if (pending && length > 1 && units[length - 1].type === "blockMove") {
      const finalMove = units[length - 1];
      const newAlg = experimentalAppendBlockMove(new Sequence(units.slice(0, length - 1)), finalMove, true, this.legacyExperimentalCoalesceModFunc(finalMove));
      this.alg = newAlg;
    }
  }
  fullscreen() {
    this.requestFullscreen();
  }
}
customElementsShim.define("twisty-player", TwistyPlayer2);

// src/cubing/twisty/animation/alg/SimpleAlgIndexer.ts
class SimpleAlgIndexer {
  constructor(puzzle, alg18) {
    this.puzzle = puzzle;
    this.durationFn = new AlgDuration(DefaultDurationForAmount);
    this.moves = expand(alg18);
  }
  getMove(index) {
    return this.moves.nestedUnits[index];
  }
  indexToMoveStartTimestamp(index) {
    const seq = new Sequence(this.moves.nestedUnits.slice(0, index));
    return this.durationFn.traverse(seq);
  }
  timestampToIndex(timestamp) {
    let cumulativeTime = 0;
    let i2;
    for (i2 = 0; i2 < this.numMoves(); i2++) {
      cumulativeTime += this.durationFn.traverseBlockMove(this.getMove(i2));
      if (cumulativeTime >= timestamp) {
        return i2;
      }
    }
    return i2;
  }
  stateAtIndex(index) {
    return this.puzzle.combine(this.puzzle.startState(), this.transformAtIndex(index));
  }
  transformAtIndex(index) {
    let state = this.puzzle.identity();
    for (const move of this.moves.nestedUnits.slice(0, index)) {
      state = this.puzzle.combine(state, this.puzzle.stateFromMove(move));
    }
    return state;
  }
  algDuration() {
    return this.durationFn.traverse(this.moves);
  }
  numMoves() {
    return countAnimatedMoves(this.moves);
  }
  moveDuration(index) {
    return this.durationFn.traverseBlockMove(this.getMove(index));
  }
}

// src/cubing/twisty/animation/stream/timeline-move-calculation-draft.ts
function isSameAxis(move1, move2) {
  const familyRoots = move1.family[0].toLowerCase() + move2.family[0].toLowerCase();
  return ![
    "uu",
    "ud",
    "du",
    "dd",
    "ll",
    "lr",
    "rl",
    "rr",
    "ff",
    "fb",
    "bf",
    "bb"
  ].includes(familyRoots);
}
function toAxes(events, diameterMs) {
  const axes = [];
  const axisMoveTracker = new Map();
  let lastEntry = null;
  for (const event of events) {
    if (!lastEntry) {
      lastEntry = {
        event,
        start: event.timeStamp - diameterMs / 2,
        end: event.timeStamp + diameterMs / 2
      };
      axes.push([lastEntry]);
      axisMoveTracker.set(experimentalBlockMoveQuantumName(lastEntry.event.move), lastEntry);
      continue;
    }
    const newEntry = {
      event,
      start: event.timeStamp - diameterMs / 2,
      end: event.timeStamp + diameterMs / 2
    };
    if (isSameAxis(lastEntry.event.move, event.move)) {
      const quarterName = experimentalBlockMoveQuantumName(newEntry.event.move);
      const prev = axisMoveTracker.get(quarterName);
      if (prev && prev.end > newEntry.start && Math.sign(prev.event.move.amount) === Math.sign(newEntry.event.move.amount)) {
        prev.event.move = new BlockMove(prev.event.move.outerLayer, prev.event.move.innerLayer, prev.event.move.family, prev.event.move.amount + newEntry.event.move.amount);
      } else {
        axes[axes.length - 1].push(newEntry);
        axisMoveTracker.set(quarterName, newEntry);
      }
    } else {
      axes.push([newEntry]);
      axisMoveTracker.clear();
      axisMoveTracker.set(experimentalBlockMoveQuantumName(newEntry.event.move), newEntry);
      if (newEntry.start < lastEntry.end) {
        const midpoint = (newEntry.start + lastEntry.end) / 2;
        newEntry.start = midpoint;
        lastEntry.end = midpoint;
      }
    }
    lastEntry = newEntry;
  }
  return axes;
}
const defaultDiameterMs = 200;
function toTimeline(events, diameterMs = defaultDiameterMs) {
  const axes = toAxes(events, diameterMs);
  return axes.flat();
}
//# sourceMappingURL=index.js.map
