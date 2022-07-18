import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
  TraversalUp,
  Unit,
} from "../../../../alg";
import {
  experimentalDirectedGenerator,
  ExperimentalIterationDirection,
} from "../../../../alg/cubing-private";
import type { KPuzzle, KTransformation } from "../../../../kpuzzle";
import type { Duration } from "../../AnimationTypes";
import { AlgDuration, defaultDurationForAmount } from "../AlgDuration";

export class AlgPartDecoration {
  constructor(
    public moveCount: number,
    public duration: number,
    public forward: KTransformation,
    public backward: KTransformation,
    public children: Array<AlgPartDecoration> = [],
  ) {}
}
export class DecoratorConstructor extends TraversalUp<AlgPartDecoration> {
  private identity: KTransformation;
  private dummyLeaf: AlgPartDecoration;
  private durationFn: TraversalUp<Duration> = new AlgDuration(
    defaultDurationForAmount,
  );

  private cache: { [key: string]: AlgPartDecoration } = {};

  constructor(private kpuzzle: KPuzzle) {
    super();
    this.identity = kpuzzle.identityTransformation();
    this.dummyLeaf = new AlgPartDecoration(
      0,
      0,
      this.identity,
      this.identity,
      [],
    );
  }

  public traverseAlg(alg: Alg): AlgPartDecoration {
    let moveCount = 0;
    let duration = 0;
    let transformation = this.identity;
    const child: Array<AlgPartDecoration> = [];
    for (const unit of alg.units()) {
      const apd = this.traverseUnit(unit);
      moveCount += apd.moveCount;
      duration += apd.duration;
      if (transformation === this.identity) {
        transformation = apd.forward;
      } else {
        transformation = transformation.applyTransformation(apd.forward);
      }
      child.push(apd);
    }
    return new AlgPartDecoration(
      moveCount,
      duration,
      transformation,
      transformation.invert(),
      child,
    );
  }

  public traverseGrouping(grouping: Grouping): AlgPartDecoration {
    const dec = this.traverseAlg(grouping.alg);
    return this.mult(dec, grouping.amount, [dec]);
  }

  public traverseMove(move: Move): AlgPartDecoration {
    const key = move.toString();
    let r: AlgPartDecoration | undefined = this.cache[key];
    if (r) {
      return r;
    }
    const transformation = this.kpuzzle.moveToTransformation(move);
    r = new AlgPartDecoration(
      1,
      this.durationFn.traverseUnit(move),
      transformation,
      transformation.invert(),
    );
    this.cache[key] = r;
    return r;
  }

  public traverseCommutator(commutator: Commutator): AlgPartDecoration {
    const decA = this.traverseAlg(commutator.A);
    const decB = this.traverseAlg(commutator.B);
    const AB = decA.forward.applyTransformation(decB.forward);
    const ApBp = decA.backward.applyTransformation(decB.backward);
    const ABApBp = AB.applyTransformation(ApBp);
    const dec = new AlgPartDecoration(
      2 * (decA.moveCount + decB.moveCount),
      2 * (decA.duration + decB.duration),
      ABApBp,
      ABApBp.invert(),
      [decA, decB],
    );
    return this.mult(dec, 1, [dec, decA, decB]);
  }

  public traverseConjugate(conjugate: Conjugate): AlgPartDecoration {
    const decA = this.traverseAlg(conjugate.A);
    const decB = this.traverseAlg(conjugate.B);
    const AB = decA.forward.applyTransformation(decB.forward);
    const ABAp = AB.applyTransformation(decA.backward);
    const dec = new AlgPartDecoration(
      2 * decA.moveCount + decB.moveCount,
      2 * decA.duration + decB.duration,
      ABAp,
      ABAp.invert(),
      [decA, decB],
    );
    return this.mult(dec, 1, [dec, decA, decB]);
  }

  public traversePause(pause: Pause): AlgPartDecoration {
    if (pause.experimentalNISSGrouping) {
      return this.dummyLeaf;
    }
    return new AlgPartDecoration(
      1,
      this.durationFn.traverseUnit(pause),
      this.identity,
      this.identity,
    );
  }

  public traverseNewline(_newline: Newline): AlgPartDecoration {
    return this.dummyLeaf;
  }

  public traverseLineComment(_comment: LineComment): AlgPartDecoration {
    return this.dummyLeaf;
  }

  private mult(
    apd: AlgPartDecoration,
    n: number,
    child: Array<AlgPartDecoration>,
  ): AlgPartDecoration {
    const absn = Math.abs(n);
    const st = apd.forward.selfMultiply(n);
    return new AlgPartDecoration(
      apd.moveCount * absn,
      apd.duration * absn,
      st,
      st.invert(),
      child,
    );
  }
}
class WalkerDown {
  constructor(public apd: AlgPartDecoration, public back: boolean) {
    /**/
  }
}
export class AlgWalker extends TraversalDownUp<WalkerDown, boolean> {
  public move?: Unit;
  public moveDuration: number;
  public back: boolean;
  public st: KTransformation;
  public root: WalkerDown;
  public i: number;
  public dur: number;
  private goali: number;
  private goaldur: number;
  constructor(
    public kpuzzle: KPuzzle,
    public algOrUnit: Alg | Unit, // TODO: can we keep these separate?
    public apd: AlgPartDecoration,
  ) {
    super();
    this.i = -1;
    this.dur = -1;
    this.goali = -1;
    this.goaldur = -1;
    this.move = undefined;
    this.back = false;
    this.moveDuration = 0;
    this.st = this.kpuzzle.identityTransformation();
    this.root = new WalkerDown(this.apd, false);
  }

