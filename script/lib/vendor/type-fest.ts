// From https://github.com/sindresorhus/type-fest/blob/main/source/iterable-element.d.ts
export type IterableElement<TargetIterable> = TargetIterable extends Iterable<
  infer ElementType
>
  ? ElementType
  : TargetIterable extends AsyncIterable<infer ElementType>
    ? ElementType
    : never;
