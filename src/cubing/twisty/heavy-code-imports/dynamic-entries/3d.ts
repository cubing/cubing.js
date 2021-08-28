import { cube3x3x3, puzzles } from "../../../puzzles";
import { Cube3D } from "../../views/3D/puzzles/Cube3D";
import { PG3D } from "../../views/3D/puzzles/PG3D";
import type { AlgCursor } from "../../old/animation/cursor/AlgCursor";
import type {
  HintFaceletStyle,
  PuzzleID,
} from "../../old/dom/TwistyPlayerConfig";

export { Cube3D } from "../../views/3D/puzzles/Cube3D";
export { PG3D } from "../../views/3D/puzzles/PG3D";
export { Twisty3DScene } from "../../views/3D/Twisty3DScene";
export { Twisty3DCanvas } from "../../old/dom/viewers/Twisty3DCanvas";

export async function cube3DShim(): Promise<Cube3D> {
  const cursorShim = { addPositionListener: () => {} } as any as AlgCursor; // TODO
  const renderCallbackShim = () => {};
  return new Cube3D(await cube3x3x3.def(), cursorShim, renderCallbackShim);
}

// TODO: take loader?
export async function pg3dShim(
  puzzleID: PuzzleID,
  hintFacelets: HintFaceletStyle,
): Promise<PG3D> {
  const cursorShim = { addPositionListener: () => {} } as any as AlgCursor; // TODO
  const renderCallbackShim = () => {};
  return new PG3D(
    cursorShim,
    renderCallbackShim,
    await puzzles[puzzleID].def(),
    (await puzzles[puzzleID].pg!()).get3d(),
    true,
    hintFacelets === "floating",
  );
}

// Mangled to avoid autocompleting.
// This must not be imported directly.
export * as T3I from "three";
