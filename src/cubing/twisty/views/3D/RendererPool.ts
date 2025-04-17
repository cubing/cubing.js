// TODO: https://stackoverflow.com/a/40443642

// let shareAllNewRenderers: boolean = false;

// // WARNING: The current shared renderer implementation is not every efficient.
// // Avoid using for players that are likely to have dimensions approaching 1 megapixel or higher.
// // TODO: use a dedicated renderer while fullscreen?
// export function experimentalSetShareAllNewRenderers(share: boolean): void {
//   shareAllNewRenderers = share;
// }

// const sharedRenderer: WebGLRenderer | null = null;

import { bulk3DCode } from "../../heavy-code-imports/3d";
import type {
  Camera,
  LinearSRGBColorSpace,
  Scene,
  WebGLRenderer,
} from "../../heavy-code-imports/three-types";
import { pixelRatio } from "../canvas";

const renderers: Promise<WebGLRenderer>[] = [];

// Render result is guaranteed to be available synchronously at resolution time.
export async function rawRenderPooled(
  width: number,
  height: number,
  scene: Scene,
  camera: Camera,
): Promise<HTMLCanvasElement> {
  // At most one in the pool for now.
  if (renderers.length === 0) {
    renderers.push(newRenderer());
  }
  const renderer = await renderers[0];
  // TODO: scissoring
  renderer.setSize(width, height); // TODO: is it faster if we cache values and only call this when necessary?
  renderer.render(scene, camera);

  return renderer.domElement;
}

// let haveSet = false;
export async function renderPooled(
  width: number,
  height: number,
  canvas: HTMLCanvasElement,
  scene: Scene,
  camera: Camera,
): Promise<void> {
  if (width === 0 || height === 0) {
    return;
  }
  // At most one in the pool for now.
  if (renderers.length === 0) {
    renderers.push(newRenderer());
  }

  const rendererCanvas = await rawRenderPooled(width, height, scene, camera);

  // TODO: Should we cache this? Seems to take about 0.0001ms to get.
  const context = canvas.getContext("2d")!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(rendererCanvas, 0, 0);
}

// Workaround to avoid an import of `three`.
const linearSRGBColorSpace =
  "srgb-linear" satisfies typeof LinearSRGBColorSpace;

export async function newRenderer(): Promise<WebGLRenderer> {
  const rendererConstructor = (await bulk3DCode()).ThreeWebGLRenderer;
  const renderer = new rendererConstructor({
    antialias: true,
    alpha: true,
  });
  renderer.outputColorSpace = linearSRGBColorSpace; // TODO(https://github.com/cubing/cubing.js/issues/308): remove this
  renderer.setPixelRatio(pixelRatio());
  return renderer;
}
