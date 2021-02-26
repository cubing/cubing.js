/**
 *  This module manages canonical sequences.  You can merge sequences
 *  combining turns (fully respecting commuting turns), and you can
 *  generate canonical sequences efficiently.
 */
import { Alg, Turn } from "../alg";
import { KPuzzleDefinition, Transformation } from "./definition_types";
import {
  areTransformationsEquivalent,
  combineTransformations,
  identityTransformation,
} from "./transformations";

class InternalTurn {
  constructor(public base: number, public twist: number) {}
  public getTransformation(canon: Canonicalizer): Transformation {
    return canon.transforms[this.base][this.twist];
  }

  public asString(canon: Canonicalizer): string {
    const mod = canon.turnorder[this.base];
    let tw = this.twist % mod;
    while (tw + tw > mod) {
      tw -= mod;
    }
    while (tw + tw <= -mod) {
      tw += mod;
    }
    const nam = canon.turnnames[this.base];
    if (tw === 1) {
      return nam;
    } else if (tw === -1) {
      return nam + "'";
    } else if (tw > 0) {
      return nam + tw;
    } else if (tw < 0) {
      return nam + -tw + "'";
    } else {
      throw new Error("Stringifying null turn?");
    }
  }
}

// represents puzzle turn data and its commuting structure
export class Canonicalizer {
  public commutes: boolean[][] = [];
  public turnorder: number[] = [];
  public turnnames: string[] = [];
  public transforms: Transformation[][] = [];
  public turnindex: { [key: string]: number } = {};
  public baseTurnCount: number;
  constructor(public def: KPuzzleDefinition) {
    const baseturns = def.turns;
    const id = identityTransformation(def);
    for (const mv1 in baseturns) {
      this.turnindex[mv1] = this.turnnames.length;
      this.turnnames.push(mv1);
      this.transforms.push([id, baseturns[mv1]]);
    }
    this.baseTurnCount = this.turnnames.length;
    for (let i = 0; i < this.baseTurnCount; i++) {
      this.commutes.push([]);
      const t1 = this.transforms[i][1];
      for (let j = 0; j < this.baseTurnCount; j++) {
        const t2 = this.transforms[j][1];
        const ab = combineTransformations(def, t1, t2);
        const ba = combineTransformations(def, t2, t1);
        this.commutes[i][j] = areTransformationsEquivalent(def, ab, ba);
      }
    }
    for (let i = 0; i < this.baseTurnCount; i++) {
      const t1 = this.transforms[i][1];
      let ct = t1;
      let order = 1;
      for (let mult = 2; !areTransformationsEquivalent(def, id, ct); mult++) {
        order++;
        ct = combineTransformations(def, ct, t1);
        this.transforms[i].push(ct);
      }
      this.turnorder[i] = order;
    }
  }

  public blockTurnToInternalTurn(turn: Turn): InternalTurn {
    const quantumTurnStr = turn.quantum.toString();
    if (!(quantumTurnStr in this.def.turns)) {
      throw new Error("! turn " + quantumTurnStr + " not in def.");
    }
    const ind = this.turnindex[quantumTurnStr];
    const mod = this.turnorder[ind];
    let tw = turn.effectiveAmount % mod; // TODO
    if (tw < 0) {
      tw = (tw + mod) % mod;
    }
    return new InternalTurn(ind, tw);
  }

  // Sequence must be simple sequence of block turns
  // this one does not attempt to merge.
  public sequenceToSearchSequence(
    alg: Alg,
    tr?: Transformation,
  ): SearchSequence {
    const ss = new SearchSequence(this, tr);
    for (const turn of alg.experimentalLeafTurns()) {
      ss.appendOneTurn(this.blockTurnToInternalTurn(turn as Turn));
    }
    return ss;
  }

  // Sequence to simple sequence, with merging.
  public mergeSequenceToSearchSequence(
    alg: Alg,
    tr?: Transformation,
  ): SearchSequence {
    const ss = new SearchSequence(this, tr);
    for (const turn of alg.experimentalLeafTurns()) {
      ss.mergeOneTurn(this.blockTurnToInternalTurn(turn));
    }
    return ss;
  }
}

