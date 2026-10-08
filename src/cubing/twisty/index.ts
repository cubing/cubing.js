/**
 * For a walkthrough, see:
 *
 * https://js.cubing.net/cubing/twisty/
 *
 * @packageDocumentation
 */

export type {
  MillisecondDuration as ExperimentalMillisecondDuration,
  MillisecondTimestamp as ExperimentalMillisecondTimestamp,
} from "./controllers/AnimationTypes.ts";
// Older
// export { Cube3D } from "./views/3D/puzzles/Cube3D";
// export { PG3D } from "./views/3D/puzzles/PG3D";
export type {
  AlgIndexer,
  LeafCount as ExperimentalLeafCount,
  LeafIndex as ExperimentalLeafIndex,
} from "./controllers/indexer/AlgIndexer.ts";
export { SimpleAlgIndexer } from "./controllers/indexer/SimpleAlgIndexer.ts";
export { TreeAlgIndexer } from "./controllers/indexer/tree/TreeAlgIndexer.ts";
export { setTwistyDebug } from "./debug.ts";
export type { ExperimentalStickering } from "./model/props/puzzle/display/StickeringRequestProp.ts";
export type { PuzzleID } from "./model/props/puzzle/structure/PuzzleIDRequestProp.ts";
export { NO_VALUE as EXPERIMENTAL_PROP_NO_VALUE } from "./model/props/TwistyProp.ts";
export {
  type BackViewLayout,
  backViewLayouts,
} from "./model/props/viewer/BackViewProp.ts";
export type { VisualizationFormat } from "./model/props/viewer/VisualizationProp.ts";
export { TwistyAnimatedSVG as ExperimentalSVGAnimator } from "./views/2D/TwistyAnimatedSVG.ts";
export { TwistyAlgEditor } from "./views/TwistyAlgEditor/TwistyAlgEditor.ts";
export { TwistyAlgViewer } from "./views/TwistyAlgViewer.ts";
export type { TwistyPlayerConfig } from "./views/TwistyPlayer.ts";
export { TwistyPlayer } from "./views/TwistyPlayer.ts";
export { TwizzleLink } from "./views/twizzle/TwizzleLink.ts";
