import {
  Alg,
  Grouping,
  LineComment,
  Commutator,
  Conjugate,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
  TraversalUp,
  Unit,
} from "../../../../../alg";
import {
  experimentalDirectedGenerator,
  ExperimentalIterationDirection,
} from "../../../../../alg";
import type {
  PuzzleWrapper,
  State,
} from "../../../../views/3D/puzzles/KPuzzleWrapper";
import type { Duration } from "../../cursor/CursorTypes";
import { AlgDuration, defaultDurationForAmount } from "../AlgDuration";

export class AlgPartDecoration<P extends PuzzleWrapper> {
  constructor(
    _puz: PuzzleWrapper,
    public moveCount: number,
    public duration: number,
    public forward: State<P>,
    public backward: State<P>,
    public children: Array<AlgPartDecoration<P>> = [],
  ) {}
}
export class DecoratorConstructor<P extends PuzzleWrapper> extends TraversalUp<
  AlgPartDecoration<P>
> {
  private identity: State<P>;
  private dummyLeaf: AlgPartDecoration<P>;
  private durationFn: TraversalUp<Duration> = new AlgDuration(
    defaultDurationForAmount,
  );

  private cache: { [key: string]: AlgPartDecoration<P> } = {};

  constructor(private puz: PuzzleWrapper) {
    super();
    this.identity = puz.identity();
    this.dummyLeaf = new AlgPartDecoration<P>(
      puz,
      0,
      0,
      this.identity,
      this.identity,
      [],
    );
  }

  public traverseAlg(alg: Alg): AlgPartDecoration<P> {
    let moveCount = 0;
    let duration = 0;
    let state = this.identity;
    const child: Array<AlgPartDecoration<P>> = [];
    for (const unit of alg.units()) {
      const apd = this.traverseUnit(unit);
      moveCount += apd.moveCount;
      duration += apd.duration;
      if (state === this.identity) {
        state = apd.forward;
      } else {
        state = this.puz.combine(state, apd.forward);
      }
      child.push(apd);
    }
    return new AlgPartDecoration<P>(
      this.puz,
      moveCount,
      duration,
      state,
      this.puz.invert(state),
      child,
    );
  }

  public traverseGrouping(grouping: Grouping): AlgPartDecoration<P> {
    const dec = this.traverseAlg(grouping.alg);
    return this.mult(dec, grouping.amount, [dec]);
  }

  public traverseMove(move: Move): AlgPartDecoration<P> {
    const key = move.toString();
    let r: AlgPartDecoration<P> | undefined = this.cache[key];
    if (r) {
      return r;
    }
    r = new AlgPartDecoration<P>(
      this.puz,
      1,
      this.durationFn.traverseUnit(move),
      this.puz.stateFromMove(move),
      this.puz.stateFromMove(move.invert()),
    );
    this.cache[key] = r;
    return r;
  }

  public traverseCommutator(commutator: Commutator): AlgPartDecoration<P> {
    const decA = this.traverseAlg(commutator.A);
    const decB = this.traverseAlg(commutator.B);
    const AB = this.puz.combine(decA.forward, decB.forward);
    const ApBp = this.puz.combine(decA.backward, decB.backward);
    const ABApBp = this.puz.combine(AB, ApBp);
    const dec = new AlgPartDecoration<P>(
      this.puz,
      2 * (decA.moveCount + decB.moveCount),
      2 * (decA.duration + decB.duration),
      ABApBp,
      this.puz.invert(ABApBp),
      [decA, decB],
    );
    return this.mult(dec, 1, [dec, decA, decB]);
  }

  public traverseConjugate(conjugate: Conjugate): AlgPartDecoration<P> {
    const decA = this.traverseAlg(conjugate.A);
    const decB = this.traverseAlg(conjugate.B);
    const AB = this.puz.combine(decA.forward, decB.forward);
    const ABAp = this.puz.combine(AB, decA.backward);
    const dec = new AlgPartDecoration<P>(
      this.puz,
      2 * decA.moveCount + decB.moveCount,
      2 * decA.duration + decB.duration,
      ABAp,
      this.puz.invert(ABAp),
      [decA, decB],
    );
    return this.mult(dec, 1, [dec, decA, decB]);
  }

  public traversePause(pause: Pause): AlgPartDecoration<P> {
    return new AlgPartDecoration<P>(
      this.puz,
      1,
      this.durationFn.traverseUnit(pause),
      this.identity,
      this.identity,
    );
  }

  public traverseNewline(_newline: Newline): AlgPartDecoration<P> {
    return this.dummyLeaf;
  }

  public traverseLineComment(_comment: LineComment): AlgPartDecoration<P> {
    return this.dummyLeaf;
  }

  private mult(
    apd: AlgPartDecoration<P>,
    n: number,
    child: Array<AlgPartDecoration<P>>,
  ): AlgPartDecoration<P> {
    const absn = Math.abs(n);
    const st = this.puz.multiply(apd.forward, n);
    return new AlgPartDecoration<P>(
      this.puz,
      apd.moveCount * absn,
      apd.duration * absn,
      st,
      this.puz.invert(st),
      child,
    );
  }
}
class WalkerDown<P extends PuzzleWrapper> {
  constructor(public apd: AlgPartDecoration<P>, public back: boolean) {
    /**/
  }
}
export class AlgWalker<P extends PuzzleWrapper> extends TraversalDownUp<
  WalkerDown<P>,
  boolean
