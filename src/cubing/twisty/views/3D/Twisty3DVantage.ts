import {
  PerspectiveCamera,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Stats } from "../../../vendor/three/examples/jsm/libs/stats.module";
import { THREEJS } from "../../heavy-code-imports/3d";
import { StaleDropper } from "../../model/PromiseFreshener";
import type { TwistyPropParent } from "../../model/props/TwistyProp";
import type { OrbitCoordinatesV2 } from "../../model/props/viewer/OrbitCoordinatesRequestProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { RenderScheduler } from "../../old/animation/RenderScheduler";
import { ManagedCustomElement } from "../../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../../old/dom/element/node-custom-element-shims";
import { pixelRatio } from "../../old/dom/viewers/canvas";
import { twisty3DCanvasCSS } from "../../old/dom/viewers/Twisty3DCanvas.css";
import { BLOOM_SCENE_LAYER, ENTIRE_SCENE_LAYER } from "./puzzles/Cube3D";
import { DEGREES_PER_RADIAN } from "./TAU";
import type { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";
import { TwistyOrbitControlsV2 } from "./TwistyOrbitControlsV2";

let SHOW_STATS = false;
export function showStats(enable: boolean): void {
  SHOW_STATS = enable;
}

export async function setCameraFromOrbitCoordinates(
  camera: PerspectiveCamera,
  orbitCoordinates: OrbitCoordinatesV2,
  backView: boolean = false,
): Promise<void> {
  const spherical = new (await THREEJS).Spherical(
    orbitCoordinates.distance,
    (90 - (backView ? -1 : 1) * orbitCoordinates.latitude) / DEGREES_PER_RADIAN,
    ((backView ? 180 : 0) + orbitCoordinates.longitude) / DEGREES_PER_RADIAN,
  );
  spherical.makeSafe();
  camera.position.setFromSpherical(spherical);
  camera.lookAt(0, 0, 0);
}

export class Twisty3DVantage extends ManagedCustomElement {
  scene: Twisty3DSceneWrapper | null = null;

  stats: Stats | null = null;

  constructor(
    private model?: TwistyPlayerModel,
    scene?: Twisty3DSceneWrapper,
    private options?: { backView?: boolean },
  ) {
    super();
    this.scene = scene ?? null;

    if (SHOW_STATS) {
      this.stats = Stats();
      this.stats.dom.style.position = "absolute";
      this.contentWrapper.appendChild(this.stats.dom);
    }
  }

  async connectedCallback(): Promise<void> {
    this.addCSS(twisty3DCanvasCSS);
    this.addElement(await this.canvas());

    this.#onResize();
    const observer = new ResizeObserver(this.#onResize.bind(this));
    observer.observe(this.contentWrapper);
    this.orbitControls(); // TODO
    this.scheduleRender();
  }

  #onResizeStaleDropper = new StaleDropper<
    [PerspectiveCamera, WebGLRenderer]
  >();

  // TODO: Why doesn't this work for the top-right back view height?
  async #onResize(): Promise<void> {
    const [camera, renderer] = await this.#onResizeStaleDropper.queue(
      Promise.all([this.camera(), this.renderer()]),
    );

    const w = this.contentWrapper.clientWidth;
    const h = this.contentWrapper.clientHeight;
    const off = 0;
    let yoff = 0;
    let excess = 0;
    if (h > w) {
      excess = h - w;
      yoff = -Math.floor(0.5 * excess);
    }
    camera.aspect = w / h;
    camera.setViewOffset(w, h - excess, off, yoff, w, h);
    camera.updateProjectionMatrix(); // TODO

    // if (this.rendererIsShared) {
    //   canvas.width = w * pixelRatio();
    //   canvas.height = h * pixelRatio();
    //   canvas.style.width = w.toString();
    //   canvas.style.height = w.toString();
    // } else {
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(w, h, true);
    this.bloomComposer.setSize(w, h);
    this.bloomComposer.setPixelRatio(pixelRatio());
    this.mainComposer.setSize(w, h);
    this.mainComposer.setPixelRatio(pixelRatio());
    // }

    this.scheduleRender();
  }

  bloomComposer: EffectComposer;
  mainComposer: EffectComposer;

  #cachedRenderer: Promise<WebGLRenderer> | null = null;
  async renderer(): Promise<WebGLRenderer> {
    return (this.#cachedRenderer ??= (async () => {
      const rendererConstructor = (await THREEJS).WebGLRenderer;
      const renderer = new rendererConstructor({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(pixelRatio());

      const bloomPass = new UnrealBloomPass(
        new Vector2(window.innerWidth, window.innerHeight),
        0.3,
        1,
        0,
      );
      bloomPass.bloomTintColors = [
        new Vector3(0.6, 0.8, 1),
        new Vector3(0.6, 0.8, 1),
        new Vector3(0.6, 0.8, 1),
        new Vector3(0.6, 0.8, 1),
        new Vector3(0.6, 0.8, 1),
      ];
      this.bloomComposer = new EffectComposer(renderer);
      const scene = await this.scene!.scene();

      const renderScene = new RenderPass(scene, await this.camera());
      this.bloomComposer.addPass(renderScene);
      this.bloomComposer.addPass(bloomPass);

      const finalPass = new ShaderPass(
        new ShaderMaterial({
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
          },
          vertexShader: `		varying vec2 vUv;

			void main() {

				vUv = uv;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}`,
          fragmentShader: `uniform sampler2D baseTexture;
			uniform sampler2D bloomTexture;

			varying vec2 vUv;

			void main() {

				gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );

			}
`,
          defines: {},
        }),
        "baseTexture",
      );
      finalPass.needsSwap = true;

      this.mainComposer = new EffectComposer(renderer);
      this.mainComposer.addPass(renderScene);
      this.mainComposer.addPass(finalPass);

      return renderer;
    })());
  }

  #cachedCanvas: Promise<HTMLCanvasElement> | null = null;
  async canvas(): Promise<HTMLCanvasElement> {
    return (this.#cachedCanvas ??= (async () => {
      return (await this.renderer()).domElement;
    })());
  }

  #cachedCamera: Promise<PerspectiveCamera> | null = null;
  async camera(): Promise<PerspectiveCamera> {
    return (this.#cachedCamera ??= (async () => {
      const camera = new (await THREEJS).PerspectiveCamera(
        20,
        1, // We rely on the resize logic to handle this.
        0.1,
        20,
      );
      camera.position.copy(
        new (await THREEJS).Vector3(2, 4, 4).multiplyScalar(
          this.options?.backView ? -1 : 1,
        ),
      );
      camera.lookAt(0, 0, 0);
      // TODO: `TwistyOrbitControls` breaks isolateion
      return camera;
    })());
  }

  #cachedOrbitControls: Promise<TwistyOrbitControlsV2> | null = null;
  async orbitControls(): Promise<TwistyOrbitControlsV2> {
    return (this.#cachedOrbitControls ??= (async () => {
      const orbitControls = new TwistyOrbitControlsV2(
        this.model!,
        !!this.options?.backView,
        await this.canvas(),
      );

      if (this.model) {
        this.addListener(
          this.model.orbitCoordinatesProp,
          async (orbitCoordinates: OrbitCoordinatesV2) => {
            const camera = await this.camera();
            setCameraFromOrbitCoordinates(
              camera,
              orbitCoordinates,
              this.options?.backView,
            );
            // TODO: Wrap in StaleDropper?

            this.scheduleRender();
          },
        );
      }

      return orbitControls;
    })());
  }

  addListener<T>(
    prop: TwistyPropParent<T>,
    listener: (value: T) => void,
  ): void {
    prop.addFreshListener(listener);
    this.#disconnectionFunctions.push(() => {
      prop.removeFreshListener(listener);
      // disconnected = true; // TODO
    });
  }

  #disconnectionFunctions: (() => void)[] = [];
  disconnect(): void {
    for (const fn of this.#disconnectionFunctions) {
      fn();
    }
    this.#disconnectionFunctions = []; // TODO: Encapsulate this.
  }

  async render(): Promise<void> {
    if (!this.scene) {
      throw new Error("Attempted to render without a scene");
    }

    this.stats?.begin();

    // const [renderer, scene, camera] = await Promise.all([
    //   this.renderer(),
    //   this.scene.scene(),
    //   this.camera(),
    // ]);
    await this.renderer();
    // console.log("rendering!!!!", renderer, scene, camera);

    const camera = await this.camera();
    camera.layers.set(BLOOM_SCENE_LAYER);
    this.bloomComposer.render(); // TODO
    camera.layers.set(ENTIRE_SCENE_LAYER);
    this.mainComposer.render(); // TODO

    this.stats?.end();
  }

  #scheduler = new RenderScheduler(this.render.bind(this));
  scheduleRender(): void {
    // console.log("scheduling", this);
    this.#scheduler.requestAnimFrame();
  }
}

customElementsShim.define("twisty-3d-vantage-v2", Twisty3DVantage);
