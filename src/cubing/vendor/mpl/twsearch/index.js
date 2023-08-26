console.info("Loading twsearch v0.4.2");
// src/js/api.ts
import { Alg } from "../../../alg";
async function importOnce() {
  const fn = (await import("./twsearch-BDAXZGZU.js")).default;
  return await fn();
}
var cachedEmscriptenModule = null;
async function emscriptenModule() {
  return cachedEmscriptenModule ?? (cachedEmscriptenModule = importOnce());
}
function cwrap(fn, returnType, argTypes, processReturnValue = (v) => v) {
  const wrapped = (async () => (await emscriptenModule()).cwrap(fn, returnType, argTypes))();
  return async (...args) => {
    return processReturnValue((await wrapped)(...args));
  };
}
var NoSolutionError = class extends Error {
};
function parseResult(s) {
  if (s === "--no solution--") {
    throw new NoSolutionError("");
  }
  return Alg.fromString(s);
}
var stringArg = ["string"];
var setArg = cwrap(
  "w_arg",
  "void",
  stringArg
);
var setKPuzzleDefString = cwrap(
  "w_setksolve",
  "void",
  stringArg
);
var solveScramble = cwrap(
  "w_solvescramble",
  "string",
  stringArg,
  parseResult
);
var solveState = cwrap(
  "w_solveposition",
  "string",
  stringArg,
  parseResult
);

// src/js/serialize.ts
var BLANK_LINE = "";
var END = "End";
function sanitize(s) {
  return s.replaceAll(/[^A-Za-z0-9]/g, "_");
}
function serializeMoveTransformation(name, t) {
  const outputLines = [];
  outputLines.push(`MoveTransformation ${sanitize(name)}`);
  for (const [orbitName, orbitData] of Object.entries(t)) {
    outputLines.push(sanitize(orbitName));
    outputLines.push(orbitData.permutation.join(" "));
    outputLines.push(orbitData.orientationDelta.join(" "));
  }
  outputLines.push(END);
  outputLines.push(BLANK_LINE);
  return outputLines.join("\n");
}
function serializeScrambleState(name, t) {
  const outputLines = [];
  outputLines.push(`ScrambleState ${sanitize(name)}`);
  for (const [orbitName, orbitData] of Object.entries(t)) {
    outputLines.push(sanitize(orbitName));
    outputLines.push(orbitData.pieces.join(" "));
    outputLines.push(orbitData.orientation.join(" "));
  }
  outputLines.push(END);
  outputLines.push(BLANK_LINE);
  return outputLines.join("\n");
}
function serializeDefToTws(kpuzzle, options) {
  let outputLines = [];
  const def = kpuzzle.definition;
  outputLines.push(`Name ${sanitize(def.name ?? "CustomPuzzle")}`);
  outputLines.push(BLANK_LINE);
  for (const [orbitName, orbitInfo] of Object.entries(def.orbits)) {
    outputLines.push(
      `Set ${sanitize(orbitName)} ${orbitInfo.numPieces} ${orbitInfo.numOrientations}`
    );
  }
  outputLines.push(BLANK_LINE);
  outputLines.push("StartState");
  if (options?.startState) {
    outputLines.push(options?.startState);
  } else {
    for (const [orbitName, orbitDef] of Object.entries(def.defaultPattern)) {
      outputLines.push(sanitize(orbitName));
      outputLines.push(orbitDef.pieces.join(" "));
      outputLines.push(orbitDef.orientation.join(" "));
    }
  }
  outputLines.push(END);
  outputLines.push(BLANK_LINE);
  function include(moveName) {
    if (options?.moveSubset) {
      return options.moveSubset.includes(moveName);
    } else {
      return true;
    }
  }
  for (const [moveName, moveDef] of Object.entries(def.moves)) {
    if (include(moveName)) {
      outputLines.push(serializeMoveTransformation(moveName, moveDef));
    }
  }
  for (const [moveName, moveAlgDef] of Object.entries(
    def.experimentalDerivedMoves ?? {}
  )) {
    if (include(moveName)) {
      const transformation = kpuzzle.algToTransformation(moveAlgDef);
      outputLines.push(
        serializeMoveTransformation(
          moveName,
          transformation.transformationData
        )
      );
    }
  }
  return outputLines.join("\n");
}
export {
  NoSolutionError,
  serializeDefToTws,
  serializeMoveTransformation,
  serializeScrambleState,
  setArg,
  setKPuzzleDefString,
  solveScramble,
  solveState
};
