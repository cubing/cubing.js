const warned = new Set<string>();
export function warnOnce(s: string): void {
  if (!warned.has(s)) {
    console.warn(s);
    warned.add(s);
  }
}
