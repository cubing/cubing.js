import {
  BlockMove,
  __commonJS,
  __toModule,
  blockMoveToString,
  expand
} from "./chunk.KHJLFQEA.js";

// src/kpuzzle/parser/parser-pegjs.js
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
    var peg$f0 = function(def) {
      return fixMoves(def);
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
    function fixMoves(def) {
      for (const moveName in def.moves) {
        const move = def.moves[moveName];
        for (const orbitName in def.orbits) {
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
      return def;
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

// src/kpuzzle/transformations.ts
function Combine(def, t1, t2) {
  const newTrans = {};
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
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
function Multiply(def, t, amount) {
  if (amount < 0) {
    return Multiply(def, Invert(def, t), -amount);
  }
  if (amount === 0) {
    return IdentityTransformation(def);
  }
  if (amount === 1) {
    return t;
  }
  const halfish = Multiply(def, t, Math.floor(amount / 2));
  const twiceHalfish = Combine(def, halfish, halfish);
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return Combine(def, t, twiceHalfish);
  }
}
function IdentityTransformation(definition) {
  const transformation = {};
  for (const orbitName in definition.orbits) {
    const orbitDefinition = definition.orbits[orbitName];
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
    transformation[orbitName] = orbitTransformation;
  }
  return transformation;
}
function Invert(def, t) {
  const newTrans = {};
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o = t[orbitName];
    const newPerm = new Array(oDef.numPieces);
    const newOri = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      const fromIdx = o.permutation[idx];
      newPerm[fromIdx] = idx;
      newOri[fromIdx] = (oDef.orientations - o.orientation[idx] + oDef.orientations) % oDef.orientations;
    }
    newTrans[orbitName] = {permutation: newPerm, orientation: newOri};
  }
  return newTrans;
}

// src/kpuzzle/kpuzzle.ts
function stateForBlockMove(def, blockMove) {
  const move = getNotationLayer(def).lookupMove(blockMove);
  if (!move) {
    throw new Error("Unknown move: " + blockMoveToString(blockMove));
  }
  return move;
}
function getNotationLayer(def) {
  if (!def.moveNotation) {
    def.moveNotation = new KPuzzleMoveNotation(def);
  }
  return def.moveNotation;
}
class KPuzzleMoveNotation {
  constructor(def) {
    this.def = def;
    this.cache = {};
  }
  lookupMove(move) {
    const key = blockMoveToString(move);
    let r = this.cache[key];
    if (r) {
      return r;
    }
    const baseMove = new BlockMove(move.outerLayer, move.innerLayer, move.family, 1);
    const baseKey = blockMoveToString(baseMove);
    r = this.def.moves[baseKey];
    if (r) {
      r = Multiply(this.def, r, move.amount);
      this.cache[key] = r;
    }
    return r;
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

// src/kpuzzle/definitions/2x2x2.kpuzzle.json
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

// src/kpuzzle/definitions/svg-inlined/2x2x2.kpuzzle.svg.ts
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

// src/kpuzzle/definitions/3x3x3.kpuzzle.json
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

// src/kpuzzle/definitions/svg-inlined/3x3x3.kpuzzle.svg.ts
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

// src/kpuzzle/definitions/svg-inlined/3x3x3-ll.kpuzzle.svg.ts
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

// src/kpuzzle/definitions/pyraminx.kpuzzle.json
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

// src/kpuzzle/definitions/svg-inlined/pyraminx.kpuzzle.svg.ts
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

// src/kpuzzle/definitions/sq1-hyperorbit.kpuzzle.json
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

// src/kpuzzle/definitions/svg-inlined/sq1-hyperorbit.kpuzzle.svg.ts
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

// src/kpuzzle/definitions/clock.kpuzzle.json
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

// src/kpuzzle/definitions/svg-inlined/clock.kpuzzle.svg.ts
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

// src/kpuzzle/definitions/index.ts
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

// src/kpuzzle/puzzle_definitions.ts
const Puzzles = {
  "2x2x2": Cube222,
  "3x3x3": Cube333,
  "3x3x3LL": Cube333LL,
  pyraminx: Pyraminx,
  sq1: Square1,
  clock: Clock
};

// src/kpuzzle/parser/parser-shim.js
const parser_pegjs = __toModule(require_parser_pegjs());

// src/kpuzzle/parser/parser.ts
const parseKPuzzle = parser_pegjs.parse;

export {
  parseKPuzzle,
  Puzzles,
  Combine,
  stateForBlockMove,
  Multiply,
  KPuzzle,
  IdentityTransformation,
  Invert
};
//# sourceMappingURL=chunk.ERFCDPMT.js.map
