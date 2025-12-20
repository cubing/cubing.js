/**

To run this file directly:

```shell
bun run ./src/bin/puzzle-geometry-bin.ts -- <program args>
```

To test completions:

```shell
# fish (from repo root)
set PATH (pwd)/src/test/bin-path $PATH
puzzle-geometry --completions fish | source
```

```shell
# zsh (from repo root)
autoload -Uz compinit
compinit
export PATH=$(pwd)/src/test/bin-path:$PATH
source <(puzzle-geometry --completions zsh)
```

*/

import { argv } from "node:process";
import {
  argument,
  constant,
  flag,
  integer,
  type Message,
  map,
  merge,
  message,
  type OptionName,
  object,
  option,
  optional,
  or,
  string,
} from "@optique/core";
import { run } from "@optique/run";
import { Move } from "cubing/alg";
import {
  type ExperimentalPuzzleGeometryOptions,
  getPG3DNamedPuzzles,
  PuzzleGeometry,
  parsePuzzleDescription,
} from "cubing/puzzle-geometry";
import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";
import { packageVersion } from "./common/packageVersion";

const puzzleList = getPG3DNamedPuzzles();

// TODO: make this a `ValueParser`?
function antiBool(optionName: OptionName, description: Message) {
  return optional(
    map(
      flag(optionName, {
        description,
      }),
      (v) => !v,
    ),
  );
}

// Include using `...subcommandDefaults` at the *beginning* of a subcommand `object({ … })`.
const subcommandDefaults = {
  commentStyle: constant("hash"),
  forceQuiet: constant(undefined),
} as const;

