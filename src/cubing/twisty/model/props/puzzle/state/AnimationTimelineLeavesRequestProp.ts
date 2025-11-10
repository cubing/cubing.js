import type { AlgLeaf } from "cubing/alg";
import type { MillisecondTimestamp } from "cubing/twisty/controllers/AnimationTypes";
import { SimpleTwistyPropSource } from "../../TwistyProp";

export interface AnimationTimelineLeaf {
  animLeaf: AlgLeaf;
  start: MillisecondTimestamp;
  end: MillisecondTimestamp;
}

export type AnimationTimelineLeaves = AnimationTimelineLeaf[];

export class AnimationTimelineLeavesRequestProp extends SimpleTwistyPropSource<
  AnimationTimelineLeaf[] | null
> {
  getDefaultValue(): AnimationTimelineLeaf[] | null {
    return null;
  }
}