  public moveByIndex(loc: number): boolean {
    if (this.i >= 0 && this.i === loc) {
      return this.move !== undefined;
    }
    return this.dosearch(loc, Infinity);
  }

  public moveByDuration(dur: number): boolean {
    if (
      this.dur >= 0 &&
      this.dur < dur &&
      this.dur + this.moveDuration >= dur
    ) {
      return this.move !== undefined;
    }
    return this.dosearch(Infinity, dur);
  }

  public dosearch(loc: number, dur: number): boolean {
    this.goali = loc;
    this.goaldur = dur;
    this.i = 0;
    this.dur = 0;
    this.move = undefined;
    this.moveDuration = 0;
    this.back = false;
    this.st = this.kpuzzle.identityTransformation();
    const r = this.algOrUnit.is(Alg)
      ? this.traverseAlg(this.algOrUnit as Alg, this.root)
      : this.traverseUnit(this.algOrUnit as Unit, this.root); // TODO
    return r;
  }

  public traverseAlg(alg: Alg, wd: WalkerDown): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    let i = wd.back ? alg.experimentalNumUnits() - 1 : 0;
    for (const unit of experimentalDirectedGenerator(
      alg.units(),
      wd.back
        ? ExperimentalIterationDirection.Backwards
        : ExperimentalIterationDirection.Forwards,
    )) {
      if (
        this.traverseUnit(unit, new WalkerDown(wd.apd.children[i], wd.back))
      ) {
        return true;
      }
      i += wd.back ? -1 : 1;
    }
    return false;
  }

  public traverseGrouping(grouping: Grouping, wd: WalkerDown): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, grouping.amount);
    return this.traverseAlg(
      grouping.alg,
      new WalkerDown(wd.apd.children[0], back),
    );
  }

  public traverseMove(move: Move, wd: WalkerDown): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.move = move;
    this.moveDuration = wd.apd.duration;
    this.back = wd.back;
    return true;
  }

  public traverseCommutator(commutator: Commutator, wd: WalkerDown): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, 1);
    if (back) {
      return (
        this.traverseAlg(
          commutator.B,
          new WalkerDown(wd.apd.children[2], !back),
        ) ||
        this.traverseAlg(
          commutator.A,
          new WalkerDown(wd.apd.children[1], !back),
        ) ||
        this.traverseAlg(
          commutator.B,
          new WalkerDown(wd.apd.children[2], back),
        ) ||
        this.traverseAlg(commutator.A, new WalkerDown(wd.apd.children[1], back))
      );
    } else {
      return (
        this.traverseAlg(
          commutator.A,
          new WalkerDown(wd.apd.children[1], back),
        ) ||
        this.traverseAlg(
          commutator.B,
          new WalkerDown(wd.apd.children[2], back),
        ) ||
        this.traverseAlg(
          commutator.A,
          new WalkerDown(wd.apd.children[1], !back),
        ) ||
        this.traverseAlg(
          commutator.B,
          new WalkerDown(wd.apd.children[2], !back),
        )
      );
    }
  }

  public traverseConjugate(conjugate: Conjugate, wd: WalkerDown): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, 1);
    if (back) {
      return (
        this.traverseAlg(
          conjugate.A,
          new WalkerDown(wd.apd.children[1], !back),
        ) ||
        this.traverseAlg(
          conjugate.B,
          new WalkerDown(wd.apd.children[2], back),
        ) ||
        this.traverseAlg(conjugate.A, new WalkerDown(wd.apd.children[1], back))
      );
    } else {
      return (
        this.traverseAlg(
          conjugate.A,
          new WalkerDown(wd.apd.children[1], back),
        ) ||
        this.traverseAlg(
          conjugate.B,
          new WalkerDown(wd.apd.children[2], back),
        ) ||
        this.traverseAlg(conjugate.A, new WalkerDown(wd.apd.children[1], !back))
      );
    }
  }

  public traversePause(pause: Pause, wd: WalkerDown): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.move = pause;
    this.moveDuration = wd.apd.duration;
    this.back = wd.back;
    return true;
  }

  public traverseNewline(_newline: Newline, _wd: WalkerDown): boolean {
    return false;
  }

  public traverseLineComment(
    _lineComment: LineComment,
    _wd: WalkerDown,
  ): boolean {
    return false;
  }

  private firstcheck(wd: WalkerDown): boolean {
    if (
      wd.apd.moveCount + this.i <= this.goali &&
      wd.apd.duration + this.dur < this.goaldur
    ) {
      return this.keepgoing(wd);
    }
    return true;
  }

  private domult(wd: WalkerDown, amount: number): boolean {
    let back = wd.back;
    if (amount === 0) {
      // I don't believe this will ever happen
      return back;
    }
    if (amount < 0) {
      back = !back;
      amount = -amount;
    }
    const base = wd.apd.children[0];
    const full = Math.min(
      Math.floor((this.goali - this.i) / base.moveCount),
      Math.ceil((this.goaldur - this.dur) / base.duration - 1),
    );
    if (full > 0) {
      this.keepgoing(new WalkerDown(base, back), full);
    }
    return back;
  }

  private keepgoing(wd: WalkerDown, mul: number = 1): boolean {
    this.i += mul * wd.apd.moveCount;
    this.dur += mul * wd.apd.duration;
    if (mul !== 1) {
      if (wd.back) {
        this.st = this.st.applyTransformation(
          wd.apd.backward.selfMultiply(mul),
        );
      } else {
        this.st = this.st.applyTransformation(wd.apd.forward.selfMultiply(mul));
      }
    } else {
      if (wd.back) {
        this.st = this.st.applyTransformation(wd.apd.backward);
      } else {
        this.st = this.st.applyTransformation(wd.apd.forward);
      }
    }
    return false;
  }
}
