// TODO: figure out where to house this permanently.

import type { Move } from "../../alg";
import type { KPuzzle } from "../../kpuzzle";

export type FaceletMeshAppearance =
  | "regular"
  | "dim"
  | "oriented"
  | "ignored"
  | "invisible";

export type FaceletAppearance = {
  appearance: FaceletMeshAppearance;
  hintAppearance?: FaceletMeshAppearance;
};

export type PieceAppearance = {
  // TODO: foundation?
  facelets: (FaceletMeshAppearance | FaceletAppearance | null)[];
};

export type OrbitAppearance = {
  pieces: (PieceAppearance | null)[];
};

export type PuzzleAppearance = {
  name?: string; // TODO
  orbits: Record<string, OrbitAppearance>;
};

export function getFaceletAppearance(
  appearance: PuzzleAppearance,
  orbitName: string,
  pieceIdx: number,
  faceletIdx: number,
  hint: boolean,
): FaceletMeshAppearance {
  const orbitAppearance = appearance.orbits[orbitName];
  const pieceAppearance: PieceAppearance | null =
    orbitAppearance.pieces[pieceIdx];
  if (pieceAppearance === null) {
    return regular;
  }
  const faceletAppearance: FaceletMeshAppearance | FaceletAppearance | null =
    pieceAppearance.facelets[faceletIdx];
  if (faceletAppearance === null) {
    return regular;
  }
  if (typeof faceletAppearance === "string") {
    return faceletAppearance;
  }
  if (hint) {
    return faceletAppearance.hintAppearance ?? faceletAppearance.appearance;
  }
  return faceletAppearance.appearance;
}

// TODO: Revert this to a normal enum, or write a standard to codify the names?
export enum PieceStickering {
  Regular = "Regular",
  Dim = "Dim",
  Ignored = "Ignored",
  OrientationStickers = "OrientationStickers",
  Invisible = "Invisible",
  Ignoriented = "Ignoriented",
  IgnoreNonPrimary = "IgnoreNonPrimary",
  PermuteNonPrimary = "PermuteNonPrimary",
  OrientationWithoutPermutation = "OrientationWithoutPermutation",
}

export class PieceAnnotation<T> {
  stickerings: Map<string, T[]> = new Map();
  constructor(kpuzzle: KPuzzle, defaultValue: T) {
    for (const [orbitName, orbitDef] of Object.entries(
      kpuzzle.definition.orbits,
    )) {
      this.stickerings.set(
        orbitName,
        new Array(orbitDef.numPieces).fill(defaultValue),
      );
    }
  }
}

const regular = "regular";
const ignored = "ignored";
const oriented = "oriented";
const invisible = "invisible";
const dim = "dim";

// regular
const r: PieceAppearance = {
  facelets: [regular, regular, regular, regular, regular],
};

// ignored
const i: PieceAppearance = {
  facelets: [ignored, ignored, ignored, ignored, ignored],
};

// oriented stickers
const o: PieceAppearance = {
  facelets: [oriented, oriented, oriented, oriented, oriented],
};

// invisible
const invisiblePiece: PieceAppearance = {
  facelets: [invisible, invisible, invisible, invisible], // TODO: 4th entry is for void cube. Should be handled properly for all stickerings.
};

// "OLL"
const riiii: PieceAppearance = {
  facelets: [regular, ignored, ignored, ignored, ignored],
};

// "PLL"
const drrrr: PieceAppearance = {
  facelets: [dim, regular, regular, regular, regular],
};

// ignored
const d: PieceAppearance = {
  facelets: [dim, dim, dim, dim, dim],
};

// "OLL"
const diiii: PieceAppearance = {
  facelets: [dim, ignored, ignored, ignored, ignored],
};

// oriented
const oiiii: PieceAppearance = {
  facelets: [oriented, ignored, ignored, ignored, ignored],
};

export function getPieceAppearance(
  pieceStickering: PieceStickering,
): PieceAppearance {
  switch (pieceStickering) {
    case PieceStickering.Regular:
      return r;
    case PieceStickering.Dim:
      return d;
    case PieceStickering.Ignored:
      return i;
    case PieceStickering.OrientationStickers:
      // TODO: Hack for centers. This shouldn't be needed.
      return o;
    case PieceStickering.Invisible:
      // TODO: Hack for centers. This shouldn't be needed.
      return invisiblePiece;
    case PieceStickering.IgnoreNonPrimary:
      return riiii;
    case PieceStickering.PermuteNonPrimary:
      return drrrr;
    case PieceStickering.Ignoriented:
      return diiii;
    case PieceStickering.OrientationWithoutPermutation:
      return oiiii;
  }
}

export class PuzzleStickering extends PieceAnnotation<PieceStickering> {
  constructor(kpuzzle: KPuzzle) {
    super(kpuzzle, PieceStickering.Regular);
  }

