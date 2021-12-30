import type { Alg } from "../../alg";
import type { PuzzleDescriptionString } from "../../puzzle-geometry/PGPuzzles";
import type { ExperimentalStickering, PuzzleID } from "../../twisty";
import type { BackgroundThemeWithAuto } from "../model/props/viewer/BackgroundProp";
import type { BackViewLayoutWithAuto } from "../model/props/viewer/BackViewProp";
import type { ControlPanelThemeWithAuto } from "../model/props/viewer/ControlPanelProp";
import type { HintFaceletStyleWithAuto } from "../model/props/puzzle/display/HintFaceletProp";
import type { IndexerStrategyName } from "../model/props/puzzle/state/IndexerConstructorRequestProp";
import type { TimestampRequest } from "../model/props/timeline/TimestampRequestProp";
import type { ViewerLinkPageWithAuto } from "../model/props/viewer/ViewerLinkProp";
import type { VisualizationFormatWithAuto } from "../model/props/viewer/VisualizationProp";
import { TwistyPlayerModel } from "../model/TwistyPlayerModel";
import type { MillisecondTimestamp } from "../old/animation/cursor/CursorTypes";
import { ManagedCustomElement } from "../old/dom/element/ManagedCustomElement";
import type { MovePressInput } from "../model/props/puzzle/state/MovePressInputProp";
import type { SetupToLocation } from "../model/props/puzzle/state/SetupAnchorProp";

function err(propName: string): Error {
  return new Error(
    `Cannot get \`.${propName}\` directly from a \`TwistyPlayer\`.`,
  );
}

// prettier-ignore
export abstract class TwistyPlayerSettable extends ManagedCustomElement {
  experimentalModel: TwistyPlayerModel = new TwistyPlayerModel();

  set alg(newAlg: Alg | string) { this.experimentalModel.algProp.set(newAlg); }
  get alg(): never { throw err("alg"); }

  set experimentalSetupAlg(newSetup: Alg | string) { this.experimentalModel.setupProp.set(newSetup); }
  get experimentalSetupAlg(): never { throw err("setup"); }

  set experimentalSetupAnchor(anchor: SetupToLocation) { this.experimentalModel.setupAnchorProp.set(anchor); }
  get experimentalSetupAnchor(): never { throw err("anchor"); }

  set puzzle(puzzleID: PuzzleID) { this.experimentalModel.puzzleIDRequestProp.set(puzzleID); }
  get puzzle(): never { throw err("puzzle"); }

  set experimentalPuzzleDescription(puzzleDescription: PuzzleDescriptionString) { this.experimentalModel.puzzleDescriptionRequestProp.set(puzzleDescription); }
  get experimentalPuzzleDescription(): never { throw err("experimentalPuzzleDescription"); }

  set timestamp(timestamp: TimestampRequest) { this.experimentalModel.timestampRequestProp.set(timestamp); }
  get timestamp(): never { throw err("timestamp"); }

  set hintFacelets(hintFaceletStyle: HintFaceletStyleWithAuto) { this.experimentalModel.hintFaceletProp.set(hintFaceletStyle); }
  get hintFacelets(): never { throw err("hintFacelets"); }

  set experimentalStickering(stickering: ExperimentalStickering) { this.experimentalModel.stickeringProp.set(stickering); }
  get experimentalStickering(): never { throw err("stickering"); }

  set backView(backView: BackViewLayoutWithAuto) { this.experimentalModel.backViewProp.set(backView); }
  get backView(): never { throw err("backView"); }

  set background(backgroundTheme: BackgroundThemeWithAuto) { this.experimentalModel.backgroundProp.set(backgroundTheme); }
  get background(): never { throw err("background"); }

  set controlPanel(newControlPanel: ControlPanelThemeWithAuto) { this.experimentalModel.controlPanelProp.set(newControlPanel); }
  get controlPanel(): never { throw err("controlPanel"); }

  set visualization(visualizationFormat: VisualizationFormatWithAuto) { this.experimentalModel.visualizationFormatProp.set(visualizationFormat); }
  get visualization(): never { throw err("visualization"); }

  set viewerLink(viewerLinkPage: ViewerLinkPageWithAuto) { this.experimentalModel.viewerLinkProp.set(viewerLinkPage); }
  get viewerLink(): never { throw err("viewerLink"); }

  set experimentalMovePressInput(movePressInput: MovePressInput) { this.experimentalModel.movePressInputProp.set(movePressInput); }
  get experimentalMovePressInput(): never { throw err("experimentalMovePressInput"); }

  set cameraLatitude(latitude: number) { this.experimentalModel.orbitCoordinatesRequestProp.set({ latitude }); }
  get cameraLatitude(): never { throw err("cameraLatitude"); }

  set cameraLongitude(longitude: number) { this.experimentalModel.orbitCoordinatesRequestProp.set({ longitude }); }
  get cameraLongitude(): never { throw err("cameraLongitude"); }

  set cameraDistance(distance: number) { this.experimentalModel.orbitCoordinatesRequestProp.set({ distance }); }
  get cameraDistance(): never { throw err("cameraDistance"); }

  set cameraLatitudeLimit(latitudeLimit: number) { this.experimentalModel.latitudeLimitProp.set(latitudeLimit); }
  get cameraLatitudeLimit(): never { throw err("cameraLatitudeLimit"); }

  set indexer(indexer: IndexerStrategyName) { this.experimentalModel.indexerConstructorRequestProp.set(indexer); }
  get indexer(): never { throw err("indexer"); }

  set tempoScale(newTempoScale: number) { this.experimentalModel.tempoScaleProp.set(newTempoScale); }
  get tempoScale(): never { throw err("tempoScale"); }

  set experimentalSprite(url: string | URL) { this.experimentalModel.foundationStickerSpriteURL.set(url); }
  get experimentalSprite(): never { throw err("experimentalSprite"); }

  set experimentalHintSprite(url: string | URL) { this.experimentalModel.hintStickerSpriteURL.set(url); }
  get experimentalHintSprite(): never { throw err("experimentalHintSprite"); }

  experimentalGet = new ExperimentalGetters(this.experimentalModel)
}

class ExperimentalGetters {
  constructor(private model: TwistyPlayerModel) {}

  async alg(): Promise<Alg> {
    return (await this.model.algProp.get()).alg;
  }

  async setupAlg(): Promise<Alg> {
    return (await this.model.setupProp.get()).alg;
  }

  puzzleID(): Promise<PuzzleID> {
    return this.model.puzzleIDProp.get();
  }

  async timestamp(): Promise<MillisecondTimestamp> {
    return (await this.model.detailedTimelineInfoProp.get()).timestamp;
  }
}
