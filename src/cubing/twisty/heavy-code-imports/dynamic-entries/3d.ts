import { cube3x3x3, PuzzleLoader } from "../../../puzzles";
import type { HintFaceletStyle } from "../../model/props/puzzle/display/HintFaceletProp";
import { Cube3D, Cube3DOptions } from "../../views/3D/puzzles/Cube3D";
import { PG3D } from "../../views/3D/puzzles/PG3D";

// Mangled to avoid autocompleting.
// This must not be imported directly.
export * as T3I from "three";
export { Cube3D } from "../../views/3D/puzzles/Cube3D";
export { PG3D } from "../../views/3D/puzzles/PG3D";
export { Twisty3DScene } from "../../views/3D/Twisty3DScene";

export async function cube3DShim(options?: Cube3DOptions): Promise<Cube3D> {
  const renderCallbackShim = () => {};
  return new Cube3D(await cube3x3x3.def(), renderCallbackShim, options);
}

// TODO: take loader?
export async function pg3dShim(
  puzzleLoader: PuzzleLoader,
  hintFacelets: HintFaceletStyle,
): Promise<PG3D> {
  const renderCallbackShim = () => {};
  return new PG3D(
    renderCallbackShim,
    await puzzleLoader.def(),
    (await puzzleLoader.pg!()).get3d(),
    true,
    hintFacelets === "floating",
  );
}
