import { Alg, experimentalAppendMove, Move } from "../../alg";
import type { AlgLeaf } from "../../alg/alg-nodes/AlgNode";
import { ArbitraryStringProp } from "./props/general/ArbitraryStringProp";
import { URLProp } from "./props/general/URLProp";
import { AlgProp } from "./props/puzzle/state/AlgProp";
import { AlgTransformationProp } from "./props/puzzle/state/AlgTransformationProp";
import { AnchorTransformationProp } from "./props/puzzle/state/AnchorTransformationProp";
import { CatchUpMoveProp } from "./props/puzzle/state/CatchUpMoveProp";
import { CurrentLeavesSimplifiedProp } from "./props/puzzle/state/CurrentLeavesSimplified";
import { CurrentMoveInfoProp } from "./props/puzzle/state/CurrentMoveInfoProp";
import { CurrentStateProp } from "./props/puzzle/state/CurrentStateProp";
import { IndexerConstructorProp } from "./props/puzzle/state/IndexerConstructorProp";
import { IndexerConstructorRequestProp } from "./props/puzzle/state/IndexerConstructorRequestProp";
import { IndexerProp } from "./props/puzzle/state/IndexerProp";
import { LegacyPositionProp } from "./props/puzzle/state/LegacyPositionProp";
import { NaiveMoveCountProp } from "./props/puzzle/state/NaiveMoveCountProp";
import { PuzzleAlgProp } from "./props/puzzle/state/PuzzleAlgProp";
import { SetupAnchorProp } from "./props/puzzle/state/SetupAnchorProp";
import { SetupTransformationProp } from "./props/puzzle/state/SetupTransformationProp";
import { KPuzzleProp } from "./props/puzzle/structure/KPuzzleProp";
import { PGPuzzleDescriptionStringProp } from "./props/puzzle/structure/PuzzleDescriptionProp";
import { PuzzleIDProp } from "./props/puzzle/structure/PuzzleIDProp";
import { PuzzleIDRequestProp } from "./props/puzzle/structure/PuzzleIDRequestProp";
import { PuzzleLoaderProp } from "./props/puzzle/structure/PuzzleLoaderProp";
import { CoarseTimelineInfoProp } from "./props/timeline/CoarseTimelineInfoProp";
import { DetailedTimelineInfoProp } from "./props/timeline/DetailedTimelineInfoProp";
import { PlayingInfoProp } from "./props/timeline/PlayingInfoProp";
import { TempoScaleProp } from "./props/timeline/TempoScaleProp";
import { TimestampRequestProp } from "./props/timeline/TimestampRequestProp";
import { NO_VALUE } from "./props/TwistyProp";
import { BackViewProp } from "./props/viewer/BackViewProp";
import { ButtonAppearanceProp } from "./props/viewer/ButtonAppearanceProp";
import { ControlPanelProp } from "./props/viewer/ControlPanelProp";
import { TimeRangeProp } from "./props/viewer/TimeRangeProp";
import { ViewerLinkProp } from "./props/viewer/ViewerLinkProp";
import { VisualizationFormatProp } from "./props/viewer/VisualizationProp";
import { VisualizationStrategyProp } from "./props/viewer/VisualizationStrategyProp";
import { TwistySceneModel } from "./TwistySceneModel";
import { UserVisibleErrorTracker } from "./UserVisibleErrorTracker";

export class TwistyPlayerModel {
  // TODO: incorporate error handling into the entire prop graph.
  // TODO: Make this something that can't get confused with normal props?
  userVisibleErrorTracker = new UserVisibleErrorTracker();

  // TODO: Redistribute and group props with controllers.

  // Depth 0
  alg = new AlgProp();
  backView = new BackViewProp();
  controlPanel = new ControlPanelProp();
  catchUpMove = new CatchUpMoveProp();
  indexerConstructorRequest = new IndexerConstructorRequestProp();
  playingInfo = new PlayingInfoProp();
  puzzleDescriptionRequest = new PGPuzzleDescriptionStringProp();
  puzzleIDRequest = new PuzzleIDRequestProp();
  setupAnchor = new SetupAnchorProp();
  setupAlg = new AlgProp();
  setupTransformation = new SetupTransformationProp();
  tempoScale = new TempoScaleProp();
  timestampRequest = new TimestampRequestProp();
  viewerLink = new ViewerLinkProp();
  visualizationFormat = new VisualizationFormatProp();
  // Metadata
  title = new ArbitraryStringProp();
  videoURL = new URLProp();
  competitionID = new ArbitraryStringProp();

  // Depth 1
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
    setupTransformation: this.setupTransformation,
    setupAnchor: this.setupAnchor,
    setupAlgTransformation: this.setupAlgTransformation,
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

  twistySceneModel = new TwistySceneModel(this);

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
      this.twistySceneModel.stickering.get(),
    ]);

    const isExplorer = viewerLink === "experimental-twizzle-explorer";

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

  experimentalAddAlgLeaf(
    algLeaf: AlgLeaf,
    options: {
      coalesce?: boolean;
      sliceMoves?: boolean;
      wideMoves?: boolean;
      mod?: number;
    } = {},
  ): void {
    const maybeMove = algLeaf.as(Move);
    if (maybeMove) {
      this.experimentalAddMove(maybeMove, options);
    } else {
      this.alg.set(
        (async () => {
          const alg = (await this.alg.get()).alg;
          const newAlg = alg.concat(new Alg([algLeaf]));
          this.timestampRequest.set("end");
          return newAlg;
        })(),
      );
    }
  }

  // TODO: Animate the new move.
  experimentalAddMove(
    flexibleMove: Move | string,
    options: {
      coalesce?: boolean;
      sliceMoves?: boolean;
      wideMoves?: boolean;
      mod?: number;
    } = {},
  ): void {
    const move =
      typeof flexibleMove === "string" ? new Move(flexibleMove) : flexibleMove;
    this.alg.set(
      (async () => {
        const alg = (await this.alg.get()).alg;
        const newAlg = experimentalAppendMove(alg, move, options);
        this.timestampRequest.set("end");
        this.catchUpMove.set({
          move: move,
          amount: 0,
        });
        return newAlg;
      })(),
    );
  }
}
