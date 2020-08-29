//   This class supports expanding a set of slice moves (for instance,
//   U, 2U, 3U, 2D, D on the 5x5x5) into a full set of outer block, inner
//   slice, etc. moves such as 2-3u or 5U, automatically.  The addGrip()
//   method informs us what grips exist and how many slices there are.
//   The setFaceNames() method tells us what the names of the faces are
//   so we can unswizzle swizzled grip names.

import { Transformation, KPuzzleDefinition } from "./definition_types";
import { Invert, Combine } from "./transformations";
import { BlockMove, parse } from "../alg";

export class MoveExpander {
  private gripStash: { [key: string]: Transformation[] };
  private moveStash: { [key: string]: Transformation };
  private facenames?: string[];
  private regrip: { [key: string]: string };
  private gripList: string[] = [];
  constructor() {
    this.gripStash = {};
    this.moveStash = {};
    this.regrip = {};
  }

  public setFaceNames(fn: string[]): void {
    this.facenames = fn;
  }

  public addGrip(
    grip1: string,
    grip2: string,
    nslices: number,
    def: KPuzzleDefinition,
  ): void {
    const slices = [];
    const axes = this.gripStash;
    const moves = def.moves;
    for (let i = 1; i <= nslices; i++) {
      let t = (i === 1 && moves[grip1]) || moves["" + i + grip1];
      if (!t) {
        t =
          (i === nslices && moves[grip2]) ||
          moves["" + (nslices + 1 - i) + grip2];
        if (t) {
          t = Invert(def, t);
        }
      }
      if (!t) {
        throw new Error(
          "Could not expand axis " +
            grip1 +
            " to " +
            grip2 +
            " because we are missing a move for slice " +
            i,
        );
      }
      slices.push(t);
    }
    axes[grip1] = slices;
    const aprime = slices.map((_: Transformation) => Invert(def, _));
    aprime.reverse();
    axes[grip2] = aprime;
    this.gripList.push(grip1);
    this.gripList.push(grip2);
  }

  public expandSlicesByName(
    mv: string,
    def: KPuzzleDefinition,
  ): Transformation | undefined {
    const t = this.moveStash[mv];
    if (t) {
      return t;
    }
    try {
      const alg = parse(mv);
      if (alg.nestedUnits.length !== 1) {
        return undefined;
      }
      const signmove = alg.nestedUnits[0] as BlockMove; // need better way
      return this.expandSlices(mv, signmove, def);
    } catch (e) {
      return undefined;
    }
  }

  public unswizzle(grip: string): string {
    if (this.regrip[grip]) {
      return this.regrip[grip];
    }
    if (!this.facenames) {
      return grip;
    }
    // permit unswizzle to strip w and p suffixes for callers
    // other than the internal move expander below.
    if (grip.length > 1) {
      if (
        grip[0] <= "Z" &&
        (grip[grip.length - 1] === "w" || grip[grip.length - 1] === "v")
      ) {
        grip = grip.substr(0, grip.length - 1);
      }
    }
    const e1 = this.splitByFaceNames(grip, this.facenames);
    if (!e1) {
      return grip;
    }
    for (let i = 0; i < e1.length; i++) {
      for (let j = 0; j < i; j++) {
        if (e1[i] === e1[j]) {
          return grip;
        }
      }
    }
    for (const tgrip of this.gripList) {
      const e2 = this.splitByFaceNames(tgrip, this.facenames);
      if (!e2 || (e1.length !== e2.length && e1.length < 3)) {
        continue;
      }
      let good = true;
      for (let i = 0; i < e1.length; i++) {
        let found = false;
        for (let j = 0; j < e2.length; j++) {
          if (e1[i] === e2[j]) {
            found = true;
            break;
          }
        }
        if (!found) {
          good = false;
          break;
        }
      }
      if (!good) {
        continue;
      }
      this.regrip[grip] = tgrip;
      return tgrip;
    }
    return grip;
  }

  public expandSlices(
    rep: string,
    blockMove: BlockMove,
    def: KPuzzleDefinition,
  ): Transformation | undefined {
    const t = this.moveStash[rep];
    if (t) {
      return t;
    }
    const axes = this.gripStash;
    const family = blockMove.family;
    let grip = family;
    let isBlock = false;
    let isPuzzle = false;
    // the following "reparse" code is almost certainly wrong
    if (/[a-z]/.test(family)) {
      isBlock = true;
      grip = family.toUpperCase();
    }
    if (family.length > 1 && family.endsWith("w")) {
      isBlock = true;
      grip = family.substring(0, family.length - 1);
    }
    if (family.length > 1 && family.endsWith("v")) {
      isPuzzle = true;
      grip = family.substring(0, family.length - 1);
    }
    let slices = axes[grip];
    if (!slices && this.facenames) {
      grip = this.unswizzle(grip);
      slices = axes[grip];
    }
    if (!slices) {
      return undefined;
    } // don't throw here; let others catch it
    let outer = blockMove.outerLayer;
    let inner = blockMove.innerLayer;
    if (inner === undefined) {
      if (outer === undefined) {
        outer = 1;
        inner = isBlock ? 2 : 1;
        if (isPuzzle) {
          inner = axes[grip].length;
        }
      } else {
        return undefined;
      } // should never happen
    } else if (outer === undefined) {
      outer = isBlock ? 1 : inner;
    }
    if (inner < outer) {
      return undefined;
    }
    if (outer > axes[grip].length) {
      return undefined;
    }
    let t2 = slices[outer - 1];
    for (let i = outer + 1; i <= inner; i++) {
      t2 = Combine(def, t2, slices[i - 1]);
    }
    this.moveStash[rep] = t2;
    return t2;
  }

  private splitByFaceNames(
    s: string,
    facenames: string[],
  ): string[] | undefined {
    const r: string[] = [];
    let at = 0;
    // we permit lowercase arguments, but face names are always upper case
    s = s.toUpperCase();
    while (at < s.length) {
      let currentMatch = "";
      if (at > 0 && at < s.length && s[at] === "_") {
        at++;
      }
      for (const facename of facenames) {
        if (
          s.substr(at).startsWith(facename) &&
          facename.length > currentMatch.length
        ) {
          currentMatch = facename;
        }
      }
      if (currentMatch !== "") {
        r.push(currentMatch);
        at += currentMatch.length;
      } else {
        return undefined;
      }
    }
    return r;
  }
}
