import type { Alg, AppendCancelOptions } from "../../alg";
import type { PuzzleDescriptionString } from "../../puzzle-geometry/PGPuzzles";
import type { StickeringMask } from "../../puzzles/stickerings/mask";
import type { ExperimentalStickering, PuzzleID } from "../../twisty";
import type { MillisecondTimestamp } from "../controllers/AnimationTypes";
import type { FaceletScale } from "../model/props/puzzle/display/FaceletScaleProp";
import type { HintFaceletStyleWithAuto } from "../model/props/puzzle/display/HintFaceletProp";
import type { InitialHintFaceletsAnimation } from "../model/props/puzzle/display/InitialHintFaceletsAnimationProp";
import type { DragInputMode } from "../model/props/puzzle/state/DragInputProp";
import type { IndexerStrategyName } from "../model/props/puzzle/state/IndexerConstructorRequestProp";
import type { MovePressInput } from "../model/props/puzzle/state/MovePressInputProp";
import type { SetupToLocation } from "../model/props/puzzle/state/SetupAnchorProp";
import type { TimestampRequest } from "../model/props/timeline/TimestampRequestProp";
import type { BackgroundThemeWithAuto } from "../model/props/viewer/BackgroundProp";
import type { BackViewLayoutWithAuto } from "../model/props/viewer/BackViewProp";
import type { ColorSchemeWithAuto } from "../model/props/viewer/ColorSchemeRequestProp";
import type { ControlPanelThemeWithAuto } from "../model/props/viewer/ControlPanelProp";
import type { ViewerLinkPageWithAuto } from "../model/props/viewer/ViewerLinkProp";
import type { VisualizationFormatWithAuto } from "../model/props/viewer/VisualizationProp";
import { TwistyPlayerModel } from "../model/TwistyPlayerModel";
import { ManagedCustomElement } from "./ManagedCustomElement";

function err(propName: string): Error {
  return new Error(
    `Cannot get \`.${propName}\` directly from a \`TwistyPlayer\`.`,
  );
}

export abstract class TwistyPlayerSettable extends ManagedCustomElement {
  experimentalModel: TwistyPlayerModel = new TwistyPlayerModel();

  set alg(newAlg: Alg | string) {
    this.experimentalModel.alg.set(newAlg);
  }
  get alg(): never {
    throw err("alg");
  }

  set experimentalSetupAlg(newSetup: Alg | string) {
    this.experimentalModel.setupAlg.set(newSetup);
  }
  get experimentalSetupAlg(): never {
    throw err("setup");
  }

  set experimentalSetupAnchor(anchor: SetupToLocation) {
    this.experimentalModel.setupAnchor.set(anchor);
  }
  get experimentalSetupAnchor(): never {
    throw err("anchor");
  }

  set puzzle(puzzleID: PuzzleID) {
    this.experimentalModel.puzzleIDRequest.set(puzzleID);
  }
  get puzzle(): never {
    throw err("puzzle");
  }

  set experimentalPuzzleDescription(puzzleDescription: PuzzleDescriptionString) {
    this.experimentalModel.puzzleDescriptionRequest.set(puzzleDescription);
  }
  get experimentalPuzzleDescription(): never {
    throw err("experimentalPuzzleDescription");
  }

  set timestamp(timestamp: TimestampRequest) {
    this.experimentalModel.timestampRequest.set(timestamp);
  }
  get timestamp(): never {
    throw err("timestamp");
  }

  set hintFacelets(hintFaceletStyle: HintFaceletStyleWithAuto) {
    this.experimentalModel.twistySceneModel.hintFacelet.set(hintFaceletStyle);
  }
  get hintFacelets(): never {
    throw err("hintFacelets");
  }

  set experimentalStickering(stickering: ExperimentalStickering) {
    this.experimentalModel.twistySceneModel.stickeringRequest.set(stickering);
  }
  get experimentalStickering(): never {
    throw err("experimentalStickering");
  }

  set experimentalStickeringMaskOrbits(stickeringMask:
    | string
    | StickeringMask) {
    this.experimentalModel.twistySceneModel.stickeringMaskRequest.set(
      stickeringMask,
    );
  }
  get experimentalStickeringMaskOrbits(): never {
    throw err("experimentalStickeringMaskOrbits");
  }

  set experimentalFaceletScale(faceletScale: FaceletScale) {
    this.experimentalModel.twistySceneModel.faceletScale.set(faceletScale);
  }

  get experimentalFaceletScale(): never {
    throw err("experimentalFaceletScale");
  }

  set backView(backView: BackViewLayoutWithAuto) {
    this.experimentalModel.backView.set(backView);
  }
  get backView(): never {
    throw err("backView");
  }

  set background(backgroundTheme: BackgroundThemeWithAuto) {
    this.experimentalModel.twistySceneModel.background.set(backgroundTheme);
  }
  get background(): never {
    throw err("background");
  }

  set colorScheme(colorScheme: ColorSchemeWithAuto) {
    this.experimentalModel.twistySceneModel.colorSchemeRequest.set(colorScheme);
  }
  get colorScheme(): never {
    throw err("colorScheme");
  }

