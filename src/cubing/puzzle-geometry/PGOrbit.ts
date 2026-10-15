import { Move } from "../alg/index.ts";
import type {
  KPatternData,
  KPatternOrbitData,
  KPuzzleDefinition,
  KPuzzleOrbitDefinition,
  KTransformationData,
  KTransformationOrbitData,
} from "../kpuzzle/index.ts";
import { NullMapper } from "./notation-mapping/index.ts";
import type { NotationMapper } from "./notation-mapping/NotationMapper.ts";
/* tslint:disable no-bitwise */
/* tslint:disable prefer-for-of */ import {
  factorial,
  lcm,
  Permutation,
  range,
  zeros,
} from "./Permutation.ts";

export class PGOrbitDef {
  public numPieces: number;
  public numOrientations: number;
  constructor(size: number, mod: number) {
    this.numPieces = size;
    this.numOrientations = mod;
  }

  public reassemblySize(): bigint {
    return (
      factorial(this.numPieces) *
      BigInt(this.numOrientations) ** BigInt(this.numPieces)
    );
  }
}

let lastGlobalDefinitionCounter = 0;

export function externalMoveName(
  mapper: NotationMapper,
  moveString: string,
): string {
  const internalMove = Move.fromString(moveString);
  const externalMove = mapper.notationToExternal(internalMove);
  if (externalMove === null || internalMove === externalMove) {
    return moveString;
  }
  return externalMove.toString();
}

export class PGOrbitsDef {
  public orbitNames: string[];
  private orbitDefs: PGOrbitDef[];
  public solved: VisibleState;
  public moveNames: string[];
  public moveOps: PGTransform[];
  public isRotation: boolean[];
  public forceNames: boolean[];
  constructor(
    orbitNames: string[],
    orbitDefs: PGOrbitDef[],
    solved: VisibleState,
    moveNames: string[],
    moveOps: PGTransform[],
    isRotation: boolean[],
    forceNames: boolean[],
  ) {
    this.orbitNames = orbitNames;
    this.orbitDefs = orbitDefs;
    this.solved = solved;
    this.moveNames = moveNames;
    this.moveOps = moveOps;
    this.isRotation = isRotation;
    this.forceNames = forceNames;
  }

  public toKTransformationData(t: PGTransform): KTransformationData {
    const ktransformationData: KTransformationData = {};
    for (let i = 0; i < this.orbitNames.length; i++) {
      ktransformationData[this.orbitNames[i]] =
        t.orbits[i].toKTransformationOrbitData();
    }
    return ktransformationData;
  }

  public toKPatternData(t: PGTransform): KPatternData {
    const kpatternData: KPatternData = {};
    for (let i = 0; i < this.orbitNames.length; i++) {
      kpatternData[this.orbitNames[i]] = t.orbits[i].toKPatternOrbitData();
    }
    return kpatternData;
  }

  // TODO: remove this
  public static transformToKTransformationData(
    orbitnames: string[],
    t: PGTransform,
  ): KTransformationData {
    const mp: { [orbitName: string]: any } = {};
    for (let j = 0; j < orbitnames.length; j++) {
      mp[orbitnames[j]] = t.orbits[j].toKTransformationOrbitData();
    }
    return mp;
  }

  private describeSet(s: number, r: string[], mapper: NotationMapper): void {
    const { numPieces } = this.orbitDefs[s];
    const moveNames = new Array(numPieces);
    for (let i = 0; i < numPieces; i++) {
      moveNames[i] = [];
    }
    for (let i = 0; i < this.moveNames.length; i++) {
      if (this.isRotation[i]) {
        continue;
      }
      let moveName = this.moveNames[i];
      if (!this.forceNames[i]) {
        moveName = externalMoveName(mapper, moveName);
        if (moveName[moveName.length - 1] === "'") {
          moveName = moveName.substring(0, moveName.length - 1);
        }
      }
      const pd = this.moveOps[i].orbits[s];
      for (let j = 0; j < numPieces; j++) {
        if (pd.permutation[j] !== j || pd.orientationDelta[j] !== 0) {
          moveNames[j].push(moveName);
        }
      }
    }
    for (let j = 0; j < numPieces; j++) {
      r.push(`# ${j + 1} ${moveNames[j].join(" ")}`);
    }
  }

