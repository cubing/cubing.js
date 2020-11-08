// src/puzzle-geometry/Perm.ts
const zeroCache = [];
const iotaCache = [];
function zeros(n) {
  if (!zeroCache[n]) {
    const c = Array(n);
    for (let i = 0; i < n; i++) {
      c[i] = 0;
    }
    zeroCache[n] = c;
  }
  return zeroCache[n];
}
function iota(n) {
  if (!iotaCache[n]) {
    const c = Array(n);
    for (let i = 0; i < n; i++) {
      c[i] = i;
    }
    iotaCache[n] = c;
  }
  return iotaCache[n];
}
function factorial(a) {
  let r = 1;
  while (a > 1) {
    r *= a;
    a--;
  }
  return r;
}
function gcd(a, b) {
  if (a > b) {
    const t = a;
    a = b;
    b = t;
  }
  while (a > 0) {
    const m = b % a;
    b = a;
    a = m;
  }
  return b;
}
function lcm(a, b) {
  return a / gcd(a, b) * b;
}
class Perm {
  constructor(a) {
    this.n = a.length;
    this.p = a;
  }
  toString() {
    return "Perm[" + this.p.join(" ") + "]";
  }
  mul(p2) {
    const c = Array(this.n);
    for (let i = 0; i < this.n; i++) {
      c[i] = p2.p[this.p[i]];
    }
    return new Perm(c);
  }
  rmul(p2) {
    const c = Array(this.n);
    for (let i = 0; i < this.n; i++) {
      c[i] = this.p[p2.p[i]];
    }
    return new Perm(c);
  }
  inv() {
    const c = Array(this.n);
    for (let i = 0; i < this.n; i++) {
      c[this.p[i]] = i;
    }
    return new Perm(c);
  }
  compareTo(p2) {
    for (let i = 0; i < this.n; i++) {
      if (this.p[i] !== p2.p[i]) {
        return this.p[i] - p2.p[i];
      }
    }
    return 0;
  }
  toGap() {
    const cyc = new Array();
    const seen = new Array(this.n);
    for (let i = 0; i < this.p.length; i++) {
      if (seen[i] || this.p[i] === i) {
        continue;
      }
      const incyc = new Array();
      for (let j = i; !seen[j]; j = this.p[j]) {
        incyc.push(1 + j);
        seen[j] = true;
      }
      cyc.push("(" + incyc.join(",") + ")");
    }
    return cyc.join("");
  }
  order() {
    let r = 1;
    const seen = new Array(this.n);
    for (let i = 0; i < this.p.length; i++) {
      if (seen[i] || this.p[i] === i) {
        continue;
      }
      let cs = 0;
      for (let j = i; !seen[j]; j = this.p[j]) {
        cs++;
        seen[j] = true;
      }
      r = lcm(r, cs);
    }
    return r;
  }
}

