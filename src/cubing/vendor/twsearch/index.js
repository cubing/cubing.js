// src/js/api.ts
import { Alg } from "../../../cubing/alg";
async function importOnce() {
  const fn = (await import("./twsearch-KX2MXVDL.js")).default;
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
var stringArg = ["string"];
var setArgs = cwrap(
  "w_args",
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
  Alg.fromString
);
var solveState = cwrap(
  "w_solveposition",
  "string",
  stringArg,
  Alg.fromString
);

// src/js/serialize.ts
var BLANK_LINE = "";
var END = "End";
function sanitize(s) {
  return s.replaceAll(/[^A-Za-z0-9]/g, "_");
}
function serializeKTransformationDataToTws(name, t, forScramble = false) {
  const outputLines = [];
  outputLines.push(
    `${forScramble ? "ScrambleState" : "MoveTransformation"} ${sanitize(name)}`
  );
  for (const [orbitName, orbitData] of Object.entries(t)) {
    outputLines.push(sanitize(orbitName));
    outputLines.push(orbitData.permutation.join(" "));
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
    for (const [orbitName, orbitDef] of Object.entries(def.startStateData)) {
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
      outputLines.push(serializeKTransformationDataToTws(moveName, moveDef));
    }
  }
  for (const [moveName, moveAlgDef] of Object.entries(
    def.experimentalDerivedMoves ?? {}
  )) {
    if (include(moveName)) {
      const transformation = kpuzzle.algToTransformation(moveAlgDef);
      outputLines.push(
        serializeKTransformationDataToTws(
          moveName,
          transformation.transformationData
        )
      );
    }
  }
  return outputLines.join("\n");
}
export {
  serializeDefToTws,
  serializeKTransformationDataToTws,
  setArgs,
  setKPuzzleDefString,
  solveScramble,
  solveState
};
//# sourceMappingURL=index.js.map