  public toKsolve(
    name: string,
    mapper: NotationMapper = new NullMapper(),
  ): string[] {
    const result = [];
    result.push(`Name ${name}`);
    result.push("");
    for (let i = 0; i < this.orbitNames.length; i++) {
      result.push(
        `Set ${this.orbitNames[i]} ${this.orbitDefs[i].numPieces} ${this.orbitDefs[i].numOrientations}`,
      );
      this.describeSet(i, result, mapper);
    }
    result.push("");
    result.push("Solved");
    for (let i = 0; i < this.orbitNames.length; i++) {
      this.solved.orbits[i]
        .renumberPieces()
        .appendDefinition(result, this.orbitNames[i], false, false);
    }
    result.push("End");
    for (let i = 0; i < this.moveNames.length; i++) {
      result.push("");
      let name = this.moveNames[i];
      if (!this.forceNames[i]) {
        name = externalMoveName(mapper, this.moveNames[i]);
      }
      let doinv = false;
      if (name[name.length - 1] === "'") {
        doinv = true;
        name = name.substring(0, name.length - 1);
      }
      result.push(`Move ${name}`);
      for (let j = 0; j < this.orbitNames.length; j++) {
        if (doinv) {
          this.moveOps[i].orbits[j]
            .invert()
            .appendDefinition(result, this.orbitNames[j], true);
        } else {
          this.moveOps[i].orbits[j].appendDefinition(
            result,
            this.orbitNames[j],
            true,
          );
        }
      }
      result.push("End");
    }
    // extra blank line on end lets us use join("\n") to terminate all
    return result;
  }

  // TODO: return type.
  public toKPuzzleDefinition(includemoves: boolean): KPuzzleDefinition {
    const orbits: KPuzzleOrbitDefinition[] = [];
    const defaultPatternData: KPatternData = {};
    for (let i = 0; i < this.orbitNames.length; i++) {
      orbits.push({
        orbitName: this.orbitNames[i],
        numPieces: this.orbitDefs[i].numPieces,
        numOrientations: this.orbitDefs[i].numOrientations,
      });
      const defaultPatternFrom =
        this.solved.orbits[i].toKTransformationOrbitData();
      defaultPatternData[this.orbitNames[i]] = {
        pieces: defaultPatternFrom.permutation,
        orientation: defaultPatternFrom.orientationDelta,
      };
    }
    const moves: { [moveName: string]: any } = {};
    if (includemoves) {
      for (let i = 0; i < this.moveNames.length; i++) {
        moves[this.moveNames[i]] = this.toKTransformationData(this.moveOps[i]);
      }
    }
    return {
      name: `PG3D #${++lastGlobalDefinitionCounter}`,
      orbits,
      defaultPattern: defaultPatternData,
      moves,
    };
  }

