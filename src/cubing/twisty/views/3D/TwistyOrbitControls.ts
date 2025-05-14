import type { Vector3 } from "three/src/Three.js";
import { RenderScheduler } from "../../controllers/RenderScheduler";
import { bulk3DCode } from "../../heavy-code-imports/3d";
import type { OrbitCoordinates } from "../../model/props/viewer/OrbitCoordinatesRequestProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import type { DragMovementInfo, DragTracker } from "./DragTracker";
import { DEGREES_PER_RADIAN } from "./TAU";

const INERTIA_DEFAULT: boolean = true;

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

export async function positionToOrbitCoordinates(
  position: Vector3,
): Promise<OrbitCoordinates> {
  const spherical = new (await bulk3DCode()).ThreeSpherical();
  spherical.setFromVector3(position);
  return {
    latitude: 90 - spherical.phi * DEGREES_PER_RADIAN,
    longitude: spherical.theta * DEGREES_PER_RADIAN,
    distance: spherical.radius,
  };
}

interface TwistyOrbitControlsDragAttachedInfo {
  lastTemperedX: number;
  lastTemperedY: number;
  timestamp: number;
}

// TODO: change mouse cursor while moving.
export class TwistyOrbitControls {
  /** @deprecated */
  experimentalInertia: boolean = INERTIA_DEFAULT;
  private onMovementBound = this.onMovement.bind(this);
  public experimentalHasBeenMoved: boolean = false;
  constructor(
    private model: TwistyPlayerModel,
    private mirror: boolean,
    private canvas: HTMLCanvasElement,
    private dragTracker: DragTracker,
  ) {
    this.dragTracker.addEventListener(
      "move",
      this.onMove.bind(this) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
    );
    this.dragTracker.addEventListener(
      "up",
      this.onUp.bind(this) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
    );
  }

  // f is the fraction of the canvas traversed per ms.
  temperMovement(f: number): number {
    // This is scaled to be linear for small values, but to reduce large values
    // by a significant factor.
    return (Math.sign(f) * Math.log(Math.abs(f * 10) + 1)) / 6;
  }

  onMove(e: CustomEvent<DragMovementInfo>): void {
    e.detail.attachedInfo ??= {};

    const { temperedX, temperedY } = this.onMovement(
      e.detail.movementX,
      e.detail.movementY,
    );
    const attachedInfo = e.detail
      .attachedInfo as TwistyOrbitControlsDragAttachedInfo;
    attachedInfo.lastTemperedX = temperedX * 10;
    attachedInfo.lastTemperedY = temperedY * 10;
    attachedInfo.timestamp = e.timeStamp; // TODO
  }

  onMovement(
    movementX: number,
    movementY: number,
  ): {
    temperedX: number;
    temperedY: number;
  } {
    const scale = this.mirror ? -1 : 1;

    // TODO: refactor
    const minDim = Math.min(this.canvas.offsetWidth, this.canvas.offsetHeight);

    const temperedX = this.temperMovement(movementX / minDim);
    const temperedY = this.temperMovement(
      (movementY / minDim) * VERTICAL_MOVEMENT_BASE_SCALE,
    );
    this.model.twistySceneModel.orbitCoordinatesRequest.set(
      (async () => {
        const prevCoords =
          await this.model.twistySceneModel.orbitCoordinates.get();

        const newCoords = {
          latitude:
            prevCoords.latitude + 2 * temperedY * DEGREES_PER_RADIAN * scale,
          longitude: prevCoords.longitude - 2 * temperedX * DEGREES_PER_RADIAN,
        };
        return newCoords;
      })(),
    );
    return { temperedX, temperedY };
  }

  onUp(e: CustomEvent<DragMovementInfo>): void {
    e.preventDefault();
    if (
      "lastTemperedX" in e.detail.attachedInfo &&
      "lastTemperedY" in e.detail.attachedInfo &&
      "timestamp" in e.detail.attachedInfo &&
      e.timeStamp - e.detail.attachedInfo["timestamp"] < 60 // TODO
    ) {
      new Inertia(
        e.timeStamp, // TODO
        (e.detail.attachedInfo as TwistyOrbitControlsDragAttachedInfo)
          .lastTemperedX,
        (e.detail.attachedInfo as TwistyOrbitControlsDragAttachedInfo)
          .lastTemperedY,
        this.onMovementBound,
      ); // TODO: cancel inertia
    }
  }
}