const args = run(
  merge(
    object({
      // TODO: make these exclusive. https://github.com/dahlia/optique/issues/57
      verbose: optional(map(flag("--verbose", "-v"), () => 1)),
      quiet: optional(map(flag("--quiet", "-q"), () => 0)),
    }),
    or(
      object({
        ...subcommandDefaults,
        subcommand: constant("KSolve"),
        subcommandFlag: flag("--ksolve", {
          description: message`Print KSolve (\`.tws\`). Forces \`--quiet\`.`,
        }),
      }),
      object({
        ...subcommandDefaults,
        subcommand: constant("SVG"),
        subcommandFlag: flag("--svg", {
          description: message`Print SVG.`,
        }),
        commentStyle: constant("none"),
        svg3D: optional(
          option("--3d", {
            description: message`Use 3D format for SVG file.`,
          }),
        ),
        // This is here to avoid making the usage output more complicated.
        forceQuiet: constant(0),
      }),
      object({
        ...subcommandDefaults,
        subcommand: constant("GAP"),
        subcommandFlag: flag("--gap", {
          description: message`Print GAP output.`,
        }),
      }),
      object({
        ...subcommandDefaults,
        subcommand: constant("Mathematica"),
        subcommandFlag: flag("--mathematica", {
          description: message`Print Mathematica output.`,
        }),
        commentStyle: constant("Pascal"),
      }),
      object({
        ...subcommandDefaults,
        subcommand: constant("Schreier-Sims"),
        subcommandFlag: flag("--ss", {
          description: message`Perform Schrier-Sims calculation.`,
        }),
      }),
      object({
        ...subcommandDefaults,
        subcommand: constant("Canonical string analysis"),
        subcommandFlag: flag("--canon", {
          description: message`Print canonical string analysis.`,
        }),
      }),
      object({
        ...subcommandDefaults,
        subcommand: constant("3D"),
        subcommandFlag: flag("--3d", {
          description: message`Print 3D information.`,
        }),
      }),
    ),
    object({
      // This doesn't apply to SVG, but we place it here so that it doesn't print once for each non-SVG subcommand in the help string.
      optimizeOrbits: option("--optimize", {
        description: message`Optimize output (when possible).`,
      }),
      addRotations: option("--rotations", {
        description: message`Include full-puzzle rotations as moves.`,
      }),
      allMoves: option("--allmoves", {
        description: message`Includes all moves (i.e., slice moves for 3x3x3).`,
      }),
      outerBlockMoves: option("--outerblockmoves", {
        description: message`Use outer block moves rather than slice moves.`,
      }),
      vertexMoves: option("--vertexmoves", {
        description: message`For tetrahedral puzzles, prefer vertex moves to face moves.`,
      }),
      includeCornerOrbits: antiBool(
        "--nocorners",
        message`Ignore all corners.`,
      ),
      excludeOrbits: optional(
        map(
          option("--omit", string({ metavar: "COMMA_SEPARATED_ORBITS" }), {
            description: message`Omit orbits.`,
          }),
          (s) => s.split(","),
        ),
      ),
      includeEdgeOrbits: antiBool("--noedges", message`Ignore all edges.`),
      includeCenterOrbits: antiBool(
        "--nocenters",
        message`Ignore all centers.`,
      ),
      grayCorners: option("--graycorners", {
        description: message`Gray corners.`,
      }),
      grayEdges: option("--grayedges", { description: message`Gray edges.` }),
      grayCenters: option("--graycenters", {
        description: message`Gray centers.`,
      }),
    }),
    object({
      // TODO: make these appropriately exclusive. https://github.com/dahlia/optique/issues/57
      fixedOrientation: option("--noorientation", {
        description: message`Ignore orientations.`,
      }),
      orientCenters: option("--orientcenters", {
        description: message`Give centers an orientation.`,
      }),
      puzzleOrientation: optional(
        map(
          option("--puzzleorientation", string({ metavar: "JSON_STRING" }), {
            description: message`For 3D formats, give puzzle orientation.`,
          }),
          (s) => JSON.parse(s),
        ),
      ),
      puzzleOrientations: optional(
        map(
          option("--puzzleorientations", string({ metavar: "JSON_STRING" }), {
            description: message`For 3D formats, give puzzle orientations.`,
          }),
          (s) => JSON.parse(s),
        ),
      ),
    }),
    object({
      // TODO: make these exclusive. https://github.com/dahlia/optique/issues/57
      fixCorner: optional(
        map(
          flag("--fixcorner", {
            description: message`Auto-select a subset of moves to keep a corner fixed in place.`,
          }),
          () => "v" as const,
        ),
      ),
      fixEdge: optional(
        map(
          flag("--fixedge", {
            description: message`Auto-select a subset of moves to keep an edge fixed in place.`,
          }),
          () => "e" as const,
        ),
      ),
      fixCenter: optional(
        map(
          flag("--fixcenter", {
            description: message`Auto-select a subset of moves to keep a center fixed in place.`,
          }),
          () => "f" as const,
        ),
      ),
    }),
    object({
      // TODO: this doesn't make sense for all subcommands?
      scrambleAmount: optional(
        option("--scramble", integer({ min: 0 }), {
          description: message`Scramble solved position.`,
        }),
      ),
      moveList: optional(
        map(
          option("--moves", string({ metavar: "COMMA_SEPARATED_MOVES" }), {
            description: message`Restrict moves to this list. Example: \"U2,F,r\").`,
          }),
          (s) => s.split(",").map((m) => Move.fromString(m)),
        ),
      ),
      puzzle: map(
        argument(string({ metavar: "PUZZLE" }), {
          description: message`The puzzle can be given as a geometric description or by name.
The geometric description starts with one of:

- \`c\` (cube),\n
- \`t\` (tetrahedron),\n
- \`d\` (dodecahedron),\n
- \`i\` (icosahedron),\n
- \`o\` (octahedron),\n

then a space, then a series of cuts. Each cut begins with one of:

- \`f\` (for a cut parallel to faces),\n
- \`v\` (for a cut perpendicular to a ray from the center through a corner),\n
- \`e\` (for a cut perpendicular to a ray from the center through an edge),\n

followed by a decimal number giving a distance, where 1 is the distance
between the center of the puzzle and the center of a face.

Example description: \`c f 0 v 0.577350269189626 e 0\`. Corresponds to: https://alpha.twizzle.net/explore/?puzzle=2x2x2+%2B+dino+%2B+little+chop

The recognized puzzle names are: ${Object.keys(puzzleList)
            .map((p) => JSON.stringify(p))
            .join(", ")}`,
        }),
        (s) => {
          const parsed = parsePuzzleDescription(puzzleList[s] ?? s);
          if (parsed === null) {
            throw new Error("Could not parse puzzle description!");
          }
          return parsed;
        },
      ),
    }),
  ),
  {
    programName: new Path(argv[1]).basename.path,
    description: message`
Examples:

    puzzle-geometry --ss 2x2x2\n
    puzzle-geometry --ss --fixcorner 2x2x2\n
    puzzle-geometry --ss --moves U,F2,r 4x4x4\n
    puzzle-geometry --ksolve --optimize --moves U,F,R megaminx\n
    puzzle-geometry --gap --noedges megaminx
`,
    help: "option",
    completion: {
      mode: "option",
      name: "plural",
    },
    version: {
      mode: "option",
      value: packageVersion,
    },
  },
);