  public optimize(): PGOrbitsDef {
    const newOrbitNames: string[] = [];
    const newOrbitDefs: PGOrbitDef[] = [];
    const newSolved: PGOrbit[] = [];
    const newMoveOps: PGOrbit[][] = this.moveOps.map(() => []);
    for (let j = 0; j < this.moveOps.length; j++) {
      newMoveOps.push([]);
    }
    for (let i = 0; i < this.orbitDefs.length; i++) {
      const { numPieces, numOrientations } = this.orbitDefs[i];
      const disjointUion = new DisjointUnion(numPieces);
      const changed = new Array<boolean>(this.orbitDefs[i].numPieces);
      for (let k = 0; k < numPieces; k++) {
        changed[k] = false;
      }
      // don't consider rotations when optimizing, for what to keep
      // but *do* consider rotations for unions.
      for (let j = 0; j < this.moveOps.length; j++) {
        for (let k = 0; k < numPieces; k++) {
          if (
            this.moveOps[j].orbits[i].permutation[k] !== k ||
            this.moveOps[j].orbits[i].orientationDelta[k] !== 0
          ) {
            if (!this.isRotation[j]) {
              changed[k] = true;
            }
            disjointUion.union(k, this.moveOps[j].orbits[i].permutation[k]);
          }
        }
      }
      let keepOrientation = true;
      // right now we kill ori only if solved is unique and
      // if we can kill it completely.  This is not all the optimization
      // we can perform.
      if (numOrientations > 1) {
        keepOrientation = false;
        const disjointUnion = new DisjointUnion(
          this.orbitDefs[i].numPieces * numOrientations,
        );
        for (let j = 0; j < this.moveOps.length; j++) {
          for (let k = 0; k < numPieces; k++) {
            if (
              this.moveOps[j].orbits[i].permutation[k] !== k ||
              this.moveOps[j].orbits[i].orientationDelta[k] !== 0
            ) {
              for (let o = 0; o < numOrientations; o++) {
                disjointUnion.union(
                  k * numOrientations + o,
                  this.moveOps[j].orbits[i].permutation[k] * numOrientations +
                    ((o + this.moveOps[j].orbits[i].orientationDelta[k]) %
                      numOrientations),
                );
              }
            }
          }
        }
        for (let j = 0; !keepOrientation && j < numPieces; j++) {
          for (let o = 1; o < numOrientations; o++) {
            if (
              disjointUnion.find(j * numOrientations) ===
              disjointUnion.find(j * numOrientations + o)
            ) {
              keepOrientation = true;
            }
          }
        }
        for (let j = 0; !keepOrientation && j < numPieces; j++) {
          for (let k = 0; k < j; k++) {
            if (
              this.solved.orbits[i].permutation[j] ===
              this.solved.orbits[i].permutation[k]
            ) {
              keepOrientation = true;
            }
          }
        }
      }
      // is there just one result set, or more than one?
      let nontrivial = -1;
      let multiple = false;
      for (let j = 0; j < this.orbitDefs[i].numPieces; j++) {
        if (changed[j]) {
          const h = disjointUion.find(j);
          if (nontrivial < 0) {
            nontrivial = h;
          } else if (nontrivial !== h) {
            multiple = true;
          }
        }
      }
      for (let j = 0; j < this.orbitDefs[i].numPieces; j++) {
        if (!changed[j]) {
          continue;
        }
        const h = disjointUion.find(j);
        if (h !== j) {
          continue;
        }
        const no: number[] = [];
        const on: number[] = [];
        let nv = 0;
        for (let k = 0; k < this.orbitDefs[i].numPieces; k++) {
          if (disjointUion.find(k) === j) {
            no[nv] = k;
            on[k] = nv;
            nv++;
          }
        }
        if (multiple) {
          newOrbitNames.push(`${this.orbitNames[i]}_p${j}`);
        } else {
          newOrbitNames.push(this.orbitNames[i]);
        }
        if (keepOrientation) {
          newOrbitDefs.push(
            new PGOrbitDef(nv, this.orbitDefs[i].numOrientations),
          );
          newSolved.push(this.solved.orbits[i].remapVS(no, nv));
          for (let k = 0; k < this.moveOps.length; k++) {
            newMoveOps[k].push(this.moveOps[k].orbits[i].remap(no, on, nv));
          }
        } else {
          newOrbitDefs.push(new PGOrbitDef(nv, 1));
          newSolved.push(
            this.solved.orbits[i].remapVS(no, nv).forgetOrientations(),
          );
          for (let k = 0; k < this.moveOps.length; k++) {
            newMoveOps[k].push(
              this.moveOps[k].orbits[i].remap(no, on, nv).forgetOrientations(),
            );
          }
        }
      }
    }
    return new PGOrbitsDef(
      newOrbitNames,
      newOrbitDefs,
      new VisibleState(newSolved),
      this.moveNames,
      newMoveOps.map((_) => new PGTransform(_)),
      this.isRotation,
      this.forceNames,
    );
  }

