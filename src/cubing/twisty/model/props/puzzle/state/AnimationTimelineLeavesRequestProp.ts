import type { AlgLeaf } from "cubing/alg";
import { SimpleTwistyPropSource } from "../../TwistyProp";

export interface AnimationTimelineLeaf {
  animLeaf: AlgLeaf;
  start: number;
  end: number;
}

export type AnimationTimelineLeaves = AnimationTimelineLeaf[];

export class AnimationTimelineLeavesRequestProp extends SimpleTwistyPropSource<
  AnimationTimelineLeaf[] | null
> {
  getDefaultValue(): AnimationTimelineLeaf[] | null {
    return null;
  }
}
