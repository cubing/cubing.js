import { AlgProp, SetupAlgProp } from "./depth-0/AlgProp";
import { BackgroundProp } from "./depth-0/BackgroundProp";
import { BackViewProp } from "./depth-0/BackViewProp";
import { ControlPanelProp } from "./depth-0/ControlPanelProp";
import { HintFaceletProp } from "./depth-0/HintFaceletProp";
import { IndexerConstructorRequestProp } from "./depth-0/IndexerConstructorRequestProp";
import { LatitudeLimitProp } from "./depth-0/LatitudeLimit";
import { OrbitCoordinatesRequestProp } from "./depth-0/OrbitCoordinatesRequestProp";
import { PlayingInfoProp } from "./depth-0/PlayingInfoProp";
import { PuzzleProp } from "./depth-0/PuzzleProp";
import { SetupAnchorProp } from "./depth-0/SetupAnchorProp";
import { StickeringProp } from "./depth-0/StickeringProp";
import { TempoScaleProp } from "./depth-0/TempoScaleProp";
import { TimestampRequestProp } from "./depth-0/TimestampRequestProp";
import { ViewerLinkProp } from "./depth-0/ViewerLinkProp";
import { VisualizationFormatProp } from "./depth-0/VisualizationProp";
import { OrbitCoordinatesProp } from "./depth-1/OrbitCoordinatesProp";
import { PuzzleDefProp } from "./depth-1/PuzzleDefProp";
import { VisualizationStrategyProp } from "./depth-1/VisualizationStrategyProp";
import { IndexerConstructorProp } from "./depth-2/IndexerConstructorProp";
import { PuzzleAlgProp } from "./depth-2/PuzzleAlgProp";
import { AlgTransformationProp } from "./depth-3/AlgTransformationProp";
import { IndexerProp } from "./depth-3/IndexerProp";
import { AnchoredStartProp } from "./depth-4/AnchoredStartProp";
import { TimeRangeProp } from "./depth-4/TimeRangeProp";
import { DetailedTimelineInfoProp } from "./depth-5/DetailedTimelineInfoProp";
import { CoarseTimelineInfoProp } from "./depth-6/CoarseTimelineInfoProp";
import { CurrentLeavesProp } from "./depth-6/CurrentLeavesProp";
import { ButtonAppearanceProp } from "./depth-7/ButtonAppearanceProp";
import { CurrentTransformationProp } from "./depth-7/CurrentTransformationProp";
import { LegacyPositionProp } from "./depth-8/LegacyPositionProp";

export class TwistyPlayerModel {
  // TODO: Redistribute and group props with controllers.

  // Depth 0
  algProp = new AlgProp();
  backgroundProp = new BackgroundProp();
  backViewProp = new BackViewProp();
  controlPanelProp = new ControlPanelProp();
  hintFaceletProp = new HintFaceletProp();
  indexerConstructorRequestProp = new IndexerConstructorRequestProp();

  latitudeLimitProp = new LatitudeLimitProp();
  orbitCoordinatesRequestProp: OrbitCoordinatesRequestProp =
    new OrbitCoordinatesRequestProp();

  playingInfoProp = new PlayingInfoProp();
  puzzleProp = new PuzzleProp();
  setupAnchorProp = new SetupAnchorProp();
  setupProp = new SetupAlgProp();
  stickeringProp = new StickeringProp();
  tempoScaleProp = new TempoScaleProp();
  timestampRequestProp = new TimestampRequestProp();
  viewerLinkProp = new ViewerLinkProp();
  visualizationFormatProp = new VisualizationFormatProp();

  // Depth 1
  visualizationStrategyProp = new VisualizationStrategyProp({
    visualizationRequest: this.visualizationFormatProp,
    puzzleID: this.puzzleProp,
  });

  orbitCoordinatesProp = new OrbitCoordinatesProp({
    orbitCoordinatesRequest: this.orbitCoordinatesRequestProp,
    latitudeLimit: this.latitudeLimitProp,
  });

  puzzleDefProp = new PuzzleDefProp({ puzzle: this.puzzleProp });

  // Depth 2
  indexerConstructorProp = new IndexerConstructorProp({
    alg: this.algProp,
    puzzle: this.puzzleProp,
    visualizationStrategy: this.visualizationStrategyProp,
    indexerConstructorRequest: this.indexerConstructorRequestProp,
  });

  puzzleAlgProp = new PuzzleAlgProp({
    algWithIssues: this.algProp,
    puzzleDef: this.puzzleDefProp,
  });

  puzzleSetupProp = new PuzzleAlgProp({
    algWithIssues: this.setupProp,
    puzzleDef: this.puzzleDefProp,
  });

  // Depth 3
  indexerProp = new IndexerProp({
    indexerConstructor: this.indexerConstructorProp,
    algWithIssues: this.puzzleAlgProp,
    def: this.puzzleDefProp,
  });

  setupTransformationProp = new AlgTransformationProp({
    alg: this.puzzleSetupProp,
    def: this.puzzleDefProp,
  });

  // Depth 4
  anchoredStartProp = new AnchoredStartProp({
    setupAnchor: this.setupAnchorProp,
    setupTransformation: this.setupTransformationProp,
    indexer: this.indexerProp,
    def: this.puzzleDefProp,
  });

  timeRangeProp = new TimeRangeProp({
    indexer: this.indexerProp,
  });

  // Depth 5
  detailedTimelineInfoProp: DetailedTimelineInfoProp =
    new DetailedTimelineInfoProp({
      timestampRequest: this.timestampRequestProp,
      timeRange: this.timeRangeProp,
      setupAnchor: this.setupAnchorProp,
    });

  // Depth 6
  currentLeavesProp = new CurrentLeavesProp({
    indexer: this.indexerProp,
    detailedTimelineInfo: this.detailedTimelineInfoProp,
  });

  coarseTimelineInfoProp = new CoarseTimelineInfoProp({
    detailedTimelineInfo: this.detailedTimelineInfoProp,
    playingInfo: this.playingInfoProp,
  });

  // Depth 7
  // TODO: Inline Twisty3D management.
  buttonAppearanceProp = new ButtonAppearanceProp({
    coarseTimelineInfo: this.coarseTimelineInfoProp,
    viewerLink: this.viewerLinkProp,
  });

  currentTransformationProp = new CurrentTransformationProp({
    anchoredStart: this.anchoredStartProp,
    currentMoveInfo: this.currentLeavesProp,
    indexer: this.indexerProp,
    def: this.puzzleDefProp,
  });

  // Depth 8
  legacyPositionProp = new LegacyPositionProp({
    currentMoveInfo: this.currentLeavesProp,
    transformation: this.currentTransformationProp,
  });

  public async twizzleLink(): Promise<string> {
    const url = new URL("https://alpha.twizzle.net/edit/");

    const [puzzle, alg, setup, anchor] = await Promise.all([
      this.puzzleProp.get(),
      this.algProp.get(),
      this.setupProp.get(),
      this.setupAnchorProp.get(),
    ]);

    if (!alg.alg.experimentalIsEmpty()) {
      url.searchParams.set("alg", alg.alg.toString());
    }
    if (!setup.alg.experimentalIsEmpty()) {
      url.searchParams.set("experimental-setup-alg", setup.toString());
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
