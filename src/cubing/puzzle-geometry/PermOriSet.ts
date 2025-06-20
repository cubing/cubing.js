import { Move } from "../alg";
import type { KPuzzleDefinition, KTransformationData } from "../kpuzzle"; // TODO
import type {
  KPatternData,
  KPatternOrbitData,
  KPuzzleOrbitDefinition,
  KTransformationOrbitData,
} from "../kpuzzle/KPuzzleDefinition";
import { NullMapper } from "./notation-mapping";
import type { NotationMapper } from "./notation-mapping/NotationMapper";
/* tslint:disable no-bitwise */
/* tslint:disable prefer-for-of */ import {
  factorial,
  iota,
  lcm,
  Perm,
  zeros,
} from "./Perm";
export class PGOrbitDef {
  constructor(
    public size: number,
    public mod: number,
  ) {}
  public reassemblySize(): bigint {
    return factorial(this.size) * BigInt(this.mod) ** BigInt(this.size);
  }
}

let lastGlobalDefinitionCounter = 0;

export function externalName(
  mapper: NotationMapper,
  moveString: string,
): string {
  const mv = Move.fromString(moveString);
  const mv2 = mapper.notationToExternal(mv);
  if (mv2 === null || mv === mv2) {
    return moveString;
  }
  return mv2.toString();
}

export class PGOrbitsDef {
  constructor(
    public orbitnames: string[],
    private orbitdefs: PGOrbitDef[],
    public solved: VisibleState,
    public movenames: string[],
    public moveops: PGTransform[],
    public isRotation: boolean[],
    public forcenames: boolean[],
  ) {}

  public toKTransformationData(t: PGTransform): KTransformationData {
    const ktransformationData: KTransformationData = {};
    for (let i = 0; i < this.orbitnames.length; i++) {
      ktransformationData[this.orbitnames[i]] =
        t.orbits[i].toKTransformationOrbitData();
    }
    return ktransformationData;
  }

