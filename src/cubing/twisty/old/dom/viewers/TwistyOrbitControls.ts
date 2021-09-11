import { Camera, Spherical, Vector3 } from "three";
import { DEGREES_PER_RADIAN } from "../../../views/3D/TAU";
import { RenderScheduler } from "../../animation/RenderScheduler";
import type { CameraLatitudeLimits } from "../TwistyPlayerConfig";

// Buffer at the end values of the latitude (phi), to prevent gymbal lock.
// Without this, the puzzle would flip every frame if you try to push past the
// end, or snap to a standard longitude (theta).
const EPSILON = 0.00000001;

const INERTIA_DEFAULT: boolean = true;
const LATITUDE_LIMITS_DEFAULT: CameraLatitudeLimits = "auto";

const INERTIA_DURATION_MS = 500;
// If the first inertial render is this long after the last move, we assume the
// user has halted the cursor and we consider inertia to have "timed out". We
// never begin animating the inertia.
const INERTIA_TIMEOUT_MS = 50;

const VERTICAL_MOVEMENT_BASE_SCALE = 0.75;

// progress is from 0 to 1.
function momentumScale(progress: number) {
  // This is the exponential curve flipped so that
  // - The slope at progress = 0 is 1 (this corresponds to "x = 1" on the normal
  //   curve).
  // - The scale exponentially "decays" until progress = 1.
  // This means the scale at the end will be about 0.418
  return (Math.exp(1 - progress) - (1 - progress)) / (1 - Math.E) + 1;
}

class Inertia {
  private scheduler = new RenderScheduler(this.render.bind(this));
  private lastTimestamp: number;
  constructor(
    private startTimestamp: number,
    private momentumX: number,
    private momentumY: number,
    private callback: (movementX: number, movementY: number) => void,
  ) {
    this.scheduler.requestAnimFrame();
    this.lastTimestamp = startTimestamp;
  }

  private render(now: DOMHighResTimeStamp) {
    const progressBefore =
      (this.lastTimestamp - this.startTimestamp) / INERTIA_DURATION_MS;
    const progressAfter = Math.min(
      1,
      (now - this.startTimestamp) / INERTIA_DURATION_MS,
    );

    if (
      progressBefore === 0 &&
      progressAfter > INERTIA_TIMEOUT_MS / INERTIA_DURATION_MS
    ) {
      // The user has already paused for a while. Don't start any inertia.
      return;
    }

    const delta = momentumScale(progressAfter) - momentumScale(progressBefore);

    // TODO: For now, we only carry horizontal momentum. If this should stay, we
    // can remove the plumbing for the Y dimension.
    this.callback(this.momentumX * delta * 1000, this.momentumY * delta * 1000);

    if (progressAfter < 1) {
      this.scheduler.requestAnimFrame();
    }
    this.lastTimestamp = now;
  }
}

export interface OrbitCoordinates {
  latitude: number;
  longitude: number;
  distance: number;
}

export function positionToOrbitCoordinates(
  position: Vector3,
): OrbitCoordinates {
  const spherical = new Spherical();
  spherical.setFromVector3(position);
  return {
    latitude: 90 - spherical.phi * DEGREES_PER_RADIAN,
    longitude: spherical.theta * DEGREES_PER_RADIAN,
    distance: spherical.radius,
  };
}

// TODO: change mouse cursor while moving.
export class TwistyOrbitControls {
  // TODO: should we store as lat/long directly and stick to more rounded values in degrees?
  #spherical: Spherical = new Spherical();
  #lookAt: Vector3 = new Vector3(0, 0, 0);
  // longitude: number;
  // latitude: number;
  // altitude: number;

  lookAt(v: Vector3): void {
    if (!this.#acceptPropagation) {
      return;
    }
    this.#lookAt = v;

    this.#acceptPropagation = false;
    this.#adjust();
    this.scheduleRender();
    try {
      if (this.mirrorControls) {
        // TODO: will these ever need to be separate?
        this.mirrorControls.lookAt(v);
      }
    } finally {
      this.#acceptPropagation = true;
    }
  }

  set latitude(newLatitude: number) {
    // this.#pullFromCamera();
    this.#spherical.phi = (90 - newLatitude) / DEGREES_PER_RADIAN;
    this.#propagateSpherical();
  }

  get latitude(): number {
    return 90 - this.#spherical.phi * DEGREES_PER_RADIAN;
  }

  set longitude(newLongitude: number) {
    // this.#pullFromCamera();
    this.#spherical.theta = newLongitude / DEGREES_PER_RADIAN;
    this.#propagateSpherical();
  }

