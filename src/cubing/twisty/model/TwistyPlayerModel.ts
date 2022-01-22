import { AlgProp } from "./props/puzzle/state/AlgProp";
import { BackgroundProp } from "./props/viewer/BackgroundProp";
import { BackViewProp } from "./props/viewer/BackViewProp";
import { ControlPanelProp } from "./props/viewer/ControlPanelProp";
import { HintFaceletProp } from "./props/puzzle/display/HintFaceletProp";
import { IndexerConstructorRequestProp } from "./props/puzzle/state/IndexerConstructorRequestProp";
import { LatitudeLimitProp } from "./props/viewer/LatitudeLimit";
import { OrbitCoordinatesRequestProp } from "./props/viewer/OrbitCoordinatesRequestProp";
import { PlayingInfoProp } from "./props/timeline/PlayingInfoProp";
import { PGPuzzleDescriptionStringProp } from "./props/puzzle/structure/PuzzleDescriptionProp";
import { PuzzleIDRequestProp } from "./props/puzzle/structure/PuzzleIDRequestProp";
import { PuzzleLoaderProp } from "./props/puzzle/structure/PuzzleLoaderProp";
import { SetupAnchorProp } from "./props/puzzle/state/SetupAnchorProp";
import { StickeringProp } from "./props/puzzle/display/StickeringProp";
import { TempoScaleProp } from "./props/timeline/TempoScaleProp";
import { TimestampRequestProp } from "./props/timeline/TimestampRequestProp";
import { URLProp } from "./props/general/URLProp";
import { ViewerLinkProp } from "./props/viewer/ViewerLinkProp";
import { VisualizationFormatProp } from "./props/viewer/VisualizationProp";
import { OrbitCoordinatesProp } from "./props/viewer/OrbitCoordinatesProp";
import { PuzzleIDProp } from "./props/puzzle/structure/PuzzleIDProp";
import { SpriteProp } from "./props/puzzle/display/SpriteProp";
import { VisualizationStrategyProp } from "./props/viewer/VisualizationStrategyProp";
import { IndexerConstructorProp } from "./props/puzzle/state/IndexerConstructorProp";
import { PuzzleAlgProp } from "./props/puzzle/state/PuzzleAlgProp";
import { AlgTransformationProp } from "./props/puzzle/state/AlgTransformationProp";
import { IndexerProp } from "./props/puzzle/state/IndexerProp";
import { AnchorTransformationProp } from "./props/puzzle/state/AnchorTransformationProp";
import { TimeRangeProp } from "./props/viewer/TimeRangeProp";
import { DetailedTimelineInfoProp } from "./props/timeline/DetailedTimelineInfoProp";
import { CoarseTimelineInfoProp } from "./props/timeline/CoarseTimelineInfoProp";
import { CurrentMoveInfoProp } from "./props/puzzle/state/CurrentMoveInfoProp";
import { ButtonAppearanceProp } from "./props/viewer/ButtonAppearanceProp";
import { CurrentLeavesSimplifiedProp } from "./props/puzzle/state/CurrentLeavesSimplified";
import { CurrentStateProp as CurrentStateProp } from "./props/puzzle/state/CurrentStateProp";
import { LegacyPositionProp } from "./props/puzzle/state/LegacyPositionProp";
import { KPuzzleProp } from "./props/puzzle/structure/KPuzzleProp";
import { UserVisibleErrorTracker } from "./UserVisibleErrorTracker";
import { CatchUpMoveProp } from "./props/puzzle/state/CatchUpMoveProp";
import { experimentalAppendMove, Move } from "../../alg";
import { NaiveMoveCountProp } from "./props/puzzle/state/NaiveMoveCountProp";
import { MovePressInputProp } from "./props/puzzle/state/MovePressInputProp";
import { FoundationDisplayProp } from "./props/puzzle/display/FoundationDisplayProp";
import { NO_VALUE } from "./props/TwistyProp";

export class TwistyPlayerModel {
  // TODO: incorporate error handling into the entire prop graph.
  // TODO: Make this something that can't get confused with normal props?
  userVisibleErrorTracker = new UserVisibleErrorTracker();

  // TODO: Redistribute and group props with controllers.

  // Depth 0
  alg = new AlgProp();
  background = new BackgroundProp();
  backView = new BackViewProp();
  controlPanel = new ControlPanelProp();
  catchUpMove = new CatchUpMoveProp();
  foundationDisplay = new FoundationDisplayProp();
  foundationStickerSpriteURL = new URLProp();
  hintFacelet = new HintFaceletProp();
  hintStickerSpriteURL = new URLProp();
  indexerConstructorRequest = new IndexerConstructorRequestProp();
  latitudeLimit = new LatitudeLimitProp();
  movePressInput = new MovePressInputProp();
  orbitCoordinatesRequest: OrbitCoordinatesRequestProp =
    new OrbitCoordinatesRequestProp();
  playingInfo = new PlayingInfoProp();
  puzzleDescriptionRequest = new PGPuzzleDescriptionStringProp();
  puzzleIDRequest = new PuzzleIDRequestProp();
  setupAnchor = new SetupAnchorProp();
  setupAlg = new AlgProp();
  stickering = new StickeringProp();
  tempoScale = new TempoScaleProp();
  timestampRequest = new TimestampRequestProp();
  viewerLink = new ViewerLinkProp();
  visualizationFormat = new VisualizationFormatProp();

  // Depth 1
  foundationStickerSprite = new SpriteProp({
    spriteURL: this.foundationStickerSpriteURL,
  });

  hintStickerSprite = new SpriteProp({
    spriteURL: this.hintStickerSpriteURL,
  });

