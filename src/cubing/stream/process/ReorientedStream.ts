import { experimentalIs, Move } from "../../alg";
import { OldKPuzzle } from "../../kpuzzle";
import { oldExperimentalCube3x3x3KPuzzle as cube3x3x3KPuzzle } from "../../kpuzzle";

export interface PuzzleStreamMoveEventDetail {
  move: Move;
}

// TODO: CustomEvent<PuzzleStreamMoveEventDetail>
export interface PuzzleStreamMoveEvent {
  type: "move";
  detail: PuzzleStreamMoveEventDetail;
}

export type PuzzleStreamMoveEventRegisterCompatible =
  CustomEvent<PuzzleStreamMoveEventDetail>;

function ensurePuzzleStreamMoveEvent(
  event: CustomEvent,
): PuzzleStreamMoveEvent {
  // console.log(event);
  if (event?.type !== "move") {
    throw new Error("Received non-move.");
  }
  if (!experimentalIs(event?.detail?.move, Move)) {
    throw new Error("Event detail move was not a `Move`.");
  }
  return event as PuzzleStreamMoveEvent; // TODO
}

const faces = "ULFRBD";
// TODO: better typ
const rotationMap: Record<string, [Move, string]> = {
  U: [new Move("y"), "D"],
  L: [new Move("x'"), "R"],
  F: [new Move("z"), "B"],
  R: [new Move("x"), "L"],
  B: [new Move("z"), "F"],
  D: [new Move("y'"), "U"],
};

class OrientationTracker {
  kpuzzle = new OldKPuzzle(cube3x3x3KPuzzle); // TODO: can we do centers only (less data) with little code?

  processMove(move: Move): Move[] {
    // TODO: validation
    if ("xyz".includes(move.family)) {
      this.kpuzzle.applyMove(move);
      return [move];
    } else if (move.family.slice(-1) === "w") {
      const [rotation, family] = rotationMap[move.family.slice(-1)];
      return this.processMove(rotation).concat(
        this.processMove(move.modified({ family })),
      );
    } else if (move.family === move.family.toLowerCase()) {
      const [rotation, family] = rotationMap[move.family.toUpperCase()];
      return this.processMove(rotation).concat(
        this.processMove(move.modified({ family })),
      );
    } else {
      const faceIdx = faces.indexOf(move.family);
      const family =
        faces[this.kpuzzle.state["CENTERS"].permutation.indexOf(faceIdx)];
      return [move.modified({ family })];
    }
  }
}

export class ReorientedStream extends EventTarget {
  orientationTracker = new OrientationTracker();

  constructor(target: EventTarget) {
    super();
    target.addEventListener("move", (e: CustomEvent) =>
      this.onMove(ensurePuzzleStreamMoveEvent(e)),
    );
  }

  dispatchMove(detail: PuzzleStreamMoveEventDetail): void {
    this.dispatchEvent(
      new CustomEvent("move", {
        detail,
      }),
    );
  }

  onMove(event: PuzzleStreamMoveEvent): void {
    const moves = this.orientationTracker.processMove(event.detail.move);
    for (const move of moves) {
      this.dispatchMove({ move });
    }
  }
}