  // replace the solved state with a new scrambled state.
  public scramble(n: number): void {
    this.solved = this.solved.applyTransformation(
      this.getScrambleTransformation(n),
    );
  }

  // generate a new "random" position based on an entropy pool
  // this should be significantly faster and more random than just
  // doing a large number of random moves, especially on big puzzles.
  public getScrambleTransformation(n: number): PGTransform {
    // don't let n be too tiny
    if (n < 100) {
      n = 100;
    }
    const pool: PGTransform[] = [];
    for (let i = 0; i < this.moveOps.length; i++) {
      pool[i] = this.moveOps[i];
    }
    for (let i = 0; i < pool.length; i++) {
      const j = Math.floor(Math.random() * pool.length);
      const t = pool[i];
      pool[i] = pool[j];
      pool[j] = t;
    }
    if (n < pool.length) {
      n = pool.length;
    }
    for (let i = 0; i < n; i++) {
      const ri = Math.floor(Math.random() * pool.length);
      const rj = Math.floor(Math.random() * pool.length);
      const rm = Math.floor(Math.random() * this.moveOps.length);
      pool[ri] = pool[ri].compose(pool[rj]).compose(this.moveOps[rm]);
      if (Math.random() < 0.1) {
        // break up parity
        pool[ri] = pool[ri].compose(this.moveOps[rm]);
      }
    }
    let s = pool[0];
    for (let i = 1; i < pool.length; i++) {
      s = s.compose(pool[i]);
    }
    return s;
  }

  public reassemblySize(): bigint {
    let n = BigInt(1);
    for (let i = 0; i < this.orbitDefs.length; i++) {
      n *= this.orbitDefs[i].reassemblySize();
    }
    return n;
  }
}

export class PGOrbit {
  private static ktransformationCache: KTransformationOrbitData[] = [];

  public static identity(numPieces: number, numOrientations: number): PGOrbit {
    return new PGOrbit(range(numPieces), zeros(numPieces), numOrientations);
  }

  public permutation: number[];
  public orientationDelta: number[];
  public numOrientations: number;
  constructor(
    permutation: number[],
    orientationDelta: number[],
    numOrientations: number,
  ) {
    this.permutation = permutation;
    this.orientationDelta = orientationDelta;
    this.numOrientations = numOrientations;
  }

  public applyTransformation(b: PGOrbit): PGOrbit {
    const n = this.permutation.length;
    const newPermutation = new Array<number>(n);
    if (this.numOrientations === 1) {
      for (let i = 0; i < n; i++) {
        newPermutation[i] = this.permutation[b.permutation[i]];
      }
      return new PGOrbit(
        newPermutation,
        this.orientationDelta,
        this.numOrientations,
      );
    } else {
      const newOrientationDelta = new Array<number>(n);
      for (let i = 0; i < n; i++) {
        newPermutation[i] = this.permutation[b.permutation[i]];
        newOrientationDelta[i] =
          (this.orientationDelta[b.permutation[i]] + b.orientationDelta[i]) %
          this.numOrientations;
      }
      return new PGOrbit(
        newPermutation,
        newOrientationDelta,
        this.numOrientations,
      );
    }
  }

