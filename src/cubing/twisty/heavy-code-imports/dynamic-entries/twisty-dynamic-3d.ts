import { cube3x3x3, type PuzzleLoader } from "../../../puzzles";
import type { FaceletScale } from "../../model/props/puzzle/display/FaceletScaleProp";
import type { HintFaceletStyle } from "../../model/props/puzzle/display/HintFaceletProp";
import { Cube3D, type Cube3DOptions } from "../../views/3D/puzzles/Cube3D";
import { PG3D } from "../../views/3D/puzzles/PG3D";

// Mangled to avoid autocompleting.
// This must not be imported directly.
export * as T3I from "three";
export { Cube3D } from "../../views/3D/puzzles/Cube3D";
export { PG3D } from "../../views/3D/puzzles/PG3D";
export { Twisty3DScene } from "../../views/3D/Twisty3DScene";

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
