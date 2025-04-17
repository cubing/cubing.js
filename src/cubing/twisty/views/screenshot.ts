import type { PerspectiveCamera } from "three/src/Three.js";
import { bulk3DCode } from "../heavy-code-imports/3d";
import type { TwistyPlayerModel } from "../model/TwistyPlayerModel";
import { rawRenderPooled } from "./3D/RendererPool";
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

  // TODO: Avoid the `_stickering` and `_legacyPosition` calls in favor of proper callbacks.
  const [
    { ThreePerspectiveCamera, ThreeScene },
    puzzleLoader,
    visualizationStrategy,
    _stickering, // TODO
    _stickeringMaskRequest, // TODO
    _legacyPosition,
    orbitCoordinates,
  ] = await Promise.all([
    (async () => {
      const { ThreePerspectiveCamera, ThreeScene } = await bulk3DCode();
      return { ThreePerspectiveCamera, ThreeScene };
    })(),
    await model.puzzleLoader.get(),
    await model.visualizationStrategy.get(),
    await model.twistySceneModel.stickeringRequest.get(),
    await model.twistySceneModel.stickeringMaskRequest.get(),
    await model.legacyPosition.get(),
    await model.twistySceneModel.orbitCoordinates.get(),
  ]);

  const width = options?.width ?? 2048;
  const height = options?.height ?? 2048;
  const aspectRatio = width / height;
  const camera = (cachedCamera ??= await (async () => {
    return new ThreePerspectiveCamera(20, aspectRatio, 0.1, 20);
  })());

  const scene = new ThreeScene();
  const twisty3DWrapper = new Twisty3DPuzzleWrapper(
    model,
    { scheduleRender: () => {} },
    puzzleLoader,
    visualizationStrategy,
  );
  scene.add(await twisty3DWrapper.twisty3DPuzzle());
  await setCameraFromOrbitCoordinates(camera, orbitCoordinates);

  const rendererCanvas = await rawRenderPooled(width, height, scene, camera);
  const dataURL = rendererCanvas.toDataURL();

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
    algWithIssues.alg.experimentalNumChildAlgNodes() === 0
      ? ""
      : ` ${algWithIssues.alg.toString()}`
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
