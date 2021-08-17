import { Spherical, Vector3 } from "three";
import { DEGREES_PER_RADIAN } from "../../../3D/TAU";
import { RenderScheduler } from "../../../animation/RenderScheduler";
import type { OrbitCoordinatesV2 } from "../../twisty-player-model/props/depth-1/OrbitCoordinatesRequestProp";
import type { TwistyPlayerModel } from "../../twisty-player-model/props/TwistyPlayerModel";
import type { CameraLatitudeLimits } from "../../TwistyPlayerConfig";

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

// export interface OrbitCoordinates {
//   latitude: number;
//   longitude: number;
//   distance: number;
// }

export function positionToOrbitCoordinates(
  position: Vector3,
): OrbitCoordinatesV2 {
  const spherical = new Spherical();
  spherical.setFromVector3(position);
  return {
    latitude: 90 - spherical.phi * DEGREES_PER_RADIAN,
    longitude: spherical.theta * DEGREES_PER_RADIAN,
    distance: spherical.radius,
  };
}

// TODO: change mouse cursor while moving.
export class TwistyOrbitControlsV2 {
  /** @deprecated */
  experimentalInertia: boolean = INERTIA_DEFAULT;
  /** @deprecated */
  experimentalLatitudeLimits: CameraLatitudeLimits = LATITUDE_LIMITS_DEFAULT;
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
    private model: TwistyPlayerModel,
    private mirror: boolean,
    private canvas: HTMLCanvasElement,
  ) {
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
      return;
    }

    const minDim = Math.min(this.canvas.offsetWidth, this.canvas.offsetHeight);
    const movementX = this.temperMovement(e.movementX / minDim);
    const movementY = this.temperMovement(
      (e.movementY / minDim) * VERTICAL_MOVEMENT_BASE_SCALE,
    );
    this.onMove(movementX, movementY);

    this.lastMouseMoveMomentumX =
      movementX / (e.timeStamp - this.lastMouseTimestamp);
    this.lastMouseMoveMomentumY =
      movementY / (e.timeStamp - this.lastMouseTimestamp);
    this.lastMouseTimestamp = e.timeStamp;
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
    if (this.currentTouchID === null) {
      if (e.touches[0].clientX === 0 && e.touches[0].clientY === 0) {
        // Short-circuit
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

        this.lastTouchMoveMomentumX =
          movementX / (e.timeStamp - this.lastTouchTimestamp);
        this.lastTouchMoveMomentumY =
          movementY / (e.timeStamp - this.lastTouchTimestamp);
        this.lastTouchTimestamp = e.timeStamp;
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

  async onMove(movementX: number, movementY: number): Promise<void> {
    const scale = this.mirror ? -1 : 1;
    this.model.orbitCoordinatesRequestProp.set(
      (async () => {
        const prevCoords = await this.model.orbitCoordinatesProp.get();
        const newCoords = {
          latitude:
            prevCoords.latitude + 2 * movementY * DEGREES_PER_RADIAN * scale,
          longitude:
            (prevCoords.longitude -
              2 * movementX * DEGREES_PER_RADIAN * scale) %
            360,
        };
        // console.log("coords", prevCoords, newCoords);
        return newCoords;
      })(),
    );
  }

  onEnd(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
  }
}