// src/puzzle-geometry/PermOriSet.ts
class OrbitDef {
  constructor(size, mod) {
    this.size = size;
    this.mod = mod;
  }
  reassemblySize() {
    return factorial(this.size) * Math.pow(this.mod, this.size);
  }
}
class OrbitsDef {
  constructor(orbitnames, orbitdefs, solved, movenames, moveops) {
    this.orbitnames = orbitnames;
    this.orbitdefs = orbitdefs;
    this.solved = solved;
    this.movenames = movenames;
    this.moveops = moveops;
  }
  transformToKPuzzle(t) {
    const mp = {};
    for (let j = 0; j < this.orbitnames.length; j++) {
      mp[this.orbitnames[j]] = t.orbits[j].toKpuzzle();
    }
    return mp;
  }
  toKsolve(name, forTwisty) {
    const result = [];
    result.push("Name " + name);
    result.push("");
    for (let i = 0; i < this.orbitnames.length; i++) {
      result.push("Set " + this.orbitnames[i] + " " + this.orbitdefs[i].size + " " + this.orbitdefs[i].mod);
    }
    result.push("");
    result.push("Solved");
    for (let i = 0; i < this.orbitnames.length; i++) {
      result.push(this.orbitnames[i]);
      const o = this.solved.orbits[i].toKsolveVS();
      result.push(o[0]);
      result.push(o[1]);
    }
    result.push("End");
    result.push("");
    for (let i = 0; i < this.movenames.length; i++) {
      result.push("Move " + this.movenames[i]);
      for (let j = 0; j < this.orbitnames.length; j++) {
        if (!forTwisty && this.moveops[i].orbits[j].isIdentity()) {
          continue;
        }
        result.push(this.orbitnames[j]);
        const o = this.moveops[i].orbits[j].toKsolve();
        result.push(o[0]);
        result.push(o[1]);
      }
      result.push("End");
      result.push("");
    }
    return result;
  }
  toKpuzzle() {
    const orbits = {};
    const start = {};
    for (let i = 0; i < this.orbitnames.length; i++) {
      orbits[this.orbitnames[i]] = {
        numPieces: this.orbitdefs[i].size,
        orientations: this.orbitdefs[i].mod
      };
      start[this.orbitnames[i]] = this.solved.orbits[i].toKpuzzle();
    }
    const moves = {};
    for (let i = 0; i < this.movenames.length; i++) {
      moves[this.movenames[i]] = this.transformToKPuzzle(this.moveops[i]);
    }
    return {name: "PG3D", orbits, startPieces: start, moves};
  }
  optimize() {
    const neworbitnames = [];
    const neworbitdefs = [];
    const newsolved = [];
    const newmoveops = [];
    for (let j = 0; j < this.moveops.length; j++) {
      newmoveops.push([]);
    }
    for (let i = 0; i < this.orbitdefs.length; i++) {
      const om = this.orbitdefs[i].mod;
      const n = this.orbitdefs[i].size;
      const du = new DisjointUnion(n);
      const changed = new Array(this.orbitdefs[i].size);
      for (let k = 0; k < n; k++) {
        changed[k] = false;
      }
      for (let j = 0; j < this.moveops.length; j++) {
        for (let k = 0; k < n; k++) {
          if (this.moveops[j].orbits[i].perm[k] !== k || this.moveops[j].orbits[i].ori[k] !== 0) {
            changed[k] = true;
            du.union(k, this.moveops[j].orbits[i].perm[k]);
          }
        }
      }
      let keepori = true;
      if (om > 1) {
        keepori = false;
        const duo = new DisjointUnion(this.orbitdefs[i].size * om);
        for (let j = 0; j < this.moveops.length; j++) {
          for (let k = 0; k < n; k++) {
            if (this.moveops[j].orbits[i].perm[k] !== k || this.moveops[j].orbits[i].ori[k] !== 0) {
              for (let o = 0; o < om; o++) {
                duo.union(k * om + o, this.moveops[j].orbits[i].perm[k] * om + (o + this.moveops[j].orbits[i].ori[k]) % om);
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
            if (this.solved.orbits[i].perm[j] === this.solved.orbits[i].perm[k]) {
              keepori = true;
            }
          }
        }
      }
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
        const no = [];
        const on = [];
        let nv = 0;
        for (let k = 0; k < this.orbitdefs[i].size; k++) {
          if (du.find(k) === j) {
            no[nv] = k;
            on[k] = nv;
            nv++;
          }
        }
        if (multiple) {
          neworbitnames.push(this.orbitnames[i] + "_p" + j);
        } else {
          neworbitnames.push(this.orbitnames[i]);
        }
        if (keepori) {
          neworbitdefs.push(new OrbitDef(nv, this.orbitdefs[i].mod));
          newsolved.push(this.solved.orbits[i].remapVS(no, nv));
          for (let k = 0; k < this.moveops.length; k++) {
            newmoveops[k].push(this.moveops[k].orbits[i].remap(no, on, nv));
          }
        } else {
          neworbitdefs.push(new OrbitDef(nv, 1));
          newsolved.push(this.solved.orbits[i].remapVS(no, nv).killOri());
          for (let k = 0; k < this.moveops.length; k++) {
            newmoveops[k].push(this.moveops[k].orbits[i].remap(no, on, nv).killOri());
          }
        }
      }
    }
    return new OrbitsDef(neworbitnames, neworbitdefs, new VisibleState(newsolved), this.movenames, newmoveops.map((_) => new Transformation(_)));
  }
  scramble(n) {
    const pool = [];
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
        pool[ri] = pool[ri].mul(this.moveops[rm]);
      }
    }
    let s = pool[0];
    for (let i = 1; i < pool.length; i++) {
      s = s.mul(pool[i]);
    }
    this.solved = this.solved.mul(s);
  }
  reassemblySize() {
    let n = 1;
    for (let i = 0; i < this.orbitdefs.length; i++) {
      n *= this.orbitdefs[i].reassemblySize();
    }
    return n;
  }
}
class Orbit {
  constructor(perm, ori, orimod) {
    this.perm = perm;
    this.ori = ori;
    this.orimod = orimod;
  }
  static e(n, mod) {
    return new Orbit(iota(n), zeros(n), mod);
  }
  mul(b) {
    const n = this.perm.length;
    const newPerm = new Array(n);
    if (this.orimod === 1) {
      for (let i = 0; i < n; i++) {
        newPerm[i] = this.perm[b.perm[i]];
      }
      return new Orbit(newPerm, this.ori, this.orimod);
    } else {
      const newOri = new Array(n);
      for (let i = 0; i < n; i++) {
        newPerm[i] = this.perm[b.perm[i]];
        newOri[i] = (this.ori[b.perm[i]] + b.ori[i]) % this.orimod;
      }
      return new Orbit(newPerm, newOri, this.orimod);
    }
  }
  inv() {
    const n = this.perm.length;
    const newPerm = new Array(n);
    const newOri = new Array(n);
    for (let i = 0; i < n; i++) {
      newPerm[this.perm[i]] = i;
      newOri[this.perm[i]] = (this.orimod - this.ori[i]) % this.orimod;
    }
    return new Orbit(newPerm, newOri, this.orimod);
  }
  equal(b) {
    const n = this.perm.length;
    for (let i = 0; i < n; i++) {
      if (this.perm[i] !== b.perm[i] || this.ori[i] !== b.ori[i]) {
        return false;
      }
    }
    return true;
  }
  killOri() {
    const n = this.perm.length;
    for (let i = 0; i < n; i++) {
      this.ori[i] = 0;
    }
    this.orimod = 1;
    return this;
  }
  toPerm() {
    const o = this.orimod;
    if (o === 1) {
      return new Perm(this.perm);
    }
    const n = this.perm.length;
    const newPerm = new Array(n * o);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < o; j++) {
        newPerm[i * o + j] = o * this.perm[i] + (this.ori[i] + j) % o;
      }
    }
    return new Perm(newPerm);
  }
  identicalPieces() {
    const done = [];
    const n = this.perm.length;
    const r = [];
    for (let i = 0; i < n; i++) {
      const v = this.perm[i];
      if (done[v] === void 0) {
        const s = [i];
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
  order() {
    return this.toPerm().order();
  }
  isIdentity() {
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
  remap(no, on, nv) {
    const newPerm = new Array(nv);
    const newOri = new Array(nv);
    for (let i = 0; i < nv; i++) {
      newPerm[i] = on[this.perm[no[i]]];
      newOri[i] = this.ori[no[i]];
    }
    return new Orbit(newPerm, newOri, this.orimod);
  }
  remapVS(no, nv) {
    const newPerm = new Array(nv);
    const newOri = new Array(nv);
    let nextNew = 0;
    const reassign = [];
    for (let i = 0; i < nv; i++) {
      const ov = this.perm[no[i]];
      if (reassign[ov] === void 0) {
        reassign[ov] = nextNew++;
      }
      newPerm[i] = reassign[ov];
      newOri[i] = this.ori[no[i]];
    }
    return new Orbit(newPerm, newOri, this.orimod);
  }
  toKsolveVS() {
    return [this.perm.map((_) => _ + 1).join(" "), this.ori.join(" ")];
  }
  toKsolve() {
    const newori = new Array(this.ori.length);
    for (let i = 0; i < newori.length; i++) {
      newori[this.perm[i]] = this.ori[i];
    }
    return [this.perm.map((_) => _ + 1).join(" "), newori.join(" ")];
  }
  toKpuzzle() {
    return {permutation: this.perm, orientation: this.ori};
  }
}
class TransformationBase {
  constructor(orbits) {
    this.orbits = orbits;
  }
  internalMul(b) {
    const newOrbits = [];
    for (let i = 0; i < this.orbits.length; i++) {
      newOrbits.push(this.orbits[i].mul(b.orbits[i]));
    }
    return newOrbits;
  }
  internalInv() {
    const newOrbits = [];
    for (let i = 0; i < this.orbits.length; i++) {
      newOrbits.push(this.orbits[i].inv());
    }
    return newOrbits;
  }
  equal(b) {
    for (let i = 0; i < this.orbits.length; i++) {
      if (!this.orbits[i].equal(b.orbits[i])) {
        return false;
      }
    }
    return true;
  }
  killOri() {
    for (let i = 0; i < this.orbits.length; i++) {
      this.orbits[i].killOri();
    }
    return this;
  }
  toPerm() {
    const perms = new Array();
    let n = 0;
    for (let i = 0; i < this.orbits.length; i++) {
      const p = this.orbits[i].toPerm();
      perms.push(p);
      n += p.n;
    }
    const newPerm = new Array(n);
    n = 0;
    for (let i = 0; i < this.orbits.length; i++) {
      const p = perms[i];
      for (let j = 0; j < p.n; j++) {
        newPerm[n + j] = n + p.p[j];
      }
      n += p.n;
    }
    return new Perm(newPerm);
  }
  identicalPieces() {
    const r = [];
    let n = 0;
    for (let i = 0; i < this.orbits.length; i++) {
      const o = this.orbits[i].orimod;
      const s = this.orbits[i].identicalPieces();
      for (let j = 0; j < s.length; j++) {
        r.push(s[j].map((_) => _ * o + n));
      }
      n += o * this.orbits[i].perm.length;
    }
    return r;
  }
  order() {
    let r = 1;
    for (let i = 0; i < this.orbits.length; i++) {
      r = lcm(r, this.orbits[i].order());
    }
    return r;
  }
}
class Transformation extends TransformationBase {
  constructor(orbits) {
    super(orbits);
  }
  mul(b) {
    return new Transformation(this.internalMul(b));
  }
  mulScalar(n) {
    if (n === 0) {
      return this.e();
    }
    let t = this;
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
  inv() {
    return new Transformation(this.internalInv());
  }
  e() {
    return new Transformation(this.orbits.map((_) => Orbit.e(_.perm.length, _.orimod)));
  }
}
class VisibleState extends TransformationBase {
  constructor(orbits) {
    super(orbits);
  }
  mul(b) {
    return new VisibleState(this.internalMul(b));
  }
}
class DisjointUnion {
  constructor(n) {
    this.n = n;
    this.heads = new Array(n);
    for (let i = 0; i < n; i++) {
      this.heads[i] = i;
    }
  }
  find(v) {
    let h = this.heads[v];
    if (this.heads[h] === h) {
      return h;
    }
    h = this.find(this.heads[h]);
    this.heads[v] = h;
    return h;
  }
  union(a, b) {
    const ah = this.find(a);
    const bh = this.find(b);
    if (ah < bh) {
      this.heads[bh] = ah;
    } else if (ah > bh) {
      this.heads[ah] = bh;
    }
  }
}
function showcanon(g, disp) {
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
  let curlev = {};
  curlev[0] = 1;
  for (let d = 0; d < 100; d++) {
    let sum = 0;
    const nextlev = {};
    let uniq = 0;
    for (const sti in curlev) {
      const st = +sti;
      const cnt = curlev[st];
      sum += cnt;
      uniq++;
      for (let mv = 0; mv < orders.length; mv++) {
        if ((st >> mv & 1) === 0 && (st & commutes[mv] & (1 << mv) - 1) === 0) {
          const nst = st & commutes[mv] | 1 << mv;
          if (nextlev[nst] === void 0) {
            nextlev[nst] = 0;
          }
          nextlev[nst] += (orders[mv] - 1) * cnt;
        }
      }
    }
    disp("" + d + ": canonseq " + sum + " states " + uniq);
    curlev = nextlev;
  }
}

// src/puzzle-geometry/Quat.ts
const eps = 1e-9;
function expandfaces(rots, faces) {
  const nfaces = [];
  for (let i = 0; i < rots.length; i++) {
    for (let k = 0; k < faces.length; k++) {
      const face = faces[k];
      const nface = [];
      for (let j = 0; j < face.length; j++) {
        nface.push(face[j].rotateplane(rots[i]));
      }
      nfaces.push(nface);
    }
  }
  return nfaces;
}
function centermassface(face) {
  let s = new Quat(0, 0, 0, 0);
  for (let i = 0; i < face.length; i++) {
    s = s.sum(face[i]);
  }
  return s.smul(1 / face.length);
}
function solvethreeplanes(p1, p2, p3, planes) {
  const p = planes[p1].intersect3(planes[p2], planes[p3]);
  if (!p) {
    return p;
  }
  for (let i = 0; i < planes.length; i++) {
    if (i !== p1 && i !== p2 && i !== p3) {
      const dt = planes[i].b * p.b + planes[i].c * p.c + planes[i].d * p.d;
      if (planes[i].a > 0 && dt > planes[i].a || planes[i].a < 0 && dt < planes[i].a) {
        return false;
      }
    }
  }
  return p;
}
class Quat {
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
  mul(q) {
    return new Quat(this.a * q.a - this.b * q.b - this.c * q.c - this.d * q.d, this.a * q.b + this.b * q.a + this.c * q.d - this.d * q.c, this.a * q.c - this.b * q.d + this.c * q.a + this.d * q.b, this.a * q.d + this.b * q.c - this.c * q.b + this.d * q.a);
  }
  toString() {
    return "Q[" + this.a + "," + this.b + "," + this.c + "," + this.d + "]";
  }
  dist(q) {
    return Math.hypot(this.a - q.a, this.b - q.b, this.c - q.c, this.d - q.d);
  }
  len() {
    return Math.hypot(this.a, this.b, this.c, this.d);
  }
  cross(q) {
    return new Quat(0, this.c * q.d - this.d * q.c, this.d * q.b - this.b * q.d, this.b * q.c - this.c * q.b);
  }
  dot(q) {
    return this.b * q.b + this.c * q.c + this.d * q.d;
  }
  normalize() {
    const d = Math.sqrt(this.dot(this));
    return new Quat(this.a / d, this.b / d, this.c / d, this.d / d);
  }
  makenormal() {
    return new Quat(0, this.b, this.c, this.d).normalize();
  }
  normalizeplane() {
    const d = Math.hypot(this.b, this.c, this.d);
    return new Quat(this.a / d, this.b / d, this.c / d, this.d / d);
  }
  smul(m) {
    return new Quat(this.a * m, this.b * m, this.c * m, this.d * m);
  }
  sum(q) {
    return new Quat(this.a + q.a, this.b + q.b, this.c + q.c, this.d + q.d);
  }
  sub(q) {
    return new Quat(this.a - q.a, this.b - q.b, this.c - q.c, this.d - q.d);
  }
  angle() {
    return 2 * Math.acos(this.a);
  }
  invrot() {
    return new Quat(this.a, -this.b, -this.c, -this.d);
  }
  det3x3(a00, a01, a02, a10, a11, a12, a20, a21, a22) {
    return a00 * (a11 * a22 - a12 * a21) + a01 * (a12 * a20 - a10 * a22) + a02 * (a10 * a21 - a11 * a20);
  }
  rotateplane(q) {
    const t = q.mul(new Quat(0, this.b, this.c, this.d)).mul(q.invrot());
    t.a = this.a;
    return t;
  }
  orthogonal() {
    const ab = Math.abs(this.b);
    const ac = Math.abs(this.c);
    const ad = Math.abs(this.d);
    if (ab < ac && ab < ad) {
      return this.cross(new Quat(0, 1, 0, 0)).normalize();
    } else if (ac < ab && ac < ad) {
      return this.cross(new Quat(0, 0, 1, 0)).normalize();
    } else {
      return this.cross(new Quat(0, 0, 0, 1)).normalize();
    }
  }
  pointrotation(b) {
    const a = this.normalize();
    b = b.normalize();
    if (a.sub(b).len() < eps) {
      return new Quat(1, 0, 0, 0);
    }
    let h = a.sum(b);
    if (h.len() < eps) {
      h = h.orthogonal();
    } else {
      h = h.normalize();
    }
    const r = a.cross(h);
    r.a = a.dot(h);
    return r;
  }
  unproject(b) {
    return this.sum(b.smul(-this.dot(b) / (this.len() * b.len())));
  }
  rotatepoint(q) {
    return q.mul(this).mul(q.invrot());
  }
  rotateface(face) {
    return face.map((_) => _.rotatepoint(this));
  }
  rotatecubie(cubie) {
    return cubie.map((_) => this.rotateface(_));
  }
  intersect3(p2, p3) {
    const det = this.det3x3(this.b, this.c, this.d, p2.b, p2.c, p2.d, p3.b, p3.c, p3.d);
    if (Math.abs(det) < eps) {
      return false;
    }
    return new Quat(0, this.det3x3(this.a, this.c, this.d, p2.a, p2.c, p2.d, p3.a, p3.c, p3.d) / det, this.det3x3(this.b, this.a, this.d, p2.b, p2.a, p2.d, p3.b, p3.a, p3.d) / det, this.det3x3(this.b, this.c, this.a, p2.b, p2.c, p2.a, p3.b, p3.c, p3.a) / det);
  }
  side(x) {
    if (x > eps) {
      return 1;
    }
    if (x < -eps) {
      return -1;
    }
    return 0;
  }
  cutfaces(faces) {
    const d = this.a;
    const nfaces = [];
    for (let j = 0; j < faces.length; j++) {
      const face = faces[j];
      const inout = face.map((_) => this.side(_.dot(this) - d));
      let seen = 0;
      for (let i = 0; i < inout.length; i++) {
        seen |= 1 << inout[i] + 1;
      }
      if ((seen & 5) === 5) {
        for (let s = -1; s <= 1; s += 2) {
          const nface = [];
          for (let k = 0; k < face.length; k++) {
            if (inout[k] === s || inout[k] === 0) {
              nface.push(face[k]);
            }
            const kk = (k + 1) % face.length;
            if (inout[k] + inout[kk] === 0 && inout[k] !== 0) {
              const vk = face[k].dot(this) - d;
              const vkk = face[kk].dot(this) - d;
              const r = vk / (vk - vkk);
              const pt = face[k].smul(1 - r).sum(face[kk].smul(r));
              nface.push(pt);
            }
          }
          nfaces.push(nface);
        }
      } else {
        nfaces.push(face);
      }
    }
    return nfaces;
  }
  faceside(face) {
    const d = this.a;
    for (let i = 0; i < face.length; i++) {
      const s = this.side(face[i].dot(this) - d);
      if (s !== 0) {
        return s;
      }
    }
    throw new Error("Could not determine side of plane in faceside");
  }
  sameplane(p) {
    const a = this.normalize();
    const b = p.normalize();
    return a.dist(b) < eps || a.dist(b.smul(-1)) < eps;
  }
  makecut(r) {
    return new Quat(r, this.b, this.c, this.d);
  }
}

// src/puzzle-geometry/PlatonicGenerator.ts
const eps2 = 1e-9;
function cube() {
  const s5 = Math.sqrt(0.5);
  return [new Quat(s5, s5, 0, 0), new Quat(s5, 0, s5, 0)];
}
function tetrahedron() {
  return [new Quat(0.5, 0.5, 0.5, 0.5), new Quat(0.5, 0.5, 0.5, -0.5)];
}
function dodecahedron() {
  const d36 = 2 * Math.PI / 10;
  let dx = 0.5 + 0.3 * Math.sqrt(5);
  let dy = 0.5 + 0.1 * Math.sqrt(5);
  const dd = Math.sqrt(dx * dx + dy * dy);
  dx /= dd;
  dy /= dd;
  return [
    new Quat(Math.cos(d36), dx * Math.sin(d36), dy * Math.sin(d36), 0),
    new Quat(0.5, 0.5, 0.5, 0.5)
  ];
}
function icosahedron() {
  let dx = 1 / 6 + Math.sqrt(5) / 6;
  let dy = 2 / 3 + Math.sqrt(5) / 3;
  const dd = Math.sqrt(dx * dx + dy * dy);
  dx /= dd;
  dy /= dd;
  const ang = 2 * Math.PI / 6;
  return [
    new Quat(Math.cos(ang), dx * Math.sin(ang), dy * Math.sin(ang), 0),
    new Quat(Math.cos(ang), -dx * Math.sin(ang), dy * Math.sin(ang), 0)
  ];
}
function octahedron() {
  const s5 = Math.sqrt(0.5);
  return [new Quat(0.5, 0.5, 0.5, 0.5), new Quat(s5, 0, 0, s5)];
}
function closure(g) {
  const q = [new Quat(1, 0, 0, 0)];
  for (let i = 0; i < q.length; i++) {
    for (let j = 0; j < g.length; j++) {
      const ns = g[j].mul(q[i]);
      const negns = ns.smul(-1);
      let wasseen = false;
      for (let k = 0; k < q.length; k++) {
        if (ns.dist(q[k]) < eps2 || negns.dist(q[k]) < eps2) {
          wasseen = true;
          break;
        }
      }
      if (!wasseen) {
        q.push(ns);
      }
    }
  }
  return q;
}
function uniqueplanes(p, g) {
  const planes = [];
  const planerot = [];
  for (let i = 0; i < g.length; i++) {
    const p2 = p.rotateplane(g[i]);
    let wasseen = false;
    for (let j = 0; j < planes.length; j++) {
      if (p2.dist(planes[j]) < eps2) {
        wasseen = true;
        break;
      }
    }
    if (!wasseen) {
      planes.push(p2);
      planerot.push(g[i]);
    }
  }
  return planerot;
}
function getface(planes) {
  const face = [];
  for (let i = 1; i < planes.length; i++) {
    for (let j = i + 1; j < planes.length; j++) {
      const p = solvethreeplanes(0, i, j, planes);
      if (p) {
        let wasseen = false;
        for (let k = 0; k < face.length; k++) {
          if (p.dist(face[k]) < eps2) {
            wasseen = true;
            break;
          }
        }
        if (!wasseen) {
          face.push(p);
        }
      }
    }
  }
  for (; ; ) {
    let changed = false;
    for (let i = 0; i < face.length; i++) {
      const j = (i + 1) % face.length;
      if (planes[0].dot(face[i].cross(face[j])) < 0) {
        const t = face[i];
        face[i] = face[j];
        face[j] = t;
        changed = true;
      }
    }
    if (!changed) {
      break;
    }
  }
  return face;
}

// src/puzzle-geometry/Puzzles.ts
const Puzzles = {
  "2x2x2": "c f 0",
  "3x3x3": "c f 0.333333333333333",
  "4x4x4": "c f 0.5 f 0",
  "5x5x5": "c f 0.6 f 0.2",
  "6x6x6": "c f 0.666666666666667 f 0.333333333333333 f 0",
  "7x7x7": "c f 0.714285714285714 f 0.428571428571429 f 0.142857142857143",
  "8x8x8": "c f 0.75 f 0.5 f 0.25 f 0",
  "9x9x9": "c f 0.777777777777778 f 0.555555555555556 f 0.333333333333333 f 0.111111111111111",
  "10x10x10": "c f 0.8 f 0.6 f 0.4 f 0.2 f 0",
  "11x11x11": "c f 0.818181818181818 f 0.636363636363636 f 0.454545454545455 f 0.272727272727273 f 0.0909090909090909",
  "12x12x12": "c f 0.833333333333333 f 0.666666666666667 f 0.5 f 0.333333333333333 f 0.166666666666667 f 0",
  "13x13x13": "c f 0.846153846153846 f 0.692307692307692 f 0.538461538461538 f 0.384615384615385 f 0.230769230769231 f 0.0769230769230769",
  "20x20x20": "c f 0 f .1 f .2 f .3 f .4 f .5 f .6 f .7 f .8 f .9",
  "30x30x30": "c f 0 f .066667 f .133333 f .2 f .266667 f .333333 f .4 f .466667 f .533333 f .6 f .666667 f .733333 f .8 f .866667 f .933333",
  skewb: "c v 0",
  "master skewb": "c v 0.275",
  "professor skewb": "c v 0 v 0.38",
  "compy cube": "c v 0.915641442663986",
  helicopter: "c e 0.707106781186547",
  "curvy copter": "c e 0.83",
  dino: "c v 0.577350269189626",
  "little chop": "c e 0",
  pyramorphix: "t e 0",
  mastermorphix: "t e 0.346184634065199",
  pyraminx: "t v 0.333333333333333 v 1.66666666666667",
  "master pyraminx": "t v 0 v 1 v 2",
  "professor pyraminx": "t v -0.2 v 0.6 v 1.4 v 2.2",
  "Jing pyraminx": "t f 0",
  "master pyramorphix": "t e 0.866025403784437",
  megaminx: "d f 0.7",
  gigaminx: "d f 0.64 f 0.82",
  pentultimate: "d f 0",
  starminx: "d v 0.937962370425399",
  "starminx 2": "d f 0.23606797749979",
  "pyraminx crystal": "d f 0.447213595499989",
  chopasaurus: "d v 0",
  "big chop": "d e 0",
  "skewb diamond": "o f 0",
  FTO: "o f 0.333333333333333",
  "Christopher's jewel": "o v 0.577350269189626",
  octastar: "o e 0",
  "Trajber's octahedron": "o v 0.433012701892219",
  "radio chop": "i f 0",
  icosamate: "i v 0",
  "icosahedron 2": "i v 0.18759247376021",
  "icosahedron 3": "i v 0.18759247376021 e 0",
  "icosahedron static faces": "i v 0.84",
  "icosahedron moving faces": "i v 0.73",
  "Eitan's star": "i f 0.61803398874989",
  "2x2x2 + dino": "c f 0 v 0.577350269189626",
  "2x2x2 + little chop": "c f 0 e 0",
  "dino + little chop": "c v 0.577350269189626 e 0",
  "2x2x2 + dino + little chop": "c f 0 v 0.577350269189626 e 0",
  "megaminx + chopasaurus": "d f 0.61803398875 v 0",
  "starminx combo": "d f 0.23606797749979 v 0.937962370425399"
};

// src/puzzle-geometry/interfaces.ts
class BlockMove {
  constructor(outerLayer, innerLayer, family, amount = 1) {
    this.family = family;
    this.amount = amount;
    this.type = "blockMove";
    if (innerLayer) {
      this.innerLayer = innerLayer;
      if (outerLayer) {
        this.outerLayer = outerLayer;
      }
    }
    if (outerLayer && !innerLayer) {
      throw new Error("Attempted to contruct block move with outer layer but no inner layer");
    }
  }
}

// src/puzzle-geometry/NotationMapper.ts
class NullMapper {
  notationToInternal(mv) {
    return mv;
  }
  notationToExternal(mv) {
    return mv;
  }
}
class NxNxNCubeMapper {
  constructor(slices) {
    this.slices = slices;
  }
  notationToInternal(mv) {
    const grip = mv.family;
    if (!mv.innerLayer && !mv.outerLayer) {
      if (grip === "x") {
        mv = new BlockMove(void 0, void 0, "Rv", mv.amount);
      } else if (grip === "y") {
        mv = new BlockMove(void 0, void 0, "Uv", mv.amount);
      } else if (grip === "z") {
        mv = new BlockMove(void 0, void 0, "Fv", mv.amount);
      }
      if ((this.slices & 1) === 1) {
        if (grip === "E") {
          mv = new BlockMove(void 0, (this.slices + 1) / 2, "D", mv.amount);
        } else if (grip === "M") {
          mv = new BlockMove(void 0, (this.slices + 1) / 2, "L", mv.amount);
        } else if (grip === "S") {
          mv = new BlockMove(void 0, (this.slices + 1) / 2, "F", mv.amount);
        }
      }
      if (this.slices > 2) {
        if (grip === "e") {
          mv = new BlockMove(2, this.slices - 1, "D", mv.amount);
        } else if (grip === "m") {
          mv = new BlockMove(2, this.slices - 1, "L", mv.amount);
        } else if (grip === "s") {
          mv = new BlockMove(2, this.slices - 1, "F", mv.amount);
        }
      }
    }
    return mv;
  }
  notationToExternal(mv) {
    const grip = mv.family;
    if (!mv.innerLayer && !mv.outerLayer) {
      if (grip === "Rv") {
        return new BlockMove(void 0, void 0, "x", mv.amount);
      } else if (grip === "Uv") {
        return new BlockMove(void 0, void 0, "y", mv.amount);
      } else if (grip === "Fv") {
        return new BlockMove(void 0, void 0, "z", mv.amount);
      } else if (grip === "Lv") {
        return this.negate("x", mv.amount);
      } else if (grip === "Dv") {
        return this.negate("y", mv.amount);
      } else if (grip === "Bv") {
        return this.negate("z", mv.amount);
      }
    }
    return mv;
  }
  negate(family, v) {
    if (v === void 0) {
      v = -1;
    } else if (v === -1) {
      v = void 0;
    } else {
      v = -v;
    }
    return new BlockMove(void 0, void 0, family, v);
  }
}
class FaceRenamingMapper {
  constructor(internalNames, externalNames) {
    this.internalNames = internalNames;
    this.externalNames = externalNames;
  }
  convertString(grip, a, b) {
    let suffix = "";
    if ((grip.endsWith("v") || grip.endsWith("v")) && grip <= "_") {
      suffix = grip.slice(grip.length - 1);
      grip = grip.slice(0, grip.length - 1);
    }
    const upper = grip.toUpperCase();
    let isLowerCase = false;
    if (grip !== upper) {
      isLowerCase = true;
      grip = upper;
    }
    grip = b.joinByFaceIndices(a.splitByFaceNames(grip));
    if (isLowerCase) {
      grip = grip.toLowerCase();
    }
    return grip + suffix;
  }
  convert(mv, a, b) {
    const grip = mv.family;
    const ngrip = this.convertString(grip, a, b);
    if (grip === ngrip) {
      return mv;
    } else {
      return new BlockMove(mv.outerLayer, mv.innerLayer, ngrip, mv.amount);
    }
  }
  notationToInternal(mv) {
    const r = this.convert(mv, this.externalNames, this.internalNames);
    return r;
  }
  notationToExternal(mv) {
    return this.convert(mv, this.internalNames, this.externalNames);
  }
}
class MegaminxScramblingNotationMapper {
  constructor(child) {
    this.child = child;
  }
  notationToInternal(mv) {
    if (mv.innerLayer === void 0 && mv.outerLayer === void 0 && Math.abs(mv.amount) === 1) {
      if (mv.family === "R++") {
        return new BlockMove(2, 3, "L", -2 * mv.amount);
      } else if (mv.family === "R--") {
        return new BlockMove(2, 3, "L", 2 * mv.amount);
      } else if (mv.family === "D++") {
        return new BlockMove(2, 3, "U", -2 * mv.amount);
      } else if (mv.family === "D--") {
        return new BlockMove(2, 3, "U", 2 * mv.amount);
      }
    }
    return this.child.notationToInternal(mv);
  }
  notationToExternal(mv) {
    return this.child.notationToExternal(mv);
  }
}

// src/puzzle-geometry/FaceNameSwizzler.ts
class FaceNameSwizzler {
  constructor(facenames, gripnames_arg) {
    this.facenames = facenames;
    this.prefixFree = true;
    this.gripnames = [];
    if (gripnames_arg) {
      this.gripnames = gripnames_arg;
    }
    for (let i = 0; this.prefixFree && i < facenames.length; i++) {
      for (let j = 0; this.prefixFree && j < facenames.length; j++) {
        if (i !== j && facenames[i].startsWith(facenames[j])) {
          this.prefixFree = false;
        }
      }
    }
  }
  setGripNames(names) {
    this.gripnames = names;
  }
  splitByFaceNames(s) {
    const r = [];
    let at = 0;
    while (at < s.length) {
      if (at > 0 && at < s.length && s[at] === "_") {
        at++;
      }
      let currentMatch = -1;
      for (let i = 0; i < this.facenames.length; i++) {
        if (s.substr(at).startsWith(this.facenames[i]) && (currentMatch < 0 || this.facenames[i].length > this.facenames[currentMatch].length)) {
          currentMatch = i;
        }
      }
      if (currentMatch >= 0) {
        r.push(currentMatch);
        at += this.facenames[currentMatch].length;
      } else {
        throw new Error("Could not split " + s + " into face names.");
      }
    }
    return r;
  }
  joinByFaceIndices(list) {
    let sep = "";
    const r = [];
    for (let i = 0; i < list.length; i++) {
      r.push(sep);
      r.push(this.facenames[list[i]]);
      if (!this.prefixFree) {
        sep = "_";
      }
    }
    return r.join("");
  }
  spinmatch(userinput, longname) {
    if (userinput === longname) {
      return true;
    }
    try {
      const e1 = this.splitByFaceNames(userinput);
      const e2 = this.splitByFaceNames(longname);
      if (e1.length !== e2.length && e1.length < 3) {
        return false;
      }
      for (let i = 0; i < e1.length; i++) {
        for (let j = 0; j < i; j++) {
          if (e1[i] === e1[j]) {
            return false;
          }
        }
        let found = false;
        for (let j = 0; j < e2.length; j++) {
          if (e1[i] === e2[j]) {
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  unswizzle(s) {
    if ((s.endsWith("v") || s.endsWith("w")) && s[0] <= "Z") {
      s = s.slice(0, s.length - 1);
    }
    const upperCaseGrip = s.toUpperCase();
    for (let i = 0; i < this.gripnames.length; i++) {
      const g = this.gripnames[i];
      if (this.spinmatch(upperCaseGrip, g)) {
        return g;
      }
    }
    return s;
  }
}

// src/puzzle-geometry/PuzzleGeometry.ts
const DEFAULT_COLOR_FRACTION = 0.77;
let NEW_FACE_NAMES = true;
function useNewFaceNames(use) {
  NEW_FACE_NAMES = use;
}
const eps3 = 1e-9;
const copyright = "PuzzleGeometry 0.1 Copyright 2018 Tomas Rokicki.";
const permissivieMoveParsing = false;
function defaultnets() {
  return {
    4: [["F", "D", "L", "R"]],
    6: [
      ["F", "D", "L", "U", "R"],
      ["R", "F", "", "B", ""]
    ],
    8: [
      ["F", "D", "L", "R"],
      ["D", "F", "BR", ""],
      ["BR", "D", "", "BB"],
      ["BB", "BR", "U", "BL"]
    ],
    12: [
      ["U", "F", "", "", "", ""],
      ["F", "U", "R", "C", "A", "L"],
      ["R", "F", "", "", "E", ""],
      ["E", "R", "", "BF", "", ""],
      ["BF", "E", "BR", "BL", "I", "D"]
    ],
    20: [
      ["R", "C", "F", "E"],
      ["F", "R", "L", "U"],
      ["L", "F", "A", ""],
      ["E", "R", "G", "I"],
      ["I", "E", "S", "H"],
      ["S", "I", "J", "B"],
      ["B", "S", "K", "D"],
      ["K", "B", "M", "O"],
      ["O", "K", "P", "N"],
      ["P", "O", "Q", ""]
    ]
  };
}
function defaultcolors() {
  return {
    4: {F: "#00ff00", D: "#ffff00", L: "#ff0000", R: "#0000ff"},
    6: {
      U: "#ffffff",
      F: "#00ff00",
      R: "#ff0000",
      D: "#ffff00",
      B: "#0000ff",
      L: "#ff8000"
    },
    8: {
      U: "#ffffff",
      F: "#ff0000",
      R: "#00bb00",
      D: "#ffff00",
      BB: "#1122ff",
      L: "#9524c5",
      BL: "#ff8800",
      BR: "#aaaaaa"
    },
    12: {
      U: "#ffffff",
      F: "#006633",
      R: "#ff0000",
      C: "#ffffd0",
      A: "#3399ff",
      L: "#660099",
      E: "#ff66cc",
      BF: "#99ff00",
      BR: "#0000ff",
      BL: "#ffff00",
      I: "#ff6633",
      D: "#999999"
    },
    20: {
      R: "#db69f0",
      C: "#178fde",
      F: "#23238b",
      E: "#9cc726",
      L: "#2c212d",
      U: "#177fa7",
      A: "#e0de7f",
      G: "#2b57c0",
      I: "#41126b",
      S: "#4b8c28",
      H: "#7c098d",
      J: "#7fe7b4",
      B: "#85fb74",
      K: "#3f4bc3",
      D: "#0ff555",
      M: "#f1c2c8",
      O: "#58d340",
      P: "#c514f2",
      N: "#14494e",
      Q: "#8b1be1"
    }
  };
}
function defaultfaceorders() {
  return {
    4: ["F", "D", "L", "R"],
    6: ["U", "D", "F", "B", "L", "R"],
    8: ["F", "BB", "D", "U", "BR", "L", "R", "BL"],
    12: ["L", "E", "F", "BF", "R", "I", "U", "D", "BR", "A", "BL", "C"],
    20: [
      "L",
      "S",
      "E",
      "O",
      "F",
      "B",
      "I",
      "P",
      "R",
      "K",
      "U",
      "D",
      "J",
      "A",
      "Q",
      "H",
      "G",
      "N",
      "M",
      "C"
    ]
  };
}
function defaultOrientations() {
  return {
    4: ["FLR", [0, 1, 0], "F", [0, 0, 1]],
    6: ["U", [0, 1, 0], "F", [0, 0, 1]],
    8: ["U", [0, 1, 0], "F", [0, 0, 1]],
    12: ["U", [0, 1, 0], "F", [0, 0, 1]],
    20: ["GUQMJ", [0, 1, 0], "F", [0, 0, 1]]
  };
}
function findelement(a, p) {
  for (let i = 0; i < a.length; i++) {
    if (a[i][0].dist(p) < eps3) {
      return i;
    }
  }
  throw new Error("Element not found");
}
function parsedesc(s) {
  const a = s.split(/ /).filter(Boolean);
  if (a.length % 2 === 0) {
    return false;
  }
  if (a[0] !== "o" && a[0] !== "c" && a[0] !== "i" && a[0] !== "d" && a[0] !== "t") {
    return false;
  }
  const r = [];
  for (let i = 1; i < a.length; i += 2) {
    if (a[i] !== "f" && a[i] !== "v" && a[i] !== "e") {
      return false;
    }
    r.push([a[i], a[i + 1]]);
  }
  return [a[0], r];
}
function getPuzzleGeometryByDesc(desc, options = []) {
  const [shape, cuts] = parsedesc(desc);
  const pg = new PuzzleGeometry(shape, cuts, ["allmoves", "true"].concat(options));
  pg.allstickers();
  pg.genperms();
  return pg;
}
function getPuzzleGeometryByName(puzzleName, options = []) {
  return getPuzzleGeometryByDesc(Puzzles[puzzleName], options);
}
function getmovename(geo, bits, slices) {
  let nbits = 0;
  let inverted = false;
  for (let i = 0; i <= slices; i++) {
    if (bits >> i & 1) {
      nbits |= 1 << slices - i;
    }
  }
  if (nbits < bits) {
    geo = [geo[2], geo[3], geo[0], geo[1]];
    bits = nbits;
    inverted = true;
  }
  let movenameFamily = geo[0];
  let movenamePrefix = "";
  let hibit = 0;
  while (bits >> 1 + hibit) {
    hibit++;
  }
  if (bits === (2 << slices) - 1) {
    movenameFamily = movenameFamily + "v";
  } else if (bits === 1 << hibit) {
    if (hibit > 0) {
      movenamePrefix = String(hibit + 1);
    }
  } else if (bits === (2 << hibit) - 1) {
    movenameFamily = movenameFamily.toLowerCase();
    if (hibit > 1) {
      movenamePrefix = String(hibit + 1);
    }
  } else {
    movenamePrefix = "_" + bits + "_";
  }
  return [movenamePrefix + movenameFamily, inverted];
}
function splitByFaceNames(s, facenames) {
  const r = [];
  let at = 0;
  while (at < s.length) {
    if (at > 0 && at < s.length && s[at] === "_") {
      at++;
    }
    let currentMatch = "";
    for (let i = 0; i < facenames.length; i++) {
      if (s.substr(at).startsWith(facenames[i][1]) && facenames[i][1].length > currentMatch.length) {
        currentMatch = facenames[i][1];
      }
    }
    if (currentMatch !== "") {
      r.push(currentMatch);
      at += currentMatch.length;
    } else {
      throw new Error("Could not split " + s + " into face names.");
    }
  }
  return r;
}
function toCoords(q, maxdist) {
  return [q.b / maxdist, -q.c / maxdist, q.d / maxdist];
}
function toFaceCoords(q, maxdist) {
  const r = [];
  const n = q.length;
  for (let i = 0; i < n; i++) {
    r[n - i - 1] = toCoords(q[i], maxdist);
  }
  return r;
}
function trimEdges(face, tr) {
  const r = [];
  for (let iter = 1; iter < 10; iter++) {
    for (let i = 0; i < face.length; i++) {
      const pi = (i + face.length - 1) % face.length;
      const ni = (i + 1) % face.length;
      const A = face[pi].sub(face[i]).normalize();
      const B = face[ni].sub(face[i]).normalize();
      const d = A.dot(B);
      const m = tr / Math.sqrt(1 - d * d);
      r[i] = face[i].sum(A.sum(B).smul(m));
    }
    let good = true;
    for (let i = 0; good && i < r.length; i++) {
      const pi = (i + face.length - 1) % face.length;
      const ni = (i + 1) % face.length;
      if (r[pi].sub(r[i]).cross(r[ni].sub(r[i])).dot(r[i]) >= 0) {
        good = false;
      }
    }
    if (good) {
      return r;
    }
    tr /= 2;
  }
  return face;
}
class PuzzleGeometry {
  constructor(shape, cuts, optionlist) {
    this.args = "";
    this.cmovesbyslice = [];
    this.verbose = 0;
    this.allmoves = false;
    this.cornersets = true;
    this.centersets = true;
    this.edgesets = true;
    this.graycorners = false;
    this.graycenters = false;
    this.grayedges = false;
    this.killorientation = false;
    this.optimize = false;
    this.scramble = 0;
    this.fixPiece = "";
    this.orientCenters = false;
    this.duplicatedFaces = [];
    this.duplicatedCubies = [];
    this.fixedCubie = -1;
    this.net = [];
    this.colors = [];
    this.faceorder = [];
    this.faceprecedence = [];
    this.notationMapper = new NullMapper();
    this.addNotationMapper = "";
    function asstructured(v) {
      if (typeof v === "string") {
        return JSON.parse(v);
      }
      return v;
    }
    function asboolean(v) {
      if (typeof v === "string") {
        if (v === "false") {
          return false;
        }
        return true;
      } else {
        return v ? true : false;
      }
    }
    if (optionlist !== void 0) {
      if (optionlist.length % 2 !== 0) {
        throw new Error("Odd length in option list?");
      }
      for (let i = 0; i < optionlist.length; i += 2) {
        if (optionlist[i] === "verbose") {
          this.verbose++;
        } else if (optionlist[i] === "quiet") {
          this.verbose = 0;
        } else if (optionlist[i] === "allmoves") {
          this.allmoves = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "outerblockmoves") {
          this.outerblockmoves = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "vertexmoves") {
          this.vertexmoves = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "rotations") {
          this.addrotations = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "cornersets") {
          this.cornersets = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "centersets") {
          this.centersets = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "edgesets") {
          this.edgesets = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "graycorners") {
          this.graycorners = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "graycenters") {
          this.graycenters = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "grayedges") {
          this.grayedges = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "movelist") {
          this.movelist = asstructured(optionlist[i + 1]);
        } else if (optionlist[i] === "killorientation") {
          this.killorientation = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "optimize") {
          this.optimize = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "scramble") {
          this.scramble = optionlist[i + 1];
        } else if (optionlist[i] === "fix") {
          this.fixPiece = optionlist[i + 1];
        } else if (optionlist[i] === "orientcenters") {
          this.orientCenters = asboolean(optionlist[i + 1]);
        } else if (optionlist[i] === "puzzleorientation") {
          this.puzzleOrientation = asstructured(optionlist[i + 1]);
        } else if (optionlist[i] === "puzzleorientations") {
          this.puzzleOrientations = asstructured(optionlist[i + 1]);
        } else {
          throw new Error("Bad option while processing option list " + optionlist[i]);
        }
      }
    }
    this.args = shape + " " + cuts.map((_) => _.join(" ")).join(" ");
    if (optionlist) {
      this.args += " " + optionlist.join(" ");
    }
    if (this.verbose > 0) {
      console.log(this.header("# "));
    }
    this.create(shape, cuts);
  }
  create(shape, cuts) {
    this.moveplanes = [];
    this.moveplanes2 = [];
    this.faces = [];
    this.cubies = [];
    let g = null;
    switch (shape) {
      case "c":
        g = cube();
        break;
      case "o":
        g = octahedron();
        break;
      case "i":
        g = icosahedron();
        break;
      case "t":
        g = tetrahedron();
        break;
      case "d":
        g = dodecahedron();
        break;
      default:
        throw new Error("Bad shape argument: " + shape);
    }
    this.rotations = closure(g);
    if (this.verbose) {
      console.log("# Rotations: " + this.rotations.length);
    }
    const baseplane = g[0];
    this.baseplanerot = uniqueplanes(baseplane, this.rotations);
    const baseplanes = this.baseplanerot.map((_) => baseplane.rotateplane(_));
    this.baseplanes = baseplanes;
    this.basefacecount = baseplanes.length;
    const net = defaultnets()[baseplanes.length];
    this.net = net;
    this.colors = defaultcolors()[baseplanes.length];
    this.faceorder = defaultfaceorders()[baseplanes.length];
    if (this.verbose) {
      console.log("# Base planes: " + baseplanes.length);
    }
    const baseface = getface(baseplanes);
    const zero = new Quat(0, 0, 0, 0);
    if (this.verbose) {
      console.log("# Face vertices: " + baseface.length);
    }
    const facenormal = baseplanes[0].makenormal();
    const edgenormal = baseface[0].sum(baseface[1]).makenormal();
    const vertexnormal = baseface[0].makenormal();
    const boundary = new Quat(1, facenormal.b, facenormal.c, facenormal.d);
    if (this.verbose) {
      console.log("# Boundary is " + boundary);
    }
    const planerot = uniqueplanes(boundary, this.rotations);
    const planes = planerot.map((_) => boundary.rotateplane(_));
    let faces = [getface(planes)];
    this.edgedistance = faces[0][0].sum(faces[0][1]).smul(0.5).dist(zero);
    this.vertexdistance = faces[0][0].dist(zero);
    const cutplanes = [];
    const intersects = [];
    let sawface = false;
    let sawedge = false;
    let sawvertex = false;
    for (let i = 0; i < cuts.length; i++) {
      let normal = null;
      let distance = 0;
      switch (cuts[i][0]) {
        case "f":
          normal = facenormal;
          distance = 1;
          sawface = true;
          break;
        case "v":
          normal = vertexnormal;
          distance = this.vertexdistance;
          sawvertex = true;
          break;
        case "e":
          normal = edgenormal;
          distance = this.edgedistance;
          sawedge = true;
          break;
        default:
          throw new Error("Bad cut argument: " + cuts[i][0]);
      }
      cutplanes.push(normal.makecut(cuts[i][1]));
      intersects.push(cuts[i][1] < distance);
    }
    if (this.addrotations) {
      if (!sawface) {
        cutplanes.push(facenormal.makecut(10));
      }
      if (!sawvertex) {
        cutplanes.push(vertexnormal.makecut(10));
      }
      if (!sawedge) {
        cutplanes.push(edgenormal.makecut(10));
      }
    }
    this.basefaces = [];
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
      this.basefaces.push(face);
    }
    const facenames = [];
    const faceplanes = [];
    const vertexnames = [];
    const edgenames = [];
    const edgesperface = faces[0].length;
    function searchaddelement(a, p, name) {
      for (let i = 0; i < a.length; i++) {
        if (a[i][0].dist(p) < eps3) {
          a[i].push(name);
          return;
        }
      }
      a.push([p, name]);
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
      for (let j = 0; j < face.length; j++) {
        const jj = (j + 1) % face.length;
        const midpoint = face[j].sum(face[jj]).smul(0.5);
        searchaddelement(edgenames, midpoint, i);
      }
    }
    const otherfaces = [];
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
      const facelist = [];
      for (let j = 0; j < face.length; j++) {
        const jj = (j + 1) % face.length;
        const midpoint = face[j].sum(face[jj]).smul(0.5);
        const el = edgenames[findelement(edgenames, midpoint)];
        if (i === el[1]) {
          facelist.push(el[2]);
        } else if (i === el[2]) {
          facelist.push(el[1]);
        } else {
          throw new Error("Could not find edge");
        }
      }
      otherfaces.push(facelist);
    }
    const facenametoindex = {};
    const faceindextoname = [];
    faceindextoname.push(net[0][0]);
    facenametoindex[net[0][0]] = 0;
    faceindextoname[otherfaces[0][0]] = net[0][1];
    facenametoindex[net[0][1]] = otherfaces[0][0];
    for (let i = 0; i < net.length; i++) {
      const f0 = net[i][0];
      const fi = facenametoindex[f0];
      if (fi === void 0) {
        throw new Error("Bad edge description; first edge not connected");
      }
      let ii = -1;
      for (let j = 0; j < otherfaces[fi].length; j++) {
        const fn2 = faceindextoname[otherfaces[fi][j]];
        if (fn2 !== void 0 && fn2 === net[i][1]) {
          ii = j;
          break;
        }
      }
      if (ii < 0) {
        throw new Error("First element of a net not known");
      }
      for (let j = 2; j < net[i].length; j++) {
        if (net[i][j] === "") {
          continue;
        }
        const of = otherfaces[fi][(j + ii - 1) % edgesperface];
        const fn2 = faceindextoname[of];
        if (fn2 !== void 0 && fn2 !== net[i][j]) {
          throw new Error("Face mismatch in net");
        }
        faceindextoname[of] = net[i][j];
        facenametoindex[net[i][j]] = of;
      }
    }
    for (let i = 0; i < faceindextoname.length; i++) {
      let found = false;
      for (let j = 0; j < this.faceorder.length; j++) {
        if (faceindextoname[i] === this.faceorder[j]) {
          this.faceprecedence[i] = j;
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error("Could not find face " + faceindextoname[i] + " in face order list " + this.faceorder);
      }
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
      const faceplane = boundary.rotateplane(this.baseplanerot[i]);
      const facename = faceindextoname[i];
      facenames.push([face, facename]);
      faceplanes.push([faceplane, facename]);
    }
    for (let i = 0; i < this.baseplanerot.length; i++) {
      const face = this.baseplanerot[i].rotateface(faces[0]);
      const facename = faceindextoname[i];
      for (let j = 0; j < face.length; j++) {
        const jj = (j + 1) % face.length;
        const midpoint = face[j].sum(face[jj]).smul(0.5);
        const jjj = (j + 2) % face.length;
        const midpoint2 = face[jj].sum(face[jjj]).smul(0.5);
        const e1 = findelement(edgenames, midpoint);
        const e2 = findelement(edgenames, midpoint2);
        searchaddelement(vertexnames, face[jj], [facename, e2, e1]);
      }
    }
    this.swizzler = new FaceNameSwizzler(facenames.map((_) => _[1]));
    const sep = this.swizzler.prefixFree ? "" : "_";
    for (let i = 0; i < edgenames.length; i++) {
      if (edgenames[i].length !== 3) {
        throw new Error("Bad length in edge names " + edgenames[i]);
      }
      let c1 = faceindextoname[edgenames[i][1]];
      const c2 = faceindextoname[edgenames[i][2]];
      if (this.faceprecedence[edgenames[i][1]] < this.faceprecedence[edgenames[i][2]]) {
        c1 = c1 + sep + c2;
      } else {
        c1 = c2 + sep + c1;
      }
      edgenames[i] = [edgenames[i][0], c1];
    }
    this.cornerfaces = vertexnames[0].length - 1;
    for (let i = 0; i < vertexnames.length; i++) {
      if (vertexnames[i].length < 4) {
        throw new Error("Bad length in vertex names");
      }
      let st = 1;
      for (let j = 2; j < vertexnames[i].length; j++) {
        if (this.faceprecedence[facenametoindex[vertexnames[i][j][0]]] < this.faceprecedence[facenametoindex[vertexnames[i][st][0]]]) {
          st = j;
        }
      }
      let r = "";
      for (let j = 1; j < vertexnames[i].length; j++) {
        if (j === 1) {
          r = vertexnames[i][st][0];
        } else {
          r = r + sep + vertexnames[i][st][0];
        }
        for (let k = 1; k < vertexnames[i].length; k++) {
          if (vertexnames[i][st][2] === vertexnames[i][k][1]) {
            st = k;
            break;
          }
        }
      }
      vertexnames[i] = [vertexnames[i][0], r];
    }
    if (this.verbose > 1) {
      console.log("Face precedence list: " + this.faceorder.join(" "));
      console.log("Face names: " + facenames.map((_) => _[1]).join(" "));
      console.log("Edge names: " + edgenames.map((_) => _[1]).join(" "));
      console.log("Vertex names: " + vertexnames.map((_) => _[1]).join(" "));
    }
    const geonormals = [];
    for (let i = 0; i < faceplanes.length; i++) {
      geonormals.push([faceplanes[i][0].makenormal(), faceplanes[i][1], "f"]);
    }
    for (let i = 0; i < edgenames.length; i++) {
      geonormals.push([edgenames[i][0].makenormal(), edgenames[i][1], "e"]);
    }
    for (let i = 0; i < vertexnames.length; i++) {
      geonormals.push([vertexnames[i][0].makenormal(), vertexnames[i][1], "v"]);
    }
    this.facenames = facenames;
    this.faceplanes = faceplanes;
    this.edgenames = edgenames;
    this.vertexnames = vertexnames;
    this.geonormals = geonormals;
    const geonormalnames = geonormals.map((_) => _[1]);
    this.swizzler.setGripNames(geonormalnames);
    if (this.verbose) {
      console.log("# Distances: face " + 1 + " edge " + this.edgedistance + " vertex " + this.vertexdistance);
    }
    for (let c = 0; c < cutplanes.length; c++) {
      for (let i = 0; i < this.rotations.length; i++) {
        const q = cutplanes[c].rotateplane(this.rotations[i]);
        let wasseen = false;
        for (let j = 0; j < this.moveplanes.length; j++) {
          if (q.sameplane(this.moveplanes[j])) {
            wasseen = true;
            break;
          }
        }
        if (!wasseen) {
          this.moveplanes.push(q);
          faces = q.cutfaces(faces);
          if (intersects[c]) {
            this.moveplanes2.push(q);
          }
        }
      }
    }
    this.faces = faces;
    if (this.verbose) {
      console.log("# Faces is now " + faces.length);
    }
    this.stickersperface = faces.length;
    let shortedge = 1e99;
    for (let i = 0; i < faces.length; i++) {
      for (let j = 0; j < faces[i].length; j++) {
        const k = (j + 1) % faces[i].length;
        const t = faces[i][j].dist(faces[i][k]);
        if (t < shortedge) {
          shortedge = t;
        }
      }
    }
    this.shortedge = shortedge;
    if (this.verbose) {
      console.log("# Short edge is " + shortedge);
    }
    if (shape === "c" && sawface) {
      this.addNotationMapper = "NxNxNCubeMapper";
    }
    if (shape === "o" && sawface && NEW_FACE_NAMES) {
      this.notationMapper = new FaceRenamingMapper(this.swizzler, new FaceNameSwizzler(["F", "D", "L", "BL", "R", "U", "BR", "B"]));
    }
    if (shape === "d" && sawface && NEW_FACE_NAMES) {
      this.addNotationMapper = "Megaminx";
      this.notationMapper = new FaceRenamingMapper(this.swizzler, new FaceNameSwizzler([
        "U",
        "F",
        "L",
        "BL",
        "BR",
        "R",
        "FR",
        "FL",
        "DL",
        "B",
        "DR",
        "D"
      ]));
    }
  }
  keyface(face) {
    let s = "";
    for (let i = 0; i < this.moveplanesets.length; i++) {
      let t = 0;
      for (let j = 0; j < this.moveplanesets[i].length; j++) {
        if (this.moveplanesets[i][j].faceside(face) > 0) {
          t++;
        }
      }
      s = s + " " + t;
    }
    return s;
  }
  findcubie(face) {
    return this.facetocubies[this.findface(face)][0];
  }
  findface(face) {
    const cm = centermassface(face);
    const key = this.keyface(face);
    for (let i = 0; i < this.facelisthash[key].length; i++) {
      const face2 = this.facelisthash[key][i];
      if (Math.abs(cm.dist(centermassface(this.faces[face2]))) < eps3) {
        return face2;
      }
    }
    throw new Error("Could not find face.");
  }
  project2d(facen, edgen, targvec) {
    const face = this.facenames[facen][0];
    const edgen2 = (edgen + 1) % face.length;
    const plane = this.baseplanes[facen];
    let x0 = face[edgen2].sub(face[edgen]);
    const olen = x0.len();
    x0 = x0.normalize();
    const y0 = x0.cross(plane).normalize();
    let delta = targvec[1].sub(targvec[0]);
    const len = delta.len() / olen;
    delta = delta.normalize();
    const cosr = delta.b;
    const sinr = delta.c;
    const x1 = x0.smul(cosr).sub(y0.smul(sinr)).smul(len);
    const y1 = y0.smul(cosr).sum(x0.smul(sinr)).smul(len);
    const off = new Quat(0, targvec[0].b - x1.dot(face[edgen]), targvec[0].c - y1.dot(face[edgen]), 0);
    return [x1, y1, off];
  }
  allstickers() {
    this.faces = expandfaces(this.baseplanerot, this.faces);
    if (this.verbose) {
      console.log("# Total stickers is now " + this.faces.length);
    }
    const moveplanesets = [];
    const moveplanenormals = [];
    for (let i = 0; i < this.moveplanes.length; i++) {
      const q = this.moveplanes[i];
      const qnormal = q.makenormal();
      let wasseen = false;
      for (let j = 0; j < moveplanenormals.length; j++) {
        if (qnormal.sameplane(moveplanenormals[j].makenormal())) {
          wasseen = true;
        }
      }
      if (!wasseen) {
        moveplanenormals.push(qnormal);
        moveplanesets.push([]);
      }
    }
    for (let i = 0; i < this.moveplanes2.length; i++) {
      const q = this.moveplanes2[i];
      const qnormal = q.makenormal();
      for (let j = 0; j < moveplanenormals.length; j++) {
        if (qnormal.sameplane(moveplanenormals[j])) {
          moveplanesets[j].push(q);
          break;
        }
      }
    }
    for (let i = 0; i < moveplanesets.length; i++) {
      const q = moveplanesets[i].map((_) => _.normalizeplane());
      const goodnormal = moveplanenormals[i];
      for (let j = 0; j < q.length; j++) {
        if (q[j].makenormal().dist(goodnormal) > eps3) {
          q[j] = q[j].smul(-1);
        }
      }
      q.sort((a, b) => a.a - b.a);
      moveplanesets[i] = q;
    }
    this.moveplanesets = moveplanesets;
    this.moveplanenormals = moveplanenormals;
    const sizes = moveplanesets.map((_) => _.length);
    if (this.verbose) {
      console.log("# Move plane sets: " + sizes);
    }
    const moverotations = [];
    for (let i = 0; i < moveplanesets.length; i++) {
      moverotations.push([]);
    }
    for (let i = 0; i < this.rotations.length; i++) {
      const q = this.rotations[i];
      if (Math.abs(Math.abs(q.a) - 1) < eps3) {
        continue;
      }
      const qnormal = q.makenormal();
      for (let j = 0; j < moveplanesets.length; j++) {
        if (qnormal.sameplane(moveplanenormals[j])) {
          moverotations[j].push(q);
          break;
        }
      }
    }
    this.moverotations = moverotations;
    for (let i = 0; i < moverotations.length; i++) {
      const r = moverotations[i];
      const goodnormal = r[0].makenormal();
      for (let j = 0; j < r.length; j++) {
        if (goodnormal.dist(r[j].makenormal()) > eps3) {
          r[j] = r[j].smul(-1);
        }
      }
      r.sort((a, b) => a.angle() - b.angle());
      if (moverotations[i][0].dot(moveplanenormals[i]) < 0) {
        r.reverse();
      }
    }
    const sizes2 = moverotations.map((_) => 1 + _.length);
    this.movesetorders = sizes2;
    const movesetgeos = [];
    let gtype = "?";
    for (let i = 0; i < moveplanesets.length; i++) {
      const p0 = moveplanenormals[i];
      let neg = null;
      let pos = null;
      for (let j = 0; j < this.geonormals.length; j++) {
        const d = p0.dot(this.geonormals[j][0]);
        if (Math.abs(d - 1) < eps3) {
          pos = [this.geonormals[j][1], this.geonormals[j][2]];
          gtype = this.geonormals[j][2];
        } else if (Math.abs(d + 1) < eps3) {
          neg = [this.geonormals[j][1], this.geonormals[j][2]];
          gtype = this.geonormals[j][2];
        }
      }
      if (pos === null || neg === null) {
        throw new Error("Saw positive or negative sides as null");
      }
      movesetgeos.push([
        pos[0],
        pos[1],
        neg[0],
        neg[1],
        1 + moveplanesets[i].length
      ]);
      if (this.addNotationMapper === "NxNxNCubeMapper" && gtype === "f") {
        this.notationMapper = new NxNxNCubeMapper(1 + moveplanesets[i].length);
        this.addNotationMapper = "";
      }
      if (this.addNotationMapper === "Megaminx" && gtype === "f") {
        if (1 + moveplanesets[i].length === 3) {
          this.notationMapper = new MegaminxScramblingNotationMapper(this.notationMapper);
        }
        this.addNotationMapper = "";
      }
    }
    this.movesetgeos = movesetgeos;
    const cubiehash = {};
    const facelisthash = {};
    const cubiekey = {};
    const cubiekeys = [];
    const cubies = [];
    const faces = this.faces;
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const s = this.keyface(face);
      if (!cubiehash[s]) {
        cubiekey[s] = cubies.length;
        cubiekeys.push(s);
        cubiehash[s] = [];
        facelisthash[s] = [];
        cubies.push(cubiehash[s]);
      }
      facelisthash[s].push(i);
      cubiehash[s].push(face);
      if (facelisthash[s].length === this.basefacecount) {
        if (this.verbose) {
          console.log("# Splitting core.");
        }
        for (let suff = 0; suff < this.basefacecount; suff++) {
          const s2 = s + " " + suff;
          facelisthash[s2] = [facelisthash[s][suff]];
          cubiehash[s2] = [cubiehash[s][suff]];
          cubiekeys.push(s2);
          cubiekey[s2] = cubies.length;
          cubies.push(cubiehash[s2]);
        }
        cubiehash[s] = [];
        cubies[cubiekey[s]] = [];
      }
    }
    this.cubiekey = cubiekey;
    this.facelisthash = facelisthash;
    this.cubiekeys = cubiekeys;
    if (this.verbose) {
      console.log("# Cubies: " + Object.keys(cubiehash).length);
    }
    this.cubies = cubies;
    for (let k = 0; k < cubies.length; k++) {
      const cubie = cubies[k];
      if (cubie.length < 2) {
        continue;
      }
      if (cubie.length === this.basefacecount) {
        continue;
      }
      if (cubie.length > 5) {
        throw new Error("Bad math; too many faces on this cubie " + cubie.length);
      }
      const s = this.keyface(cubie[0]);
      const facelist = facelisthash[s];
      const cm = cubie.map((_) => centermassface(_));
      const cmall = centermassface(cm);
      for (let looplimit = 0; cubie.length > 2; looplimit++) {
        let changed = false;
        for (let i = 0; i < cubie.length; i++) {
          const j = (i + 1) % cubie.length;
          if (cmall.dot(cm[i].cross(cm[j])) < 0) {
            const t = cubie[i];
            cubie[i] = cubie[j];
            cubie[j] = t;
            const u = cm[i];
            cm[i] = cm[j];
            cm[j] = u;
            const v = facelist[i];
            facelist[i] = facelist[j];
            facelist[j] = v;
            changed = true;
          }
        }
        if (!changed) {
          break;
        }
        if (looplimit > 1e3) {
          throw new Error("Bad epsilon math; too close to border");
        }
      }
      let mini = 0;
      let minf = this.findface(cubie[mini]);
      for (let i = 1; i < cubie.length; i++) {
        const temp = this.findface(cubie[i]);
        if (this.faceprecedence[this.getfaceindex(temp)] < this.faceprecedence[this.getfaceindex(minf)]) {
          mini = i;
          minf = temp;
        }
      }
      if (mini !== 0) {
        const ocubie = cubie.slice();
        const ofacelist = facelist.slice();
        for (let i = 0; i < cubie.length; i++) {
          cubie[i] = ocubie[(mini + i) % cubie.length];
          facelist[i] = ofacelist[(mini + i) % cubie.length];
        }
      }
    }
    const facetocubies = [];
    for (let i = 0; i < cubies.length; i++) {
      const facelist = facelisthash[cubiekeys[i]];
      for (let j = 0; j < facelist.length; j++) {
        facetocubies[facelist[j]] = [i, j];
      }
    }
    this.facetocubies = facetocubies;
    const typenames = ["?", "CENTERS", "EDGES", "CORNERS", "C4RNER", "C5RNER"];
    const cubiesetnames = [];
    const cubietypecounts = [0, 0, 0, 0, 0, 0];
    const orbitoris = [];
    const seen = [];
    let cubiesetnum = 0;
    const cubiesetnums = [];
    const cubieordnums = [];
    const cubieords = [];
    const cubievaluemap = [];
    const getcolorkey = (cubienum) => {
      return cubies[cubienum].map((_) => this.getfaceindex(this.findface(_))).join(" ");
    };
    const cubiesetcubies = [];
    for (let i = 0; i < cubies.length; i++) {
      if (seen[i]) {
        continue;
      }
      const cubie = cubies[i];
      if (cubie.length === 0) {
        continue;
      }
      const cubiekeymap = {};
      let cubievalueid = 0;
      cubieords.push(0);
      cubiesetcubies.push([]);
      const facecnt = cubie.length;
      const typectr = cubietypecounts[facecnt]++;
      let typename = typenames[facecnt];
      if (typename === void 0 || facecnt === this.basefacecount) {
        typename = "CORE";
      }
      typename = typename + (typectr === 0 ? "" : typectr + 1);
      cubiesetnames[cubiesetnum] = typename;
      orbitoris[cubiesetnum] = facecnt;
      const queue = [i];
      let qg = 0;
      seen[i] = true;
      while (qg < queue.length) {
        const cind = queue[qg++];
        const cubiecolorkey = getcolorkey(cind);
        if (cubie.length > 1 || cubiekeymap[cubiecolorkey] === void 0) {
          cubiekeymap[cubiecolorkey] = cubievalueid++;
        }
        cubievaluemap[cind] = cubiekeymap[cubiecolorkey];
        cubiesetnums[cind] = cubiesetnum;
        cubiesetcubies[cubiesetnum].push(cind);
        cubieordnums[cind] = cubieords[cubiesetnum]++;
        for (let j = 0; j < moverotations.length; j++) {
          const tq = this.findcubie(moverotations[j][0].rotateface(cubies[cind][0]));
          if (!seen[tq]) {
            queue.push(tq);
            seen[tq] = true;
          }
        }
      }
      cubiesetnum++;
    }
    this.orbits = cubieords.length;
    this.cubiesetnums = cubiesetnums;
    this.cubieordnums = cubieordnums;
    this.cubiesetnames = cubiesetnames;
    this.cubieords = cubieords;
    this.orbitoris = orbitoris;
    this.cubievaluemap = cubievaluemap;
    this.cubiesetcubies = cubiesetcubies;
    if (this.fixPiece !== "") {
      for (let i = 0; i < cubies.length; i++) {
        if (this.fixPiece === "v" && cubies[i].length > 2 || this.fixPiece === "e" && cubies[i].length === 2 || this.fixPiece === "f" && cubies[i].length === 1) {
          this.fixedCubie = i;
          break;
        }
      }
      if (this.fixedCubie < 0) {
        throw new Error("Could not find a cubie of type " + this.fixPiece + " to fix.");
      }
    }
    if (this.verbose) {
      console.log("# Cubie orbit sizes " + cubieords);
    }
  }
  unswizzle(mv) {
    const newmv = this.notationMapper.notationToInternal(mv);
    return this.swizzler.unswizzle(newmv.family);
  }
  stringToBlockMove(mv) {
    const re = RegExp("^(([0-9]+)-)?([0-9]+)?([^0-9]+)([0-9]+'?)?$");
    const p = mv.match(re);
    if (p === null) {
      throw new Error("Bad move passed " + mv);
    }
    const grip = p[4];
    let loslice = void 0;
    let hislice = void 0;
    if (p[2] !== void 0) {
      if (p[3] === void 0) {
        throw new Error("Missing second number in range");
      }
      loslice = parseInt(p[2], 10);
    }
    if (p[3] !== void 0) {
      hislice = parseInt(p[3], 10);
    }
    let amountstr = "1";
    let amount = 1;
    if (p[5] !== void 0) {
      amountstr = p[5];
      if (amountstr[0] === "'") {
        amountstr = "-" + amountstr.substring(1);
      }
      amount = parseInt(amountstr, 10);
    }
    return new BlockMove(loslice, hislice, grip, amount);
  }
  parseBlockMove(blockmove) {
    blockmove = this.notationMapper.notationToInternal(blockmove);
    let grip = blockmove.family;
    let fullrotation = false;
    if (grip.endsWith("v") && grip[0] <= "Z") {
      if (blockmove.innerLayer !== void 0 || blockmove.outerLayer !== void 0) {
        throw new Error("Cannot use a prefix with full cube rotations");
      }
      grip = grip.slice(0, -1);
      fullrotation = true;
    }
    if (grip.endsWith("w") && grip[0] <= "Z") {
      grip = grip.slice(0, -1).toLowerCase();
    }
    let geo;
    let msi = -1;
    const geoname = this.swizzler.unswizzle(grip);
    let firstgrip = false;
    for (let i = 0; i < this.movesetgeos.length; i++) {
      const g = this.movesetgeos[i];
      if (geoname === g[0]) {
        firstgrip = true;
        geo = g;
        msi = i;
      }
      if (geoname === g[2]) {
        firstgrip = false;
        geo = g;
        msi = i;
      }
    }
    let loslice = 1;
    let hislice = 1;
    if (grip.toUpperCase() !== grip) {
      hislice = 2;
    }
    if (geo === void 0) {
      throw new Error("Bad grip in move " + blockmove.family);
    }
    if (blockmove.outerLayer !== void 0) {
      loslice = blockmove.outerLayer;
    }
    if (blockmove.innerLayer !== void 0) {
      if (blockmove.outerLayer === void 0) {
        hislice = blockmove.innerLayer;
        if (geoname === grip) {
          loslice = hislice;
        } else {
          loslice = 1;
        }
      } else {
        hislice = blockmove.innerLayer;
      }
    }
    loslice--;
    hislice--;
    if (fullrotation) {
      loslice = 0;
      hislice = this.moveplanesets[msi].length;
    }
    if (loslice < 0 || loslice > this.moveplanesets[msi].length || hislice < 0 || hislice > this.moveplanesets[msi].length) {
      throw new Error("Bad slice spec " + loslice + " " + hislice);
    }
    if (!permissivieMoveParsing && loslice === 0 && hislice === this.moveplanesets[msi].length && !fullrotation) {
      throw new Error("! full puzzle rotations must be specified with v suffix.");
    }
    const r = [void 0, msi, loslice, hislice, firstgrip, blockmove.amount];
    return r;
  }
  parsemove(mv) {
    const r = this.parseBlockMove(this.stringToBlockMove(mv));
    r[0] = mv;
    return r;
  }
  genperms() {
    if (this.cmovesbyslice.length > 0) {
      return;
    }
    const cmovesbyslice = [];
    if (this.orientCenters) {
      for (let k = 0; k < this.cubies.length; k++) {
        if (this.cubies[k].length === 1) {
          const kk = this.findface(this.cubies[k][0]);
          const i = this.getfaceindex(kk);
          if (centermassface(this.basefaces[i]).dist(centermassface(this.faces[kk])) < eps3) {
            const o = this.basefaces[i].length;
            for (let m = 0; m < o; m++) {
              this.cubies[k].push(this.cubies[k][0]);
            }
            this.duplicatedFaces[kk] = o;
            this.duplicatedCubies[k] = o;
            this.orbitoris[this.cubiesetnums[k]] = o;
          }
        }
      }
    }
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveplaneset = this.moveplanesets[k];
      const slicenum = [];
      const slicecnts = [];
      for (let i = 0; i < this.faces.length; i++) {
        const face = this.faces[i];
        let t = 0;
        for (let j = 0; j < moveplaneset.length; j++) {
          if (moveplaneset[j].faceside(face) < 0) {
            t++;
          }
        }
        slicenum.push(t);
        while (slicecnts.length <= t) {
          slicecnts.push(0);
        }
        slicecnts[t]++;
      }
      const axiscmoves = [];
      for (let sc = 0; sc < slicecnts.length; sc++) {
        const slicecmoves = [];
        const cubiedone = [];
        for (let i = 0; i < this.faces.length; i++) {
          if (slicenum[i] !== sc) {
            continue;
          }
          const b = this.facetocubies[i].slice();
          let face = this.faces[i];
          let fi2 = i;
          for (; ; ) {
            slicenum[fi2] = -1;
            const face2 = this.moverotations[k][0].rotateface(face);
            fi2 = this.findface(face2);
            if (slicenum[fi2] < 0) {
              break;
            }
            if (slicenum[fi2] !== sc) {
              throw new Error("Bad movement?");
            }
            const c = this.facetocubies[fi2];
            b.push(c[0], c[1]);
            face = face2;
          }
          if (b.length > 2 && this.orientCenters && (this.cubies[b[0]].length === 1 || this.cubies[b[0]][0] === this.cubies[b[0]][1])) {
            if (centermassface(this.faces[i]).dist(centermassface(this.basefaces[this.getfaceindex(i)])) < eps3) {
              let face1 = this.cubies[b[0]][0];
              for (let ii = 0; ii < b.length; ii += 2) {
                const face0 = this.cubies[b[ii]][0];
                let o = -1;
                for (let jj = 0; jj < face1.length; jj++) {
                  if (face0[jj].dist(face1[0]) < eps3) {
                    o = jj;
                    break;
                  }
                }
                if (o < 0) {
                  throw new Error("Couldn't find rotation of center faces; ignoring for now.");
                } else {
                  b[ii + 1] = o;
                  face1 = this.moverotations[k][0].rotateface(face1);
                }
              }
            }
          }
          if (b.length === 2 && this.orientCenters) {
            for (let ii = 1; ii < this.movesetorders[k]; ii++) {
              if (sc === 0) {
                b.push(b[0], ii);
              } else {
                b.push(b[0], (this.movesetorders[k] - ii) % this.movesetorders[k]);
              }
            }
          }
          if (b.length > 2 && !cubiedone[b[0]]) {
            if (b.length !== 2 * this.movesetorders[k]) {
              throw new Error("Bad length in perm gen");
            }
            for (let j = 0; j < b.length; j++) {
              slicecmoves.push(b[j]);
            }
          }
          for (let j = 0; j < b.length; j += 2) {
            cubiedone[b[j]] = true;
          }
        }
        axiscmoves.push(slicecmoves);
      }
      cmovesbyslice.push(axiscmoves);
    }
    this.cmovesbyslice = cmovesbyslice;
    if (this.movelist !== void 0) {
      const parsedmovelist = [];
      for (let i = 0; i < this.movelist.length; i++) {
        parsedmovelist.push(this.parsemove(this.movelist[i]));
      }
      this.parsedmovelist = parsedmovelist;
    }
  }
  getfaces() {
    return this.faces.map((_) => {
      return _.map((__) => [__.b, __.c, __.d]);
    });
  }
  getboundarygeometry() {
    return {
      baseplanes: this.baseplanes,
      facenames: this.facenames,
      faceplanes: this.faceplanes,
      vertexnames: this.vertexnames,
      edgenames: this.edgenames,
      geonormals: this.geonormals
    };
  }
  getmovesets(k) {
    const slices = this.moveplanesets[k].length;
    if (slices > 30) {
      throw new Error("Too many slices for getmovesets bitmasks");
    }
    let r = [];
    if (this.parsedmovelist !== void 0) {
      for (let i = 0; i < this.parsedmovelist.length; i++) {
        const parsedmove = this.parsedmovelist[i];
        if (parsedmove[1] !== k) {
          continue;
        }
        if (parsedmove[4]) {
          r.push((2 << parsedmove[3]) - (1 << parsedmove[2]));
        } else {
          r.push((2 << slices - parsedmove[2]) - (1 << slices - parsedmove[3]));
        }
        r.push(parsedmove[5]);
      }
    } else if (this.vertexmoves && !this.allmoves) {
      const msg = this.movesetgeos[k];
      if (msg[1] !== msg[3]) {
        for (let i = 0; i < slices; i++) {
          if (msg[1] !== "v") {
            if (this.outerblockmoves) {
              r.push((2 << slices) - (2 << i));
            } else {
              r.push(2 << i);
            }
            r.push(1);
          } else {
            if (this.outerblockmoves) {
              r.push((2 << i) - 1);
            } else {
              r.push(1 << i);
            }
            r.push(1);
          }
        }
      }
    } else {
      for (let i = 0; i <= slices; i++) {
        if (!this.allmoves && i + i === slices) {
          continue;
        }
        if (this.outerblockmoves) {
          if (i + i > slices) {
            r.push((2 << slices) - (1 << i));
          } else {
            r.push((2 << i) - 1);
          }
        } else {
          r.push(1 << i);
        }
        r.push(1);
      }
    }
    if (this.fixedCubie >= 0) {
      const dep = 1 << +this.cubiekeys[this.fixedCubie].trim().split(" ")[k];
      const newr = [];
      for (let i = 0; i < r.length; i += 2) {
        let o = r[i];
        if (o & dep) {
          o = (2 << slices) - 1 - o;
        }
        let found = false;
        for (let j = 0; j < newr.length; j += 2) {
          if (newr[j] === o && newr[j + 1] === r[i + 1]) {
            found = true;
            break;
          }
        }
        if (!found) {
          newr.push(o);
          newr.push(r[i + 1]);
        }
      }
      r = newr;
    }
    return r;
  }
  graybyori(cubie) {
    let ori = this.cubies[cubie].length;
    if (this.duplicatedCubies[cubie]) {
      ori = 1;
    }
    return ori === 1 && (this.graycenters || !this.centersets) || ori === 2 && (this.grayedges || !this.edgesets) || ori > 2 && (this.graycorners || !this.cornersets);
  }
  skipbyori(cubie) {
    let ori = this.cubies[cubie].length;
    if (this.duplicatedCubies[cubie]) {
      ori = 1;
    }
    return ori === 1 && !this.centersets || ori === 2 && !this.edgesets || ori > 2 && !this.cornersets;
  }
  skipcubie(fi) {
    return this.skipbyori(fi);
  }
  skipset(set) {
    if (set.length === 0) {
      return true;
    }
    const fi = set[0];
    return this.skipbyori(this.facetocubies[fi][0]);
  }
  header(comment) {
    return comment + copyright + "\n" + comment + this.args + "\n";
  }
  writegap() {
    const os = this.getOrbitsDef(false);
    const r = [];
    const mvs = [];
    for (let i = 0; i < os.moveops.length; i++) {
      const movename = "M_" + os.movenames[i];
      mvs.push(movename);
      r.push(movename + ":=" + os.moveops[i].toPerm().toGap() + ";");
    }
    r.push("Gen:=[");
    r.push(mvs.join(","));
    r.push("];");
    const ip = os.solved.identicalPieces();
    r.push("ip:=[" + ip.map((_) => "[" + _.map((__) => __ + 1).join(",") + "]").join(",") + "];");
    r.push("");
    return this.header("# ") + r.join("\n");
  }
  writeksolve(name = "PuzzleGeometryPuzzle", fortwisty = false) {
    const od = this.getOrbitsDef(fortwisty);
    if (fortwisty) {
      return od.toKsolve(name, fortwisty).join("\n");
    } else {
      return this.header("# ") + od.toKsolve(name, fortwisty).join("\n");
    }
  }
  writekpuzzle(fortwisty = true) {
    const od = this.getOrbitsDef(fortwisty);
    const r = od.toKpuzzle();
    r.moveNotation = new PGNotation(this, od);
    return r;
  }
  getMoveFromBits(movebits, amount, inverted, axiscmoves, setmoves, movesetorder) {
    const moveorbits = [];
    const perms = [];
    const oris = [];
    for (let ii = 0; ii < this.cubiesetnames.length; ii++) {
      perms.push(iota(this.cubieords[ii]));
      oris.push(zeros(this.cubieords[ii]));
    }
    for (let m = 0; m < axiscmoves.length; m++) {
      if ((movebits >> m & 1) === 0) {
        continue;
      }
      const slicecmoves = axiscmoves[m];
      for (let j = 0; j < slicecmoves.length; j += 2 * movesetorder) {
        const mperm = slicecmoves.slice(j, j + 2 * movesetorder);
        const setnum = this.cubiesetnums[mperm[0]];
        for (let ii = 0; ii < mperm.length; ii += 2) {
          mperm[ii] = this.cubieordnums[mperm[ii]];
        }
        let inc = 2;
        let oinc = 3;
        if (inverted) {
          inc = mperm.length - 2;
          oinc = mperm.length - 1;
        }
        if (perms[setnum] === iota(this.cubieords[setnum])) {
          perms[setnum] = perms[setnum].slice();
          if (this.orbitoris[setnum] > 1 && !this.killorientation) {
            oris[setnum] = oris[setnum].slice();
          }
        }
        for (let ii = 0; ii < mperm.length; ii += 2) {
          perms[setnum][mperm[(ii + inc) % mperm.length]] = mperm[ii];
          if (this.orbitoris[setnum] > 1 && !this.killorientation) {
            oris[setnum][mperm[ii]] = (mperm[(ii + oinc) % mperm.length] - mperm[(ii + 1) % mperm.length] + 2 * this.orbitoris[setnum]) % this.orbitoris[setnum];
          }
        }
      }
    }
    for (let ii = 0; ii < this.cubiesetnames.length; ii++) {
      if (setmoves && !setmoves[ii]) {
        continue;
      }
      if (this.orbitoris[ii] === 1 || this.killorientation) {
        moveorbits.push(new Orbit(perms[ii], oris[ii], 1));
      } else {
        const no = new Array(oris[ii].length);
        for (let jj = 0; jj < perms[ii].length; jj++) {
          no[jj] = oris[ii][perms[ii][jj]];
        }
        moveorbits.push(new Orbit(perms[ii], no, this.orbitoris[ii]));
      }
    }
    let mv = new Transformation(moveorbits);
    if (amount !== 1) {
      mv = mv.mulScalar(amount);
    }
    return mv;
  }
  getOrbitsDef(fortwisty) {
    const setmoves = [];
    const setnames = [];
    const setdefs = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveset = this.getmovesets(k);
      const movesetorder = this.movesetorders[k];
      for (let i = 0; i < moveset.length; i += 2) {
        for (let j = 0; j < i; j += 2) {
          if (moveset[i] === moveset[j] && moveset[i + 1] === moveset[j + 1]) {
            throw new Error("Redundant moves in moveset.");
          }
        }
      }
      let allbits = 0;
      for (let i = 0; i < moveset.length; i += 2) {
        allbits |= moveset[i];
      }
      const axiscmoves = this.cmovesbyslice[k];
      for (let i = 0; i < axiscmoves.length; i++) {
        if ((allbits >> i & 1) === 0) {
          continue;
        }
        const slicecmoves = axiscmoves[i];
        for (let j = 0; j < slicecmoves.length; j += 2 * movesetorder) {
          if (this.skipcubie(slicecmoves[j])) {
            continue;
          }
          const ind = this.cubiesetnums[slicecmoves[j]];
          setmoves[ind] = 1;
        }
      }
    }
    for (let i = 0; i < this.cubiesetnames.length; i++) {
      if (!setmoves[i]) {
        continue;
      }
      setnames.push(this.cubiesetnames[i]);
      setdefs.push(new OrbitDef(this.cubieords[i], this.killorientation ? 1 : this.orbitoris[i]));
    }
    const solved = [];
    for (let i = 0; i < this.cubiesetnames.length; i++) {
      if (!setmoves[i]) {
        continue;
      }
      const p = [];
      const o = [];
      for (let j = 0; j < this.cubieords[i]; j++) {
        if (fortwisty) {
          p.push(j);
        } else {
          const cubie = this.cubiesetcubies[i][j];
          p.push(this.cubievaluemap[cubie]);
        }
        o.push(0);
      }
      solved.push(new Orbit(p, o, this.killorientation ? 1 : this.orbitoris[i]));
    }
    const movenames = [];
    const moves = [];
    for (let k = 0; k < this.moveplanesets.length; k++) {
      const moveplaneset = this.moveplanesets[k];
      const slices = moveplaneset.length;
      const moveset = this.getmovesets(k);
      const movesetgeo = this.movesetgeos[k];
      for (let i = 0; i < moveset.length; i += 2) {
        const movebits = moveset[i];
        const mna = getmovename(movesetgeo, movebits, slices);
        const movename = mna[0];
        const inverted = mna[1];
        if (moveset[i + 1] === 1) {
          movenames.push(movename);
        } else {
          movenames.push(movename + moveset[i + 1]);
        }
        const mv = this.getMoveFromBits(movebits, moveset[i + 1], inverted, this.cmovesbyslice[k], setmoves, this.movesetorders[k]);
        moves.push(mv);
      }
    }
    this.ksolvemovenames = movenames;
    let r = new OrbitsDef(setnames, setdefs, new VisibleState(solved), movenames, moves);
    if (this.optimize) {
      r = r.optimize();
    }
    if (this.scramble !== 0) {
      r.scramble(this.scramble);
    }
    return r;
  }
  getMovesAsPerms() {
    return this.getOrbitsDef(false).moveops.map((_) => _.toPerm());
  }
  showcanon(disp) {
    showcanon(this.getOrbitsDef(false), disp);
  }
  getsolved() {
    const r = [];
    for (let i = 0; i < this.basefacecount; i++) {
      for (let j = 0; j < this.stickersperface; j++) {
        r.push(i);
      }
    }
    return new Perm(r);
  }
  getOrientationRotation(desiredRotation) {
    const feature1name = desiredRotation[0];
    const direction1 = new Quat(0, desiredRotation[1][0], -desiredRotation[1][1], desiredRotation[1][2]);
    const feature2name = desiredRotation[2];
    const direction2 = new Quat(0, desiredRotation[3][0], -desiredRotation[3][1], desiredRotation[3][2]);
    let feature1 = null;
    let feature2 = null;
    const feature1geoname = this.swizzler.unswizzle(feature1name);
    const feature2geoname = this.swizzler.unswizzle(feature2name);
    for (const gn of this.geonormals) {
      if (feature1geoname === gn[1]) {
        feature1 = gn[0];
      }
      if (feature2geoname === gn[1]) {
        feature2 = gn[0];
      }
    }
    if (!feature1) {
      throw new Error("Could not find feature " + feature1name);
    }
    if (!feature2) {
      throw new Error("Could not find feature " + feature2name);
    }
    const r1 = feature1.pointrotation(direction1);
    const feature2rot = feature2.rotatepoint(r1);
    const r2 = feature2rot.unproject(direction1).pointrotation(direction2.unproject(direction1));
    return r2.mul(r1);
  }
  getInitial3DRotation() {
    const basefacecount = this.basefacecount;
    let rotDesc = null;
    if (this.puzzleOrientation) {
      rotDesc = this.puzzleOrientation;
    } else if (this.puzzleOrientations) {
      rotDesc = this.puzzleOrientations[basefacecount];
    }
    if (!rotDesc) {
      rotDesc = defaultOrientations()[basefacecount];
    }
    if (!rotDesc) {
      throw new Error("No default orientation?");
    }
    return this.getOrientationRotation(rotDesc);
  }
  generatesvg(w = 800, h = 500, trim = 10, threed = false) {
    w -= 2 * trim;
    h -= 2 * trim;
    function extendedges(a, n) {
      let dx = a[1][0] - a[0][0];
      let dy = a[1][1] - a[0][1];
      const ang = 2 * Math.PI / n;
      const cosa = Math.cos(ang);
      const sina = Math.sin(ang);
      for (let i = 2; i < n; i++) {
        const ndx = dx * cosa + dy * sina;
        dy = dy * cosa - dx * sina;
        dx = ndx;
        a.push([a[i - 1][0] + dx, a[i - 1][1] + dy]);
      }
    }
    function noise(c) {
      return c + 0 * (Math.random() - 0.5);
    }
    function drawedges(id, pts, color) {
      return '<polygon id="' + id + '" class="sticker" style="fill: ' + color + '" points="' + pts.map((p) => noise(p[0]) + " " + noise(p[1])).join(" ") + '"/>\n';
    }
    let needvertexgrips = this.addrotations;
    let neededgegrips = this.addrotations;
    let needfacegrips = this.addrotations;
    for (let i = 0; i < this.movesetgeos.length; i++) {
      const msg = this.movesetgeos[i];
      for (let j = 1; j <= 3; j += 2) {
        if (msg[j] === "v") {
          needvertexgrips = true;
        }
        if (msg[j] === "f") {
          needfacegrips = true;
        }
        if (msg[j] === "e") {
          neededgegrips = true;
        }
      }
    }
    this.genperms();
    const boundarygeo = this.getboundarygeometry();
    const face0 = boundarygeo.facenames[0][0];
    const polyn = face0.length;
    const net = this.net;
    if (net === null) {
      throw new Error("No net?");
    }
    const edges = {};
    let minx = 0;
    let miny = 0;
    let maxx = 1;
    let maxy = 0;
    edges[net[0][0]] = [
      [1, 0],
      [0, 0]
    ];
    extendedges(edges[net[0][0]], polyn);
    for (let i = 0; i < net.length; i++) {
      const f0 = net[i][0];
      if (!edges[f0]) {
        throw new Error("Bad edge description; first edge not connected.");
      }
      for (let j = 1; j < net[i].length; j++) {
        const f1 = net[i][j];
        if (f1 === "" || edges[f1]) {
          continue;
        }
        edges[f1] = [edges[f0][j % polyn], edges[f0][(j + polyn - 1) % polyn]];
        extendedges(edges[f1], polyn);
      }
    }
    for (const f in edges) {
      const es = edges[f];
      for (let i = 0; i < es.length; i++) {
        minx = Math.min(minx, es[i][0]);
        maxx = Math.max(maxx, es[i][0]);
        miny = Math.min(miny, es[i][1]);
        maxy = Math.max(maxy, es[i][1]);
      }
    }
    const sc = Math.min(w / (maxx - minx), h / (maxy - miny));
    const xoff = 0.5 * (w - sc * (maxx + minx));
    const yoff = 0.5 * (h - sc * (maxy + miny));
    const geos = {};
    const bg = this.getboundarygeometry();
    const edges2 = {};
    const initv = [
      [sc + xoff, yoff],
      [xoff, yoff]
    ];
    edges2[net[0][0]] = initv;
    extendedges(edges2[net[0][0]], polyn);
    geos[this.facenames[0][1]] = this.project2d(0, 0, [
      new Quat(0, initv[0][0], initv[0][1], 0),
      new Quat(0, initv[1][0], initv[1][1], 0)
    ]);
    const connectat = [];
    connectat[0] = 0;
    for (let i = 0; i < net.length; i++) {
      const f0 = net[i][0];
      if (!edges2[f0]) {
        throw new Error("Bad edge description; first edge not connected.");
      }
      let gfi = -1;
      for (let j = 0; j < bg.facenames.length; j++) {
        if (f0 === bg.facenames[j][1]) {
          gfi = j;
          break;
        }
      }
      if (gfi < 0) {
        throw new Error("Could not find first face name " + f0);
      }
      const thisface = bg.facenames[gfi][0];
      for (let j = 1; j < net[i].length; j++) {
        const f1 = net[i][j];
        if (f1 === "" || edges2[f1]) {
          continue;
        }
        edges2[f1] = [
          edges2[f0][j % polyn],
          edges2[f0][(j + polyn - 1) % polyn]
        ];
        extendedges(edges2[f1], polyn);
        const caf0 = connectat[gfi];
        const mp = thisface[(caf0 + j) % polyn].sum(thisface[(caf0 + j + polyn - 1) % polyn]).smul(0.5);
        const epi = findelement(bg.edgenames, mp);
        const edgename = bg.edgenames[epi][1];
        const el = splitByFaceNames(edgename, this.facenames);
        const gf1 = el[f0 === el[0] ? 1 : 0];
        let gf1i = -1;
        for (let k = 0; k < bg.facenames.length; k++) {
          if (gf1 === bg.facenames[k][1]) {
            gf1i = k;
            break;
          }
        }
        if (gf1i < 0) {
          throw new Error("Could not find second face name");
        }
        const otherface = bg.facenames[gf1i][0];
        for (let k = 0; k < otherface.length; k++) {
          const mp2 = otherface[k].sum(otherface[(k + 1) % polyn]).smul(0.5);
          if (mp2.dist(mp) <= eps3) {
            const p1 = edges2[f0][(j + polyn - 1) % polyn];
            const p2 = edges2[f0][j % polyn];
            connectat[gf1i] = k;
            geos[gf1] = this.project2d(gf1i, k, [
              new Quat(0, p2[0], p2[1], 0),
              new Quat(0, p1[0], p1[1], 0)
            ]);
            break;
          }
        }
      }
    }
    const pos = this.getsolved();
    const colormap = [];
    const facegeo = [];
    for (let i = 0; i < this.basefacecount; i++) {
      colormap[i] = this.colors[this.facenames[i][1]];
    }
    let hix = 0;
    let hiy = 0;
    const rot = this.getInitial3DRotation();
    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i];
      face = rot.rotateface(face);
      for (let j = 0; j < face.length; j++) {
        hix = Math.max(hix, Math.abs(face[j].b));
        hiy = Math.max(hiy, Math.abs(face[j].c));
      }
    }
    const sc2 = Math.min(h / hiy / 2, (w - trim) / hix / 4);
    const mappt2d = (fn, q) => {
      if (threed) {
        const xoff2 = 0.5 * trim + 0.25 * w;
        const xmul = this.baseplanes[fn].rotateplane(rot).d < 0 ? 1 : -1;
        return [
          trim + w * 0.5 + xmul * (xoff2 - q.b * sc2),
          trim + h * 0.5 + q.c * sc2
        ];
      } else {
        const g = geos[this.facenames[fn][1]];
        return [trim + q.dot(g[0]) + g[2].b, trim + h - q.dot(g[1]) - g[2].c];
      }
    };
    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i];
      const facenum = Math.floor(i / this.stickersperface);
      if (threed) {
        face = rot.rotateface(face);
      }
      facegeo.push(face.map((_) => mappt2d(facenum, _)));
    }
    const svg = [];
    for (let j = 0; j < this.basefacecount; j++) {
      svg.push("<g>");
      svg.push("<title>" + this.facenames[j][1] + "</title>\n");
      for (let ii = 0; ii < this.stickersperface; ii++) {
        const i = j * this.stickersperface + ii;
        const cubie = this.facetocubies[i][0];
        const cubieori = this.facetocubies[i][1];
        const cubiesetnum = this.cubiesetnums[cubie];
        const cubieord = this.cubieordnums[cubie];
        const color = this.graybyori(cubie) ? "#808080" : colormap[pos.p[i]];
        let id = this.cubiesetnames[cubiesetnum] + "-l" + cubieord + "-o" + cubieori;
        svg.push(drawedges(id, facegeo[i], color));
        if (this.duplicatedFaces[i]) {
          for (let jj = 1; jj < this.duplicatedFaces[i]; jj++) {
            id = this.cubiesetnames[cubiesetnum] + "-l" + cubieord + "-o" + jj;
            svg.push(drawedges(id, facegeo[i], color));
          }
        }
      }
      svg.push("</g>");
    }
    const svggrips = [];
    function addgrip(onface, name, pt, order) {
      const pt2 = mappt2d(onface, pt);
      for (let i = 0; i < svggrips.length; i++) {
        if (Math.hypot(pt2[0] - svggrips[i][0], pt2[1] - svggrips[i][1]) < eps3) {
          return;
        }
      }
      svggrips.push([pt2[0], pt2[1], name, order]);
    }
    for (let i = 0; i < this.faceplanes.length; i++) {
      const baseface = this.facenames[i][0];
      let facecoords = baseface;
      if (threed) {
        facecoords = rot.rotateface(facecoords);
      }
      if (needfacegrips) {
        let pt = this.faceplanes[i][0];
        if (threed) {
          pt = pt.rotatepoint(rot);
        }
        addgrip(i, this.faceplanes[i][1], pt, polyn);
      }
      for (let j = 0; j < baseface.length; j++) {
        if (neededgegrips) {
          const mp = baseface[j].sum(baseface[(j + 1) % baseface.length]).smul(0.5);
          const ep = findelement(this.edgenames, mp);
          const mpc = facecoords[j].sum(facecoords[(j + 1) % baseface.length]).smul(0.5);
          addgrip(i, this.edgenames[ep][1], mpc, 2);
        }
        if (needvertexgrips) {
          const vp = findelement(this.vertexnames, baseface[j]);
          addgrip(i, this.vertexnames[vp][1], facecoords[j], this.cornerfaces);
        }
      }
    }
    const html = '<svg id="svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 500">\n<style type="text/css"><![CDATA[.sticker { stroke: #000000; stroke-width: 1px; }]]></style>\n' + svg.join("") + "</svg>";
    this.svggrips = svggrips;
    return html;
  }
  dist(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }
  triarea(a, b, c) {
    const ab = this.dist(a, b);
    const bc = this.dist(b, c);
    const ac = this.dist(a, c);
    const p = (ab + bc + ac) / 2;
    return Math.sqrt(p * (p - ab) * (p - bc) * (p - ac));
  }
  polyarea(coords) {
    let sum = 0;
    for (let i = 2; i < coords.length; i++) {
      sum += this.triarea(coords[0], coords[1], coords[i]);
    }
    return sum;
  }
  get3d(colorfrac = DEFAULT_COLOR_FRACTION) {
    const stickers = [];
    const foundations = [];
    const rot = this.getInitial3DRotation();
    const faces = [];
    const maxdist = 0.52 * this.basefaces[0][0].len();
    let avgstickerarea = 0;
    for (let i = 0; i < this.basefaces.length; i++) {
      const coords = rot.rotateface(this.basefaces[i]);
      const name = this.facenames[i][1];
      faces.push({coords: toFaceCoords(coords, maxdist), name});
      avgstickerarea += this.polyarea(faces[i].coords);
    }
    avgstickerarea /= this.faces.length;
    const trim = Math.sqrt(avgstickerarea) * (1 - Math.sqrt(colorfrac)) / 2;
    for (let i = 0; i < this.faces.length; i++) {
      const facenum = Math.floor(i / this.stickersperface);
      const cubie = this.facetocubies[i][0];
      const cubieori = this.facetocubies[i][1];
      const cubiesetnum = this.cubiesetnums[cubie];
      const cubieord = this.cubieordnums[cubie];
      const color = this.graybyori(cubie) ? "#808080" : this.colors[this.facenames[facenum][1]];
      let coords = rot.rotateface(this.faces[i]);
      foundations.push({
        coords: toFaceCoords(coords, maxdist),
        color,
        orbit: this.cubiesetnames[cubiesetnum],
        ord: cubieord,
        ori: cubieori
      });
      const fcoords = coords;
      if (trim && trim > 0) {
        coords = trimEdges(coords, trim);
      }
      stickers.push({
        coords: toFaceCoords(coords, maxdist),
        color,
        orbit: this.cubiesetnames[cubiesetnum],
        ord: cubieord,
        ori: cubieori
      });
      if (this.duplicatedFaces[i]) {
        for (let jj = 1; jj < this.duplicatedFaces[i]; jj++) {
          stickers.push({
            coords: toFaceCoords(coords, maxdist),
            color,
            orbit: this.cubiesetnames[cubiesetnum],
            ord: cubieord,
            ori: jj
          });
          foundations.push({
            coords: toFaceCoords(fcoords, maxdist),
            color,
            orbit: this.cubiesetnames[cubiesetnum],
            ord: cubieord,
            ori: jj
          });
        }
      }
    }
    const grips = [];
    for (let i = 0; i < this.movesetgeos.length; i++) {
      const msg = this.movesetgeos[i];
      const order = this.movesetorders[i];
      for (let j = 0; j < this.geonormals.length; j++) {
        const gn = this.geonormals[j];
        if (msg[0] === gn[1] && msg[1] === gn[2]) {
          grips.push([toCoords(gn[0].rotatepoint(rot), 1), msg[0], order]);
          grips.push([
            toCoords(gn[0].rotatepoint(rot).smul(-1), 1),
            msg[2],
            order
          ]);
        }
      }
    }
    const f = function() {
      return function(mv) {
        return this.unswizzle(mv);
      };
    }().bind(this);
    return {
      stickers,
      foundations,
      faces,
      axis: grips,
      unswizzle: f,
      notationMapper: this.notationMapper
    };
  }
  getGeoNormal(geoname) {
    const rot = this.getInitial3DRotation();
    const grip = this.swizzler.unswizzle(geoname);
    for (let j = 0; j < this.geonormals.length; j++) {
      const gn = this.geonormals[j];
      if (grip === gn[1]) {
        const r = toCoords(gn[0].rotatepoint(rot), 1);
        if (Math.abs(r[0]) < eps3 && Math.abs(r[2]) < eps3) {
          r[0] = 0;
          r[2] = 1e-6;
        }
        return r;
      }
    }
    return void 0;
  }
  getfaceindex(facenum) {
    const divid = this.stickersperface;
    return Math.floor(facenum / divid);
  }
}
class PGNotation {
  constructor(pg, od) {
    this.pg = pg;
    this.od = od;
    this.cache = {};
  }
  lookupMove(move) {
    const key = this.blockMoveToString(move);
    if (key in this.cache) {
      return this.cache[key];
    }
    const mv = this.pg.parseBlockMove(move);
    let bits = (2 << mv[3]) - (1 << mv[2]);
    if (!mv[4]) {
      const slices = this.pg.moveplanesets[mv[1]].length;
      bits = (2 << slices - mv[2]) - (1 << slices - mv[3]);
    }
    const pgmv = this.pg.getMoveFromBits(bits, mv[5], !mv[4], this.pg.cmovesbyslice[mv[1]], void 0, this.pg.movesetorders[mv[1]]);
    const r = this.od.transformToKPuzzle(pgmv);
    this.cache[key] = r;
    return r;
  }
  blockMoveToString(mv) {
    let r = "";
    if (mv.outerLayer) {
      r = r + mv.outerLayer + ",";
    }
    if (mv.innerLayer) {
      r = r + mv.innerLayer + ",";
    }
    r = r + mv.family + "," + mv.amount;
    return r;
  }
}

export {
  Puzzles,
  OrbitDef,
  iota,
  OrbitsDef,
  Quat,
  Perm,
  useNewFaceNames,
  parsedesc,
  getPuzzleGeometryByDesc,
  getPuzzleGeometryByName,
  Orbit,
  PuzzleGeometry,
  Transformation,
  VisibleState
};
//# sourceMappingURL=chunk.KTBFBVM2.js.map
