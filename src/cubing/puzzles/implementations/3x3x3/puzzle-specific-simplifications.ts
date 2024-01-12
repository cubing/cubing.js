import type { PuzzleSpecificSimplifyOptions } from "../../../alg";
import { Move, QuantumMove } from "../../../alg";

enum Axis {
  X = "x axis",
  Y = "y axis",
  Z = "z axis",
}

enum MoveSourceType {
  INDEXABLE_SLICE_NEAR,
  INDEXABLE_SLICE_FAR,
  INDEXABLE_WIDE_NEAR,
  INDEXABLE_WIDE_FAR,
  SPECIFIC_SLICE,
  ROTATION,
}

interface MoveSourceInfo {
  family: string;
  direction: -1 | 1;
  type: MoveSourceType;
  from: number;
  to: number;
}

function makeSourceInfo(
  moveStrings: string[],
  type: MoveSourceType,
  from: number,
  to: number,
): MoveSourceInfo[] {
  const output: MoveSourceInfo[] = [];
  for (const moveString of moveStrings) {
    const move = Move.fromString(moveString);
    const { family, amount: direction } = move;
    if (![-1, 1].includes(direction)) {
      // TODO: test iner/outer
      // TODO: Can we move this to a test file?
      throw new Error("Invalid config move");
    }
    output.push({ family, direction: direction as -1 | 1, type, from, to });
  }
  return output;
}

interface AxisInfo {
  sliceDiameter: number;
  extendsThroughEntirePuzzle: boolean;
  moveSourceInfos: MoveSourceInfo[];
}

// TODO: wide slices
const axisInfos: Record<Axis, AxisInfo> = {
  [Axis.X]: {
    sliceDiameter: 3,
    extendsThroughEntirePuzzle: true,
    moveSourceInfos: [
      ...makeSourceInfo(["R"], MoveSourceType.INDEXABLE_SLICE_NEAR, 0, 3),
      ...makeSourceInfo(["L'"], MoveSourceType.INDEXABLE_SLICE_FAR, 0, 3),
      ...makeSourceInfo(["r", "Rw"], MoveSourceType.INDEXABLE_WIDE_NEAR, 0, 2),
      ...makeSourceInfo(["l'", "Lw'"], MoveSourceType.INDEXABLE_WIDE_FAR, 0, 2),
      ...makeSourceInfo(["M'"], MoveSourceType.SPECIFIC_SLICE, 1, 2), // TODO: remove some indices?
      ...makeSourceInfo(["x", "Uv", "Dv'"], MoveSourceType.ROTATION, 0, 3), // TODO: remove some indices?
    ],
  },
  [Axis.Y]: {
    sliceDiameter: 3,
    extendsThroughEntirePuzzle: true,
    moveSourceInfos: [
      ...makeSourceInfo(["U"], MoveSourceType.INDEXABLE_SLICE_NEAR, 0, 3),
      ...makeSourceInfo(["D'"], MoveSourceType.INDEXABLE_SLICE_FAR, 0, 3),
      ...makeSourceInfo(["u", "Uw"], MoveSourceType.INDEXABLE_WIDE_NEAR, 0, 2),
      ...makeSourceInfo(["d'", "Dw'"], MoveSourceType.INDEXABLE_WIDE_FAR, 0, 2),
      ...makeSourceInfo(["E'"], MoveSourceType.SPECIFIC_SLICE, 1, 2), // TODO: remove some indices?
      ...makeSourceInfo(["y", "Uv", "Dv'"], MoveSourceType.ROTATION, 0, 3), // TODO: remove some indices?
    ],
  },
  [Axis.Z]: {
    sliceDiameter: 3,
    extendsThroughEntirePuzzle: true,
    moveSourceInfos: [
      ...makeSourceInfo(["F"], MoveSourceType.INDEXABLE_SLICE_NEAR, 0, 3),
      ...makeSourceInfo(["B'"], MoveSourceType.INDEXABLE_SLICE_FAR, 0, 3),
      ...makeSourceInfo(["f", "Fw"], MoveSourceType.INDEXABLE_WIDE_NEAR, 0, 3),
      ...makeSourceInfo(["b'", "Bw'"], MoveSourceType.INDEXABLE_WIDE_FAR, 0, 3),
      ...makeSourceInfo(["S"], MoveSourceType.SPECIFIC_SLICE, 1, 2), // TODO: remove some indices?
      ...makeSourceInfo(["z", "Fv", "Bv'"], MoveSourceType.ROTATION, 0, 3), // TODO: remove some indices?
    ],
  },
};