const verbosity: number | undefined =
  args.forceQuiet ?? args.verbose ?? args.quiet;

if (verbosity !== 0) {
  const cmd = () => {
    const [command, ...args] = argv;
    return new PrintableShellCommand(command, args).getPrintableCommand({
      argumentLineWrapping: "inline",
    });
  };

  switch (args.commentStyle) {
    case "hash": {
      console.log(`# ${cmd()}`);
      break;
    }
    case "none": {
      break;
    }
    case "Pascal": {
      console.log(`(* ${cmd()} *)`);
      break;
    }
    default:
      throw new Error("Invalid comment style.") as never;
  }
}

function buildPuzzleGeometry(): PuzzleGeometry {
  const fixedPieceType = args.fixCorner ?? args.fixEdge ?? args.fixCenter;
  const {
    optimizeOrbits,
    addRotations,
    allMoves,
    outerBlockMoves,
    vertexMoves,
    includeCornerOrbits,
    includeCenterOrbits,
    includeEdgeOrbits,
    excludeOrbits,
    grayCorners,
    grayEdges,
    grayCenters,
    fixedOrientation,
    orientCenters,
    scrambleAmount,
    moveList,
  } = args;
  const options: ExperimentalPuzzleGeometryOptions = {
    verbosity,
    optimizeOrbits,
    addRotations,
    allMoves,
    outerBlockMoves,
    vertexMoves,
    includeCornerOrbits,
    includeCenterOrbits,
    includeEdgeOrbits,
    excludeOrbits,
    grayCorners,
    grayEdges,
    grayCenters,
    fixedOrientation,
    orientCenters,
    scrambleAmount,
    moveList,
    fixedPieceType,
  };

  const puzzleGeometry = new PuzzleGeometry(args.puzzle, options);
  // TODO: why are these calls needed?
  puzzleGeometry.allstickers();
  puzzleGeometry.genperms();
  return puzzleGeometry;
}

switch (args.subcommand) {
  case "KSolve": {
    console.log(buildPuzzleGeometry().writeksolve());
    break;
  }
  case "SVG": {
    console.log(
      buildPuzzleGeometry().generatesvg(
        undefined,
        undefined,
        undefined,
        args.svg3D,
      ),
    );
    break;
  }
  case "GAP": {
    console.log(buildPuzzleGeometry().writegap());
    break;
  }
  case "Mathematica": {
    console.log(buildPuzzleGeometry().writemathematica());
    break;
  }
  case "Schreier-Sims": {
    buildPuzzleGeometry().writeSchreierSims(console.log);
    break;
  }
  case "Canonical string analysis": {
    buildPuzzleGeometry().showcanon(console.log);
    break;
  }
  case "3D": {
    console.log(JSON.stringify(buildPuzzleGeometry().get3d(), null, "  "));
    break;
  }
  default:
    throw new Error("Invalid subcommand.") as never;
}
