import { cube3x3x3, type PuzzleLoader } from "../../../puzzles/index.ts";
import type { FaceletScale } from "../../model/props/puzzle/display/FaceletScaleProp.ts";
import type { HintFaceletStyle } from "../../model/props/puzzle/display/HintFaceletProp.ts";
import { Cube3D, type Cube3DOptions } from "../../views/3D/puzzles/Cube3D.ts";
import { PG3D } from "../../views/3D/puzzles/PG3D.ts";

// TODO: figure out how to load these dynamically without a bottleneck.
export { PerspectiveCamera as ThreePerspectiveCamera } from "three/src/cameras/PerspectiveCamera.js";
export { Raycaster as ThreeRaycaster } from "three/src/core/Raycaster.js";
export { TextureLoader as ThreeTextureLoader } from "three/src/loaders/TextureLoader.js";
export { Spherical as ThreeSpherical } from "three/src/math/Spherical.js";
export { Vector2 as ThreeVector2 } from "three/src/math/Vector2.js";
export { Vector3 as ThreeVector3 } from "three/src/math/Vector3.js";
export { WebGLRenderer as ThreeWebGLRenderer } from "three/src/renderers/WebGLRenderer.js";
export { Scene as ThreeScene } from "three/src/scenes/Scene.js";

export { Cube3D } from "../../views/3D/puzzles/Cube3D.ts";
export { PG3D } from "../../views/3D/puzzles/PG3D.ts";
export { Twisty3DScene } from "../../views/3D/Twisty3DScene.ts";

export async function cube3DShim(
  renderCallback: () => void,
  options?: Cube3DOptions,
): Promise<Cube3D> {
  return new Cube3D(await cube3x3x3.kpuzzle(), renderCallback, options);
}

// TODO: take loader?
export async function pg3dShim(
  renderCallback: () => void,
  puzzleLoader: PuzzleLoader,
  hintFacelets: HintFaceletStyle,
  faceletScale: FaceletScale,
  darkIgnoredOrbits: boolean,
): Promise<PG3D> {
  return new PG3D(
    renderCallback,
    await puzzleLoader.kpuzzle(),
    (await puzzleLoader.pg!()).get3d({ darkIgnoredOrbits }),
    true,
    hintFacelets === "floating",
    undefined,
    faceletScale,
  );
}
