/**
 * For a walkthrough, see:
 *
 * https://js.cubing.net/cubing/twisty/
 *
 * @packageDocumentation
 */

export { setTwistyDebug } from "./debug";

export { TwistyPlayer } from "./views/TwistyPlayer";
export { TwistyAlgViewer } from "./views/TwistyAlgViewer";
export { TwistyAlgEditor } from "./views/TwistyAlgEditor/TwistyAlgEditor";
export type { TwistyPlayerConfig } from "./views/TwistyPlayer";

export { NO_VALUE as EXPERIMENTAL_PROP_NO_VALUE } from "./model/props/TwistyProp";
export type { ExperimentalStickering } from "./model/props/puzzle/display/StickeringRequestProp";
export {
  type BackViewLayout,
  backViewLayouts,
} from "./model/props/viewer/BackViewProp";
export type { PuzzleID } from "./model/props/puzzle/structure/PuzzleIDRequestProp";
export type { VisualizationFormat } from "./model/props/viewer/VisualizationProp";

export { TwizzleLink } from "./views/twizzle/TwizzleLink";

export type { MillisecondTimestamp as ExperimentalMillisecondTimestamp } from "./controllers/AnimationTypes";

// Older
// export { Cube3D } from "./views/3D/puzzles/Cube3D";
// export { PG3D } from "./views/3D/puzzles/PG3D";
export type { AlgIndexer } from "./controllers/indexer/AlgIndexer";
export { SimpleAlgIndexer } from "./controllers/indexer/SimpleAlgIndexer";
export { TreeAlgIndexer } from "./controllers/indexer/tree/TreeAlgIndexer";

export { TwistyAnimatedSVG as ExperimentalSVGAnimator } from "./views/2D/TwistyAnimatedSVG";
