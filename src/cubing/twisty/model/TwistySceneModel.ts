import { URLProp } from "./props/general/URLProp";
import { FaceletScaleProp } from "./props/puzzle/display/FaceletScaleProp";
import { FoundationDisplayProp } from "./props/puzzle/display/FoundationDisplayProp";
import { HintFaceletProp } from "./props/puzzle/display/HintFaceletProp";
import { InitialHintFaceletsAnimationProp } from "./props/puzzle/display/InitialHintFaceletsAnimationProp";
import { SpriteProp } from "./props/puzzle/display/SpriteProp";
import { StickeringMaskProp } from "./props/puzzle/display/StickeringMaskProp";
import { StickeringMaskRequestProp } from "./props/puzzle/display/StickeringMaskRequestProp";
import { StickeringRequestProp } from "./props/puzzle/display/StickeringRequestProp";
import { DragInputProp } from "./props/puzzle/state/DragInputProp";
import { MovePressCancelOptions } from "./props/puzzle/state/MovePressCancelOptions";
import { MovePressInputProp } from "./props/puzzle/state/MovePressInputProp";
import { BackgroundProp } from "./props/viewer/BackgroundProp";
import { ColorSchemeProp } from "./props/viewer/ColorSchemeProp";
import { ColorSchemeRequestProp } from "./props/viewer/ColorSchemeRequestProp";
import { DOMElementReferenceProp } from "./props/viewer/DOMElementReferenceProp";
import { LatitudeLimitProp } from "./props/viewer/LatitudeLimit";
import { OrbitCoordinatesProp } from "./props/viewer/OrbitCoordinatesProp";
import { OrbitCoordinatesRequestProp } from "./props/viewer/OrbitCoordinatesRequestProp";
import type { TwistyPlayerModel } from "./TwistyPlayerModel";

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

  constructor(public twistyPlayerModel: TwistyPlayerModel) {
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
