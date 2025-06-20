const zeroCache: number[][] = [];
const iotaCache: number[][] = [];

export function zeros(n: number): number[] {
  if (!zeroCache[n]) {
    const c = Array(n);
    for (let i = 0; i < n; i++) {
      c[i] = 0;
    }
    zeroCache[n] = c;
  }
  return zeroCache[n];
}

export function iota(n: number): number[] {
  if (!iotaCache[n]) {
    const c = Array(n);
    for (let i = 0; i < n; i++) {
      c[i] = i;
    }
    iotaCache[n] = c;
  }
  return iotaCache[n];
}

export function identity(n: number): Perm {
  return new Perm(iota(n));
}

export function random(n: number): Perm {
  // random
  const c = Array(n);
  for (let i = 0; i < n; i++) {
    c[i] = i;
  }
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor((n - i) * Math.random());
    const t = c[i];
    c[i] = c[j];
    c[j] = t;
  }
  return new Perm(c);
}

export function factorial(a: number): bigint {
  let r = BigInt(1);
  while (a > 1) {
    r *= BigInt(a);
    a--;
  }
  return r;
}

function gcd(a: number, b: number): number {
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

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

export class Perm {
  public n: number; // length
  public p: number[]; // The permutation itself
  constructor(a: number[]) {
    this.n = a.length;
    this.p = a;
  }

  public toString(): string {
    // stringify
    return `Perm[${this.p.join(" ")}]`;
  }

  public mul(p2: Perm): Perm {
    // multiply
    const c: number[] = Array(this.n);
    for (let i = 0; i < this.n; i++) {
      c[i] = p2.p[this.p[i]];
    }
    return new Perm(c);
  }

  public rmul(p2: Perm): Perm {
    // multiply the other way
    const c = Array(this.n);
    for (let i = 0; i < this.n; i++) {
      c[i] = this.p[p2.p[i]];
    }
    return new Perm(c);
  }

  public inv(): Perm {
    const c = Array(this.n);
    for (let i = 0; i < this.n; i++) {
      c[this.p[i]] = i;
    }
    return new Perm(c);
  }

  public compareTo(p2: Perm): number {
    // comparison
    for (let i = 0; i < this.n; i++) {
      if (this.p[i] !== p2.p[i]) {
        return this.p[i] - p2.p[i];
      }
    }
    return 0;
  }

  public toGap(): string {
    const cyc: string[] = [];
    const seen = new Array<boolean>(this.n);
    for (let i = 0; i < this.p.length; i++) {
      if (seen[i] || this.p[i] === i) {
        continue;
      }
      const incyc: number[] = [];
      for (let j = this.p[i]; !seen[j]; j = this.p[j]) {
        incyc.push(1 + j);
        seen[j] = true;
      }
      cyc.push(`(${incyc.reverse().join(",")})`);
    }
    return cyc.join("");
  }

  public toMathematica(): string {
    const cyc: string[] = [];
    const seen = new Array<boolean>(this.n);
    for (let i = 0; i < this.p.length; i++) {
      if (seen[i] || this.p[i] === i) {
        continue;
      }
      const incyc: number[] = [];
      for (let j = this.p[i]; !seen[j]; j = this.p[j]) {
        incyc.push(1 + j);
        seen[j] = true;
      }
      cyc.push(`{${incyc.reverse().join(",")}}`);
    }
    return `Cycles[{${cyc.join(",")}}]`;
  }

  public order(): number {
    let r = 1;
    const seen = new Array<boolean>(this.n);
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
