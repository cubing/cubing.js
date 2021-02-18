/**
 *  This module manages canonical sequences.  You can merge sequences
 *  combining moves (fully respecting commuting moves), and you can
 *  generate canonical sequences efficiently.
 */
import { KPuzzleDefinition, Transformation } from "./definition_types";
import {
  areTransformationsEquivalent,
  combineTransformations,
  identityTransformation,
} from "./transformations";
import {
  modifiedBlockMove,
  blockMoveToString,
  BlockMove,
  Sequence,
} from "../alg";

class InternalMove {
  constructor(public base: number, public twist: number) {}
  public getTransformation(canon: Canonicalizer): Transformation {
    return canon.transforms[this.base][this.twist];
  }

  public asString(canon: Canonicalizer): string {
    const mod = canon.moveorder[this.base];
    let tw = this.twist % mod;
    while (tw + tw > mod) {
      tw -= mod;
    }
    while (tw + tw <= -mod) {
      tw += mod;
    }
    const nam = canon.movenames[this.base];
    if (tw === 1) {
      return nam;
    } else if (tw === -1) {
      return nam + "'";
    } else if (tw > 0) {
      return nam + tw;
    } else if (tw < 0) {
      return nam + -tw + "'";
    } else {
      throw new Error("Stringifying null move?");
    }
  }
}

// represents puzzle move data and its commuting structure
export class Canonicalizer {
  public commutes: boolean[][] = [];
  public moveorder: number[] = [];
  public movenames: string[] = [];
  public transforms: Transformation[][] = [];
  public moveindex: { [key: string]: number } = {};
  public baseMoveCount: number;
  constructor(public def: KPuzzleDefinition) {
    const basemoves = def.moves;
    const id = identityTransformation(def);
    for (const mv1 in basemoves) {
      this.moveindex[mv1] = this.movenames.length;
      this.movenames.push(mv1);
      this.transforms.push([id, basemoves[mv1]]);
    }
    this.baseMoveCount = this.movenames.length;
    for (let i = 0; i < this.baseMoveCount; i++) {
      this.commutes.push([]);
      const t1 = this.transforms[i][1];
      for (let j = 0; j < this.baseMoveCount; j++) {
        const t2 = this.transforms[j][1];
        const ab = combineTransformations(def, t1, t2);
        const ba = combineTransformations(def, t2, t1);
        this.commutes[i][j] = areTransformationsEquivalent(def, ab, ba);
      }
    }
    for (let i = 0; i < this.baseMoveCount; i++) {
      const t1 = this.transforms[i][1];
      let ct = t1;
      let order = 1;
      for (let mult = 2; !areTransformationsEquivalent(def, id, ct); mult++) {
        order++;
        ct = combineTransformations(def, ct, t1);
        this.transforms[i].push(ct);
      }
      this.moveorder[i] = order;
    }
  }

  public blockMoveToInternalMove(mv: BlockMove): InternalMove {
    const basemove = modifiedBlockMove(mv, { amount: 1 });
    const s = blockMoveToString(basemove);
    if (!(s in this.def.moves)) {
      throw new Error("! move " + s + " not in def.");
    }
    const ind = this.moveindex[s];
    const mod = this.moveorder[ind];
    let tw = mv.amount % mod;
    if (tw < 0) {
      tw = (tw + mod) % mod;
    }
    return new InternalMove(ind, tw);
  }

  // Sequence must be simple sequence of block moves
  // this one does not attempt to merge.
  public sequenceToSearchSequence(
    s: Sequence,
    tr?: Transformation,
  ): SearchSequence {
    const ss = new SearchSequence(this, tr);
    for (const mv of s.nestedUnits) {
      ss.appendOneMove(this.blockMoveToInternalMove(mv as BlockMove));
    }
    return ss;
  }

  // Sequence to simple sequence, with merging.
  public mergeSequenceToSearchSequence(
    s: Sequence,
    tr?: Transformation,
  ): SearchSequence {
    const ss = new SearchSequence(this, tr);
    for (const mv of s.nestedUnits) {
      ss.mergeOneMove(this.blockMoveToInternalMove(mv as BlockMove));
    }
    return ss;
  }
}

// represents a single sequence we are working on
// this can be a search sequence, or it can be a
// "cooked" sequence that we want to use efficiently.
export class SearchSequence {
  public moveseq: InternalMove[] = [];
  public trans: Transformation;
  constructor(private canon: Canonicalizer, tr?: Transformation) {
    if (tr) {
      this.trans = tr;
    } else {
      this.trans = identityTransformation(canon.def);
    }
  }

  /*
   *  A common use for search sequences is to extend them, but
   *  sometimes we shouldn't modify the returned one.  This
   *  method gives you a copy you can do whatever you want with.
   */
  public clone(): SearchSequence {
    const r = new SearchSequence(this.canon, this.trans);
    r.moveseq = [...this.moveseq];
    return r;
  }