  // TODO: Wrap into [-180, 180]
  get longitude(): number {
    return this.#spherical.theta * DEGREES_PER_RADIAN;
  }

  set distance(newDistance: number) {
    // this.#pullFromCamera();
    this.#spherical.radius = newDistance;
    this.#propagateSpherical();
  }

  get distance(): number {
    return this.#spherical.radius;
  }

  /** @deprecated */
  get orbitCoordinates(): OrbitCoordinates {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      distance: this.distance,
    };
  }

  /** @deprecated */
  set orbitCoordinates(orbitCoordinates: OrbitCoordinates) {
    this.latitude = orbitCoordinates.latitude;
    this.longitude = orbitCoordinates.longitude;
    this.distance = orbitCoordinates.distance;
  }

  /** @deprecated */
  experimentalInertia: boolean = INERTIA_DEFAULT;
  /** @deprecated */
  experimentalLatitudeLimits: CameraLatitudeLimits = LATITUDE_LIMITS_DEFAULT;
  private mirrorControls?: TwistyOrbitControls;
  private lastTouchClientX: number = 0;
  private lastTouchClientY: number = 0;
  private currentTouchID: number | null = null; // TODO: support multiple touches?
  private onMoveBound = this.onMove.bind(this);
  private onMouseMoveBound = this.onMouseMove.bind(this);
  private onMouseEndBound = this.onMouseEnd.bind(this);
  private onTouchMoveBound = this.onTouchMove.bind(this);
  private onTouchEndBound = this.onTouchEnd.bind(this);
  private lastTouchTimestamp: number = 0;
  private lastTouchMoveMomentumX: number = 0;
  private lastTouchMoveMomentumY: number = 0;
  private lastMouseTimestamp: number = 0;
  private lastMouseMoveMomentumX: number = 0;
  private lastMouseMoveMomentumY: number = 0;
  public experimentalHasBeenMoved: boolean = false;
  constructor(
    private camera: Camera,
    private canvas: HTMLCanvasElement,
    private scheduleRender: () => void,
  ) {
    this.#spherical.setFromVector3(camera.position);
    this.#propagateSpherical();
    canvas.addEventListener("mousedown", this.onMouseStart.bind(this));
    canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
  }

  // f is the fraction of the canvas traversed per ms.
  temperMovement(f: number): number {
    // This is scaled to be linear for small values, but to reduce large values
    // by a significant factor.
    return (Math.sign(f) * Math.log(Math.abs(f * 10) + 1)) / 6;
  }

  onMouseStart(e: MouseEvent): void {
    this.experimentalHasBeenMoved = true;
    window.addEventListener("mousemove", this.onMouseMoveBound);
    window.addEventListener("mouseup", this.onMouseEndBound);
    this.onStart(e);

    this.lastMouseTimestamp = e.timeStamp;
  }

  onMouseMove(e: MouseEvent): void {
    if (e.buttons === 0) {
      // Certain elements (e.g. disabled buttons) can capture the `mouseup`
      // event. So if we notice that there are no mouse buttons pressed, we stop
      // the movement.
      this.onMouseEnd(e);
      return;
    }

    if (e.movementX === 0 && e.movementY === 0) {
      // Short-circuit
      console.log("short-circuit mouse!");
      return;
    }

    const minDim = Math.min(this.canvas.offsetWidth, this.canvas.offsetHeight);
    const movementX = this.temperMovement(e.movementX / minDim);
    const movementY = this.temperMovement(
      (e.movementY / minDim) * VERTICAL_MOVEMENT_BASE_SCALE,
    );
    this.onMove(movementX, movementY);

    if (e.timeStamp !== this.lastMouseTimestamp) {
      this.lastMouseMoveMomentumX =
        movementX / (e.timeStamp - this.lastMouseTimestamp);
      this.lastMouseMoveMomentumY =
        movementY / (e.timeStamp - this.lastMouseTimestamp);
      this.lastMouseTimestamp = e.timeStamp;
    }
  }

  onMouseEnd(e: MouseEvent): void {
    window.removeEventListener("mousemove", this.onMouseMoveBound);
    window.removeEventListener("mouseup", this.onMouseEndBound);
    this.onEnd(e);

    if (this.experimentalInertia) {
      new Inertia(
        this.lastMouseTimestamp,
        this.lastMouseMoveMomentumX,
        this.lastMouseMoveMomentumY,
        this.onMoveBound,
      );
    }
  }

  onTouchStart(e: TouchEvent): void {
    this.experimentalHasBeenMoved = true;
    if (this.currentTouchID === null) {
      if (e.touches[0].clientX === 0 && e.touches[0].clientY === 0) {
        // Short-circuit
        console.log("short-circuit touch!");
        return;
      }
      this.currentTouchID = e.changedTouches[0].identifier;
      this.lastTouchClientX = e.touches[0].clientX;
      this.lastTouchClientY = e.touches[0].clientY;
      window.addEventListener("touchmove", this.onTouchMoveBound);
      window.addEventListener("touchend", this.onTouchEndBound);
      window.addEventListener("touchcancel", this.onTouchEndBound);
      this.onStart(e);

      this.lastTouchTimestamp = e.timeStamp;
    }
  }

  onTouchMove(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.currentTouchID) {
        const minDim = Math.min(
          this.canvas.offsetWidth,
          this.canvas.offsetHeight,
        );
        const movementX = this.temperMovement(
          (touch.clientX - this.lastTouchClientX) / minDim,
        );
        const movementY = this.temperMovement(
          ((touch.clientY - this.lastTouchClientY) / minDim) *
            VERTICAL_MOVEMENT_BASE_SCALE,
        );
        this.onMove(movementX, movementY);
        this.lastTouchClientX = touch.clientX;
        this.lastTouchClientY = touch.clientY;

        if (e.timeStamp !== this.lastTouchTimestamp) {
          this.lastTouchMoveMomentumX =
            movementX / (e.timeStamp - this.lastTouchTimestamp);
          this.lastTouchMoveMomentumY =
            movementY / (e.timeStamp - this.lastTouchTimestamp);
          this.lastTouchTimestamp = e.timeStamp;
        }
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

    if (this.experimentalInertia) {
      new Inertia(
        this.lastTouchTimestamp,
        this.lastTouchMoveMomentumX,
        this.lastTouchMoveMomentumY,
        this.onMoveBound,
      );
    }
  }

  onStart(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
  }

  onMove(movementX: number, movementY: number): void {
    // TODO: optimize, e.g. by caching or using the spherical coordinates
    // directly if they are still fresh.

    // this.#pullFromCamera();

    // console.log(movementX, movementY)

    const newSpherical = new Spherical();
    newSpherical.copy(this.#spherical);

    newSpherical.theta += -2 * movementX;
    newSpherical.phi += -2 * movementY;
    if (this.experimentalLatitudeLimits !== "none") {
      newSpherical.phi = Math.max(newSpherical.phi, Math.PI * 0.3); // TODO: Arctic circle: 1/6
      newSpherical.phi = Math.min(newSpherical.phi, Math.PI * 0.7); // TODO: Antarctic circle: 5/6
    } else {
      newSpherical.phi = Math.max(newSpherical.phi, EPSILON);
      newSpherical.phi = Math.min(newSpherical.phi, Math.PI - EPSILON);
    }

    if (
      isNaN(newSpherical.theta) ||
      newSpherical.theta === Infinity ||
      newSpherical.theta === -Infinity
    ) {
      return;
    }

    if (
      isNaN(newSpherical.phi) ||
      newSpherical.phi === Infinity ||
      newSpherical.phi === -Infinity
    ) {
      return;
    }

    this.#spherical = newSpherical;
    this.#propagateSpherical();
  }

  #adjust(): void {
    this.#spherical.makeSafe(); // TODO: IS this close enouh for all purposes? Can we set exact using e.g. matrices?
    this.camera.position.setFromSpherical(this.#spherical);
    this.camera.lookAt(this.#lookAt);
  }

  #acceptPropagation: boolean = true;
  // #lastTranslation = 0;
  #propagateSpherical(): void {
    this.#acceptPropagation = false;
    try {
      this.#adjust();

      this.scheduleRender();
      this.mirrorControls?.updateMirroredCamera({
        latitude: this.latitude,
        longitude: this.longitude,
        distance: this.distance,
      });
      // We would take the event in the arguments, and try to call
      // `preventDefault()` on it, but Chrome logs an error event if we try to
      // catch it, because it enforces a passive listener.
    } finally {
      this.#acceptPropagation = true;
    }
  }

  onEnd(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
  }

  public setMirror(m: TwistyOrbitControls): void {
    this.mirrorControls = m;
  }

  updateMirroredCamera(orbitCoordinates: OrbitCoordinates): void {
    if (this.#acceptPropagation) {
      this.latitude = -orbitCoordinates.latitude;
      this.longitude = orbitCoordinates.longitude + 180;
      this.distance = orbitCoordinates.distance;

      this.#adjust();
      this.scheduleRender();
    }
  }
}