  public toKPatternData(t: PGTransform): KPatternData {
    const kpatternData: KPatternData = {};
    for (let i = 0; i < this.orbitnames.length; i++) {
      kpatternData[this.orbitnames[i]] = t.orbits[i].toKPatternOrbitData();
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
    const n = this.orbitdefs[s].size;
    const m = new Array(n);
    for (let i = 0; i < n; i++) {
      m[i] = [];
    }
    for (let i = 0; i < this.movenames.length; i++) {
      if (this.isRotation[i]) {
        continue;
      }
      let mvname = this.movenames[i];
      if (!this.forcenames[i]) {
        mvname = externalName(mapper, mvname);
        if (mvname[mvname.length - 1] === "'") {
          mvname = mvname.substring(0, mvname.length - 1);
        }
      }
      const pd = this.moveops[i].orbits[s];
      for (let j = 0; j < n; j++) {
        if (pd.perm[j] !== j || pd.ori[j] !== 0) {
          m[j].push(mvname);
        }
      }
    }
    for (let j = 0; j < n; j++) {
      r.push(`# ${j + 1} ${m[j].join(" ")}`);
    }
  }

  public toKsolve(
    name: string,
    mapper: NotationMapper = new NullMapper(),
  ): string[] {
    const result = [];
    result.push(`Name ${name}`);
    result.push("");
    for (let i = 0; i < this.orbitnames.length; i++) {
      result.push(
        `Set ${this.orbitnames[i]} ${this.orbitdefs[i].size} ${this.orbitdefs[i].mod}`,
      );
      this.describeSet(i, result, mapper);
    }
    result.push("");
    result.push("Solved");
    for (let i = 0; i < this.orbitnames.length; i++) {
      this.solved.orbits[i].appendDefinition(
        result,
        this.orbitnames[i],
        false,
        false,
      );
    }
    result.push("End");
    for (let i = 0; i < this.movenames.length; i++) {
      result.push("");
      let name = this.movenames[i];
      if (!this.forcenames[i]) {
        name = externalName(mapper, this.movenames[i]);
      }
      let doinv = false;
      if (name[name.length - 1] === "'") {
        doinv = true;
        name = name.substring(0, name.length - 1);
      }
      result.push(`Move ${name}`);
      for (let j = 0; j < this.orbitnames.length; j++) {
        if (doinv) {
          this.moveops[i].orbits[j]
            .inv()
            .appendDefinition(result, this.orbitnames[j], true);
        } else {
          this.moveops[i].orbits[j].appendDefinition(
            result,
            this.orbitnames[j],
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
    for (let i = 0; i < this.orbitnames.length; i++) {
      orbits.push({
        orbitName: this.orbitnames[i],
        numPieces: this.orbitdefs[i].size,
        numOrientations: this.orbitdefs[i].mod,
      });
      const defaultPatternFrom =
        this.solved.orbits[i].toKTransformationOrbitData();
      defaultPatternData[this.orbitnames[i]] = {
        pieces: defaultPatternFrom.permutation,
        orientation: defaultPatternFrom.orientationDelta,
      };
    }
    const moves: { [moveName: string]: any } = {};
    if (includemoves) {
      for (let i = 0; i < this.movenames.length; i++) {
        moves[this.movenames[i]] = this.toKTransformationData(this.moveops[i]);
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
    const neworbitnames: string[] = [];
    const neworbitdefs: PGOrbitDef[] = [];
    const newsolved: PGOrbit[] = [];
    const newmoveops: PGOrbit[][] = [];
    for (let j = 0; j < this.moveops.length; j++) {
      newmoveops.push([]);
    }
    for (let i = 0; i < this.orbitdefs.length; i++) {
      const om = this.orbitdefs[i].mod;
      const n = this.orbitdefs[i].size;
      const du = new DisjointUnion(n);
      const changed = new Array<boolean>(this.orbitdefs[i].size);
      for (let k = 0; k < n; k++) {
        changed[k] = false;
      }
      // don't consider rotations when optimizing, for what to keep
      // but *do* consider rotations for unions.
      for (let j = 0; j < this.moveops.length; j++) {
        for (let k = 0; k < n; k++) {
          if (
            this.moveops[j].orbits[i].perm[k] !== k ||
            this.moveops[j].orbits[i].ori[k] !== 0
          ) {
            if (!this.isRotation[j]) {
              changed[k] = true;
            }
            du.union(k, this.moveops[j].orbits[i].perm[k]);
          }
        }
      }
      let keepori = true;
      // right now we kill ori only if solved is unique and
      // if we can kill it completely.  This is not all the optimization
      // we can perform.
      if (om > 1) {
        keepori = false;
        const duo = new DisjointUnion(this.orbitdefs[i].size * om);
        for (let j = 0; j < this.moveops.length; j++) {
          for (let k = 0; k < n; k++) {
            if (
              this.moveops[j].orbits[i].perm[k] !== k ||
              this.moveops[j].orbits[i].ori[k] !== 0
            ) {
              for (let o = 0; o < om; o++) {
                duo.union(
                  k * om + o,
                  this.moveops[j].orbits[i].perm[k] * om +
                    ((o + this.moveops[j].orbits[i].ori[k]) % om),
                );
              }
            }
          }
        }
        for (let j = 0; !keepori && j < n; j++) {
          for (let o = 1; o < om; o++) {
            if (duo.find(j * om) === duo.find(j * om + o)) {
              keepori = true;
            }
          }
        }
        for (let j = 0; !keepori && j < n; j++) {
          for (let k = 0; k < j; k++) {
            if (
              this.solved.orbits[i].perm[j] === this.solved.orbits[i].perm[k]
            ) {
              keepori = true;
            }
          }
        }
      }
      // is there just one result set, or more than one?
      let nontriv = -1;
      let multiple = false;
      for (let j = 0; j < this.orbitdefs[i].size; j++) {
        if (changed[j]) {
          const h = du.find(j);
          if (nontriv < 0) {
            nontriv = h;
          } else if (nontriv !== h) {
            multiple = true;
          }
        }
      }
      for (let j = 0; j < this.orbitdefs[i].size; j++) {
        if (!changed[j]) {
          continue;
        }
        const h = du.find(j);
        if (h !== j) {
          continue;
        }
        const no: number[] = [];
        const on: number[] = [];
        let nv = 0;
        for (let k = 0; k < this.orbitdefs[i].size; k++) {
          if (du.find(k) === j) {
            no[nv] = k;
            on[k] = nv;
            nv++;
          }
        }
        if (multiple) {
          neworbitnames.push(`${this.orbitnames[i]}_p${j}`);
        } else {
          neworbitnames.push(this.orbitnames[i]);
        }
        if (keepori) {
          neworbitdefs.push(new PGOrbitDef(nv, this.orbitdefs[i].mod));
          newsolved.push(this.solved.orbits[i].remapVS(no, nv));
          for (let k = 0; k < this.moveops.length; k++) {
            newmoveops[k].push(this.moveops[k].orbits[i].remap(no, on, nv));
          }
        } else {
          neworbitdefs.push(new PGOrbitDef(nv, 1));
          newsolved.push(this.solved.orbits[i].remapVS(no, nv).killOri());
          for (let k = 0; k < this.moveops.length; k++) {
            newmoveops[k].push(
              this.moveops[k].orbits[i].remap(no, on, nv).killOri(),
            );
          }
        }
      }
    }
    return new PGOrbitsDef(
      neworbitnames,
      neworbitdefs,
      new VisibleState(newsolved),
      this.movenames,
      newmoveops.map((_) => new PGTransform(_)),
      this.isRotation,
      this.forcenames,
    );
  }

  // replace the solved state with a new scrambled state.
  public scramble(n: number): void {
    this.solved = this.solved.mul(this.getScrambleTransformation(n));
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
    for (let i = 0; i < this.moveops.length; i++) {
      pool[i] = this.moveops[i];
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
      const rm = Math.floor(Math.random() * this.moveops.length);
      pool[ri] = pool[ri].mul(pool[rj]).mul(this.moveops[rm]);
      if (Math.random() < 0.1) {
        // break up parity
        pool[ri] = pool[ri].mul(this.moveops[rm]);
      }
    }
    let s = pool[0];
    for (let i = 1; i < pool.length; i++) {
      s = s.mul(pool[i]);
    }
    return s;
  }

  public reassemblySize(): bigint {
    let n = BigInt(1);
    for (let i = 0; i < this.orbitdefs.length; i++) {
      n *= this.orbitdefs[i].reassemblySize();
    }
    return n;
  }
}

export class PGOrbit {
  private static ktransformationCache: KTransformationOrbitData[] = [];

  public static e(n: number, mod: number): PGOrbit {
    return new PGOrbit(iota(n), zeros(n), mod);
  }

  constructor(
    public perm: number[],
    public ori: number[],
    public orimod: number,
  ) {}

  public mul(b: PGOrbit): PGOrbit {
    const n = this.perm.length;
    const newPerm = new Array<number>(n);
    if (this.orimod === 1) {
      for (let i = 0; i < n; i++) {
        newPerm[i] = this.perm[b.perm[i]];
      }
      return new PGOrbit(newPerm, this.ori, this.orimod);
    } else {
      const newOri = new Array<number>(n);
      for (let i = 0; i < n; i++) {
        newPerm[i] = this.perm[b.perm[i]];
        newOri[i] = (this.ori[b.perm[i]] + b.ori[i]) % this.orimod;
      }
      return new PGOrbit(newPerm, newOri, this.orimod);
    }
  }

  public inv(): PGOrbit {
    const n = this.perm.length;
    const newPerm = new Array<number>(n);
    const newOri = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      newPerm[this.perm[i]] = i;
      newOri[this.perm[i]] = (this.orimod - this.ori[i]) % this.orimod;
    }
    return new PGOrbit(newPerm, newOri, this.orimod);
  }

  public equal(b: PGOrbit): boolean {
    const n = this.perm.length;
    for (let i = 0; i < n; i++) {
      if (this.perm[i] !== b.perm[i] || this.ori[i] !== b.ori[i]) {
        return false;
      }
    }
    return true;
  }

  // in-place mutator
  public killOri(): this {
    const n = this.perm.length;
    for (let i = 0; i < n; i++) {
      this.ori[i] = 0;
    }
    this.orimod = 1;
    return this;
  }

  public toPerm(): Perm {
    const o = this.orimod;
    if (o === 1) {
      return new Perm(this.perm);
    }
    const n = this.perm.length;
    const newPerm = new Array<number>(n * o);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < o; j++) {
        newPerm[i * o + j] = o * this.perm[i] + ((this.ori[i] + j) % o);
      }
    }
    return new Perm(newPerm);
  }

  // returns tuple of sets of identical pieces in this orbit
  public identicalPieces(): number[][] {
    const done: boolean[] = [];
    const n = this.perm.length;
    const r: number[][] = [];
    for (let i = 0; i < n; i++) {
      const v = this.perm[i];
      if (done[v] === undefined) {
        const s: number[] = [i];
        done[v] = true;
        for (let j = i + 1; j < n; j++) {
          if (this.perm[j] === v) {
            s.push(j);
          }
        }
        r.push(s);
      }
    }
    return r;
  }

  public order(): number {
    // can be made more efficient
    return this.toPerm().order();
  }

  public isIdentity(): boolean {
    const n = this.perm.length;
    if (this.perm === iota(n) && this.ori === zeros(n)) {
      return true;
    }
    for (let i = 0; i < n; i++) {
      if (this.perm[i] !== i || this.ori[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  private zeroOris(): boolean {
    const n = this.perm.length;
    if (this.ori === zeros(n)) {
      return true;
    }
    for (let i = 0; i < n; i++) {
      if (this.ori[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  public remap(no: number[], on: number[], nv: number): PGOrbit {
    const newPerm = new Array<number>(nv);
    const newOri = new Array<number>(nv);
    for (let i = 0; i < nv; i++) {
      newPerm[i] = on[this.perm[no[i]]];
      newOri[i] = this.ori[no[i]];
    }
    return new PGOrbit(newPerm, newOri, this.orimod);
  }

  public remapVS(no: number[], nv: number): PGOrbit {
    const newPerm = new Array<number>(nv);
    const newOri = new Array<number>(nv);
    let nextNew = 0;
    const reassign = [];
    for (let i = 0; i < nv; i++) {
      const ov = this.perm[no[i]];
      if (reassign[ov] === undefined) {
        reassign[ov] = nextNew++;
      }
      newPerm[i] = reassign[ov];
      newOri[i] = this.ori[no[i]];
    }
    return new PGOrbit(newPerm, newOri, this.orimod);
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
    result.push(this.perm.map((_: number) => _ + 1).join(" "));
    if (!this.zeroOris()) {
      if (useVS) {
        const newori = new Array<number>(this.ori.length);
        for (let i = 0; i < newori.length; i++) {
          newori[this.perm[i]] = this.ori[i];
        }
        result.push(newori.join(" "));
      } else {
        result.push(this.ori.join(" "));
      }
    }
  }

  public toKTransformationOrbitData(): KTransformationOrbitData {
    const n = this.perm.length;
    if (this.isIdentity()) {
      if (!PGOrbit.ktransformationCache[n]) {
        PGOrbit.ktransformationCache[n] = {
          permutation: iota(n),
          orientationDelta: zeros(n),
        };
      }
      return PGOrbit.ktransformationCache[n];
    } else {
      return { permutation: this.perm, orientationDelta: this.ori };
    }
  }

  public toKPatternOrbitData(): KPatternOrbitData {
    const n = this.perm.length;
    return {
      pieces: this.perm,
      orientation: this.ori,
      orientationMod: zeros(n),
    };
  }
}

export class PGTransformBase {
  constructor(public orbits: PGOrbit[]) {}
  public internalMul(b: PGTransformBase): PGOrbit[] {
    const newOrbits: PGOrbit[] = [];
    for (let i = 0; i < this.orbits.length; i++) {
      newOrbits.push(this.orbits[i].mul(b.orbits[i]));
    }
    return newOrbits;
  }

  protected internalInv(): PGOrbit[] {
    const newOrbits: PGOrbit[] = [];
    for (const orbit of this.orbits) {
      newOrbits.push(orbit.inv());
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

  protected killOri(): this {
    for (const orbit of this.orbits) {
      orbit.killOri();
    }
    return this;
  }

  public toPerm(): Perm {
    const perms: Perm[] = [];
    let n = 0;
    for (const orbit of this.orbits) {
      const p = orbit.toPerm();
      perms.push(p);
      n += p.n;
    }
    const newPerm = new Array<number>(n);
    n = 0;
    for (const p of perms) {
      for (let j = 0; j < p.n; j++) {
        newPerm[n + j] = n + p.p[j];
      }
      n += p.n;
    }
    return new Perm(newPerm);
  }

  public identicalPieces(): number[][] {
    const r: number[][] = [];
    let n = 0;
    for (const orbit of this.orbits) {
      const o = orbit.orimod;
      const s = orbit.identicalPieces();
      for (let j = 0; j < s.length; j++) {
        r.push(s[j].map((_) => _ * o + n));
      }
      n += o * orbit.perm.length;
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
  public mul(b: PGTransform): PGTransform {
    return new PGTransform(this.internalMul(b));
  }

  public mulScalar(n: number): PGTransform {
    if (n === 0) {
      return this.e();
    }
    let t: PGTransform = this;
    if (n < 0) {
      t = t.inv();
      n = -n;
    }
    while ((n & 1) === 0) {
      t = t.mul(t);
      n >>= 1;
    }
    if (n === 1) {
      return t;
    }
    let s = t;
    let r = this.e();
    while (n > 0) {
      if (n & 1) {
        r = r.mul(s);
      }
      if (n > 1) {
        s = s.mul(s);
      }
      n >>= 1;
    }
    return r;
  }

  public inv(): PGTransform {
    return new PGTransform(this.internalInv());
  }

  public e(): PGTransform {
    return new PGTransform(
      this.orbits.map((_: PGOrbit) => PGOrbit.e(_.perm.length, _.orimod)),
    );
  }
}
export class VisibleState extends PGTransformBase {
  public mul(b: PGTransform): VisibleState {
    return new VisibleState(this.internalMul(b));
  }
}
//  Disjoint set union implementation.
class DisjointUnion {
  private heads: number[];
  constructor(public n: number) {
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
export function showcanon(g: PGOrbitsDef, disp: (s: string) => void): void {
  // show information for canonical move derivation
  const n = g.moveops.length;
  if (n > 30) {
    throw new Error("Canon info too big for bitmask");
  }
  const orders = [];
  const commutes = [];
  for (let i = 0; i < n; i++) {
    const permA = g.moveops[i];
    orders.push(permA.order());
    let bits = 0;
    for (let j = 0; j < n; j++) {
      if (j === i) {
        continue;
      }
      const permB = g.moveops[j];
      if (permA.mul(permB).equal(permB.mul(permA))) {
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
export function showcanon0(g: PGOrbitsDef, disp: (s: string) => void): void {
  // show information for canonical move derivation
  const n = g.moveops.length;
  if (n > 30) {
    throw new Error("Canon info too big for bitmask");
  }
  const orders = [];
  const commutes = [];
  for (let i = 0; i < n; i++) {
    const permA = g.moveops[i];
    orders.push(permA.order());
    let bits = 0;
    for (let j = 0; j < n; j++) {
      if (j === i) {
        continue;
      }
      const permB = g.moveops[j];
      if (permA.mul(permB).equal(permB.mul(permA))) {
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
