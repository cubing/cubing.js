import type { ExperimentalStickering } from "../../..";
import type { Alg } from "../../../../alg";
import type { MillisecondTimestamp } from "../../../animation/cursor/CursorTypes";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import type { PuzzleID, SetupToLocation } from "../../TwistyPlayerConfig";
import type { BackgroundThemeWithAuto } from "../props/depth-0/BackgroundProp";
import type { BackViewLayoutWithAuto } from "../props/depth-0/BackViewProp";
import type { ControlPanelThemeWithAuto } from "../props/depth-0/ControlPanelProp";
import type { HintFaceletStyleWithAuto } from "../props/depth-0/HintFaceletProp";
import type { IndexerStrategyName } from "../props/depth-0/IndexerConstructorRequestProp";
import type { ViewerLinkPageWithAuto } from "../props/depth-0/ViewerLinkProp";
import type { VisualizationFormatWithAuto } from "../props/depth-0/VisualizationProp";
import { TwistyPlayerModel } from "../props/TwistyPlayerModel";

function err(propName: string): Error {
  return new Error(
    `Cannot get \`.${propName}\` directly from a \`TwistyPlayer\`.`,
  );
}

// prettier-ignore
export abstract class TwistyPlayerSettable extends ManagedCustomElement {
  model: TwistyPlayerModel = new TwistyPlayerModel();

  set alg(newAlg: Alg | string) { this.model.algProp.set(newAlg); }
  get alg(): never { throw err("alg"); }

  set experimentalSetupAlg(newSetup: Alg | string) { this.model.setupProp.set(newSetup); }
  get experimentalSetupAlg(): never { throw err("setup"); }

  set experimentalSetupAnchor(anchor: SetupToLocation) { this.model.setupAnchorProp.set(anchor); }
  get experimentalSetupAnchor(): never { throw err("anchor"); }

  set puzzle(puzzleID: PuzzleID) { this.model.puzzleProp.set(puzzleID); }
  get puzzle(): never { throw err("puzzle"); }

  set timestamp(timestamp: MillisecondTimestamp) { this.model.timestampRequestProp.set(timestamp); }
  get timestamp(): never { throw err("timestamp"); }

  set hintFacelets(hintFaceletStyle: HintFaceletStyleWithAuto) { this.model.hintFaceletProp.set(hintFaceletStyle); }
  get hintFacelets(): never { throw err("hintFacelets"); }

  set experimentalStickering(stickering: ExperimentalStickering) { this.model.stickeringProp.set(stickering); }
  get experimentalStickering(): never { throw err("stickering"); }

  set backView(backView: BackViewLayoutWithAuto) { this.model.backViewProp.set(backView); }
  get backView(): never { throw err("backView"); }

  set background(backgroundTheme: BackgroundThemeWithAuto) { this.model.backgroundProp.set(backgroundTheme); }
  get background(): never { throw err("background"); }

  set controlPanel(newControlPanel: ControlPanelThemeWithAuto) { this.model.controlPanelProp.set(newControlPanel); }
  get controlPanel(): never { throw new Error( "Cannot get `.controlPanel` directly from a `TwistyPlayer`."); }

  set visualization(visualizationFormat: VisualizationFormatWithAuto) { this.model.visualizationFormatProp.set(visualizationFormat); }
  get visualization(): never { throw new Error( "Cannot get `.visualization` directly from a `TwistyPlayer`."); }

  set viewerLink(viewerLinkPage: ViewerLinkPageWithAuto) { this.model.viewerLinkProp.set(viewerLinkPage); }
  get viewerLink(): never { throw err("viewerLink"); }

  set cameraLatitude(latitude: number) { this.model.orbitCoordinatesRequestProp.set({ latitude }); }
  get cameraLatitude(): never { throw new Error( "Cannot get `.cameraLatitude` directly from a `TwistyPlayer`."); }

  set cameraLongitude(longitude: number) { this.model.orbitCoordinatesRequestProp.set({ longitude }); }
  get cameraLongitude(): never { throw new Error( "Cannot get `.cameraLongitude` directly from a `TwistyPlayer`."); }

  set cameraDistance(distance: number) { this.model.orbitCoordinatesRequestProp.set({ distance }); }
  get cameraDistance(): never { throw new Error( "Cannot get `.cameraDistance` directly from a `TwistyPlayer`."); }

  set cameraLatitudeLimit(latitudeLimit: number) { this.model.latitudeLimitProp.set(latitudeLimit); }
  get cameraLatitudeLimit(): never { throw new Error( "Cannot get `.cameraLatitudeLimit` directly from a `TwistyPlayer`."); }

  set indexer(indexer: IndexerStrategyName) { this.model.indexerConstructorRequestProp.set(indexer); }
  get indexer(): never { throw err("indexer"); }

  set tempoScale(newTempoScale: number) { this.model.tempoScaleProp.set(newTempoScale); }
  get tempoScale(): never { throw err("tempoScale"); }
}
