import {
  Alg,
  AlgBuilder,
  LineComment,
  Move,
  Newline,
} from "../../../../cubing/alg";
import {
  KPattern,
  type KPatternData,
  type KPatternOrbitData,
  type KTransformation,
} from "../../../../cubing/kpuzzle";
import { eventInfo, puzzles } from "../../../../cubing/puzzles";
import { cubeLikePuzzleStickering } from "../../../../cubing/puzzles/stickerings/cube-like-stickerings";
import { PieceStickering } from "../../../../cubing/puzzles/stickerings/mask";
import { randomScrambleForEvent } from "../../../../cubing/scramble";
import type { TwistyAlgViewer, TwistyPlayer } from "../../../../cubing/twisty";
import "../../../../cubing/twisty/cubing-private"; // TwistyStreamSource
import type { TwistyStreamSource } from "../../../../cubing/twisty/cubing-private";
import { constructMoveCountDisplay } from "../../../../cubing/twisty/cubing-private";
import type { AlgWithIssues } from "../../../../cubing/twisty/model/props/puzzle/state/AlgProp";

const twistyStreamSource: TwistyStreamSource = document.querySelector(
  "twisty-stream-source",
)!;

const player = document.querySelector<TwistyPlayer>("twisty-player")!;
const scrambleElem = document.querySelector<TwistyAlgViewer>("#scramble")!;
const moveCountDisplay =
  document.querySelector<HTMLElement>("move-count-display")!;

const scrambleEvent = "333";
const puzzleLoader = puzzles[eventInfo(scrambleEvent)?.puzzleID ?? "3x3x3"];

const scramble = await (async () => {
  const scrambleString = new URL(location.href).searchParams.get("setup");
  if (scrambleString) {
    return Alg.fromString(scrambleString);
  }
  return await randomScrambleForEvent(scrambleEvent);
})();
(scrambleElem as any).setAlg(scramble); // TODO: haxx

const kpuzzle = await puzzleLoader.kpuzzle();
const solved = kpuzzle.defaultPattern();

constructMoveCountDisplay(player.experimentalModel, moveCountDisplay);

twistyStreamSource.addEventListener("move", (e) => {
  player.experimentalAddAlgLeaf(
    (e as any as { detail: { move: Move } }).detail.move,
    {
      cancel: {
        directional: "same-direction",
        puzzleSpecificModWrap: "gravity",
      },
      puzzleSpecificSimplifyOptions: puzzleLoader.puzzleSpecificSimplifyOptions,
    },
  );
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.which === 13) {
    e.preventDefault();
    (async () => {
      const a = document.createElement("a");
      a.href = await player.experimentalModel.twizzleLink();
      a.click();
    })();
  }
  if (e.code === "Backspace") {
    player.experimentalRemoveFinalChild();
    e.preventDefault();
  }
});

function flashSolution() {
  document
    .querySelector("#solution")
    ?.animate(
      [{ backgroundColor: "gray" }, { backgroundColor: "transparent" }],
      {
        duration: 250,
        easing: "ease-out",
      },
    );
}
document.addEventListener("copy", (e: ClipboardEvent) => {
  if (globalThis.getSelection?.()?.toString() === "") {
    console.log(
      "Detected no selected text, so the clipboard will be set to the solution.",
    );
    e.preventDefault();
    (async () => {
      navigator.clipboard.writeText(
        (await player.experimentalGet.alg()).toString(),
      );
      flashSolution();
    })();
  }
});

const IGNORED_PIECE_VALUE = 9999; // TODO: This should really be set to the lowest otherwise unused piece number in the orbit.
const ORIENTATION_ONLY_PIECE_VALUE = 9998; // TODO: This should really be set to the lowest otherwise unused piece number in the orbit.
const MYSTERY_PIECE_VALUE = 9997; // TODO: This should really be set to the lowest otherwise unused piece number in the orbit.

