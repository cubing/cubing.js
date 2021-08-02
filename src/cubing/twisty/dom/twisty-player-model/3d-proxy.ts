import { cube3x3x3, puzzles } from "../../../puzzles";
import { Cube3D } from "../../3D/puzzles/Cube3D";
import { PG3D } from "../../3D/puzzles/PG3D";
import type { AlgCursor } from "../../animation/cursor/AlgCursor";
import type { PuzzleID } from "../TwistyPlayerConfig";

export { Cube3D } from "../../3D/puzzles/Cube3D";
export { PG3D } from "../../3D/puzzles/PG3D";
export { Twisty3DScene } from "../../3D/Twisty3DScene";
export { Twisty3DCanvas } from "../viewers/Twisty3DCanvas";

export async function cube3DShim(): Promise<Cube3D> {
  return new Cube3D(await cube3x3x3.def());
}

// TODO: take loader?
export async function pg3dShim(puzzleID: PuzzleID): Promise<PG3D> {
  const cursorShim = { addPositionListener: () => {} } as any as AlgCursor; // TODO
  const renderCallbackShim = () => {};
  return new PG3D(
    cursorShim,
    renderCallbackShim,
    await puzzles[puzzleID].def(),
    (await puzzles[puzzleID].pg!()).get3d(),
  );
}
