export interface ActiveSwipe {
  sourceSector: HTMLElement;
  currentSector: HTMLElement | null;
  hasMovedAwayFromSourceSector: boolean;
}

interface ActiveTouch extends ActiveSwipe {
  touchIdentifier: number;
}

export class SwipeTracker {
  private sectorIndices: Map<HTMLElement, number> = new Map();
  private activeTouchesByID: Map<number, ActiveTouch> = new Map();
  private activeTouches: ActiveTouch[] = [];
  constructor(
    private sectors: HTMLElement[],
    private swipeChangeListener: (activeSwipes: ActiveSwipe[]) => void,
    private swipeFinishListener: (
      source: HTMLElement,
      target: HTMLElement
    ) => void
  ) {
    for (const [idx, sector] of this.sectors.entries()) {
      this.sectorIndices.set(sector, idx);
      sector.addEventListener("touchstart", this.touchStart.bind(this, sector));
      sector.addEventListener("touchmove", this.touchMove.bind(this));
      sector.addEventListener("touchend", this.touchEnd.bind(this, sector));
      sector.addEventListener("touchcancel", this.touchEnd.bind(this, sector));

      // sector.addEventListener("mousedown", this.swipeStart.bind(this, sector));
      // sector.addEventListener("mouseup", this.swipeStop.bind(this, sector));
      // window.addEventListener("mouseup", this.globalMouseup.bind(this));
      // sector.addEventListener("mouseenter", this.swipeStart.bind(this, sector));
    }
  }

  public reset(): void {
    this.activeTouches = [];
    this.activeTouchesByID.clear();
  }

  public isSwipeStillActive(swipe: ActiveSwipe): boolean {
    return this.activeTouches.includes(swipe as ActiveTouch);
  }

  private idx(sector: HTMLElement): number {
    return this.sectorIndices.get(sector);
  }

  private dispatchTouchChange(): void {
    this.swipeChangeListener(this.activeTouches);
  }

  private touchStart(sector: HTMLElement, e: TouchEvent): void {
    for (const touch of e.changedTouches) {
      const activeTouch = {
        sourceSector: sector,
        currentSector: sector,
        hasMovedAwayFromSourceSector: false,
        touchIdentifier: touch.identifier,
      };
      this.activeTouchesByID.set(touch.identifier, activeTouch);
      this.activeTouches.push(activeTouch);
      // console.log("Started touch #", touch.identifier);
    }
    e.preventDefault();
    this.dispatchTouchChange();
  }

  private touchMove(e: TouchEvent): void {
    let anyChanged = false;
    // console.log("touchMove", sector, this.idx(sector), e);
    // const foundIDs: Set<number> = new Set(); // TODO: is this expensive?
    for (const touch of e.changedTouches) {
      // foundIDs.add(touch.identifier);
      const activeTouch = this.activeTouchesByID.get(touch.identifier);
      if (!activeTouch) {
        // TODO: this shouldn't happen?
        // continue;
      }
      const sectorUnderSwipe = document.elementFromPoint(
        touch.pageX,
        touch.pageY
      ) as HTMLElement | null;

      if (!sectorUnderSwipe || !this.sectorIndices.has(sectorUnderSwipe)) {
        continue;
      }

      if (activeTouch.currentSector !== sectorUnderSwipe) {
        // console.log(
        //   `Touch #${
        //     activeTouch.touchIdentifier
        //   } has moved to sector #${this.idx(sectorUnderSwipe)}`
        // );
        activeTouch.currentSector = sectorUnderSwipe;
        if (sectorUnderSwipe !== activeTouch.sourceSector) {
          activeTouch.hasMovedAwayFromSourceSector = true;
        }

        anyChanged = true;
        // console.table(x);
      }
    }
    // for (const id of this.activeTouchesByID.keys()) {
    //   if (!foundIDs.has(id)) {
    //     this.activeTouchesByID.delete(id);
    //   }
    // }
    if (anyChanged) {
      this.dispatchTouchChange();
    }
  }

  private touchEnd(sector: HTMLElement, e: TouchEvent): void {
    for (const touch of e.changedTouches) {
      // console.log("Ended touch #", touch.identifier);
      // console.log("touchEnd", sector, this.idx(sector), e);
      const activeTouch = this.activeTouchesByID.get(touch.identifier);
      this.activeTouchesByID.delete(touch.identifier);

      const activeTouchIdx = this.activeTouches.indexOf(activeTouch);
      this.activeTouches.splice(activeTouchIdx, 1);

      this.swipeFinishListener(
        activeTouch.sourceSector,
        activeTouch.currentSector
      );
    }

    this.dispatchTouchChange();
  }

  // globalMouseup(): void {}

  // swipeStart(sector: HTMLElement): void {
  //   console.log("start", sector, this.idx(sector));
  // }

  // swipeStop(sector: HTMLElement): void {
  //   console.log("stop", sector, this.idx(sector));
  // }
}

// const sector = document.createElement("div");
// if (this.active) {
//   sector.addEventListener("touchstart", this.swipeStart.bind(this, i, sector));
//   sector.addEventListener("mousedown", this.swipeStart.bind(this, i, sector));
//   // div.addEventListener("touchenter", this.swipeEnter.bind(this, i, div));
//   sector.addEventListener("mouseenter", this.swipeEnter.bind(this, i, sector));
//   // div.addEventListener("touchleave", this.swipeLeave.bind(this, i, div));
//   sector.addEventListener("mouseleave", this.swipeLeave.bind(this, i, sector));
//   // div.addEventListener("touchend", this.swipeEnd.bind(this, i, div));
//   // div.addEventListener("mouseup", this.swipeEnd.bind(this, i, div));
// }
// this.sectors.set(sector, i);
