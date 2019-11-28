import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import { PerspectiveCamera, WebGLRenderer } from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { initialHeight, usePG3D } from "./config";
import { Room } from "./room";
import { VRCube } from "./vr-cube";
import { VRInput } from "./vr-input";
import { VRPG3D } from "./vr-pg3d";

class VRCubeDemo {
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;

  private room: Room;

  private vrInput: VRInput;

  constructor() {
    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.setY(initialHeight);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.vr.enabled = true;

    this.vrInput = new VRInput(this.renderer);

    const puzzleConstructor = usePG3D ? VRPG3D : VRCube;
    const vrPuzzle = new puzzleConstructor(this.vrInput);
    this.room = new Room(this.vrInput, vrPuzzle);
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(VRButton.createButton(this.renderer));

    window.addEventListener("resize", this.onWindowResize.bind(this), false);

    this.animate();
  }

  public render(): void {
    this.vrInput.update();
    this.room.update();
    this.renderer.render(this.room.scene, this.camera);
  }

  private animate(): void {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

(window as any).vrCubeDemo = new VRCubeDemo();
