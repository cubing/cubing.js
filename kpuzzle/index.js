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
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module) => {
  return __exportStar(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? {get: () => module.default, enumerable: true} : {value: module, enumerable: true})), module);
};

// src/cubing/kpuzzle/parser/parser-pegjs.js
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
    var peg$e1 = peg$classExpectation([
      ["A", "Z"],
      ["a", "z"]
    ], false, false);
    var peg$e2 = peg$classExpectation([
      ["A", "Z"],
      ["a", "z"],
      ["0", "9"]
    ], false, false);
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
      return [
        set_identifier,
        {numPieces: num_pieces, orientations: num_orientations}
      ];
    };
    var peg$f6 = function(orbit, orbits) {
      orbits[orbit[0]] = orbit[1];
      return orbits;
    };
    var peg$f7 = function(orbit) {
      const orbits = {};
      orbits[orbit[0]] = orbit[1];
      return orbits;
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
      return [
        set_identifier,
        {
          permutation,
          orientation: new Array(permutation.length).fill(0)
        }
      ];
    };
    var peg$f13 = function(definition, definitions) {
      definitions[definition[0]] = definition[1];
      return definitions;
    };
    var peg$f14 = function(definition) {
      const definitions = {};
      definitions[definition[0]] = definition[1];
      return definitions;
    };
    var peg$f15 = function(definitions) {
      return definitions;
    };
    var peg$f16 = function(identifier, definitions) {
      return [identifier, definitions];
    };
    var peg$f17 = function(move, moves) {
      moves[move[0]] = move[1];
      return moves;
    };
    var peg$f18 = function(move) {
      const moves = {};
      moves[move[0]] = move[1];
      return moves;
    };
    var peg$f19 = function(name, orbits, start_pieces, moves) {
      return {
        name,
        orbits,
        moves,
        startPieces: start_pieces
      };
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
      return {
        type: "class",
        parts,
        inverted,
        ignoreCase
      };
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
    function peg$end(invert) {
      var expected2 = peg$expected.pop();
      var top = peg$expected[peg$expected.length - 1];
      var variants = expected2.variants;
      if (top.pos !== expected2.pos) {
        return;
      }
      if (invert) {
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
        s1 = peg$f1(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseSET_IDENTIFIER() {
      var s0, s1, s2, s3;
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
        s2 = [];
        rule$expects(peg$e2);
        if (peg$r2.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          rule$expects(peg$e2);
          if (peg$r2.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f2(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
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
      rule$expects(peg$e3);
      if (peg$r3.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          rule$expects(peg$e3);
          if (peg$r3.test(input.charAt(peg$currPos))) {
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
      var s0, s1, s2, s3;
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
        s2 = peg$parseSPACE();
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3, s4, s5, s6, s7;
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
        s2 = peg$parseSPACE();
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseORBIT();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNEWLINE();
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseNUMBER();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSPACE();
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3, s4, s5;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseSET_IDENTIFIER();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNEWLINE();
        if (s2 !== peg$FAILED) {
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
          s2 = peg$parseNEWLINE();
          if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseDEFINITION();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNEWLINE();
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3, s4, s5;
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
        s2 = peg$parseNEWLINE();
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3, s4, s5, s6, s7;
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
        s2 = peg$parseSPACE();
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseMOVE();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNEWLINES();
        if (s2 !== peg$FAILED) {
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
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;
      var rule$expects = function(expected2) {
        if (peg$silentFails === 0)
          peg$expect(expected2);
      };
      s0 = peg$currPos;
      s1 = peg$parseNAME();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNEWLINES();
        if (s2 !== peg$FAILED) {
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
          for (let i = 0; i < perm.length; i++) {
            newOrientation[i] = oldOrientation[perm[i]];
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
  module.exports = {
    SyntaxError: peg$SyntaxError,
    parse: peg$parse
  };
});

// src/cubing/kpuzzle/kpuzzle.ts
import {Move} from "cubing/alg";

// src/cubing/kpuzzle/transformations.ts
var lasto;
function isIdentity(omod, o) {
  if (o === lasto) {
    return true;
  }
  const perm = o.permutation;
  const n = perm.length;
  for (let idx = 0; idx < n; idx++) {
    if (perm[idx] !== idx) {
      return false;
    }
  }
  if (omod > 1) {
    const ori = o.orientation;
    for (let idx = 0; idx < n; idx++) {
      if (ori[idx] !== 0) {
        return false;
      }
    }
  }
  lasto = o;
  return true;
}
function combineTransformations(def2, t1, t2) {
  const newTrans = {};
  for (const orbitName in def2.orbits) {
    const oDef = def2.orbits[orbitName];
    const o1 = t1[orbitName];
    const o2 = t2[orbitName];
    if (isIdentity(oDef.orientations, o2)) {
      newTrans[orbitName] = o1;
    } else if (isIdentity(oDef.orientations, o1)) {
      newTrans[orbitName] = o2;
    } else {
      const newPerm = new Array(oDef.numPieces);
      if (oDef.orientations === 1) {
        for (let idx = 0; idx < oDef.numPieces; idx++) {
          newPerm[idx] = o1.permutation[o2.permutation[idx]];
        }
        newTrans[orbitName] = {
          permutation: newPerm,
          orientation: o1.orientation
        };
      } else {
        const newOri = new Array(oDef.numPieces);
        for (let idx = 0; idx < oDef.numPieces; idx++) {
          newOri[idx] = (o1.orientation[o2.permutation[idx]] + o2.orientation[idx]) % oDef.orientations;
          newPerm[idx] = o1.permutation[o2.permutation[idx]];
        }
        newTrans[orbitName] = {permutation: newPerm, orientation: newOri};
      }
    }
  }
  return newTrans;
}
function multiplyTransformations(def2, t, amount) {
  if (amount < 0) {
    return multiplyTransformations(def2, invertTransformation(def2, t), -amount);
  }
  if (amount === 0) {
    return identityTransformation(def2);
  }
  if (amount === 1) {
    return t;
  }
  let halfish = t;
  if (amount !== 2) {
    halfish = multiplyTransformations(def2, t, Math.floor(amount / 2));
  }
  const twiceHalfish = combineTransformations(def2, halfish, halfish);
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return combineTransformations(def2, t, twiceHalfish);
  }
}
function identityTransformation(definition) {
  const transformation = {};
  for (const orbitName in definition.orbits) {
    const orbitDefinition = definition.orbits[orbitName];
    if (!lasto || lasto.permutation.length !== orbitDefinition.numPieces) {
      const newPermutation = new Array(orbitDefinition.numPieces);
      const newOrientation = new Array(orbitDefinition.numPieces);
      for (let i = 0; i < orbitDefinition.numPieces; i++) {
        newPermutation[i] = i;
        newOrientation[i] = 0;
      }
      const orbitTransformation = {
        permutation: newPermutation,
        orientation: newOrientation
      };
      lasto = orbitTransformation;
    }
    transformation[orbitName] = lasto;
  }
  return transformation;
}
function invertTransformation(def2, t) {
  const newTrans = {};
  for (const orbitName in def2.orbits) {
    const oDef = def2.orbits[orbitName];
    const o = t[orbitName];
    if (isIdentity(oDef.orientations, o)) {
      newTrans[orbitName] = o;
    } else if (oDef.orientations === 1) {
      const newPerm = new Array(oDef.numPieces);
      for (let idx = 0; idx < oDef.numPieces; idx++) {
        newPerm[o.permutation[idx]] = idx;
      }
      newTrans[orbitName] = {
        permutation: newPerm,
        orientation: o.orientation
      };
    } else {
      const newPerm = new Array(oDef.numPieces);
      const newOri = new Array(oDef.numPieces);
      for (let idx = 0; idx < oDef.numPieces; idx++) {
        const fromIdx = o.permutation[idx];
        newPerm[fromIdx] = idx;
        newOri[fromIdx] = (oDef.orientations - o.orientation[idx] + oDef.orientations) % oDef.orientations;
      }
      newTrans[orbitName] = {permutation: newPerm, orientation: newOri};
    }
  }
  return newTrans;
}
function gcd(a, b) {
  if (b) {
    return gcd(b, a % b);
  }
  return a;
}
function transformationOrder(def2, t) {
  let r = 1;
  for (const orbitName in def2.orbits) {
    const oDef = def2.orbits[orbitName];
    const o = t[orbitName];
    const d = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      if (!d[idx]) {
        let w = idx;
        let om = 0;
        let pm = 0;
        for (; ; ) {
          d[w] = true;
          om = om + o.orientation[w];
          pm = pm + 1;
          w = o.permutation[w];
          if (w === idx) {
            break;
          }
        }
        if (om !== 0) {
          pm = pm * oDef.orientations / gcd(oDef.orientations, om);
        }
        r = r * pm / gcd(r, pm);
      }
    }
  }
  return r;
}
function areOrbitTransformationsEquivalent(def2, orbitName, t1, t2, options = {}) {
  const oDef = def2.orbits[orbitName];
  const o1 = t1[orbitName];
  const o2 = t2[orbitName];
  for (let idx = 0; idx < oDef.numPieces; idx++) {
    if (!options?.ignoreOrientation && o1.orientation[idx] !== o2.orientation[idx]) {
      return false;
    }
    if (!options?.ignorePermutation && o1.permutation[idx] !== o2.permutation[idx]) {
      return false;
    }
  }
  return true;
}
function areTransformationsEquivalent(def2, t1, t2) {
  for (const orbitName in def2.orbits) {
    if (!areOrbitTransformationsEquivalent(def2, orbitName, t1, t2)) {
      return false;
    }
  }
  return true;
}
function areStatesEquivalent(def2, t1, t2) {
  return areTransformationsEquivalent(def2, combineTransformations(def2, def2.startPieces, t1), combineTransformations(def2, def2.startPieces, t2));
}

// src/cubing/kpuzzle/kpuzzle.ts
function transformationForQuantumMove(def2, quantumMove) {
  const transformation = getNotationLayer(def2).lookupMove(new Move(quantumMove));
  if (!transformation) {
    throw new Error("Unknown move: " + quantumMove.toString());
  }
  return transformation;
}
function transformationForMove(def2, move) {
  const transformation = getNotationLayer(def2).lookupMove(move);
  if (!transformation) {
    throw new Error("Unknown move: " + move.toString());
  }
  return transformation;
}
function getNotationLayer(def2) {
  if (!def2.moveNotation) {
    def2.moveNotation = new KPuzzleMoveNotation(def2);
  }
  return def2.moveNotation;
}
var KPuzzleMoveNotation = class {
  constructor(def2) {
    this.def = def2;
    this.cache = {};
  }
  lookupMove(move) {
    const key = move.toString();
    let r = this.cache[key];
    if (r) {
      return r;
    }
    const quantumKey = move.quantum.toString();
    r = this.def.moves[quantumKey];
    if (r) {
      r = multiplyTransformations(this.def, r, move.effectiveAmount);
      this.cache[key] = r;
    }
    return r;
  }
};
var KPuzzle = class {
  constructor(definition) {
    this.definition = definition;
    this.state = identityTransformation(definition);
  }
  reset() {
    this.state = identityTransformation(this.definition);
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
  applyMove(move) {
    this.state = combineTransformations(this.definition, this.state, transformationForMove(this.definition, move));
  }
  applyAlg(alg) {
    for (const move of alg.experimentalLeafMoves()) {
      this.applyMove(move);
    }
  }
};

// src/cubing/kpuzzle/canonicalize.ts
var InternalMove = class {
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
};
var Canonicalizer = class {
  constructor(def2) {
    this.def = def2;
    this.commutes = [];
    this.moveorder = [];
    this.movenames = [];
    this.transforms = [];
    this.moveindex = {};
    const basemoves = def2.moves;
    const id = identityTransformation(def2);
    for (const mv1 in basemoves) {
      this.moveindex[mv1] = this.movenames.length;
      this.movenames.push(mv1);
      this.transforms.push([id, basemoves[mv1]]);
    }
    this.baseMoveCount = this.movenames.length;
    for (let i = 0; i < this.baseMoveCount; i++) {
      this.commutes.push([]);
      const t1 = this.transforms[i][1];
      for (let j = 0; j < this.baseMoveCount; j++) {
        const t2 = this.transforms[j][1];
        const ab = combineTransformations(def2, t1, t2);
        const ba = combineTransformations(def2, t2, t1);
        this.commutes[i][j] = areTransformationsEquivalent(def2, ab, ba);
      }
    }
    for (let i = 0; i < this.baseMoveCount; i++) {
      const t1 = this.transforms[i][1];
      let ct = t1;
      let order = 1;
      for (let mult = 2; !areTransformationsEquivalent(def2, id, ct); mult++) {
        order++;
        ct = combineTransformations(def2, ct, t1);
        this.transforms[i].push(ct);
      }
      this.moveorder[i] = order;
    }
  }
  blockMoveToInternalMove(move) {
    const quantumMoveStr = move.quantum.toString();
    if (!(quantumMoveStr in this.def.moves)) {
      throw new Error("! move " + quantumMoveStr + " not in def.");
    }
    const ind = this.moveindex[quantumMoveStr];
    const mod = this.moveorder[ind];
    let tw = move.effectiveAmount % mod;
    if (tw < 0) {
      tw = (tw + mod) % mod;
    }
    return new InternalMove(ind, tw);
  }
  sequenceToSearchSequence(alg, tr) {
    const ss = new SearchSequence(this, tr);
    for (const move of alg.experimentalLeafMoves()) {
      ss.appendOneMove(this.blockMoveToInternalMove(move));
    }
    return ss;
  }
  mergeSequenceToSearchSequence(alg, tr) {
    const ss = new SearchSequence(this, tr);
    for (const move of alg.experimentalLeafMoves()) {
      ss.mergeOneMove(this.blockMoveToInternalMove(move));
    }
    return ss;
  }
};
var SearchSequence = class {
  constructor(canon, tr) {
    this.canon = canon;
    this.moveseq = [];
    if (tr) {
      this.trans = tr;
    } else {
      this.trans = identityTransformation(canon.def);
    }
  }
  clone() {
    const r = new SearchSequence(this.canon, this.trans);
    r.moveseq = [...this.moveseq];
    return r;
  }
  mergeOneMove(mv) {
    const r = this.onlyMergeOneMove(mv);
    this.trans = combineTransformations(this.canon.def, this.trans, mv.getTransformation(this.canon));
    return r;
  }
  appendOneMove(mv) {
    this.moveseq.push(mv);
    this.trans = combineTransformations(this.canon.def, this.trans, mv.getTransformation(this.canon));
    return 1;
  }
  popMove() {
    const mv = this.moveseq.pop();
    if (!mv) {
      throw new Error("Can't pop an empty sequence");
    }
    this.trans = combineTransformations(this.canon.def, this.trans, this.canon.transforms[mv.base][this.canon.moveorder[mv.base] - mv.twist]);
    return 1;
  }
  oneMoreTwist() {
    const lastmv = this.moveseq[this.moveseq.length - 1];
    this.trans = combineTransformations(this.canon.def, this.trans, this.canon.transforms[lastmv.base][1]);
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
    let r = this.moveseq.length;
    for (let i = 0; i < seq.moveseq.length; i++) {
      const mv = seq.moveseq[i];
      const d = this.onlyMergeOneMove(mv);
      r += d;
    }
    this.trans = combineTransformations(this.canon.def, this.trans, seq.trans);
    return r;
  }
  getSequenceAsString() {
    const r = [];
    for (const mv of this.moveseq) {
      r.push(mv.asString(this.canon));
    }
    return r.join(" ");
  }
};
var CanonicalSequenceIterator = class {
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
    for (let d = 0; ; d++) {
      yield* this.genSequence(d, []);
    }
  }
  *genSequenceTree(canonstate) {
    const r = yield this.ss;
    if (r > 0) {
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
};

// src/cubing/kpuzzle/parser/parser-shim.ts
var import_parser_pegjs = __toModule(require_parser_pegjs());
var pegParseKPuzzleDefinition = import_parser_pegjs.parse;

// src/cubing/kpuzzle/svg.ts
var xmlns = "http://www.w3.org/2000/svg";
var svgCounter = 0;
function nextSVGID() {
  svgCounter += 1;
  return "svg" + svgCounter.toString();
}
var colorMaps = {
  dim: {
    white: "#dddddd",
    orange: "#884400",
    limegreen: "#008800",
    red: "#660000",
    "rgb(34, 102, 255)": "#000088",
    yellow: "#888800"
  },
  oriented: {
    white: "#ff88ff",
    orange: "#ff88ff",
    limegreen: "#ff88ff",
    red: "#ff88ff",
    "rgb(34, 102, 255)": "#ff88ff",
    yellow: "#ff88ff"
  },
  ignored: {
    white: "#444444",
    orange: "#444444",
    limegreen: "#444444",
    red: "#444444",
    "rgb(34, 102, 255)": "#444444",
    yellow: "#444444"
  },
  invisible: {
    white: "#00000000",
    orange: "#00000000",
    limegreen: "#00000000",
    red: "#00000000",
    "rgb(34, 102, 255)": "#00000000",
    yellow: "#00000000"
  }
};
var KPuzzleSVGWrapper = class {
  constructor(kPuzzleDefinition, svgSource, experimentalAppearance) {
    this.kPuzzleDefinition = kPuzzleDefinition;
    this.originalColors = {};
    this.gradients = {};
    if (!svgSource) {
      throw new Error(`No SVG definition for puzzle type: ${kPuzzleDefinition.name}`);
    }
    this.svgID = nextSVGID();
    this.element = document.createElement("div");
    this.element.classList.add("svg-wrapper");
    this.element.innerHTML = svgSource;
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
          let originalColor = elem.style.fill;
          if (experimentalAppearance) {
            (() => {
              const a = experimentalAppearance.orbits;
              if (!a) {
                return;
              }
              const orbitAppearance = a[orbitName];
              if (!orbitAppearance) {
                return;
              }
              const pieceAppearance = orbitAppearance.pieces[idx];
              if (!pieceAppearance) {
                return;
              }
              const faceletAppearance = pieceAppearance.facelets[orientation];
              if (!faceletAppearance) {
                return;
              }
              const appearance = typeof faceletAppearance === "string" ? faceletAppearance : faceletAppearance?.appearance;
              const colorMap = colorMaps[appearance];
              if (colorMap) {
                originalColor = colorMap[originalColor];
              }
            })();
          } else {
            originalColor = elem.style.fill;
          }
          this.originalColors[id] = originalColor;
          this.gradients[id] = this.newGradient(id, originalColor);
          this.gradientDefs.appendChild(this.gradients[id]);
          elem.setAttribute("style", `fill: url(#grad-${this.svgID}-${id})`);
        }
      }
    }
  }
  drawKPuzzle(kpuzzle, nextState, fraction) {
    this.draw(kpuzzle.definition, kpuzzle.state, nextState, fraction);
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
};

// src/cubing/kpuzzle/puzzle-orientation.ts
import {experimentalNormalizePuzzleOrientation as normalize3x3x3Orientation} from "cubing/protocol";
import {experimentalCube3x3x3KPuzzle as def} from "cubing/puzzles";
function experimentalIs3x3x3Solved(transformation, options) {
  const normalized = normalize3x3x3Orientation(transformation);
  if (options.ignoreCenterOrientation) {
    return areOrbitTransformationsEquivalent(def, "EDGES", normalized, def.startPieces) && areOrbitTransformationsEquivalent(def, "CORNERS", normalized, def.startPieces);
  } else {
    return areTransformationsEquivalent(def, normalized, def.startPieces);
  }
}
export {
  CanonicalSequenceIterator,
  Canonicalizer,
  KPuzzle,
  KPuzzleSVGWrapper,
  SearchSequence,
  areOrbitTransformationsEquivalent,
  areStatesEquivalent,
  areTransformationsEquivalent,
  combineTransformations,
  experimentalIs3x3x3Solved,
  transformationForQuantumMove as experimentalTransformationForQuantumMove,
  identityTransformation,
  invertTransformation,
  multiplyTransformations,
  pegParseKPuzzleDefinition as parseKPuzzleDefinition,
  transformationForMove,
  transformationOrder
};
