export enum IterationDirection {
  Forwards = 1,
  Backwards = -1,
}

export function toggleDirection(
  iterationDirection: IterationDirection,
  flip: boolean = true,
): IterationDirection {
  if (!flip) {
    return iterationDirection;
  }
  switch (iterationDirection) {
    case IterationDirection.Forwards:
      return IterationDirection.Backwards;
    case IterationDirection.Backwards:
      return IterationDirection.Forwards;
  }
}

export function direct<T>(
  g: Iterable<T>,
  iterDir: IterationDirection,
): Iterable<T> {
  return iterDir === IterationDirection.Backwards ? Array.from(g).reverse() : g;
}

export function reverse<T>(g: Iterable<T>): Iterable<T> {
  return Array.from(g).reverse();
}

export function* directedGenerator<T>(
  g: Generator<T>,
  direction: IterationDirection,
): Generator<T> {
  direction === IterationDirection.Backwards
    ? yield* reverseGenerator(g)
    : yield* g;
}

export function* reverseGenerator<T>(g: Generator<T>): Generator<T> {
  for (const t of Array.from(g).reverse()) {
    yield t;
  }
}