type FlatPuzzleStickering = Record<string, PieceStickering[]>;
function applyPuzzleStickering(
  pattern: KPattern,
  flatPuzzleStickering: FlatPuzzleStickering,
): KPattern {
  const newPatternData: KPatternData = {};
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    const patternOrbit = pattern.patternData[orbitDefinition.orbitName];
    const maskOrbit = flatPuzzleStickering[orbitDefinition.orbitName];
    const newOrbitData: KPatternOrbitData & { orientationMod: number[] } = {
      pieces: [],
      orientation: [],
      orientationMod: [],
    };

    for (let i = 0; i < orbitDefinition.numPieces; i++) {
      switch (maskOrbit[i]) {
        case PieceStickering.PermuteNonPrimary:
        // fallthrough
        case PieceStickering.Regular:
        // fallthrough
        case PieceStickering.Dim: {
          newOrbitData.pieces.push(patternOrbit.pieces[i]);
          newOrbitData.orientation.push(patternOrbit.orientation[i]);
          newOrbitData.orientationMod.push(
            patternOrbit.orientationMod?.[i] ?? 0,
          );
          break;
        }
        case PieceStickering.Ignored:
        // fallthrough
        case PieceStickering.Invisible: {
          newOrbitData.pieces.push(IGNORED_PIECE_VALUE);
          newOrbitData.orientation.push(0);
          newOrbitData.orientationMod.push(1);
          break;
        }
        case PieceStickering.IgnoreNonPrimary:
        // fallthrough
        case PieceStickering.Ignoriented:
        // fallthrough
        case PieceStickering.OrientationWithoutPermutation:
        // fallthrough
        case PieceStickering.OrientationStickers: {
          newOrbitData.pieces.push(ORIENTATION_ONLY_PIECE_VALUE);
          newOrbitData.orientation.push(patternOrbit.orientation[i]);
          newOrbitData.orientationMod.push(
            patternOrbit.orientationMod?.[i] ?? 0,
          );
          break;
        }
        case PieceStickering.Mystery: {
          newOrbitData.pieces.push(MYSTERY_PIECE_VALUE);
          newOrbitData.orientation.push(0);
          newOrbitData.orientationMod.push(1);
          break;
        }
        default: {
          throw new Error(
            `Unrecognized \`PieceMaskAction\` value: ${maskOrbit[i]}`,
          );
        }
      }
    }
    newPatternData[orbitDefinition.orbitName] = newOrbitData;
  }
  return new KPattern(pattern.kpuzzle, newPatternData);
}

const cubeOrientations: {
  inverseTransformation: KTransformation;
  algToNormalize: Alg;
}[] = [];
for (const moveToSetU of [
  null,
  new Move("x"),
  new Move("x2"),
  new Move("x'"),
  new Move("z"),
  new Move("z'"),
]) {
  for (const moveToSetF of [
    null,
    new Move("y"),
    new Move("y2"),
    new Move("y'"),
  ]) {
    const algBuilder: AlgBuilder = new AlgBuilder();
    if (moveToSetU) {
      algBuilder.push(moveToSetU);
    }
    if (moveToSetF) {
      algBuilder.push(moveToSetF);
    }
    const algToNormalize = algBuilder.toAlg();
    const inverseTransformation = kpuzzle.algToTransformation(algToNormalize);
    cubeOrientations.push({
      inverseTransformation,
      algToNormalize,
    });
  }
}

const orientedSolvedPattern: KPattern = kpuzzle.defaultPattern();

interface OrientationAnchor {
  orbitName: string;
  pieceIndex: number;
}

interface AnchorCoordinates {
  anchorPieceIndex: number;
  anchorOrientationIndex: number;
}

class PatternChecker {
  solvedPatternsByAnchorCoordinates: Record<
    number /* DRF piece */,
    Record<number /* DRF orientation */, KPattern>
  > = {};
  constructor(
    public name: string,
    private flatPuzzleStickering: FlatPuzzleStickering,
    private orientationAnchor: OrientationAnchor,
    public obviates: string[] = [],
  ) {
    for (const cubeOrientation of cubeOrientations) {
      const orientedPattern = orientedSolvedPattern.applyTransformation(
        cubeOrientation.inverseTransformation,
      );
      const maskedPattern = applyPuzzleStickering(
        orientedPattern,
        flatPuzzleStickering,
      );
      const { anchorPieceIndex, anchorOrientationIndex } =
        this.extractAnchorCoordinates(orientedPattern);
      const byOrientation = (this.solvedPatternsByAnchorCoordinates[
        anchorPieceIndex
      ] ??= {});
      byOrientation[anchorOrientationIndex] = maskedPattern;
    }
  }

  extractAnchorCoordinates(pattern: KPattern): AnchorCoordinates {
    const orbitData = pattern.patternData[this.orientationAnchor.orbitName];
    if (
      (orbitData.orientationMod?.[this.orientationAnchor.pieceIndex] ?? 0) !== 0
    ) {
      throw new Error("Unexpected partially known orientation");
    }
    return {
      anchorPieceIndex: orbitData.pieces[this.orientationAnchor.pieceIndex],
      anchorOrientationIndex:
        orbitData.orientation[this.orientationAnchor.pieceIndex],
    };
  }

