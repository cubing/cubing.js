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
import { AnchoredStartProp } from "./props/puzzle/state/AnchoredStartProp";
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
  algProp = new AlgProp();
  backgroundProp = new BackgroundProp();
  backViewProp = new BackViewProp();
  controlPanelProp = new ControlPanelProp();
  catchUpMoveProp = new CatchUpMoveProp();
  foundationDisplayProp = new FoundationDisplayProp();
  foundationStickerSpriteURL = new URLProp();
  hintFaceletProp = new HintFaceletProp();
  hintStickerSpriteURL = new URLProp();
  indexerConstructorRequestProp = new IndexerConstructorRequestProp();
  latitudeLimitProp = new LatitudeLimitProp();
  movePressInputProp = new MovePressInputProp();
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

  puzzleLoaderProp = new PuzzleLoaderProp(
    {
      puzzleIDRequest: this.puzzleIDRequestProp,
      puzzleDescriptionRequest: this.puzzleDescriptionRequestProp,
    },
    this.userVisibleErrorTracker,
  );

  // Depth 2
  kpuzzleProp = new KPuzzleProp({ puzzleLoader: this.puzzleLoaderProp });

  puzzleIDProp = new PuzzleIDProp({ puzzleLoader: this.puzzleLoaderProp });

  // Depth 3

  puzzleAlgProp = new PuzzleAlgProp({
    algWithIssues: this.algProp,
    kpuzzle: this.kpuzzleProp,
  });

  puzzleSetupProp = new PuzzleAlgProp({
    algWithIssues: this.setupProp,
    kpuzzle: this.kpuzzleProp,
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

  moveCountProp = new NaiveMoveCountProp({ alg: this.puzzleAlgProp });

  orbitCoordinatesProp = new OrbitCoordinatesProp({
    orbitCoordinatesRequest: this.orbitCoordinatesRequestProp,
    latitudeLimit: this.latitudeLimitProp,
    puzzleID: this.puzzleIDProp,
    strategy: this.visualizationStrategyProp,
  });

  setupTransformationProp = new AlgTransformationProp({
    alg: this.puzzleSetupProp,
    kpuzzle: this.kpuzzleProp,
  });

  // Depth 5
  indexerProp = new IndexerProp({
    indexerConstructor: this.indexerConstructorProp,
    algWithIssues: this.puzzleAlgProp,
    kpuzzle: this.kpuzzleProp,
  });

  // Depth 6
  anchoredStartProp = new AnchoredStartProp({
    setupAnchor: this.setupAnchorProp,
    setupTransformation: this.setupTransformationProp,
    indexer: this.indexerProp,
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

  currentMoveInfoProp = new CurrentMoveInfoProp({
    indexer: this.indexerProp,
    detailedTimelineInfo: this.detailedTimelineInfoProp,
    catchUpMove: this.catchUpMoveProp,
  });

  // Depth 9
  // TODO: Inline Twisty3D management.
  buttonAppearanceProp = new ButtonAppearanceProp({
    coarseTimelineInfo: this.coarseTimelineInfoProp,
    viewerLink: this.viewerLinkProp,
  });

  currentLeavesSimplifiedProp = new CurrentLeavesSimplifiedProp({
    currentMoveInfo: this.currentMoveInfoProp,
  });

  // Depth 10
  currentStateProp = new CurrentStateProp({
    anchoredStart: this.anchoredStartProp,
    currentLeavesSimplified: this.currentLeavesSimplifiedProp,
    indexer: this.indexerProp,
  });

  // Depth 11
  legacyPositionProp = new LegacyPositionProp({
    currentMoveInfo: this.currentMoveInfoProp,
    state: this.currentStateProp,
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
      this.viewerLinkProp.get(),
      this.puzzleIDProp.get(),
      this.puzzleDescriptionRequestProp.get(),
      this.algProp.get(),
      this.setupProp.get(),
      this.setupAnchorProp.get(),
      this.stickeringProp.get(),
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
      const alg = (await this.algProp.get()).alg;
      const newAlg = experimentalAppendMove(alg, move, {
        coalesce: options?.coalesce,
        mod: options?.mod,
      });
      this.algProp.set(newAlg);
      this.timestampRequestProp.set("end");
      this.catchUpMoveProp.set({
        move: move,
        amount: 0,
      });
    })();
  }
}
