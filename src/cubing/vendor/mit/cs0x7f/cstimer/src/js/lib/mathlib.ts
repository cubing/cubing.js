const Cnk: number[][] = [];
const fact = [1];
for (let i = 0; i < 32; ++i) {
  Cnk[i] = [];
  for (let j = 0; j < 32; ++j) {
    Cnk[i][j] = 0;
  }
}
for (let i = 0; i < 32; ++i) {
  Cnk[i][0] = Cnk[i][i] = 1;
  fact[i + 1] = fact[i] * (i + 1);
  for (let j = 1; j < i; ++j) {
    Cnk[i][j] = Cnk[i - 1][j - 1] + Cnk[i - 1][j];
  }
}

function circle(arr: number[], ...moreArgs: number[]) {
  const length = moreArgs.length;
  const temp = arr[moreArgs[length - 1]];
  for (let i = length; i > 0; i--) {
    arr[moreArgs[i]] = arr[moreArgs[i - 1]];
  }
  arr[moreArgs[0]] = temp;
  return circle;
}

function set8Perm(arr: number[], idx: number, n?: number, even?: number) {
  n = (n || 8) - 1;
  let val = 0x76543210;
  let prt = 0;
  even ??= 0;
  if (even < 0) {
    idx <<= 1;
  }
  for (let i = 0; i < n; ++i) {
    const p = fact[n - i];
    let v = ~~(idx / p);
    prt ^= v;
    idx %= p;
    v <<= 2;
    arr[i] = (val >> v) & 7;
    const m = (1 << v) - 1;
    val = (val & m) + ((val >> 4) & ~m);
  }
  if (even < 0 && (prt & 1) !== 0) {
    arr[n] = arr[n - 1];
    arr[n - 1] = val & 7;
  } else {
    arr[n] = val & 7;
  }
  return arr;
}

export { Cnk, set8Perm, circle };
