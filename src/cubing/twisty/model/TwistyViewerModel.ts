import { URLProp } from "./props/general/URLProp";
import { FoundationDisplayProp } from "./props/puzzle/display/FoundationDisplayProp";
import { HintFaceletProp } from "./props/puzzle/display/HintFaceletProp";
import { SpriteProp } from "./props/puzzle/display/SpriteProp";
import { StickeringProp } from "./props/puzzle/display/StickeringProp";
import { MovePressInputProp } from "./props/puzzle/state/MovePressInputProp";
import type { PuzzleIDProp } from "./props/puzzle/structure/PuzzleIDProp";
import { BackgroundProp } from "./props/viewer/BackgroundProp";
import { LatitudeLimitProp } from "./props/viewer/LatitudeLimit";
import { OrbitCoordinatesProp } from "./props/viewer/OrbitCoordinatesProp";
import { OrbitCoordinatesRequestProp } from "./props/viewer/OrbitCoordinatesRequestProp";
import type { VisualizationStrategyProp } from "./props/viewer/VisualizationStrategyProp";

export class TwistyViewerModel {
  /******** Per visualization instance (e.g. vantage) ********/

  // Depth 0
  background = new BackgroundProp();
  foundationDisplay = new FoundationDisplayProp();
  foundationStickerSpriteURL = new URLProp();
  hintFacelet = new HintFaceletProp();
  hintStickerSpriteURL = new URLProp();
  latitudeLimit = new LatitudeLimitProp();
  movePressInput = new MovePressInputProp();
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

  constructor(inputs: {
    puzzleID: PuzzleIDProp;
    visualizationStrategy: VisualizationStrategyProp;
  }) {
    this.orbitCoordinates = new OrbitCoordinatesProp({
      orbitCoordinatesRequest: this.orbitCoordinatesRequest,
      latitudeLimit: this.latitudeLimit,
      puzzleID: inputs.puzzleID,
      strategy: inputs.visualizationStrategy,
    });
  }
}
