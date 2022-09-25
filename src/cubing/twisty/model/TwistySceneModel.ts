import { URLProp } from "./props/general/URLProp";
import { FoundationDisplayProp } from "./props/puzzle/display/FoundationDisplayProp";
import { HintFaceletProp } from "./props/puzzle/display/HintFaceletProp";
import { SpriteProp } from "./props/puzzle/display/SpriteProp";
import { StickeringProp } from "./props/puzzle/display/StickeringProp";
import { DragInputProp } from "./props/puzzle/state/DragInputProp";
import { MovePressCancelOptions } from "./props/puzzle/state/MovePressCancelOptions";
import { MovePressInputProp } from "./props/puzzle/state/MovePressInputProp";
import { BackgroundProp } from "./props/viewer/BackgroundProp";
import { LatitudeLimitProp } from "./props/viewer/LatitudeLimit";
import { OrbitCoordinatesProp } from "./props/viewer/OrbitCoordinatesProp";
import { OrbitCoordinatesRequestProp } from "./props/viewer/OrbitCoordinatesRequestProp";
import type { TwistyPlayerModel } from "./TwistyPlayerModel";

export class TwistySceneModel {
  // Depth 0
  background = new BackgroundProp();
  dragInput = new DragInputProp();
  foundationDisplay = new FoundationDisplayProp();
  foundationStickerSpriteURL = new URLProp();
  hintFacelet = new HintFaceletProp();
  hintStickerSpriteURL = new URLProp();
  latitudeLimit = new LatitudeLimitProp();
  movePressInput = new MovePressInputProp();
  movePressCancelOptions = new MovePressCancelOptions();
  orbitCoordinatesRequest: OrbitCoordinatesRequestProp =
    new OrbitCoordinatesRequestProp();
  stickering = new StickeringProp();

  // Depth 1
  foundationStickerSprite = new SpriteProp({
    spriteURL: this.foundationStickerSpriteURL,
  });

  hintStickerSprite = new SpriteProp({
    spriteURL: this.hintStickerSpriteURL,
  });

  // Depth 4
  orbitCoordinates: OrbitCoordinatesProp;

  constructor(public twistyPlayerModel: TwistyPlayerModel) {
    this.orbitCoordinates = new OrbitCoordinatesProp({
      orbitCoordinatesRequest: this.orbitCoordinatesRequest,
      latitudeLimit: this.latitudeLimit,
      puzzleID: twistyPlayerModel.puzzleID,
      strategy: twistyPlayerModel.visualizationStrategy,
    });
  }
}
