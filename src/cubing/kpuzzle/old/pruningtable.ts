import { Canonicalizer, CanonicalSequenceIterator } from "./canonicalize";
import type { OldKPuzzleDefinition, OldTransformation } from "../";
import { areStatesEquivalent } from "./transformations";
const mask = 0x7fffffff;
function hash(def: OldKPuzzleDefinition, s: OldTransformation): number {
  let r = 0;
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o = s[orbitName];
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      r =
        (37 * r + oDef.orientations * o.permutation[idx] + o.orientation[idx]) &
        mask;
    }
  }
  return r;
}
export class PruningTable {
  private tab: Uint8Array;
  private population: number = 0;
  private lookups: number = 0;
  private def: OldKPuzzleDefinition;
  private filled: number = -1;
  constructor(
    public canon: Canonicalizer,
    public memsize: number = 16 * 1024 * 1024,
  ) {
    this.def = canon.def;
    this.tab = new Uint8Array(memsize);
    for (let i = 0; i < memsize; i++) {
      this.tab[i] = 255;
    }
    this.filllevel();
  }

  public solve(s: OldTransformation): string {
    for (let d = 0; ; d++) {
      if (
        this.lookups > this.population &&
        this.population * 3 < this.memsize
      ) {
        this.filllevel();
      }
      const gen = new CanonicalSequenceIterator(this.canon, s).genSequenceTree(
        [],
      );
      let rval = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const t = gen.next(rval);
        if (t.value === null) {
          break;
        }
        const dep = this.lookup(t.value.trans);
        if (
          dep === 0 &&
          areStatesEquivalent(this.def, t.value.trans, this.def.startPieces)
        ) {
          return t.value.getSequenceAsString();
        }
        if (t.value.moveseq.length + dep > d) {
          rval = 1;
        } else {
          rval = 0;
        }
      }
    }
  }

  private filllevel(): void {
    this.filled++;
    const gen = new CanonicalSequenceIterator(
      this.canon,
      this.def.startPieces,
    ).genSequence(this.filled, []);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const t = gen.next();
      if (t.value === null) {
        break;
      }
      const off = hash(this.def, t.value.trans) % this.memsize;
      if (this.tab[off] === 255) {
        this.tab[off] = this.filled;
        this.population++;
      }
    }
  }

  private lookup(s: OldTransformation): number {
    this.lookups++;
    const v = this.tab[hash(this.def, s) % this.memsize];
    if (v === 255) {
      return this.filled + 1;
    } else {
      return v;
    }
  }
}
