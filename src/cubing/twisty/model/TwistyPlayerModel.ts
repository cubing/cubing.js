import { AlgProp } from "./depth-0/AlgProp";
import { BackgroundProp } from "./depth-0/BackgroundProp";
import { BackViewProp } from "./depth-0/BackViewProp";
import { ControlPanelProp } from "./depth-0/ControlPanelProp";
import { HintFaceletProp } from "./depth-0/HintFaceletProp";
import { IndexerConstructorRequestProp } from "./depth-0/IndexerConstructorRequestProp";
import { LatitudeLimitProp } from "./depth-0/LatitudeLimit";
import { OrbitCoordinatesRequestProp } from "./depth-0/OrbitCoordinatesRequestProp";
import { PlayingInfoProp } from "./depth-0/PlayingInfoProp";
import { PGPuzzleDescriptionStringProp } from "./depth-0/PuzzleDescriptionProp";
import { PuzzleIDRequestProp } from "./depth-0/PuzzleIDRequestProp";
import { PuzzleLoaderProp } from "./depth-1/PuzzleLoaderProp";
import { SetupAnchorProp } from "./depth-0/SetupAnchorProp";
import { StickeringProp } from "./depth-0/StickeringProp";
import { TempoScaleProp } from "./depth-0/TempoScaleProp";
import { TimestampRequestProp } from "./depth-0/TimestampRequestProp";
import { URLProp } from "./depth-0/URLProp";
import { ViewerLinkProp } from "./depth-0/ViewerLinkProp";
import { VisualizationFormatProp } from "./depth-0/VisualizationProp";
import { OrbitCoordinatesProp } from "./depth-3/OrbitCoordinatesProp";
import { PuzzleIDProp } from "./depth-2/PuzzleIDProp";
import { SpriteProp } from "./depth-1/SpriteProp";
import { VisualizationStrategyProp } from "./depth-3/VisualizationStrategyProp";
import { IndexerConstructorProp } from "./depth-4/IndexerConstructorProp";
import { PuzzleAlgProp } from "./depth-3/PuzzleAlgProp";
import { AlgTransformationProp } from "./depth-4/AlgTransformationProp";
import { IndexerProp } from "./depth-5/IndexerProp";
import { AnchoredStartProp } from "./depth-6/AnchoredStartProp";
import { TimeRangeProp } from "./depth-6/TimeRangeProp";
import { DetailedTimelineInfoProp } from "./depth-7/DetailedTimelineInfoProp";
import { CoarseTimelineInfoProp } from "./depth-8/CoarseTimelineInfoProp";
import { CurrentLeavesProp } from "./depth-8/CurrentLeavesProp";
import { ButtonAppearanceProp } from "./depth-9/ButtonAppearanceProp";
import { CurrentLeavesSimplifiedProp } from "./depth-9/CurrentLeavesSimplified";
import { CurrentTransformationProp } from "./depth-10/CurrentTransformationProp";
import { LegacyPositionProp } from "./depth-11/LegacyPositionProp";
import { PuzzleDefProp } from "./depth-2/PuzzleDefProp";

export class TwistyPlayerModel {
  // TODO: Redistribute and group props with controllers.

  // Depth 0
  algProp = new AlgProp();
  backgroundProp = new BackgroundProp();
  backViewProp = new BackViewProp();
  controlPanelProp = new ControlPanelProp();
  foundationStickerSpriteURL = new URLProp();
  hintFaceletProp = new HintFaceletProp();
  hintStickerSpriteURL = new URLProp();
  indexerConstructorRequestProp = new IndexerConstructorRequestProp();
  latitudeLimitProp = new LatitudeLimitProp();
  orbitCoordinatesRequestProp: OrbitCoordinatesRequestProp =
    new OrbitCoordinatesRequestProp();

  playingInfoProp = new PlayingInfoProp();
  puzzleDescriptionRequestProp = new PGPuzzleDescriptionStringProp();
  puzzleIDRequestProp = new PuzzleIDRequestProp();
  setupAnchorProp = new SetupAnchorProp();
  setupProp = new AlgProp();
  stickeringProp = new StickeringProp();
  tempoScaleProp = new TempoScaleProp();
  timestampRequestProp = new TimestampRequestProp();
  viewerLinkProp = new ViewerLinkProp();
  visualizationFormatProp = new VisualizationFormatProp();

  // Depth 1
  foundationStickerSprite = new SpriteProp({
    spriteURL: this.foundationStickerSpriteURL,
  });

  hintStickerSprite = new SpriteProp({
    spriteURL: this.hintStickerSpriteURL,
  });

