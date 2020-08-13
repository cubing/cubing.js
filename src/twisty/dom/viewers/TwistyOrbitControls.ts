import { Camera, Renderer } from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls";

// TODO: Support limiting altitudinal angle, similar to alg.cubing.net v1.
// TODO: Allow locking vertical rotation if the mouse/touch hasn't moved much, similar to alg.cubing.net v1.
// TODO: Use more damping during drag, and less damping after letting go.
// TODO: Implement an orbit control paired to an opposing camera.
export class TwistyOrbitControls {
  threeOrbitControls: ThreeOrbitControls;
  constructor(
    camera: Camera,
    renderer: Renderer,
    private scheduleRender: () => void,
  ) {
    this.threeOrbitControls = new ThreeOrbitControls(
      camera,
      renderer.domElement,
    );
    this.threeOrbitControls.rotateSpeed = 0.5;
    this.threeOrbitControls.enablePan = false;

    // Note we can get a `change` event after `end` due to dampening.
    this.threeOrbitControls.addEventListener("start", scheduleRender);
    this.threeOrbitControls.addEventListener("change", scheduleRender);
    this.threeOrbitControls.addEventListener("end", scheduleRender);
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