  set controlPanel(newControlPanel: ControlPanelThemeWithAuto) {
    this.experimentalModel.controlPanel.set(newControlPanel);
  }
  get controlPanel(): never {
    throw err("controlPanel");
  }

  set visualization(visualizationFormat: VisualizationFormatWithAuto) {
    this.experimentalModel.visualizationFormat.set(visualizationFormat);
  }
  get visualization(): never {
    throw err("visualization");
  }

  set experimentalTitle(title: string | null) {
    this.experimentalModel.title.set(title);
  }
  get experimentalTitle(): never {
    throw err("experimentalTitle");
  }

  set experimentalVideoURL(videoURL: string | null) {
    this.experimentalModel.videoURL.set(videoURL);
  }
  get experimentalVideoURL(): never {
    throw err("experimentalVideoURL");
  }

  set experimentalCompetitionID(competitionID: string | null) {
    this.experimentalModel.competitionID.set(competitionID);
  }
  get experimentalCompetitionID(): never {
    throw err("experimentalCompetitionID");
  }

  set viewerLink(viewerLinkPage: ViewerLinkPageWithAuto) {
    this.experimentalModel.viewerLink.set(viewerLinkPage);
  }
  get viewerLink(): never {
    throw err("viewerLink");
  }

  set experimentalMovePressInput(movePressInput: MovePressInput) {
    this.experimentalModel.twistySceneModel.movePressInput.set(movePressInput);
  }
  get experimentalMovePressInput(): never {
    throw err("experimentalMovePressInput");
  }

  set experimentalMovePressCancelOptions(movePressCancelOptions: AppendCancelOptions) {
    this.experimentalModel.twistySceneModel.movePressCancelOptions.set(
      movePressCancelOptions,
    );
  }
  get experimentalMovePressCancelOptions(): never {
    throw err("experimentalMovePressCancelOptions");
  }

  set cameraLatitude(latitude: number) {
    this.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set({
      latitude,
    });
  }
  get cameraLatitude(): never {
    throw err("cameraLatitude");
  }

  set cameraLongitude(longitude: number) {
    this.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set({
      longitude,
    });
  }
  get cameraLongitude(): never {
    throw err("cameraLongitude");
  }

  set cameraDistance(distance: number) {
    this.experimentalModel.twistySceneModel.orbitCoordinatesRequest.set({
      distance,
    });
  }
  get cameraDistance(): never {
    throw err("cameraDistance");
  }

  set cameraLatitudeLimit(latitudeLimit: number) {
    this.experimentalModel.twistySceneModel.latitudeLimit.set(latitudeLimit);
  }
  get cameraLatitudeLimit(): never {
    throw err("cameraLatitudeLimit");
  }

  set indexer(indexer: IndexerStrategyName) {
    this.experimentalModel.indexerConstructorRequest.set(indexer);
  }
  get indexer(): never {
    throw err("indexer");
  }

  set tempoScale(newTempoScale: number) {
    this.experimentalModel.tempoScale.set(newTempoScale);
  }
  get tempoScale(): never {
    throw err("tempoScale");
  }

  set experimentalSprite(url: string | URL) {
    this.experimentalModel.twistySceneModel.foundationStickerSpriteURL.set(url);
  }
  get experimentalSprite(): never {
    throw err("experimentalSprite");
  }

  set experimentalHintSprite(url: string | URL) {
    this.experimentalModel.twistySceneModel.hintStickerSpriteURL.set(url);
  }
  get experimentalHintSprite(): never {
    throw err("experimentalHintSprite");
  }

  set fullscreenElement(element: Element | null) {
    this.experimentalModel.twistySceneModel.fullscreenElement.set(element);
  }
  get fullscreenElement(): never {
    throw err("fullscreenElement");
  }

  set experimentalInitialHintFaceletsAnimation(anim: InitialHintFaceletsAnimation) {
    this.experimentalModel.twistySceneModel.initialHintFaceletsAnimation.set(
      anim,
    );
  }
  get experimentalInitialHintFaceletsAnimation(): never {
    throw err("experimentalInitialHintFaceletsAnimation");
  }

  set experimentalDragInput(dragInputMode: DragInputMode) {
    this.experimentalModel.twistySceneModel.dragInput.set(dragInputMode);
  }
  get experimentalDragInput(): never {
    throw err("experimentalDragInput");
  }

  experimentalGet = new ExperimentalGetters(this.experimentalModel);
}

class ExperimentalGetters {
  constructor(private model: TwistyPlayerModel) {}

  async alg(): Promise<Alg> {
    return (await this.model.alg.get()).alg;
  }

  async setupAlg(): Promise<Alg> {
    return (await this.model.setupAlg.get()).alg;
  }

  puzzleID(): Promise<PuzzleID> {
    return this.model.puzzleID.get();
  }

  async timestamp(): Promise<MillisecondTimestamp> {
    return (await this.model.detailedTimelineInfo.get()).timestamp;
  }
}