const byFamily: Record<string, { axis: Axis; moveSourceInfo: MoveSourceInfo }> =
  {};
for (const [axis, info] of Object.entries(axisInfos)) {
  for (const moveSourceInfo of info.moveSourceInfos) {
    byFamily[moveSourceInfo.family] = { axis: axis as Axis, moveSourceInfo };
  }
}

// TODO: lazy initialization?
const byAxisThenType: Record<
  Axis,
  Partial<Record<MoveSourceType, MoveSourceInfo[]>>
> = {} as any; // TODO: avoid typecast (using `Object.fromEntries`?)
for (const axis of Object.keys(axisInfos) as Axis[]) {
  const entry: Partial<Record<MoveSourceType, MoveSourceInfo[]>> = {};
  byAxisThenType[axis] = entry;
  for (const moveSourceInfo of axisInfos[axis].moveSourceInfos) {
    (entry[moveSourceInfo.type] ??= []).push(moveSourceInfo);
  }
}

// TODO: consolidate lookup tables?
const byAxisThenSpecificSlices: Record<
  Axis,
  Map<number, MoveSourceInfo>
> = {} as any; // TODO: avoid typecast (using `Object.fromEntries`?)
for (const axis of Object.keys(axisInfos) as Axis[]) {
  const entry: Map<number, MoveSourceInfo> = new Map();
  byAxisThenSpecificSlices[axis] = entry;
  for (const moveSourceInfo of axisInfos[axis].moveSourceInfos) {
    // We only want to use the first entry per slice index (in the unlikely case there are multiple).
    if (!entry.get(moveSourceInfo.from)) {
      entry.set(moveSourceInfo.from, moveSourceInfo);
    }
  }
}

function firstOfType(
  axis: Axis,
  moveSourceType: MoveSourceType,
): MoveSourceInfo {
  const entry = byAxisThenType[axis][moveSourceType]?.[0];
  if (!entry) {
    throw new Error(
      `Could not find a reference move (axis: ${axis}, move source type: ${moveSourceType})`,
    );
  }
  return entry;
}

const areQuantumMovesSameAxis = (
  quantumMove1: QuantumMove,
  quantumMove2: QuantumMove,
) => {
  return (
    byFamily[quantumMove1.family].axis === byFamily[quantumMove2.family].axis
  );
};

function simplestMove(
  axis: Axis,
  from: number,
  to: number,
  directedAmount: number,
): Move {
  if (from + 1 === to) {
    const sliceSpecificInfo = byAxisThenSpecificSlices[axis].get(from);
    if (sliceSpecificInfo) {
      return new Move(
        new QuantumMove(sliceSpecificInfo.family),
        directedAmount * sliceSpecificInfo.direction,
      );
    }
  }

  const axisInfo = axisInfos[axis];
  const { sliceDiameter } = axisInfo;
  if (from === 0 && to === sliceDiameter) {
    const moveSourceInfo = firstOfType(axis, MoveSourceType.ROTATION);
    return new Move(
      new QuantumMove(moveSourceInfo.family),
      directedAmount * moveSourceInfo.direction,
    );
  }

  // const specificSliceInfo = byAxisThenSpecificSlices[axis].get(from);
  const far = from + to > sliceDiameter; // (from + to) / 2 > sliceDiameter / 2
  if (far) {
    [from, to] = [sliceDiameter - to, sliceDiameter - from];
  }

  let outerLayer: number | null = from + 1; // change to 1-indexed
  let innerLayer: number | null = to; // already 1-indexed
  const slice = outerLayer === innerLayer;
  if (slice) {
    innerLayer = null;
  }

  if (outerLayer === 1) {
    outerLayer = null;
  }
  if (slice && outerLayer === 1) {
    innerLayer = null;
  }
  if (!slice && innerLayer === 2) {
    innerLayer = null;
  }

  const moveSourceType = slice
    ? far
      ? MoveSourceType.INDEXABLE_SLICE_FAR
      : MoveSourceType.INDEXABLE_SLICE_NEAR
    : far
      ? MoveSourceType.INDEXABLE_WIDE_FAR
      : MoveSourceType.INDEXABLE_WIDE_NEAR;
  const moveSourceInfo = firstOfType(axis, moveSourceType);
  return new Move(
    new QuantumMove(moveSourceInfo.family, innerLayer, outerLayer),
    directedAmount * moveSourceInfo.direction,
  );
}