  set(pieceSet: PieceSet, pieceStickering: PieceStickering): PuzzleStickering {
    for (const [orbitName, pieces] of this.stickerings.entries()) {
      for (let i = 0; i < pieces.length; i++) {
        if (pieceSet.stickerings.get(orbitName)![i]) {
          pieces[i] = pieceStickering;
        }
      }
    }
    return this;
  }

  toAppearance(): PuzzleAppearance {
    const appearance: PuzzleAppearance = { orbits: {} };
    for (const [orbitName, pieceStickerings] of this.stickerings.entries()) {
      const pieces: PieceAppearance[] = [];
      const orbitAppearance: OrbitAppearance = {
        pieces,
      };
      appearance.orbits[orbitName] = orbitAppearance;
      for (const pieceStickering of pieceStickerings) {
        pieces.push(getPieceAppearance(pieceStickering));
      }
    }
    return appearance;
  }
}

export type PieceSet = PieceAnnotation<boolean>;

export class StickeringManager {
  constructor(private kpuzzle: KPuzzle) {}

  and(pieceSets: PieceSet[]): PieceSet {
    const newPieceSet = new PieceAnnotation<boolean>(this.kpuzzle, false);
    for (const [orbitName, orbitDef] of Object.entries(
      this.kpuzzle.definition.orbits,
    )) {
      pieceLoop: for (let i = 0; i < orbitDef.numPieces; i++) {
        newPieceSet.stickerings.get(orbitName)![i] = true;
        for (const pieceSet of pieceSets) {
          if (!pieceSet.stickerings.get(orbitName)![i]) {
            newPieceSet.stickerings.get(orbitName)![i] = false;
            continue pieceLoop;
          }
        }
      }
    }
    return newPieceSet;
  }

  or(pieceSets: PieceSet[]): PieceSet {
    // TODO: unify impl with and?
    const newPieceSet = new PieceAnnotation<boolean>(this.kpuzzle, false);
    for (const [orbitName, orbitDef] of Object.entries(
      this.kpuzzle.definition.orbits,
    )) {
      pieceLoop: for (let i = 0; i < orbitDef.numPieces; i++) {
        newPieceSet.stickerings.get(orbitName)![i] = false;
        for (const pieceSet of pieceSets) {
          if (pieceSet.stickerings.get(orbitName)![i]) {
            newPieceSet.stickerings.get(orbitName)![i] = true;
            continue pieceLoop;
          }
        }
      }
    }
    return newPieceSet;
  }

  not(pieceSet: PieceSet): PieceSet {
    const newPieceSet = new PieceAnnotation<boolean>(this.kpuzzle, false);
    for (const [orbitName, orbitDef] of Object.entries(
      this.kpuzzle.definition.orbits,
    )) {
      for (let i = 0; i < orbitDef.numPieces; i++) {
        newPieceSet.stickerings.get(orbitName)![i] = !pieceSet.stickerings.get(
          orbitName,
        )![i];
      }
    }
    return newPieceSet;
  }

  all(): PieceSet {
    return this.and(this.moves([])); // TODO: are the degenerate cases for and/or the wrong way around
  }

  move(moveSource: Move | string): PieceSet {
    const transformation = this.kpuzzle.moveToTransformation(moveSource);
    const newPieceSet = new PieceAnnotation<boolean>(this.kpuzzle, false);
    for (const [orbitName, orbitDef] of Object.entries(
      this.kpuzzle.definition.orbits,
    )) {
      for (let i = 0; i < orbitDef.numPieces; i++) {
        if (
          transformation.transformationData[orbitName].permutation[i] !== i ||
          transformation.transformationData[orbitName].orientation[i] !== 0
        ) {
          newPieceSet.stickerings.get(orbitName)![i] = true;
        }
      }
    }
    return newPieceSet;
  }

  moves(moveSources: (Move | string)[]): PieceSet[] {
    return moveSources.map((moveSource) => this.move(moveSource));
  }

  orbits(orbitNames: string[]): PieceSet {
    const pieceSet = new PieceAnnotation<boolean>(this.kpuzzle, false);
    for (const orbitName of orbitNames) {
      pieceSet.stickerings.get(orbitName)!.fill(true);
    }
    return pieceSet;
  }

  orbitPrefix(orbitPrefix: string): PieceSet {
    const pieceSet = new PieceAnnotation<boolean>(this.kpuzzle, false);
    for (const orbitName in this.kpuzzle.definition.orbits) {
      if (orbitName.startsWith(orbitPrefix)) {
        pieceSet.stickerings.get(orbitName)!.fill(true);
      }
    }
    return pieceSet;
  }
  // trueCounts(pieceSet: PieceSet): Record<string, number> {
  //   const counts: Record<string, number> = {};
  //   for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
  //     let count = 0;
  //     for (let i = 0; i < orbitDef.numPieces; i++) {
  //       if (pieceSet.stickerings.get(orbitName)![i]) {
  //         count++;
  //       }
  //     }
  //     counts[orbitName] = count;
  //   }
  //   return counts;
  // }
}
