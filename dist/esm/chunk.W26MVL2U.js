import {
  EquivalentTransformations
} from "./chunk.JQRASIC7.js";
import {
  modifiedBlockMove
} from "./chunk.SBF4OERV.js";
import {
  Combine,
  IdentityTransformation
} from "./chunk.OXN3TMHE.js";
import {
  blockMoveToString
} from "./chunk.KHJLFQEA.js";

// src/kpuzzle/transformations.ts
function gcd(a, b) {
  if (b) {
    return gcd(b, a % b);
  }
  return a;
}
function Order(def, t) {
  let r = 1;
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o = t[orbitName];
    const d = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      if (!d[idx]) {
        let w = idx;
        let om = 0;
        let pm = 0;
        for (; ; ) {
          d[w] = true;
          om = om + o.orientation[w];
          pm = pm + 1;
          w = o.permutation[w];
          if (w === idx) {
            break;
          }
        }
        if (om !== 0) {
          pm = pm * oDef.orientations / gcd(oDef.orientations, om);
        }
        r = r * pm / gcd(r, pm);
      }
    }
  }
  return r;
}

// src/kpuzzle/canonicalize.ts
class InternalMove {
  constructor(base, twist) {
    this.base = base;
    this.twist = twist;
  }
  getTransformation(canon) {
    return canon.transforms[this.base][this.twist];
  }
  asString(canon) {
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
class Canonicalize {
  constructor(def) {
    this.def = def;
    this.commutes = [];
    this.moveorder = [];
    this.movenames = [];
    this.transforms = [];
    this.moveindex = {};
    const basemoves = def.moves;
    const id = IdentityTransformation(def);
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
        const ab = Combine(def, t1, t2);
        const ba = Combine(def, t2, t1);
        this.commutes[i][j] = EquivalentTransformations(def, ab, ba);
      }
    }
    for (let i = 0; i < this.baseMoveCount; i++) {
      const t1 = this.transforms[i][1];
      let ct = t1;
      let order = 1;
      for (let mult = 2; !EquivalentTransformations(def, id, ct); mult++) {
        order++;
        ct = Combine(def, ct, t1);
        this.transforms[i].push(ct);
      }
      this.moveorder[i] = order;
    }
  }
  blockMoveToInternalMove(mv) {
    const basemove = modifiedBlockMove(mv, {amount: 1});
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
  sequenceToSearchSequence(s, tr) {
    const ss = new SearchSequence(this, tr);
    for (const mv of s.nestedUnits) {
      ss.appendOneMove(this.blockMoveToInternalMove(mv));
    }
    return ss;
  }
  mergeSequenceToSearchSequence(s, tr) {
    const ss = new SearchSequence(this, tr);
    for (const mv of s.nestedUnits) {
      ss.mergeOneMove(this.blockMoveToInternalMove(mv));
    }
    return ss;
  }
}
class SearchSequence {
  constructor(canon, tr) {
    this.canon = canon;
    this.moveseq = [];
    if (tr) {
      this.trans = tr;
    } else {
      this.trans = IdentityTransformation(canon.def);
    }
  }
  clone() {
    const r = new SearchSequence(this.canon, this.trans);
    r.moveseq = [...this.moveseq];
    return r;
  }
  mergeOneMove(mv) {
    const r = this.onlyMergeOneMove(mv);
    this.trans = Combine(this.canon.def, this.trans, mv.getTransformation(this.canon));
    return r;
  }
  appendOneMove(mv) {
    this.moveseq.push(mv);
    this.trans = Combine(this.canon.def, this.trans, mv.getTransformation(this.canon));
    return 1;
  }
  popMove() {
    const mv = this.moveseq.pop();
    if (!mv) {
      throw new Error("Can't pop an empty sequence");
    }
    this.trans = Combine(this.canon.def, this.trans, this.canon.transforms[mv.base][this.canon.moveorder[mv.base] - mv.twist]);
    return 1;
  }
  oneMoreTwist() {
    const lastmv = this.moveseq[this.moveseq.length - 1];
    this.trans = Combine(this.canon.def, this.trans, this.canon.transforms[lastmv.base][1]);
    this.moveseq[this.moveseq.length - 1] = new InternalMove(lastmv.base, lastmv.twist + 1);
    return 0;
  }
  onlyMergeOneMove(mv) {
    let j = this.moveseq.length - 1;
    while (j >= 0) {
      if (mv.base === this.moveseq[j].base) {
        const mo = this.canon.moveorder[mv.base];
        let twist = (mv.twist + this.moveseq[j].twist) % mo;
        if (twist < 0) {
          twist = (twist + mo) % mo;
        }
        if (twist === 0) {
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
  mergeSequence(seq) {
    let r = this.moveseq.length;
    for (let i = 0; i < seq.moveseq.length; i++) {
      const mv = seq.moveseq[i];
      const d = this.onlyMergeOneMove(mv);
      r += d;
    }
    this.trans = Combine(this.canon.def, this.trans, seq.trans);
    return r;
  }
  getSequenceAsString() {
    const r = [];
    for (const mv of this.moveseq) {
      r.push(mv.asString(this.canon));
    }
    return r.join(" ");
  }
}
class CanonicalSequenceIterator {
  constructor(canon, state) {
    this.canon = canon;
    this.ss = new SearchSequence(canon, state);
    this.targetLength = 0;
  }
  nextState(base, canonstate) {
    const newstate = [];
    for (const prevbase of canonstate) {
      if (prevbase === base) {
        return null;
      } else if (!this.canon.commutes[prevbase][base]) {
      } else if (base < prevbase) {
        return null;
      } else {
        newstate.push(prevbase);
      }
    }
    return newstate;
  }
  *genSequence(togo, canonstate) {
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
  *generator() {
    for (let d = 0; ; d++) {
      yield* this.genSequence(d, []);
    }
  }
  *genSequenceTree(canonstate) {
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

export {
  Canonicalize,
  SearchSequence,
  Order,
  CanonicalSequenceIterator
};
//# sourceMappingURL=chunk.2GPB2U2B.js.map