  check(
    candidateFull3x3x3Pattern: KPattern,
  ): { isSolved: false } | { isSolved: true; algToNormalize: Alg } {
    for (const cubeOrientation of cubeOrientations) {
      const reorientedCandidate = candidateFull3x3x3Pattern.applyTransformation(
        cubeOrientation.inverseTransformation,
      );
      const candidateMasked = applyPuzzleStickering(
        reorientedCandidate,
        this.flatPuzzleStickering,
      );
      const { anchorPieceIndex, anchorOrientationIndex } =
        this.extractAnchorCoordinates(reorientedCandidate);
      const solvedPatternByDRF =
        this.solvedPatternsByAnchorCoordinates[anchorPieceIndex][
          anchorOrientationIndex
        ];
      if (candidateMasked.isIdentical(solvedPatternByDRF)) {
        const { algToNormalize } = cubeOrientation;
        return { isSolved: true, algToNormalize };
      }
    }
    return { isSolved: false };
  }
}

const R = PieceStickering.Regular;
const I = PieceStickering.Ignored;

const F2L1: [FlatPuzzleStickering, OrientationAnchor] = [
  {
    EDGES: [I, I, I, I, R, R, R, R, R, I, I, I],
    CORNERS: [I, I, I, I, R, I, I, I],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 4 },
];

const F2L2A: [FlatPuzzleStickering, OrientationAnchor] = [
  {
    EDGES: [I, I, I, I, R, R, R, R, R, R, I, I],
    CORNERS: [I, I, I, I, R, R, I, I],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 4 },
];

const F2L2O: [FlatPuzzleStickering, OrientationAnchor] = [
  {
    EDGES: [I, I, I, I, R, R, R, R, R, I, I, R],
    CORNERS: [I, I, I, I, R, I, R, I],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 4 },
];

const F2L3: [FlatPuzzleStickering, OrientationAnchor] = [
  {
    EDGES: [I, I, I, I, R, R, R, R, I, R, R, R],
    CORNERS: [I, I, I, I, I, R, R, R],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 4 },
];

const FirstLayer: [FlatPuzzleStickering, OrientationAnchor] = [
  {
    EDGES: [I, I, I, I, R, R, R, R, I, I, I, I],
    CORNERS: [I, I, I, I, R, R, R, R],
    CENTERS: [I, R, R, R, R, R],
  },
  { orbitName: "EDGES", pieceIndex: 4 },
];

const Roux1L: [FlatPuzzleStickering, OrientationAnchor] = [
  {
    EDGES: [I, I, I, I, I, I, I, R, I, R, I, R],
    CORNERS: [I, I, I, I, I, R, R, I],
    CENTERS: [I, R, I, I, I, I],
  },
  { orbitName: "CORNERS", pieceIndex: 5 },
];

// const Roux1R: [FlatPuzzleStickering, OrientationAnchor] = [
//   {
//     EDGES: [I, I, I, I, I, R, I, I, R, I, R, I],
//     CORNERS: [I, I, I, I, R, I, I, R],
//     CENTERS: [I, I, I, R, I, I],
//   },
//   { orbitName: "CORNERS", pieceIndex: 4 },
// ];

const Roux2: [FlatPuzzleStickering, OrientationAnchor] = [
  {
    EDGES: [I, I, I, I, I, R, I, R, R, R, R, R],
    CORNERS: [I, I, I, I, R, R, R, R],
    CENTERS: [I, R, I, R, I, I],
  },
  { orbitName: "CORNERS", pieceIndex: 5 },
];

const patternCheckers: PatternChecker[] = [];

async function addSimpleStep(
  stickering: string,
  orbitName: string,
  pieceIndex: number,
  name?: string,
  obviates: string[] = [],
) {
  patternCheckers.push(
    new PatternChecker(
      name ?? stickering,
      Object.fromEntries(
        (
          await cubeLikePuzzleStickering(puzzleLoader, stickering)
        ).stickerings.entries(),
      ),
      {
        orbitName,
        pieceIndex,
      },
      obviates,
    ),
  );
}

const LSLLStuff = ["OLL", "OCLL", "EOLL", "F2L", "CLS", "ELS"];

const XCrosses = [
  "X-Cross",
  "Double X-Cross (adjacent)",
  "Double X-Cross (opposite)",
  "Triple X-Cross",
  "First Layer",
];

const RouxBlocks = ["Both Roux blocks", "1st Roux block"];

const CFOP_Stuff = [...XCrosses, ...LSLLStuff];
const XRoux = [...XCrosses, ...RouxBlocks];