  puzzleLoader = new PuzzleLoaderProp(
    {
      puzzleIDRequest: this.puzzleIDRequest,
      puzzleDescriptionRequest: this.puzzleDescriptionRequest,
    },
    this.userVisibleErrorTracker,
  );

  // Depth 2
  kpuzzle = new KPuzzleProp({ puzzleLoader: this.puzzleLoader });

  puzzleID = new PuzzleIDProp({ puzzleLoader: this.puzzleLoader });

  // Depth 3

  puzzleAlg = new PuzzleAlgProp({
    algWithIssues: this.alg,
    kpuzzle: this.kpuzzle,
  });

  puzzleSetupAlg = new PuzzleAlgProp({
    algWithIssues: this.setupAlg,
    kpuzzle: this.kpuzzle,
  });

  visualizationStrategy = new VisualizationStrategyProp({
    visualizationRequest: this.visualizationFormat,
    puzzleID: this.puzzleID,
  });

  // Depth 4
  indexerConstructor = new IndexerConstructorProp({
    alg: this.alg,
    puzzle: this.puzzleID,
    visualizationStrategy: this.visualizationStrategy,
    indexerConstructorRequest: this.indexerConstructorRequest,
  });

  moveCount = new NaiveMoveCountProp({ alg: this.puzzleAlg });

  orbitCoordinates = new OrbitCoordinatesProp({
    orbitCoordinatesRequest: this.orbitCoordinatesRequest,
    latitudeLimit: this.latitudeLimit,
    puzzleID: this.puzzleID,
    strategy: this.visualizationStrategy,
  });

  setupAlgTransformation = new AlgTransformationProp({
    setupAlg: this.puzzleSetupAlg,
    kpuzzle: this.kpuzzle,
  });

  // Depth 5
  indexer = new IndexerProp({
    indexerConstructor: this.indexerConstructor,
    algWithIssues: this.puzzleAlg,
    kpuzzle: this.kpuzzle,
  });

  // Depth 6
  anchorTransformation = new AnchorTransformationProp({
    setupAnchor: this.setupAnchor,
    setupTransformation: this.setupAlgTransformation,
    indexer: this.indexer,
  });

  timeRange = new TimeRangeProp({
    indexer: this.indexer,
  });

  // Depth 7
  detailedTimelineInfo: DetailedTimelineInfoProp = new DetailedTimelineInfoProp(
    {
      timestampRequest: this.timestampRequest,
      timeRange: this.timeRange,
      setupAnchor: this.setupAnchor,
    },
  );

  // Depth 8
  coarseTimelineInfo = new CoarseTimelineInfoProp({
    detailedTimelineInfo: this.detailedTimelineInfo,
    playingInfo: this.playingInfo,
  });

  currentMoveInfo = new CurrentMoveInfoProp({
    indexer: this.indexer,
    detailedTimelineInfo: this.detailedTimelineInfo,
    catchUpMove: this.catchUpMove,
  });

  // Depth 9
  // TODO: Inline Twisty3D management.
  buttonAppearance = new ButtonAppearanceProp({
    coarseTimelineInfo: this.coarseTimelineInfo,
    viewerLink: this.viewerLink,
  });

  currentLeavesSimplified = new CurrentLeavesSimplifiedProp({
    currentMoveInfo: this.currentMoveInfo,
  });

  // Depth 10
  currentState = new CurrentStateProp({
    anchoredStart: this.anchorTransformation,
    currentLeavesSimplified: this.currentLeavesSimplified,
    indexer: this.indexer,
  });

  // Depth 11
  legacyPosition = new LegacyPositionProp({
    currentMoveInfo: this.currentMoveInfo,
    state: this.currentState,
  });

  public async twizzleLink(): Promise<string> {
    const [
      viewerLink,
      puzzleID,
      puzzleDescription,
      alg,
      setup,
      anchor,
      experimentalStickering,
    ] = await Promise.all([
      this.viewerLink.get(),
      this.puzzleID.get(),
      this.puzzleDescriptionRequest.get(),
      this.alg.get(),
      this.setupAlg.get(),
      this.setupAnchor.get(),
      this.stickering.get(),
    ]);

    const isExplorer = viewerLink === "experimental-twizzle-explorer";

    console.log({ isExplorer, viewerLink });

    const url = new URL(
      `https://alpha.twizzle.net/${isExplorer ? "explore" : "edit"}/`,
    );

    if (!alg.alg.experimentalIsEmpty()) {
      url.searchParams.set("alg", alg.alg.toString());
    }
    if (!setup.alg.experimentalIsEmpty()) {
      url.searchParams.set("setup-alg", setup.alg.toString());
    }
    if (anchor !== "start") {
      url.searchParams.set("setup-anchor", anchor);
    }
    if (experimentalStickering !== "full") {
      url.searchParams.set("experimental-stickering", experimentalStickering);
    }
    if (isExplorer && puzzleDescription !== NO_VALUE) {
      url.searchParams.set("puzzle-description", puzzleDescription);
    } else if (puzzleID !== "3x3x3") {
      url.searchParams.set("puzzle", puzzleID);
    }
    return url.toString();
  }

  // TODO: Animate the new move.
  experimentalAddMove(
    flexibleMove: Move | string,
    options: { coalesce?: boolean; mod?: number } = {},
  ): void {
    const move =
      typeof flexibleMove === "string" ? new Move(flexibleMove) : flexibleMove;
    (async () => {
      const alg = (await this.alg.get()).alg;
      const newAlg = experimentalAppendMove(alg, move, {
        coalesce: options?.coalesce,
        mod: options?.mod,
      });
      this.alg.set(newAlg);
      this.timestampRequest.set("end");
      this.catchUpMove.set({
        move: move,
        amount: 0,
      });
    })();
  }
}
