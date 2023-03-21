import { Move } from "../../../../../cubing/alg";
import type { PuzzleID, StringListAsType } from "../url-params";
import { type ActiveSwipe, SwipeTracker } from "./SwipeTracker";
import { type Action, actionToUIText, moveMaps } from "./SwipeyPuzzle";

export const themes = [
  "blank",
  "grid",
  "grid-back",
  "transparent-grid",
  "transparent-grid-back",
  "HUD",
  "box",
  "layers",
  "dots",
  "cross-hairs",
] as const;

export type ThemeType = StringListAsType<typeof themes>;

// TODO: Handle multiple simultaneous swipes.
export class SwipeGrid extends HTMLElement {
  private swipeTracker: SwipeTracker;
  private sectors: HTMLElement[];

  private sectorMap: Map<HTMLElement, number> = new Map();
  // `swipeSource` indicates if a swipe is in progress.
  private swipeSource: HTMLElement | null = null;
  // private currentMove: string | null = null;
  // private lastSectorUnderSwipe: HTMLElement | null = null;
  private showAllTargetMovesID: number = 0; // TODO: use proper state tracking.
  constructor(
    private puzzleName: PuzzleID,
    private moveListener: (move: Move) => void,
    private actionListener: (action: Action) => void,
    private theme: ThemeType,
    _active: boolean = false, // TODO
  ) {
    super();

    this.sectors = [];
    for (let i = 0; i < 9; i++) {
      const sector = document.createElement("div");
      this.sectors.push(sector);
      this.sectorMap.set(sector, i);
    }
    this.swipeTracker = new SwipeTracker(
      this.sectors,
      this.onTouchChange.bind(this),
      this.onSwipeFinish.bind(this),
    );

    this.classList.add(`theme-${this.theme}`);
  }

  protected connectedCallback() {
    for (const sector of this.sectors) {
      this.appendChild(sector);
    }
  }

  private onTouchChange(swipes: ActiveSwipe[]) {
    const newSectorData: Map<
      HTMLElement,
      {
        isSource: boolean;
        isTentativeTarget: boolean;
        isSelfRetarget: boolean;
        text: string;
        hasMoved: boolean;
      }
    > = new Map();
    for (const sector of this.sectors) {
      newSectorData.set(sector, {
        isSource: false,
        isTentativeTarget: false,
        isSelfRetarget: false,
        text: "",
        hasMoved: false,
      });
    }

    for (const swipe of swipes) {
      const data = newSectorData.get(swipe.sourceSector)!;
      data.isSource = true;
      data.text = this.moveUIText(
        moveMaps[this.puzzleName][this.sectorMap.get(swipe.sourceSector)!][
          this.sectorMap.get(swipe.currentSector!)!
        ],
      );
      data.hasMoved = data.hasMoved || swipe.hasMovedAwayFromSourceSector;
      newSectorData.get(swipe.currentSector!)!.isTentativeTarget = true;
      data.isSelfRetarget =
        data.isSelfRetarget ||
        (swipe.hasMovedAwayFromSourceSector &&
          swipe.sourceSector === swipe.currentSector);
    }

    for (const [sector, data] of newSectorData.entries()) {
      sector.classList.toggle("source", data.isSource);
      sector.classList.toggle("tentative-target", data.isTentativeTarget);
      sector.classList.toggle("self-retarget", data.isSelfRetarget);
      sector.textContent = data.text;
    }

    if (swipes.length === 1 && !swipes[0].hasMovedAwayFromSourceSector) {
      this.showAllTargetMovesID++;
      this.showAllTargetMoves(swipes[0]);
    } else {
      this.classList.remove("showing-all-targets");
    }
  }

  private onSwipeFinish(source: HTMLElement, target: HTMLElement) {
    this.hideAllTargetMoves();
    const move =
      moveMaps[this.puzzleName][this.sectorMap.get(source)!][
        this.sectorMap.get(target)!
      ];
    if (move === "") {
      // nothing
    } else if (move.startsWith("/")) {
      this.actionListener(move.slice(1) as Action);
      if (move === "space") {
        this.swipeTracker.reset();
      }
    } else {
      this.moveListener(new Move(move));
    }
  }

  showAllTargetMoves(swipe: ActiveSwipe): void {
    this.showAllTargetMovesID++;
    const id = this.showAllTargetMovesID;
    setTimeout(() => {
      if (
        this.showAllTargetMovesID !== id ||
        !this.swipeTracker.isSwipeStillActive(swipe) ||
        swipe.hasMovedAwayFromSourceSector
      ) {
        return;
      }
      for (let i = 0; i < this.sectors.length; i++) {
        const targetSector = this.sectors[i];
        if (targetSector !== swipe.sourceSector) {
          targetSector.textContent = this.moveUIText(
            moveMaps[this.puzzleName][this.sectorMap.get(swipe.sourceSector)!][
              i
            ],
          );
        }
      }
      this.classList.add("showing-all-targets");
    }, 500);
  }

  hideAllTargetMoves(): void {
    this.showAllTargetMovesID++;
    this.classList.remove("showing-all-targets");
    for (const targetSector of this.sectorMap.keys()) {
      if (targetSector !== this.swipeSource) {
        targetSector.textContent = "";
      }
    }
  }

  private moveUIText(move: string): string {
    if (move.startsWith("/")) {
      return actionToUIText(move.slice(1) as Action);
    }
    return move;
  }
}

if (customElements) {
  customElements.define("swipe-grid", SwipeGrid);
}
