export function smootherStep(x: number): number {
  return x * x * x * (10 - x * (15 - 6 * x));
}
