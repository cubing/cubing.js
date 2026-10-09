import { URLProp } from "./props/general/URLProp.ts";
import { FaceletScaleProp } from "./props/puzzle/display/FaceletScaleProp.ts";
import { FoundationDisplayProp } from "./props/puzzle/display/FoundationDisplayProp.ts";
import { HintFaceletProp } from "./props/puzzle/display/HintFaceletProp.ts";
import { HintFaceletsElevationProp } from "./props/puzzle/display/HintFaceletsElevationProp.ts";
import { InitialHintFaceletsAnimationProp } from "./props/puzzle/display/InitialHintFaceletsAnimationProp.ts";
import { SpriteProp } from "./props/puzzle/display/SpriteProp.ts";
import { StickeringMaskProp } from "./props/puzzle/display/StickeringMaskProp.ts";
import { StickeringMaskRequestProp } from "./props/puzzle/display/StickeringMaskRequestProp.ts";
import { StickeringRequestProp } from "./props/puzzle/display/StickeringRequestProp.ts";
import { DragInputProp } from "./props/puzzle/state/DragInputProp.ts";
import { MovePressCancelOptions } from "./props/puzzle/state/MovePressCancelOptions.ts";
import { MovePressInputProp } from "./props/puzzle/state/MovePressInputProp.ts";
import { BackgroundProp } from "./props/viewer/BackgroundProp.ts";
import { ColorSchemeProp } from "./props/viewer/ColorSchemeProp.ts";
import { ColorSchemeRequestProp } from "./props/viewer/ColorSchemeRequestProp.ts";
import { DOMElementReferenceProp } from "./props/viewer/DOMElementReferenceProp.ts";
import { LatitudeLimitProp } from "./props/viewer/LatitudeLimit.ts";
import { OrbitCoordinatesProp } from "./props/viewer/OrbitCoordinatesProp.ts";
import { OrbitCoordinatesRequestProp } from "./props/viewer/OrbitCoordinatesRequestProp.ts";
import type { TwistyPlayerModel } from "./TwistyPlayerModel.ts";

export class TwistySceneModel {
  // Depth 0
  background = new BackgroundProp();
  colorSchemeRequest = new ColorSchemeRequestProp();
  dragInput = new DragInputProp();
  foundationDisplay = new FoundationDisplayProp();
  foundationStickerSpriteURL = new URLProp();
  fullscreenElement = new DOMElementReferenceProp();
  hintFacelet = new HintFaceletProp();
  hintStickerSpriteURL = new URLProp();
  initialHintFaceletsAnimation = new InitialHintFaceletsAnimationProp();
  hintFaceletsElevation = new HintFaceletsElevationProp();
  latitudeLimit = new LatitudeLimitProp();
  movePressInput = new MovePressInputProp();
  movePressCancelOptions = new MovePressCancelOptions();
  orbitCoordinatesRequest: OrbitCoordinatesRequestProp =
    new OrbitCoordinatesRequestProp();
  // `stickeringMaskRequest` takes priority over `stickeringRequest`
  stickeringMaskRequest = new StickeringMaskRequestProp();
  stickeringRequest = new StickeringRequestProp();
  faceletScale = new FaceletScaleProp();

  // Depth 1
  colorScheme = new ColorSchemeProp({
    colorSchemeRequest: this.colorSchemeRequest,
  });
  foundationStickerSprite = new SpriteProp({
    spriteURL: this.foundationStickerSpriteURL,
  });
  hintStickerSprite = new SpriteProp({
    spriteURL: this.hintStickerSpriteURL,
  });

  // Dependence on TwistyPlayerModel
  orbitCoordinates: OrbitCoordinatesProp;
  stickeringMask: StickeringMaskProp;

  public twistyPlayerModel: TwistyPlayerModel;
  constructor(twistyPlayerModel: TwistyPlayerModel) {
    this.twistyPlayerModel = twistyPlayerModel;

    this.orbitCoordinates = new OrbitCoordinatesProp({
      orbitCoordinatesRequest: this.orbitCoordinatesRequest,
      latitudeLimit: this.latitudeLimit,
      puzzleID: twistyPlayerModel.puzzleID,
      strategy: twistyPlayerModel.visualizationStrategy,
    });
    this.stickeringMask = new StickeringMaskProp({
      stickeringMaskRequest: this.stickeringMaskRequest,
      stickeringRequest: this.stickeringRequest,
      puzzleLoader: twistyPlayerModel.puzzleLoader,
    });
  }
}
