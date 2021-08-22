

/*
TODO: Use something like "animation iteration count"?
https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count

Or maybe something like "behaviour on animation end", e.g. "reverse", "loop", "pause". Maybe that could be combined with boundary type into a single value?
*/
export const experimentalAnimationIterationInstructions = {
  auto : true,
  once : true,
  loop: true
}
export type ExperimentalAnimationIteration = keyof typeof experimentalAnimationIterationInstructions;
