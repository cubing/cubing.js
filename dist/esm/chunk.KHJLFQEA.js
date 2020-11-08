var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var __exportStar = (target, module, desc) => {
  __markAsModule(target);
  if (typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module) => {
  if (module && module.__esModule)
    return module;
  return __exportStar(__defProp(__create(__getProtoOf(module)), "default", {value: module, enumerable: true}), module);
};

// src/alg/parser/parser-pegjs.js
var require_parser_pegjs = __commonJS((exports, module) => {
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
    function hex(ch) {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }
    function literalEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex(ch);
      });
    }
    function classEscape(s) {
      return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
        return "\\x0" + hex(ch);
      }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
        return "\\x" + hex(ch);
      });
    }
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      var descriptions = expected2.map(describeExpectation);
      var i, j;
      descriptions.sort();
      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
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
      var p;
      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }
        details = peg$posDetailsCache[p];
        details = {
          line: details.line,
          column: details.column
        };
        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
          p++;
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
      var s0, s1, s2;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = [];
      rule$expects(peg$e0);
      if (peg$r0.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          rule$expects(peg$e0);
          if (peg$r0.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
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
      var s0, s1, s2;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseNUMBER();
      if (s1 !== peg$FAILED) {
        rule$expects(peg$e1);
        if (input.charCodeAt(peg$currPos) === 39) {
          s2 = peg$c0;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2;
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
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            rule$expects(peg$e6);
            if (peg$r1.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
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
      var s0, s1, s2, s3, s4;
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
          s2 = peg$parseFAMILY();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f6(s1, s2);
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
              s2 = peg$c5;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3, s4, s5;
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
          s2 = peg$parseSEQUENCE();
          if (s2 !== peg$FAILED) {
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
                  s0 = peg$f8(s2, s3, s4);
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
            s2 = peg$parseSEQUENCE();
            if (s2 !== peg$FAILED) {
              rule$expects(peg$e12);
              if (input.charCodeAt(peg$currPos) === 41) {
                s3 = peg$c9;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
              }
              if (s3 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f9(s2);
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
      var s0, s1, s2;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseREPEATABLE_UNIT();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseAMOUNT();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f10(s1, s2);
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
      var s0, s1, s2, s3;
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
        s2 = [];
        rule$expects(peg$e14);
        if (peg$r3.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          rule$expects(peg$e14);
          if (peg$r3.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f12(s2);
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
      var s0, s1, s2;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseSEGMENT_PART();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSEGMENT();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f15(s1, s2);
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
      var s0, s1, s2, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseSEGMENT();
      if (s1 !== peg$FAILED) {
        s2 = [];
        rule$expects(peg$e17);
        if (peg$r5.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            rule$expects(peg$e17);
            if (peg$r5.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3, s4;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = [];
      rule$expects(peg$e17);
      if (peg$r5.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
      }
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        rule$expects(peg$e17);
        if (peg$r5.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
        }
      }
      s2 = peg$parseUNIT_LIST();
      if (s2 !== peg$FAILED) {
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
        s0 = peg$f18(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        rule$expects(peg$e17);
        if (peg$r5.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          rule$expects(peg$e17);
          if (peg$r5.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
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
  module.exports = {
    SyntaxError: peg$SyntaxError,
    parse: peg$parse
  };
});

// src/alg/debug.ts
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

// src/alg/algorithm/alg-part.ts
class AlgPart {
}
function matchesAlgType(a, t) {
  return a.type === t;
}
function assertMatchesType(a, t) {
  if (!matchesAlgType(a, t)) {
    reportTypeMismatch(`Expected "type": "${t}", saw "type": "${a.type}".`);
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

// src/alg/algorithm/block-move.ts
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

// src/alg/traversal.ts
function dispatch(t, algPart, dataDown) {
  switch (algPart.type) {
    case "sequence":
      assertMatchesType(algPart, "sequence");
      return t.traverseSequence(algPart, dataDown);
    case "group":
      assertMatchesType(algPart, "group");
      return t.traverseGroup(algPart, dataDown);
    case "blockMove":
      assertMatchesType(algPart, "blockMove");
      return t.traverseBlockMove(algPart, dataDown);
    case "commutator":
      assertMatchesType(algPart, "commutator");
      return t.traverseCommutator(algPart, dataDown);
    case "conjugate":
      assertMatchesType(algPart, "conjugate");
      return t.traverseConjugate(algPart, dataDown);
    case "pause":
      assertMatchesType(algPart, "pause");
      return t.traversePause(algPart, dataDown);
    case "newLine":
      assertMatchesType(algPart, "newLine");
      return t.traverseNewLine(algPart, dataDown);
    case "comment":
      assertMatchesType(algPart, "comment");
      return t.traverseComment(algPart, dataDown);
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
    for (let i = 0; i < amount; i++) {
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
    for (let i = 0; i < sequence.nestedUnits.length; i++) {
      if (!this.traverse(sequence.nestedUnits[i], dataDownSeq.nestedUnits[i])) {
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
      for (let i = 1; i < sequence.nestedUnits.length; i++) {
        output += this.spaceBetween(sequence.nestedUnits[i - 1], sequence.nestedUnits[i]);
        output += this.traverse(sequence.nestedUnits[i]);
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

// src/alg/example.ts
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

// src/alg/validation.ts
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

// src/alg/parser/parser.js
const parser_pegjs = __toModule(require_parser_pegjs());

// src/alg/keyboard.ts
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

export {
  __defProp,
  AlgPart,
  BlockMove,
  cubeKeyMapping,
  parser_pegjs,
  setAlgPartTypeMismatchReportingLevel,
  Example,
  __markAsModule,
  ValidationError,
  BareBlockMove,
  Unit,
  Move,
  __commonJS,
  Annotation,
  TraversalDownUp,
  Container,
  Sequence,
  Group,
  __toModule,
  Commutator,
  Conjugate,
  Pause,
  NewLine,
  Comment,
  TraversalUp,
  validateSiGNMoves,
  validateFlatAlg,
  blockMoveToString,
  invert,
  expand,
  structureEquals,
  coalesceBaseMoves,
  algToString,
  algPartToStringForTesting
};
//# sourceMappingURL=chunk.KIGGIIWN.js.map
