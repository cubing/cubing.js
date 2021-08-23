import { PerspectiveCamera, WebGLRenderer } from "three";
import { THREEJS } from "../heavy-code-imports/3d";
import type { TwistyPlayerModel } from "../model/TwistyPlayerModel";
import { Twisty3DPuzzleWrapper } from "./3D/Twisty3DPuzzleWrapper";
import { setCameraFromOrbitCoordinates } from "./3D/Twisty3DVantage";

export interface TwistyPlayerScreenshot {
  dataURL: string;
  download: (filename?: string) => Promise<void>;
}

// TODO: cache
let cachedCamera: PerspectiveCamera | null = null;
export async function screenshot(
  model: TwistyPlayerModel,
): Promise<TwistyPlayerScreenshot> {
  // TODO: improve async caching
  const camera = (cachedCamera ??= await (async () => {
    return new (await THREEJS).PerspectiveCamera(
      20,
      1, // We rely on the resize logic to handle this.
      0.1,
      20,
    );
  })());

  const scene = new (await THREEJS).Scene();

  const twisty3DWrapper = new Twisty3DPuzzleWrapper(
    model,
    { scheduleRender: () => {} },
    await model.puzzleProp.get(),
  );

  // TODO: Find a more robust way to do this.
  await model.legacyPositionProp.get(); // Force the 3D puzzle listeners for the state to fire.

  scene.add(await twisty3DWrapper.twisty3DPuzzle());

  const orbitCoordinates = await model.orbitCoordinatesProp.get();
  await setCameraFromOrbitCoordinates(camera, orbitCoordinates);

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(2048, 2048);

  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL();

  const defaultFilename = await getDefaultFilename(model);

  return {
    dataURL,
    download: async (filename?: string) => {
      await downloadURL(dataURL, filename ?? defaultFilename);
    },
  };
}

async function getDefaultFilename(model: TwistyPlayerModel): Promise<string> {
  const [puzzleID, algWithIssues] = await Promise.all([
    model.puzzleProp.get(),
    model.algProp.get(),
  ]);
  return `[${puzzleID}]${
    algWithIssues.alg.experimentalNumUnits() === 0
      ? ""
      : " " + algWithIssues.alg.toString()
  }.png`;
}

export function downloadURL(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.png`;
  a.click();
}
