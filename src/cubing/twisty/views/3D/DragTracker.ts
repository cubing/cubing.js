// export class Drag() {

// }

interface DragInfo {
  attachedInfo: Record<any, any>;
  hasMoved: boolean;
  lastClientX: number;
  lastClientY: number;
  lastTimeStamp: number;
}

type PointerID = number;

export interface DragMovementInfo {
  attachedInfo: Record<any, any>;
  movementX: number;
  movementY: number;
  elapsedMs: number;
}

// Chrome can report movements as low as `0.0000152587890625` even if the cursor did not move at all. So we need a treshold insteadl.
const MOVEMENT_EPSILON = 0.1; // px

export class DragTracker extends EventTarget {
  #dragInfoMap: Map<PointerID, DragInfo> = new Map();

  constructor(public readonly target: HTMLElement) {
    super();
    target.addEventListener("pointerdown", this.onPointerDown.bind(this));
    // Prevent touch scrolling (preventing default on `pointermove` doesn't work).
    this.target.addEventListener("touchmove", (e) => e.preventDefault());
    // Prevent zooming on double-tap (iOS).
    // This is because `dblclick` works to zoom in, but does *not* work to zoom out. So the user can get stuck zoomed into the player without a way to zoom out.
    this.target.addEventListener("dblclick", (e) => e.preventDefault());
  }

  // This allows us to avoid getting a callback every time the pointer moves over the canvas, until we have a down event.
  // TODO: Ideally we'd also support unregistering when we're certain there are no more active touches. But this means we need to properly handle every way a pointer "click" can end, which is tricky across environments (due to e.g. mouse vs. touch vs. stylues, canvas/viewport/window/scroll boundaries, right-click and other ways of losing focus, etc.), so we conservatively leave the listeners on.
  #lazyListenersRegistered: boolean = false;
  #registerLazyListeners(): void {
    if (this.#lazyListenersRegistered) {
      return;
    }
    this.target.addEventListener("pointermove", this.onPointerMove.bind(this)); // TODO: only register this after pointer down.
    this.target.addEventListener("pointerup", this.onPointerUp.bind(this));
    this.#lazyListenersRegistered = true;
  }

  #clear(e: PointerEvent): void {
    this.#dragInfoMap.delete(e.pointerId);
  }

  // `null`: means: ignore this result (no movement, or not
  #trackDrag(e: PointerEvent): {
    movementInfo: DragMovementInfo | null;
    hasMoved: boolean;
  } {
    // TODO: Find a way to detect if this is an active press, in a way that works cross-platform.
    // if (e.buttons === 0) {
    //   return { movementInfo: null, hasMoved: false };
    // }
    const existing = this.#dragInfoMap.get(e.pointerId);
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
    if ((e.movementX ?? 0) !== 0 || (e.movementY ?? 0) !== 0) {
      // We optimistically try to catch sub-pixel movements in Chrome.
      movementInfo = {
        attachedInfo: existing.attachedInfo,
        movementX: e.movementX,
        movementY: e.movementY,
        elapsedMs: e.timeStamp - existing.lastTimeStamp,
      };
    } else {
      movementInfo = {
        attachedInfo: existing.attachedInfo,
        movementX: e.clientX - existing.lastClientX,
        movementY: e.clientY - existing.lastClientY,
        elapsedMs: e.timeStamp - existing.lastTimeStamp,
      };
    }
    existing.lastClientX = e.clientX;
    existing.lastClientY = e.clientY;
    existing.lastTimeStamp = e.timeStamp;
    if (
      Math.abs(movementInfo.movementX) < MOVEMENT_EPSILON &&
      Math.abs(movementInfo.movementY) < MOVEMENT_EPSILON
    ) {
      return { movementInfo: null, hasMoved: existing.hasMoved };
    } else {
      existing.hasMoved = true;
      return { movementInfo, hasMoved: existing.hasMoved };
    }
  }

  private onPointerDown(e: PointerEvent) {
    this.#registerLazyListeners();
    const newDragInfo: DragInfo = {
      attachedInfo: {},
      hasMoved: false,
      lastClientX: e.clientX,
      lastClientY: e.clientY,
      lastTimeStamp: e.timeStamp,
    };
    this.#dragInfoMap.set(e.pointerId, newDragInfo);
    this.target.setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent) {
    const movementInfo = this.#trackDrag(e).movementInfo;
    if (movementInfo) {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("move", {
          detail: movementInfo,
        }),
      );
    }
  }

  private onPointerUp(e: PointerEvent) {
    const trackDragResult = this.#trackDrag(e);
    const existing = this.#dragInfoMap.get(e.pointerId)!; // TODO
    this.#clear(e);
    this.target.releasePointerCapture(e.pointerId); // TODO: unnecessary?
    let event: CustomEvent;
    if (trackDragResult.hasMoved) {
      // TODO: send proper movement/momentum since last move event.
      event = new CustomEvent("up", {
        detail: { attachedInfo: existing.attachedInfo },
      });
    } else {
      event = new CustomEvent("press", {
        detail: {
          offsetX: e.offsetX,
          offsetY: e.offsetY,
        },
      });
    }
    this.dispatchEvent(event);
  }
}
