import type { AlgLeaf } from "../../../../../alg/index.ts";
import type { MillisecondTimestamp } from "../../../../controllers/AnimationTypes.ts";
import { SimpleTwistyPropSource } from "../../TwistyProp.ts";

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
