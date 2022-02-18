import type { PerspectiveCamera } from "three";
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
  options?: { width: number; height: number },
): Promise<TwistyPlayerScreenshot> {
  // TODO: improve async caching

  const width = options?.width ?? 2048;
  const height = options?.height ?? 2048;
  const aspectRatio = width / height;
  const camera = (cachedCamera ??= await (async () => {
    return new (await THREEJS).PerspectiveCamera(20, aspectRatio, 0.1, 20);
  })());

  const scene = new (await THREEJS).Scene();

  const twisty3DWrapper = new Twisty3DPuzzleWrapper(
    model,
    { scheduleRender: () => {} },
    await model.puzzleLoader.get(),
    await model.visualizationStrategy.get(),
  );

  // TODO: Pass the stickering to the constructor so we don't have to wait..
  await model.twistySceneModel.stickering.get();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // TODO: Find a more robust way to do this.
  await model.legacyPosition.get(); // Force the 3D puzzle listeners for the state to fire.

  scene.add(await twisty3DWrapper.twisty3DPuzzle());

  const orbitCoordinates = await model.twistySceneModel.orbitCoordinates.get();
  await setCameraFromOrbitCoordinates(camera, orbitCoordinates);

  const renderer = new (await THREEJS).WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);

  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL();

  const defaultFilename = await getDefaultFilename(model);

  return {
    dataURL,
    download: async (filename?: string) => {
      downloadURL(dataURL, filename ?? defaultFilename);
    },
  };
}

export async function getDefaultFilename(
  model: TwistyPlayerModel,
): Promise<string> {
  const [puzzleID, algWithIssues] = await Promise.all([
    model.puzzleID.get(),
    model.alg.get(),
  ]);
  return `[${puzzleID}]${
    algWithIssues.alg.experimentalNumUnits() === 0
      ? ""
      : " " + algWithIssues.alg.toString()
  }`;
}

export function downloadURL(
  url: string,
  name: string,
  extension: string = "png",
): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.${extension}`;
  a.click();
}
