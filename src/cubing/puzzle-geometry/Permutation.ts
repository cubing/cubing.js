const zeroCache: number[][] = [];
const rangeCache: number[][] = [];

export function zeros(n: number): number[] {
  return (zeroCache[n] ??= new Array(n).fill(0));
}

export function range(n: number): number[] {
  return (rangeCache[n] ??= zeros(n).map((_, i) => i));
}

export function identity(n: number): Permutation {
  return new Permutation(range(n));
}

export function factorial(n: number): bigint {
  let output = BigInt(1);
  while (n > 1) {
    output *= BigInt(n);
    n--;
  }
  return output;
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

export class Permutation {
  public permutation: number[]; // The permutation itself
  constructor(a: number[]) {
    this.permutation = a;
  }

  get length(): number {
    return this.permutation.length;
  }

  public toString(): string {
    // stringify
    return `Perm[${this.permutation.join(" ")}]`;
  }

  public multiply(p2: Permutation): Permutation {
    // multiply
    const c: number[] = Array(this.length);
    for (let i = 0; i < this.length; i++) {
      c[i] = p2.permutation[this.permutation[i]];
    }
    return new Permutation(c);
  }

  public rightMultiply(p2: Permutation): Permutation {
    // multiply the other way
    const c = Array(this.length);
    for (let i = 0; i < this.length; i++) {
      c[i] = this.permutation[p2.permutation[i]];
    }
    return new Permutation(c);
  }

  public invert(): Permutation {
    const c = Array(this.length);
    for (let i = 0; i < this.length; i++) {
      c[this.permutation[i]] = i;
    }
    return new Permutation(c);
  }

  public compare(p2: Permutation): number {
    // comparison
    for (let i = 0; i < this.length; i++) {
      if (this.permutation[i] !== p2.permutation[i]) {
        return this.permutation[i] - p2.permutation[i];
      }
    }
    return 0;
  }

  public toGap(): string {
    const cyc: string[] = [];
    const seen = new Array<boolean>(this.length);
    for (let i = 0; i < this.permutation.length; i++) {
      if (seen[i] || this.permutation[i] === i) {
        continue;
      }
      const incyc: number[] = [];
      for (let j = this.permutation[i]; !seen[j]; j = this.permutation[j]) {
        incyc.push(1 + j);
        seen[j] = true;
      }
      cyc.push(`(${incyc.reverse().join(",")})`);
    }
    return cyc.join("");
  }

  public toMathematica(): string {
    const cyc: string[] = [];
    const seen = new Array<boolean>(this.length);
    for (let i = 0; i < this.permutation.length; i++) {
      if (seen[i] || this.permutation[i] === i) {
        continue;
      }
      const incyc: number[] = [];
      for (let j = this.permutation[i]; !seen[j]; j = this.permutation[j]) {
        incyc.push(1 + j);
        seen[j] = true;
      }
      cyc.push(`{${incyc.reverse().join(",")}}`);
    }
    return `Cycles[{${cyc.join(",")}}]`;
  }

  public order(): number {
    let output = 1;
    const seen = new Array<boolean>(this.length);
    for (let i = 0; i < this.permutation.length; i++) {
      if (seen[i] || this.permutation[i] === i) {
        continue;
      }
      let cycleLength = 0;
      for (let j = i; !seen[j]; j = this.permutation[j]) {
        cycleLength++;
        seen[j] = true;
      }
      output = lcm(output, cycleLength);
    }
    return output;
  }
}
