// export class Drag() {

// }

interface DragInfo {
  attachedInfo: Record<any, any>;
  hasMoved: boolean;
  lastScreenX: number;
  lastScreenY: number;
  lastTimeStamp: number;
}

type PointerID = number;

export interface DragMovementInfo {
  attachedInfo: Record<any, any>;
  movementX: number;
  movementY: number;
  elapsedMs: number;
}

export class DragTracker extends EventTarget {
  lastCoordinates: Map<PointerID, DragInfo> = new Map();

  constructor(public readonly target: HTMLElement) {
    super();
    target.addEventListener("pointerdown", this.onPointerDown.bind(this));
    target.addEventListener("pointermove", this.onPointerMove.bind(this));
    target.addEventListener("pointerup", this.onPointerUp.bind(this));
  }

  #clear(e: PointerEvent): void {
    this.lastCoordinates.delete(e.pointerId);
  }

  // `null`: means: ignore this result (no movement, or not
  #trackDrag(e: PointerEvent): {
    movementInfo: DragMovementInfo | null;
    hasMoved: boolean;
  } {
    const existing = this.lastCoordinates.get(e.pointerId);
    if (!existing) {
      return { movementInfo: null, hasMoved: false };
    }
    // We would try to use `e.movementX`/`e.movementY`, except Safari:
    // - Does not have those values on i[Pad]OS.
    // - Will always report `0` for these values on macOS.
    // https://bugs.webkit.org/show_bug.cgi?id=220194
    //
    // The following are all insufficiently powerful for detecting the Safari `0` bug:
    // - `"movementX" in e`
    // - `e.movementX !== "undefined"`
    // - `e.hasOwnProperty("movementX")`

    let movementInfo: DragMovementInfo;
    if (e.movementX !== 0 || e.movementY !== 0) {
      // We optimistically try to catch sub-pixel movements in Chrome.
      movementInfo = {
        attachedInfo: existing.attachedInfo,
        movementX: e.movementX,
        movementY: e.movementY,
      };
    } else {
      movementInfo = {
        attachedInfo: existing.attachedInfo,
        movementX: e.screenX - existing.lastScreenX,
        movementY: e.screenY - existing.lastScreenY,
        elapsedMs: e.timeStamp - existing.lastTimeStamp,
      };
    }
    existing.lastScreenX = e.screenX;
    existing.lastScreenY = e.screenY;
    existing.lastTimeStamp = e.timeStamp;
    if (movementInfo.movementX === 0 || movementInfo.movementY === 0) {
      return { movementInfo: null, hasMoved: existing.hasMoved };
    } else {
      existing.hasMoved = true;
      return { movementInfo, hasMoved: existing.hasMoved };
    }
  }

  private onPointerDown(e: PointerEvent) {
    const newDragInfo: DragInfo = {
      attachedInfo: {},
      hasMoved: false,
      lastScreenX: e.screenX,
      lastScreenY: e.screenY,
      lastTimeStamp: e.timeStamp,
    };
    this.lastCoordinates.set(e.pointerId, newDragInfo);
    this.target.setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent) {
    const movementInfo = this.#trackDrag(e).movementInfo;
    if (movementInfo) {
      this.dispatchEvent(
        new CustomEvent("move", {
          detail: movementInfo,
        }),
      );
    }
  }

  private onPointerUp(e: PointerEvent) {
    const trackDragResult = this.#trackDrag(e);
    this.#clear(e);
    this.target.releasePointerCapture(e.pointerId); // TODO: unnecessary?
    let event: CustomEvent;
    if (trackDragResult.hasMoved) {
      event = new CustomEvent("up", {
        detail: trackDragResult.movementInfo,
      });
    } else {
      event = new CustomEvent("click", {
        detail: {
          offsetX: e.offsetX,
          offsetY: e.offsetY,
        },
      });
    }
    this.dispatchEvent(event);
  }
}