  // returns 1 if the move is added, 0 if it is merged, -1 if it cancels a move
  public mergeOneMove(mv: InternalMove): number {
    const r = this.onlyMergeOneMove(mv);
    this.trans = combineTransformations(
      this.canon.def,
      this.trans,
      mv.getTransformation(this.canon),
    );
    return r;
  }

  // does not do merge work; just slaps the new move on
  public appendOneMove(mv: InternalMove): number {
    this.moveseq.push(mv);
    this.trans = combineTransformations(
      this.canon.def,
      this.trans,
      mv.getTransformation(this.canon),
    );
    return 1;
  }

  // pop a move off.
  public popMove(): number {
    const mv = this.moveseq.pop();
    if (!mv) {
      throw new Error("Can't pop an empty sequence");
    }
    this.trans = combineTransformations(
      this.canon.def,
      this.trans,
      this.canon.transforms[mv.base][this.canon.moveorder[mv.base] - mv.twist],
    );
    return 1;
  }

  // do one more twist of the last move
  public oneMoreTwist(): number {
    const lastmv = this.moveseq[this.moveseq.length - 1];
    this.trans = combineTransformations(
      this.canon.def,
      this.trans,
      this.canon.transforms[lastmv.base][1],
    );
    this.moveseq[this.moveseq.length - 1] = new InternalMove(
      lastmv.base,
      lastmv.twist + 1,
    );
    return 0;
  }

  private onlyMergeOneMove(mv: InternalMove): number {
    let j = this.moveseq.length - 1;
    while (j >= 0) {
      if (mv.base === this.moveseq[j].base) {
        const mo = this.canon.moveorder[mv.base];
        let twist = (mv.twist + this.moveseq[j].twist) % mo;
        if (twist < 0) {
          twist = (twist + mo) % mo;
        }
        if (twist === 0) {
          // this splice should not be a performance problem because the
          // typical number of following moves should be small
          this.moveseq.splice(j, 1);
          return -1;
        } else {
          this.moveseq[j] = new InternalMove(mv.base, twist);
          return 0;
        }
      } else if (this.canon.commutes[mv.base][this.moveseq[j].base]) {
        j--;
      } else {
        break;
      }
    }
    this.moveseq.push(mv);
    return 1;
  }

  // returns the length of the merged sequence.
  public mergeSequence(seq: SearchSequence): number {
    let r = this.moveseq.length;
    for (let i = 0; i < seq.moveseq.length; i++) {
      const mv = seq.moveseq[i];
      const d = this.onlyMergeOneMove(mv);
      r += d;
    }
    this.trans = combineTransformations(this.canon.def, this.trans, seq.trans);
    return r;
  }

  public getSequenceAsString(): string {
    const r: string[] = [];
    for (const mv of this.moveseq) {
      r.push(mv.asString(this.canon));
    }
    return r.join(" ");
  }
}

/*
 *   Iterate through canonical sequences by length.  This version
 *   uses generators.
 */
export class CanonicalSequenceIterator {
  public ss: SearchSequence;
  public targetLength: number;
  constructor(public canon: Canonicalizer, state?: Transformation) {
    this.ss = new SearchSequence(canon, state);
    this.targetLength = 0;
  }

  public nextState(base: number, canonstate: number[]): null | number[] {
    const newstate: number[] = [];
    for (const prevbase of canonstate) {
      if (prevbase === base) {
        return null;
      } else if (!this.canon.commutes[prevbase][base]) {
        // don't do anything in this case
      } else if (base < prevbase) {
        return null;
      } else {
        newstate.push(prevbase);
      }
    }
    return newstate;
  }

  public *genSequence(
    togo: number,
    canonstate: number[],
  ): Generator<SearchSequence, null, void> {
    if (togo === 0) {
      yield this.ss;
    } else {
      for (let base = 0; base < this.canon.baseMoveCount; base++) {
        const newstate = this.nextState(base, canonstate);
        if (newstate) {
          newstate.push(base);
          for (let tw = 1; tw < this.canon.moveorder[base]; tw++) {
            this.ss.appendOneMove(new InternalMove(base, tw));
            yield* this.genSequence(togo - 1, newstate);
            this.ss.popMove();
          }
        }
      }
    }
    return null;
  }

  public *generator(): Generator<SearchSequence, SearchSequence, void> {
    for (let d = 0; ; d++) {
      yield* this.genSequence(d, []);
    }
  }

  public *genSequenceTree(
    canonstate: number[],
  ): Generator<SearchSequence, null, number> {
    const r = yield this.ss;
    if (r > 0) {
      return null;
    }
    for (let base = 0; base < this.canon.baseMoveCount; base++) {
      const newstate = this.nextState(base, canonstate);
      if (newstate) {
        newstate.push(base);
        for (let tw = 1; tw < this.canon.moveorder[base]; tw++) {
          this.ss.appendOneMove(new InternalMove(base, tw));
          yield* this.genSequenceTree(newstate);
          this.ss.popMove();
        }
      }
    }
    return null;
  }
}