> {
  public move?: Unit;
  public moveDuration: number;
  public back: boolean;
  public st: State<P>;
  public root: WalkerDown<P>;
  public i: number;
  public dur: number;
  private goali: number;
  private goaldur: number;
  constructor(
    public puz: P,
    public algOrUnit: Alg | Unit, // TODO: can we keep these separate?
    public apd: AlgPartDecoration<P>,
  ) {
    super();
    this.i = -1;
    this.dur = -1;
    this.goali = -1;
    this.goaldur = -1;
    this.move = undefined;
    this.back = false;
    this.moveDuration = 0;
    this.st = this.puz.identity();
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
    this.st = this.puz.identity();
    const r = this.algOrUnit.is(Alg)
      ? this.traverseAlg(this.algOrUnit as Alg, this.root)
      : this.traverseUnit(this.algOrUnit as Unit, this.root); // TODO
    return r;
  }

  public traverseAlg(alg: Alg, wd: WalkerDown<P>): boolean {
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

  public traverseGrouping(grouping: Grouping, wd: WalkerDown<P>): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    const back = this.domult(wd, grouping.amount);
    return this.traverseAlg(
      grouping.alg,
      new WalkerDown(wd.apd.children[0], back),
    );
  }

  public traverseMove(move: Move, wd: WalkerDown<P>): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.move = move;
    this.moveDuration = wd.apd.duration;
    this.back = wd.back;
    return true;
  }

  public traverseCommutator(
    commutator: Commutator,
    wd: WalkerDown<P>,
  ): boolean {
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

  public traverseConjugate(conjugate: Conjugate, wd: WalkerDown<P>): boolean {
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

  public traversePause(pause: Pause, wd: WalkerDown<P>): boolean {
    if (!this.firstcheck(wd)) {
      return false;
    }
    this.move = pause;
    this.moveDuration = wd.apd.duration;
    this.back = wd.back;
    return true;
  }

  public traverseNewline(_newline: Newline, _wd: WalkerDown<P>): boolean {
    return false;
  }

  public traverseLineComment(
    _lineComment: LineComment,
    _wd: WalkerDown<P>,
  ): boolean {
    return false;
  }

  private firstcheck(wd: WalkerDown<P>): boolean {
    if (
      wd.apd.moveCount + this.i <= this.goali &&
      wd.apd.duration + this.dur < this.goaldur
    ) {
      return this.keepgoing(wd);
    }
    return true;
  }

  private domult(wd: WalkerDown<P>, amount: number): boolean {
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
      this.keepgoing(new WalkerDown<P>(base, back), full);
    }
    return back;
  }

  private keepgoing(wd: WalkerDown<P>, mul: number = 1): boolean {
    this.i += mul * wd.apd.moveCount;
    this.dur += mul * wd.apd.duration;
    if (mul !== 1) {
      if (wd.back) {
        this.st = this.puz.combine(
          this.st,
          this.puz.multiply(wd.apd.backward, mul),
        );
      } else {
        this.st = this.puz.combine(
          this.st,
          this.puz.multiply(wd.apd.forward, mul),
        );
      }
    } else {
      if (wd.back) {
        this.st = this.puz.combine(this.st, wd.apd.backward);
      } else {
        this.st = this.puz.combine(this.st, wd.apd.forward);
      }
    }
    return false;
  }
}
