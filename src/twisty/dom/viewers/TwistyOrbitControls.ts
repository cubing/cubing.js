import { Camera, Renderer } from "three";
import { OrbitControls as ThreeOrbitControls } from "./vendor/OrbitControls";

const INERTIA_DEFAULT: boolean = true;

// TODO: Support limiting altitudinal angle, similar to alg.cubing.net v1.
// TODO: Allow locking vertical rotation if the mouse/touch hasn't moved much, similar to alg.cubing.net v1.
// TODO: Use more damping during drag, and less damping after letting go.
// TODO: Implement an orbit control paired to an opposing camera.
export class TwistyOrbitControls {
  threeOrbitControls: ThreeOrbitControls;
  mirrorControls?: TwistyOrbitControls;
  constructor(
    private camera: Camera,
    renderer: Renderer,
    private scheduleRender: () => void,
  ) {
    this.threeOrbitControls = new ThreeOrbitControls(
      camera,
      renderer.domElement,
    );
    this.threeOrbitControls.enableDamping = INERTIA_DEFAULT;
    this.threeOrbitControls.rotateSpeed = 0.5;
    this.threeOrbitControls.enablePan = false;

    // Note we can get a `change` event after `end` due to dampening.
    const eventHandler = this.onOrbitControlEvent.bind(this);
    this.threeOrbitControls.addEventListener("start", eventHandler);
    this.threeOrbitControls.addEventListener("change", eventHandler);
    this.threeOrbitControls.addEventListener("end", eventHandler);
  }

  public setInertia(enabled: boolean): void {
    this.threeOrbitControls.enableDamping = enabled;
  }

  public onOrbitControlEvent(): void {
    this.scheduleRender();
    this.mirrorControls?.updateMirroredCamera(this.camera);
  }

  public setMirror(m: TwistyOrbitControls): void {
    this.mirrorControls = m;
  }

  updateMirroredCamera(c: Camera): void {
    this.camera.position.copy(c.position);
    this.camera.position.multiplyScalar(-1);
    this.scheduleRender();
  }

  updateAndSchedule(): void {
    // The return value tells us whether there was an update. If there was an
    // update, we schedule a render to check next frame. This means we might
    // render an extra frame at the end, but that's a fairly low cost for the
    // simplicity of implementation.
    if (this.threeOrbitControls.update()) {
      this.scheduleRender();
    }
  }
}
