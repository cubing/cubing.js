import {
  Engine,
  FreeCamera,
  HemisphericLight,
  Mesh,
  Scene,
  Vector3,
  // TODO: This is a workaround for TypeScript 4.3, which errors because
  // `babylonjs` uses `WebGLObject`. It breaks Snowpack, but allows CI to work.
  // Import `@babylonjs/core` directly once it has updated defs.
  // @ts-ignore
} from "../../../../node_modules/babylonjs/babylon";

class BabylonTest {
  public canvas: HTMLCanvasElement = document.createElement("canvas");
  private engine: Engine = new Engine(this.canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });

  private scene = new Scene(this.engine);
  private camera = new FreeCamera(
    "camera1",
    new Vector3(0, 5, -10),
    this.scene,
  );

  constructor() {
    this.createScene();
    this.engine.runRenderLoop(this.render.bind(this));
    window.addEventListener("resize", this.resize.bind(this));
  }

  public resize() {
    this.engine.resize();
  }

  private render() {
    this.scene.render();
  }

  // CreateScene function that creates and return the scene
  private createScene() {
    // Target the camera to scene origin
    this.camera.setTarget(Vector3.Zero());
    // Attach the camera to the canvas
    this.camera.attachControl(this.canvas, false);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    const sphere = Mesh.CreateSphere(
      "sphere1",
      16,
      2,
      this.scene,
      false,
      Mesh.FRONTSIDE,
    );
    // Move the sphere upward 1/2 of its height
    sphere.position.y = 1;
    // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
    Mesh.CreateGround("ground1", 6, 6, 2, this.scene, false);
  }
}

const babylonTest = new BabylonTest();
(window as any).babylonTest = babylonTest;
window.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(babylonTest.canvas);
  babylonTest.resize();
});
