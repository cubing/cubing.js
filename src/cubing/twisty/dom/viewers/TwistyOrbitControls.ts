import { Camera, Spherical, Vector3 } from "three";

// const INERTIA_DEFAULT: boolean = true;

// TODO: Allow locking phi at the top/bottom if the mouse/touch hasn't moved much, similar to alg.cubing.net v1.
export class TwistyOrbitControls {
  mirrorControls?: TwistyOrbitControls;
  lastTouchClientX: number = 0;
  lastTouchClientY: number = 0;
  currentTouchID: number | null = null; // TODO: support multiple touches?
  onMoveBound = this.onMove.bind(this);
  onMouseMoveBound = this.onMouseMove.bind(this);
  onMouseEndBound = this.onMouseEnd.bind(this);
  onTouchMoveBound = this.onTouchMove.bind(this);
  onTouchEndBound = this.onTouchEnd.bind(this);
  // Variable for temporary use, to prevent reallocation.
  tempSpherical: Spherical = new Spherical();
  constructor(
    private camera: Camera,
    canvas: HTMLCanvasElement,
    private scheduleRender: () => void,
  ) {
    canvas.addEventListener("mousedown", this.onMouseStart.bind(this));
    canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
  }

  onMouseStart(e: MouseEvent): void {
    window.addEventListener("mousemove", this.onMouseMoveBound);
    window.addEventListener("mouseup", this.onMouseEndBound);
    this.onStart(e);
  }

  onMouseMove(e: MouseEvent): void {
    this.onMove(e.movementX, e.movementY);
  }

  onMouseEnd(e: MouseEvent): void {
    window.removeEventListener("mousemove", this.onMouseMoveBound);
    window.removeEventListener("mouseup", this.onMouseEndBound);
    this.onEnd(e);
  }

  onTouchStart(e: TouchEvent): void {
    if (this.currentTouchID === null) {
      this.currentTouchID = e.changedTouches[0].identifier;
      this.lastTouchClientX = e.touches[0].clientX;
      this.lastTouchClientY = e.touches[0].clientY;
      window.addEventListener("touchmove", this.onTouchMoveBound);
      window.addEventListener("touchend", this.onTouchEndBound);
      window.addEventListener("touchcanel", this.onTouchEndBound);
      this.onStart(e);
    }
  }

  onTouchMove(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.currentTouchID) {
        this.onMove(
          touch.clientX - this.lastTouchClientX,
          touch.clientY - this.lastTouchClientY,
        );
        this.lastTouchClientX = touch.clientX;
        this.lastTouchClientY = touch.clientY;
      }
    }
  }

  onTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.currentTouchID) {
        this.currentTouchID = null;
        window.removeEventListener("touchmove", this.onTouchMoveBound);
        window.removeEventListener("touchend", this.onTouchEndBound);
        window.removeEventListener("touchcancel", this.onTouchEndBound);
        this.onEnd(e);
      }
    }
  }

  onStart(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
  }

  onMove(movementX: number, movementY: number): void {
    // TODO: optimize, e.g. by caching or using the spherical coordinates
    // directly if they are still fresh.
    this.tempSpherical.setFromVector3(this.camera.position);

    this.tempSpherical.theta += -0.008 * movementX;
    this.tempSpherical.phi += -0.008 * movementY;
    this.tempSpherical.phi = Math.max(this.tempSpherical.phi, Math.PI * 0.3);
    this.tempSpherical.phi = Math.min(this.tempSpherical.phi, Math.PI * 0.7);

    this.camera.position.setFromSpherical(this.tempSpherical);
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.scheduleRender();
    this.mirrorControls?.updateMirroredCamera(this.camera);
    // We would take the event in the arguments, and try to call
    // `preventDefault()` on it, but Chrome logs an error event if we try to
    // catch it, because it enforces a passive listener.
  }

  onEnd(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
  }

  public setInertia(_enabled: boolean): void {
    // TODO
  }

  public setMirror(m: TwistyOrbitControls): void {
    this.mirrorControls = m;
  }

  updateMirroredCamera(c: Camera): void {
    this.camera.position.copy(c.position);
    this.camera.position.multiplyScalar(-1);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.scheduleRender();
  }

  updateAndSchedule(): void {
    this.scheduleRender();
  }
}