  puzzleLoaderProp = new PuzzleLoaderProp({
    puzzleIDRequest: this.puzzleIDRequestProp,
    puzzleDescriptionRequest: this.puzzleDescriptionRequestProp,
  });

  // Depth 2
  puzzleDefProp = new PuzzleDefProp({ puzzleLoader: this.puzzleLoaderProp });

  puzzleIDProp = new PuzzleIDProp({ puzzleLoader: this.puzzleLoaderProp });

  // Depth 3

  orbitCoordinatesProp = new OrbitCoordinatesProp({
    orbitCoordinatesRequest: this.orbitCoordinatesRequestProp,
    latitudeLimit: this.latitudeLimitProp,
    puzzleID: this.puzzleIDProp,
  });

  puzzleAlgProp = new PuzzleAlgProp({
    algWithIssues: this.algProp,
    puzzleDef: this.puzzleDefProp,
  });

  puzzleSetupProp = new PuzzleAlgProp({
    algWithIssues: this.setupProp,
    puzzleDef: this.puzzleDefProp,
  });

  visualizationStrategyProp = new VisualizationStrategyProp({
    visualizationRequest: this.visualizationFormatProp,
    puzzleID: this.puzzleIDProp,
  });

  // Depth 4
  indexerConstructorProp = new IndexerConstructorProp({
    alg: this.algProp,
    puzzle: this.puzzleIDProp,
    visualizationStrategy: this.visualizationStrategyProp,
    indexerConstructorRequest: this.indexerConstructorRequestProp,
  });

  setupTransformationProp = new AlgTransformationProp({
    alg: this.puzzleSetupProp,
    def: this.puzzleDefProp,
  });

  // Depth 5
  indexerProp = new IndexerProp({
    indexerConstructor: this.indexerConstructorProp,
    algWithIssues: this.puzzleAlgProp,
    def: this.puzzleDefProp,
  });

  // Depth 6
  anchoredStartProp = new AnchoredStartProp({
    setupAnchor: this.setupAnchorProp,
    setupTransformation: this.setupTransformationProp,
    indexer: this.indexerProp,
    def: this.puzzleDefProp,
  });

  timeRangeProp = new TimeRangeProp({
    indexer: this.indexerProp,
  });

  // Depth 7
  detailedTimelineInfoProp: DetailedTimelineInfoProp =
    new DetailedTimelineInfoProp({
      timestampRequest: this.timestampRequestProp,
      timeRange: this.timeRangeProp,
      setupAnchor: this.setupAnchorProp,
    });

  // Depth 8
  coarseTimelineInfoProp = new CoarseTimelineInfoProp({
    detailedTimelineInfo: this.detailedTimelineInfoProp,
    playingInfo: this.playingInfoProp,
  });

  currentLeavesProp = new CurrentLeavesProp({
    indexer: this.indexerProp,
    detailedTimelineInfo: this.detailedTimelineInfoProp,
  });

  // Depth 9
  // TODO: Inline Twisty3D management.
  buttonAppearanceProp = new ButtonAppearanceProp({
    coarseTimelineInfo: this.coarseTimelineInfoProp,
    viewerLink: this.viewerLinkProp,
  });

  currentLeavesSimplifiedProp = new CurrentLeavesSimplifiedProp({
    currentMoveInfo: this.currentLeavesProp,
  });

  // Depth 10
  currentTransformationProp = new CurrentTransformationProp({
    anchoredStart: this.anchoredStartProp,
    currentLeavesSimplified: this.currentLeavesSimplifiedProp,
    indexer: this.indexerProp,
    def: this.puzzleDefProp,
  });

  // Depth 11
  legacyPositionProp = new LegacyPositionProp({
    currentMoveInfo: this.currentLeavesProp,
    transformation: this.currentTransformationProp,
  });

  public async twizzleLink(): Promise<string> {
    const url = new URL("https://alpha.twizzle.net/edit/");

    const [puzzle, alg, setup, anchor] = await Promise.all([
      this.puzzleIDProp.get(),
      this.algProp.get(),
      this.setupProp.get(),
      this.setupAnchorProp.get(),
    ]);

    if (!alg.alg.experimentalIsEmpty()) {
      url.searchParams.set("alg", alg.alg.toString());
    }
    if (!setup.alg.experimentalIsEmpty()) {
      url.searchParams.set("experimental-setup-alg", setup.alg.toString());
    }
    if (anchor !== "start") {
      url.searchParams.set("experimental-setup-anchor", anchor);
    }
    // if (this.experimentalStickering !== "full") {
    //   url.searchParams.set(
    //     "experimental-stickering",
    //     this.experimentalStickering,
    //   );
    if (puzzle !== "3x3x3") {
      url.searchParams.set("puzzle", puzzle);
    }
    return url.toString();
  }
}