function simplifySameAxisMoves(
  moves: Move[],
  quantumMod: boolean = true, // TODO
): Move[] {
  if (moves.length === 0) {
    // TODO: can we use the type system to avoid this?
    return [];
  }

  const axis: Axis = byFamily[moves[0].family].axis;
  const axisInfo = axisInfos[axis];
  const { sliceDiameter } = axisInfo;
  const sliceDeltas = new Map<number, number>();
  let lastCandidateRange: {
    suffixLength: number;
    sliceDeltas: Map<number, number>;
  } | null = null;

  function adjustValue(idx: number, relativeDelta: number) {
    let newDelta = (sliceDeltas.get(idx) ?? 0) + relativeDelta;
    if (quantumMod) {
      newDelta = (newDelta % 4) + (5 % 4) - 1; // TODO: Use a passed-in `modMove`?
    }
    if (newDelta === 0) {
      sliceDeltas.delete(idx);
    } else {
      sliceDeltas.set(idx, newDelta);
    }
  }
  // TODO: go as far as possible instead of trying to take all moves, e.g. simplify U y y' to U.
  let suffixLength = 0;
  // TODO: Reverse iterator?
  for (const move of Array.from(moves).reverse()) {
    suffixLength++;
    const { moveSourceInfo } = byFamily[move.family];
    const directedAmount = move.amount * moveSourceInfo.direction;
    // console.log({ directedAmount });
    switch (moveSourceInfo.type) {
      case MoveSourceType.INDEXABLE_SLICE_NEAR: {
        // We convert to zero-indexing
        const idx = (move.innerLayer ?? 1) - 1;
        adjustValue(idx, directedAmount);
        adjustValue(idx + 1, -directedAmount);
        break;
      }
      case MoveSourceType.INDEXABLE_SLICE_FAR: {
        // We convert to zero-indexing (which cancels with the subtraction from the slice width)
        const idx = sliceDiameter - (move.innerLayer ?? 1);
        adjustValue(idx, directedAmount);
        adjustValue(idx + 1, -directedAmount);
        break;
      }
      case MoveSourceType.INDEXABLE_WIDE_NEAR: {
        adjustValue((move.outerLayer ?? 1) - 1, directedAmount);
        adjustValue(move.innerLayer ?? 2, -directedAmount);
        break;
      }
      case MoveSourceType.INDEXABLE_WIDE_FAR: {
        adjustValue(sliceDiameter - (move.innerLayer ?? 2), directedAmount);
        adjustValue(
          sliceDiameter - ((move.outerLayer ?? 1) - 1),
          -directedAmount,
        );
        break;
      }
      case MoveSourceType.SPECIFIC_SLICE: {
        // We convert to zero-indexing (which cancels with the subtraction from the slice width)
        adjustValue(moveSourceInfo.from, directedAmount);
        adjustValue(moveSourceInfo.to, -directedAmount);
        break;
      }
      case MoveSourceType.ROTATION: {
        adjustValue(0, directedAmount);
        adjustValue(sliceDiameter, -directedAmount);
        break;
      }
    }
    if ([0, 2].includes(sliceDeltas.size)) {
      lastCandidateRange = { suffixLength, sliceDeltas: new Map(sliceDeltas) };
    }
  }
  if (sliceDeltas.size === 0) {
    return [];
  }
  // TODO: handle this check in the destructuring assignment?
  if (!lastCandidateRange) {
    return moves;
  }
  let [from, to] = lastCandidateRange.sliceDeltas.keys();
  if (from > to) {
    [from, to] = [to, from];
  }
  const directedAmount = lastCandidateRange.sliceDeltas.get(from)!;
  // TODO: Handle empty move
  return [
    ...moves.slice(0, -lastCandidateRange.suffixLength),
    ...(directedAmount !== 0
      ? [simplestMove(axis, from, to, directedAmount)]
      : []),
  ];
}

export const puzzleSpecificSimplifyOptions333: PuzzleSpecificSimplifyOptions = {
  quantumMoveOrder: () => 4,
  // doQuantumMovesCommute: areQuantumMovesSameAxis,
  axis: { areQuantumMovesSameAxis, simplifySameAxisMoves },
};
