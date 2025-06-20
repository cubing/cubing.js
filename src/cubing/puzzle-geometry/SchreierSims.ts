import { identity, type Perm } from "./Perm";

class FactoredNumber {
  public mult: number[];
  constructor() {
    this.mult = [];
  }

  public multiply(n: number): void {
    for (let f = 2; f * f <= n; f++) {
      while (n % f === 0) {
        if (undefined !== this.mult[f]) {
          this.mult[f]++;
        } else {
          this.mult[f] = 1;
        }
        n /= f;
      }
    }
    if (n > 1) {
      if (undefined !== this.mult[n]) {
        this.mult[n]++;
      } else {
        this.mult[n] = 1;
      }
    }
  }

  public toString(): string {
    let r = "";
    for (let i = 0; i < this.mult.length; i++) {
      if (undefined !== this.mult[i]) {
        if (r !== "") {
          r += "*";
        }
        r += i;
        if (this.mult[i] > 1) {
          r += `^${this.mult[i]}`;
        }
      }
    }
    return r;
  }
}

export function schreierSims(g: Perm[], disp: (s: string) => void): bigint {
  const n = g[0].p.length;
  const e = identity(n);
  let sgs: Perm[][] = [];
  let sgsi: Perm[][] = [];
  let sgslen: number[][] = [];
  let Tk: Perm[][] = [];
  let Tklen: number[][] = [];
  function resolve(p: Perm): boolean {
    for (let i = p.p.length - 1; i >= 0; i--) {
      const j = p.p[i];
      if (j !== i) {
        if (!sgs[i][j]) {
          return false;
        }
        p = p.mul(sgsi[i][j]);
      }
    }
    return true;
  }
  function knutha(k: number, p: Perm, len: number): void {
    Tk[k].push(p);
    Tklen[k].push(len);
    for (let i = 0; i < sgs[k].length; i++) {
      if (sgs[k][i]) {
        knuthb(k, sgs[k][i].mul(p), len + sgslen[k][i]);
      }
    }
  }
  function knuthb(k: number, p: Perm, len: number): void {
    const j = p.p[k];
    if (!sgs[k][j]) {
      sgs[k][j] = p;
      sgsi[k][j] = p.inv();
      sgslen[k][j] = len;
      for (let i = 0; i < Tk[k].length; i++) {
        knuthb(k, p.mul(Tk[k][i]), len + Tklen[k][i]);
      }
      return;
    }
    const p2 = p.mul(sgsi[k][j]);
    if (!resolve(p2)) {
      knutha(k - 1, p2, len + sgslen[k][j]);
    }
  }
  function getsgs(): bigint {
    sgs = [];
    sgsi = [];
    Tk = [];
    sgslen = [];
    Tklen = [];
    for (let i = 0; i < n; i++) {
      sgs.push([]);
      sgsi.push([]);
      sgslen.push([]);
      Tk.push([]);
      Tklen.push([]);
      sgs[i][i] = e;
      sgsi[i][i] = e;
      sgslen[i][i] = 0;
    }
    let none = 0;
    let sz = BigInt(1);
    for (let i = 0; i < g.length; i++) {
      knutha(n - 1, g[i], 1);
      sz = BigInt(1);
      let tks = 0;
      let sollen = 0;
      const avgs = [];
      const mults = new FactoredNumber();
      for (let j = 0; j < n; j++) {
        let cnt = 0;
        let lensum = 0;
        for (let k = 0; k < n; k++) {
          if (sgs[j][k]) {
            cnt++;
            lensum += sgslen[j][k];
            if (j !== k) {
              none++;
            }
          }
        }
        tks += Tk[j].length;
        sz *= BigInt(cnt);
        if (cnt > 1) {
          mults.multiply(cnt);
        }
        const avg = lensum / cnt;
        avgs.push(avg);
        sollen += avg;
      }
      disp(
        `${i}: sz ${sz} T ${tks} sol ${sollen} none ${none} mults ${mults.toString()}`,
      );
    }
    return sz;
  }
  return getsgs();
}