// Note: these are topologically sorted.
// TODO: add "prerequisites" (e.g. EOLL for ZBLL, OLL for PLL, ELS for CLS, Roux blocks for Rouxh L10P steps, etc.)
await addSimpleStep("full", "EDGES", 4, "Solved");
await addSimpleStep("PLL", "EDGES", 4);
await addSimpleStep("L6E", "EDGES", 4);
await addSimpleStep("OLL", "EDGES", 4, undefined, [
  "ELS",
  "CLS",
  "CLL",
  "Solved",
  "L6E",
]);
await addSimpleStep("OLL", "EDGES", 4);
await addSimpleStep("OCLL", "EDGES", 4);
await addSimpleStep("EOLL", "EDGES", 4);
await addSimpleStep("F2L", "EDGES", 4, undefined, ["CLS"]);
await addSimpleStep("CLS", "EDGES", 4, undefined, [
  "OLL",
  "OCLL",
  "EOLL",
  "F2L",
  "Solved",
  "L6E",
]);
await addSimpleStep("ELS", "EDGES", 4, undefined, [
  "OLL",
  "OCLL",
  "EOLL",
  "F2L",
]);
patternCheckers.push(new PatternChecker("Triple X-Cross", ...F2L3, XRoux));
patternCheckers.push(new PatternChecker("F2L Slot 3", ...F2L3, XRoux));
patternCheckers.push(
  new PatternChecker("Double X-Cross (opposite)", ...F2L2O, XRoux),
);
patternCheckers.push(
  new PatternChecker("Double X-Cross (adjacent)", ...F2L2A, XRoux),
);
patternCheckers.push(
  new PatternChecker("F2L Slot 2 (adjacent)", ...F2L2A, XRoux),
);
patternCheckers.push(
  new PatternChecker("F2L Slot 2 (opposite)", ...F2L2O, XRoux),
);
patternCheckers.push(new PatternChecker("X-Cross", ...F2L1, XRoux));
patternCheckers.push(new PatternChecker("First Layer", ...FirstLayer, XRoux)); // TODO: this is usually obviated by 1st Roux block
patternCheckers.push(new PatternChecker("F2L Slot 1", ...F2L1, XRoux));

await addSimpleStep("2x2x3", "CORNERS", 6);

// await addSimpleStep("L6EO", "CORNERS", 4, undefined, CFOP_Stuff); // TODO
await addSimpleStep("CMLL", "CORNERS", 4, undefined, CFOP_Stuff); // TODO: AUF
patternCheckers.push(
  new PatternChecker("Both Roux blocks", ...Roux2, [
    ...CFOP_Stuff,
    "Solved",
    "PLL",
  ]),
);
patternCheckers.push(
  new PatternChecker("1st Roux block", ...Roux1L, CFOP_Stuff),
); // TODO: detect left vs. right

// await addSimpleStep("EOCross", "EDGES", 4); // TODO
await addSimpleStep("Cross", "EDGES", 4, undefined, XCrosses);
// TODO: daisy
await addSimpleStep("2x2x2", "CORNERS", 6);
// TODO: 1x2x2?
// await addSimpleStep("EO", "EDGES", 0); // TODO

const obviated = new Set<string>();

let lastI = patternCheckers.length + 1;
export function multiCheck(pattern: KPattern): string | null {
  console.log("--------");
  for (const [i, patternChecker] of patternCheckers.entries()) {
    if (i >= lastI) {
      return null;
    }
    if (obviated.has(patternChecker.name)) {
      continue;
    }
    // if (skip.has(patternChecker.name)) {
    //   continue;
    // }
    const isSolvedInfo = patternChecker.check(pattern);
    if (isSolvedInfo.isSolved) {
      console.log(
        `[${patternChecker.name}] Solved, orient using: ${
          isSolvedInfo.algToNormalize.experimentalIsEmpty()
            ? "(empty alg)"
            : isSolvedInfo.algToNormalize
        }`,
      );
      lastI = i;
      obviated.add(patternChecker.name);
      for (const newlyObviated of patternChecker.obviates) {
        console.log("obviating", newlyObviated);
        obviated.add(newlyObviated);
      }
      return patternChecker.name;
    } else {
      // console.log(`[${patternChecker.name}] Unsolved`);
    }
  }

  return null;
}

// multiCheck(
//   new Alg(`
// R2 L2 F U' F B2 U L2 U2 R2 B L2 B' L2 D2 R2 F R2 B'

// y' x U2' L2 x U2' R U R' U' R // X-Cross
// U' R U R' L U' L' // Slot 2
// R U' R' U' L' U' L // Slot 3 + ELS
// `),
// );

player.experimentalSetupAlg = scramble;

let justDetected = false;
player?.experimentalModel.puzzleAlg.addFreshListener(
  (algWithIssues: AlgWithIssues) => {
    player.experimentalModel.alg.set(
      (async () => {
        if (justDetected) {
          justDetected = false;
          return algWithIssues.alg;
        }

        const setupAlg =
          await player.experimentalModel.setupAlgTransformation.get(); // TODO: dedup?
        const pattern = solved
          .applyTransformation(setupAlg)
          .applyAlg(algWithIssues.alg);

        const signature = multiCheck(pattern);
        if (signature !== null) {
          justDetected = true;
          return new Alg([
            ...algWithIssues.alg.childAlgNodes(),
            new LineComment(` ${signature}`),
            new Newline(), // TODO: this should not be necessary
          ]);
        }
        return algWithIssues.alg;
      })(),
    );
  },
);
