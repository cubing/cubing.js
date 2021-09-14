import type { Alg } from "../../alg";
import type { PuzzleDescriptionString } from "../../puzzle-geometry/PGPuzzles";
import type { ExperimentalStickering } from "../../twisty";
import type { BackgroundThemeWithAuto } from "../model/depth-0/BackgroundProp";
import type { BackViewLayoutWithAuto } from "../model/depth-0/BackViewProp";
import type { ControlPanelThemeWithAuto } from "../model/depth-0/ControlPanelProp";
import type { HintFaceletStyleWithAuto } from "../model/depth-0/HintFaceletProp";
import type { IndexerStrategyName } from "../model/depth-0/IndexerConstructorRequestProp";
import type { TimestampRequest } from "../model/depth-0/TimestampRequestProp";
import type { ViewerLinkPageWithAuto } from "../model/depth-0/ViewerLinkProp";
import type { VisualizationFormatWithAuto } from "../model/depth-0/VisualizationProp";
import { TwistyPlayerModel } from "../model/TwistyPlayerModel";
import { ManagedCustomElement } from "../old/dom/element/ManagedCustomElement";
import type { PuzzleID, SetupToLocation } from "../old/dom/TwistyPlayerConfig";

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

  set puzzleID(puzzleID: PuzzleID) { this.experimentalModel.puzzleIDRequestProp.set(puzzleID); }
  get puzzleID(): never { throw err("puzzle"); }

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
  get controlPanel(): never { throw new Error( "Cannot get `.controlPanel` directly from a `TwistyPlayer`."); }

  set visualization(visualizationFormat: VisualizationFormatWithAuto) { this.experimentalModel.visualizationFormatProp.set(visualizationFormat); }
  get visualization(): never { throw new Error( "Cannot get `.visualization` directly from a `TwistyPlayer`."); }

  set viewerLink(viewerLinkPage: ViewerLinkPageWithAuto) { this.experimentalModel.viewerLinkProp.set(viewerLinkPage); }
  get viewerLink(): never { throw err("viewerLink"); }

  set cameraLatitude(latitude: number) { this.experimentalModel.orbitCoordinatesRequestProp.set({ latitude }); }
  get cameraLatitude(): never { throw new Error( "Cannot get `.cameraLatitude` directly from a `TwistyPlayer`."); }

  set cameraLongitude(longitude: number) { this.experimentalModel.orbitCoordinatesRequestProp.set({ longitude }); }
  get cameraLongitude(): never { throw new Error( "Cannot get `.cameraLongitude` directly from a `TwistyPlayer`."); }

  set cameraDistance(distance: number) { this.experimentalModel.orbitCoordinatesRequestProp.set({ distance }); }
  get cameraDistance(): never { throw new Error( "Cannot get `.cameraDistance` directly from a `TwistyPlayer`."); }

  set cameraLatitudeLimit(latitudeLimit: number) { this.experimentalModel.latitudeLimitProp.set(latitudeLimit); }
  get cameraLatitudeLimit(): never { throw new Error( "Cannot get `.cameraLatitudeLimit` directly from a `TwistyPlayer`."); }

  set indexer(indexer: IndexerStrategyName) { this.experimentalModel.indexerConstructorRequestProp.set(indexer); }
  get indexer(): never { throw err("indexer"); }

  set tempoScale(newTempoScale: number) { this.experimentalModel.tempoScaleProp.set(newTempoScale); }
  get tempoScale(): never { throw err("tempoScale"); }

  set experimentalSprite(url: string | URL) { this.experimentalModel.foundationStickerSpriteURL.set(url); }
  get experimentalSprite(): never { throw err("experimentalSprite"); }

  set experimentalHintSprite(url: string | URL) { this.experimentalModel.hintStickerSpriteURL.set(url); }
  get experimentalHintSprite(): never { throw err("experimentalHintSprite"); }
}