// represents a single sequence we are working on
// this can be a search sequence, or it can be a
// "cooked" sequence that we want to use efficiently.
export class SearchSequence {
  public turnseq: InternalTurn[] = [];
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
    r.turnseq = [...this.turnseq];
    return r;
  }

  // returns 1 if the turn is added, 0 if it is merged, -1 if it cancels a turn
  public mergeOneTurn(mv: InternalTurn): number {
    const r = this.onlyMergeOneTurn(mv);
    this.trans = combineTransformations(
      this.canon.def,
      this.trans,
      mv.getTransformation(this.canon),
    );
    return r;
  }

  // does not do merge work; just slaps the new turn on
  public appendOneTurn(mv: InternalTurn): number {
    this.turnseq.push(mv);
    this.trans = combineTransformations(
      this.canon.def,
      this.trans,
      mv.getTransformation(this.canon),
    );
    return 1;
  }

  // pop a turn off.
  public popTurn(): number {
    const mv = this.turnseq.pop();
    if (!mv) {
      throw new Error("Can't pop an empty sequence");
    }
    this.trans = combineTransformations(
      this.canon.def,
      this.trans,
      this.canon.transforms[mv.base][this.canon.turnorder[mv.base] - mv.twist],
    );
    return 1;
  }

  // do one more twist of the last turn
  public oneMoreTwist(): number {
    const lastmv = this.turnseq[this.turnseq.length - 1];
    this.trans = combineTransformations(
      this.canon.def,
      this.trans,
      this.canon.transforms[lastmv.base][1],
    );
    this.turnseq[this.turnseq.length - 1] = new InternalTurn(
      lastmv.base,
      lastmv.twist + 1,
    );
    return 0;
  }

  private onlyMergeOneTurn(mv: InternalTurn): number {
    let j = this.turnseq.length - 1;
    while (j >= 0) {
      if (mv.base === this.turnseq[j].base) {
        const mo = this.canon.turnorder[mv.base];
        let twist = (mv.twist + this.turnseq[j].twist) % mo;
        if (twist < 0) {
          twist = (twist + mo) % mo;
        }
        if (twist === 0) {
          // this splice should not be a performance problem because the
          // typical number of following turns should be small
          this.turnseq.splice(j, 1);
          return -1;
        } else {
          this.turnseq[j] = new InternalTurn(mv.base, twist);
          return 0;
        }
      } else if (this.canon.commutes[mv.base][this.turnseq[j].base]) {
        j--;
      } else {
        break;
      }
    }
    this.turnseq.push(mv);
    return 1;
  }

  // returns the length of the merged sequence.
  public mergeSequence(seq: SearchSequence): number {
    let r = this.turnseq.length;
    for (let i = 0; i < seq.turnseq.length; i++) {
      const mv = seq.turnseq[i];
      const d = this.onlyMergeOneTurn(mv);
      r += d;
    }
    this.trans = combineTransformations(this.canon.def, this.trans, seq.trans);
    return r;
  }

  public getSequenceAsString(): string {
    const r: string[] = [];
    for (const mv of this.turnseq) {
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
      for (let base = 0; base < this.canon.baseTurnCount; base++) {
        const newstate = this.nextState(base, canonstate);
        if (newstate) {
          newstate.push(base);
          for (let tw = 1; tw < this.canon.turnorder[base]; tw++) {
            this.ss.appendOneTurn(new InternalTurn(base, tw));
            yield* this.genSequence(togo - 1, newstate);
            this.ss.popTurn();
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
    for (let base = 0; base < this.canon.baseTurnCount; base++) {
      const newstate = this.nextState(base, canonstate);
      if (newstate) {
        newstate.push(base);
        for (let tw = 1; tw < this.canon.turnorder[base]; tw++) {
          this.ss.appendOneTurn(new InternalTurn(base, tw));
          yield* this.genSequenceTree(newstate);
          this.ss.popTurn();
        }
      }
    }
    return null;
  }
}