  public invert(): PGOrbit {
    const n = this.permutation.length;
    const newPerm = new Array<number>(n);
    const newOri = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      newPerm[this.permutation[i]] = i;
      newOri[this.permutation[i]] =
        (this.numOrientations - this.orientationDelta[i]) %
        this.numOrientations;
    }
    return new PGOrbit(newPerm, newOri, this.numOrientations);
  }

  public equal(b: PGOrbit): boolean {
    const n = this.permutation.length;
    for (let i = 0; i < n; i++) {
      if (
        this.permutation[i] !== b.permutation[i] ||
        this.orientationDelta[i] !== b.orientationDelta[i]
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Set the number of orientations to 1, so that orientations are effectively
   * no longer tracked for this orbit.
   */
  public forgetOrientations(): this {
    const n = this.permutation.length;
    for (let i = 0; i < n; i++) {
      this.orientationDelta[i] = 0;
    }
    this.numOrientations = 1;
    return this;
  }

  public toPermutation(): Permutation {
    const { numOrientations } = this;
    if (numOrientations === 1) {
      return new Permutation(this.permutation);
    }
    const n = this.permutation.length;
    const newPerm = new Array<number>(n * numOrientations);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < numOrientations; j++) {
        newPerm[i * numOrientations + j] =
          numOrientations * this.permutation[i] +
          ((this.orientationDelta[i] + j) % numOrientations);
      }
    }
    return new Permutation(newPerm);
  }

  // number the pieces in order.
  public renumberPieces(): PGOrbit {
    const seen = new Array<number>(this.permutation.length);
    const newPerm = new Array<number>(this.permutation.length);
    let id = 0;
    for (let i = 0; i < this.permutation.length; i++) {
      const v = this.permutation[i];
      if (seen[v] === undefined) {
        seen[v] = id++;
      }
      newPerm[i] = seen[v];
    }
    return new PGOrbit(newPerm, this.orientationDelta, this.numOrientations);
  }

  // returns tuple of arrays of indices identical pieces in this orbit
  public identicalPieces(): Record<number, number[]> {
    const output: Record<number, number[]> = {};
    for (let i = 0; i < this.permutation.length; i++) {
      const pieceNumber = this.permutation[i];
      (output[pieceNumber] ??= []).push(i);
    }
    return output;
  }

  public order(): number {
    // can be made more efficient
    return this.toPermutation().order();
  }

  public isIdentity(): boolean {
    const n = this.permutation.length;
    if (this.permutation === range(n) && this.orientationDelta === zeros(n)) {
      return true;
    }
    for (let i = 0; i < n; i++) {
      if (this.permutation[i] !== i || this.orientationDelta[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  private zeroOris(): boolean {
    const n = this.permutation.length;
    // Fast path for zeros in the cache.
    if (this.orientationDelta === zeros(n)) {
      return true;
    }
    for (let i = 0; i < n; i++) {
      if (this.orientationDelta[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  public remap(no: number[], on: number[], nv: number): PGOrbit {
    const newPermutation = new Array<number>(nv);
    const newOrientation = new Array<number>(nv);
    for (let i = 0; i < nv; i++) {
      newPermutation[i] = on[this.permutation[no[i]]];
      newOrientation[i] = this.orientationDelta[no[i]];
    }
    return new PGOrbit(newPermutation, newOrientation, this.numOrientations);
  }

  public remapVS(no: number[], nv: number): PGOrbit {
    const newPerm = new Array<number>(nv);
    const newOri = new Array<number>(nv);
    let nextNew = 0;
    const reassign = [];
    for (let i = 0; i < nv; i++) {
      const ov = this.permutation[no[i]];
      if (reassign[ov] === undefined) {
        reassign[ov] = nextNew++;
      }
      newPerm[i] = reassign[ov];
      newOri[i] = this.orientationDelta[no[i]];
    }
    return new PGOrbit(newPerm, newOri, this.numOrientations);
  }

  public appendDefinition(
    result: string[],
    name: string,
    useVS: boolean,
    concise: boolean = true,
  ): void {
    if (concise && this.isIdentity()) {
      return;
    }
    result.push(name);
    result.push(this.permutation.map((_: number) => _ + 1).join(" "));
    if (!this.zeroOris()) {
      if (useVS) {
        const newori = new Array<number>(this.orientationDelta.length);
        for (let i = 0; i < newori.length; i++) {
          newori[this.permutation[i]] = this.orientationDelta[i];
        }
        result.push(newori.join(" "));
      } else {
        result.push(this.orientationDelta.join(" "));
      }
    }
  }

  public toKTransformationOrbitData(): KTransformationOrbitData {
    const n = this.permutation.length;
    if (this.isIdentity()) {
      if (!PGOrbit.ktransformationCache[n]) {
        PGOrbit.ktransformationCache[n] = {
          permutation: range(n),
          orientationDelta: zeros(n),
        };
      }
      return PGOrbit.ktransformationCache[n];
    } else {
      return {
        permutation: this.permutation,
        orientationDelta: this.orientationDelta,
      };
    }
  }

  public toKPatternOrbitData(): KPatternOrbitData {
    const n = this.permutation.length;
    return {
      pieces: this.permutation,
      orientation: this.orientationDelta,
      orientationMod: zeros(n),
    };
  }
}

export class PGTransformBase {
  public orbits: PGOrbit[];
  constructor(orbits: PGOrbit[]) {
    this.orbits = orbits;
  }

  protected internalApplyTransformation(b: PGTransformBase): PGOrbit[] {
    const newOrbits: PGOrbit[] = [];
    for (let i = 0; i < this.orbits.length; i++) {
      newOrbits.push(this.orbits[i].applyTransformation(b.orbits[i]));
    }
    return newOrbits;
  }

  protected internalInvert(): PGOrbit[] {
    const newOrbits: PGOrbit[] = [];
    for (const orbit of this.orbits) {
      newOrbits.push(orbit.invert());
    }
    return newOrbits;
  }

  public equal(b: PGTransformBase): boolean {
    for (let i = 0; i < this.orbits.length; i++) {
      if (!this.orbits[i].equal(b.orbits[i])) {
        return false;
      }
    }
    return true;
  }

  protected forgetOrientations(): this {
    for (const orbit of this.orbits) {
      orbit.forgetOrientations();
    }
    return this;
  }

  public toPermutation(): Permutation {
    const perms: Permutation[] = [];
    let n = 0;
    for (const orbit of this.orbits) {
      const p = orbit.toPermutation();
      perms.push(p);
      n += p.length;
    }
    const newPerm = new Array<number>(n);
    n = 0;
    for (const p of perms) {
      for (let j = 0; j < p.length; j++) {
        newPerm[n + j] = n + p.permutation[j];
      }
      n += p.length;
    }
    return new Permutation(newPerm);
  }

  public identicalPieces(): number[][] {
    const r: number[][] = [];
    let n = 0;
    for (const orbit of this.orbits) {
      const o = orbit.numOrientations;
      for (const occurences of Object.values(orbit.identicalPieces())) {
        r.push(occurences.map((i) => i * o + n));
      }
      n += o * orbit.permutation.length;
    }
    return r;
  }

  public order(): number {
    let r = 1;
    for (const orbit of this.orbits) {
      r = lcm(r, orbit.order());
    }
    return r;
  }
}
export class PGTransform extends PGTransformBase {
  public compose(b: PGTransform): PGTransform {
    return new PGTransform(this.internalApplyTransformation(b));
  }

  public multiplyByScalar(s: number): PGTransform {
    if (s === 0) {
      return this.identity();
    }
    let t: PGTransform = this;
    if (s < 0) {
      t = t.inverrt();
      s = -s;
    }
    while ((s & 1) === 0) {
      t = t.compose(t);
      s >>= 1;
    }
    if (s === 1) {
      return t;
    }
    let transform = t;
    let r = this.identity();
    while (s > 0) {
      if (s & 1) {
        r = r.compose(transform);
      }
      if (s > 1) {
        transform = transform.compose(transform);
      }
      s >>= 1;
    }
    return r;
  }

  public inverrt(): PGTransform {
    return new PGTransform(this.internalInvert());
  }

  public identity(): PGTransform {
    return new PGTransform(
      this.orbits.map((orbit: PGOrbit) =>
        PGOrbit.identity(orbit.permutation.length, orbit.numOrientations),
      ),
    );
  }
}
export class VisibleState extends PGTransformBase {
  public applyTransformation(b: PGTransform): VisibleState {
    return new VisibleState(this.internalApplyTransformation(b));
  }
}
//  Disjoint set union implementation.
class DisjointUnion {
  private heads: number[];
  public n: number;
  constructor(n: number) {
    this.n = n;
    this.heads = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      this.heads[i] = i;
    }
  }

  public find(v: number): number {
    let h = this.heads[v];
    if (this.heads[h] === h) {
      return h;
    }
    h = this.find(this.heads[h]);
    this.heads[v] = h;
    return h;
  }

  public union(a: number, b: number): void {
    const ah = this.find(a);
    const bh = this.find(b);
    if (ah < bh) {
      this.heads[bh] = ah;
    } else if (ah > bh) {
      this.heads[ah] = bh;
    }
  }
}

export function showCanonical(g: PGOrbitsDef, disp: (s: string) => void): void {
  // show information for canonical move derivation
  const n = g.moveOps.length;
  if (n > 30) {
    throw new Error("Canon info too big for bitmask");
  }
  const orders = [];
  const commutes = [];
  for (let i = 0; i < n; i++) {
    const permA = g.moveOps[i];
    orders.push(permA.order());
    let bits = 0;
    for (let j = 0; j < n; j++) {
      if (j === i) {
        continue;
      }
      const permB = g.moveOps[j];
      if (permA.compose(permB).equal(permB.compose(permA))) {
        bits |= 1 << j;
      }
    }
    commutes.push(bits);
  }
  let curlev: any = {};
  curlev[0] = 1;
  for (let d = 0; d < 100; d++) {
    let sum = 0;
    const nextlev: any = {};
    let uniq = 0;
    for (const sti in curlev) {
      const st = +sti; // string to number
      const cnt = curlev[st];
      sum += cnt;
      uniq++;
      for (let mv = 0; mv < orders.length; mv++) {
        if (
          ((st >> mv) & 1) === 0 &&
          (st & commutes[mv] & ((1 << mv) - 1)) === 0
        ) {
          const nst = (st & commutes[mv]) | (1 << mv);
          if (nextlev[nst] === undefined) {
            nextlev[nst] = 0;
          }
          nextlev[nst] += (orders[mv] - 1) * cnt;
        }
      }
    }
    disp(`${d}: canonseq ${sum} states ${uniq}`);
    curlev = nextlev;
  }
}

// This is a less effective canonicalization (that happens to work fine
// for the 3x3x3).  We include this only for comparison.
export function showCanonical0(
  g: PGOrbitsDef,
  disp: (s: string) => void,
): void {
  // show information for canonical move derivation
  const n = g.moveOps.length;
  if (n > 30) {
    throw new Error("Canon info too big for bitmask");
  }
  const orders = [];
  const commutes = [];
  for (let i = 0; i < n; i++) {
    const permA = g.moveOps[i];
    orders.push(permA.order());
    let bits = 0;
    for (let j = 0; j < n; j++) {
      if (j === i) {
        continue;
      }
      const permB = g.moveOps[j];
      if (permA.compose(permB).equal(permB.compose(permA))) {
        bits |= 1 << j;
      }
    }
    commutes.push(bits);
  }
  let curlev: any = {};
  disp("0: canonseq 1");
  for (let x = 0; x < orders.length; x++) {
    curlev[x] = orders[x] - 1;
  }
  for (let d = 1; d < 100; d++) {
    let sum = 0;
    const nextlev: any = {};
    let uniq = 0;
    for (const sti in curlev) {
      const st = +sti; // string to number
      const cnt = curlev[st];
      sum += cnt;
      uniq++;
      for (let mv = 0; mv < orders.length; mv++) {
        if (mv === st || (commutes[mv] & (1 << st) && mv < st)) {
          continue;
        }
        if (nextlev[mv] === undefined) {
          nextlev[mv] = 0;
        }
        nextlev[mv] += (orders[mv] - 1) * cnt;
      }
    }
    disp(`${d}": canonseq ${sum} states ${uniq}`);
    curlev = nextlev;
  }
}
