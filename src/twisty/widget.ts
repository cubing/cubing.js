import { Vector3 } from "three";
import { algToString, BlockMove, Sequence } from "../alg";
import { Combine, KPuzzleDefinition, stateForBlockMove, SVG, Transformation } from "../kpuzzle";
import { Cube3D } from "./3D/cube3D";
import { PG3D } from "./3D/pg3D";
import { AnimModel, CursorObserver, DirectionObserver, JumpObserver } from "./anim";
import { getConfigWithDefault } from "./config";
import { Cursor } from "./cursor";
import { Puzzle } from "./puzzle";

export type VisualizationFormat = "2D" | "3D" | "PG3D";

declare global {
  interface Document {
    mozCancelFullScreen: () => void;
    msExitFullscreen: () => void;
    mozFullScreenElement: HTMLElement;
    msFullscreenElement: HTMLElement;
    webkitFullscreenElement: HTMLElement;
  }

  interface Element {
    mozRequestFullScreen: () => void;
    msRequestFullscreen: () => void;
  }
}

export function currentFullscreenElement(): Element {
  return document.fullscreenElement ||
    document.webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement ||
    document.webkitFullscreenElement;
}
export function fullscreenRequest(element: HTMLElement): void {
  const requestFullscreen = element.requestFullscreen ||
    (element as any).mozRequestFullScreen ||
    (element as any).msRequestFullscreen ||
    (element as any).webkitRequestFullscreen;
  requestFullscreen.call(element);
}
export function fullscreenExit(): void {
  const exitFullscreen = document.exitFullscreen ||
    (document as any).mozCancelFullScreen ||
    (document as any).msExitFullscreen ||
    (document as any).webkitExitFullscreen;
  exitFullscreen.call(document);
}

// TODO: Expose this as a config per instance.
let showJumpingFlash = true;
export function experimentalShowJumpingFlash(show: boolean): void {
  showJumpingFlash = show;
}

export abstract class Button {
  public element: HTMLButtonElement;
  constructor(title: string, initialClass: string) {
    this.element = document.createElement("button");
    this.element.title = title;
    // TODO: Handle updating image based on anim state.
    this.element.classList.add(initialClass);
    this.element.addEventListener("click", this.onpress.bind(this));
  }

  public abstract onpress(): void;
}

// tslint:disable-next-line no-namespace // TODO: nested module?
export namespace Button {

  export class Fullscreen extends Button {
    constructor(private fullscreenElement: HTMLElement) {
      super("Full Screen", "fullscreen");
    }

    public onpress(): void {
      if (currentFullscreenElement() === this.fullscreenElement) {
        fullscreenExit();
      } else {
        fullscreenRequest(this.fullscreenElement);
      }
    }
  }

  export class SkipToStart extends Button {
    constructor(private anim: AnimModel) {
      super("Skip To Start", "skip-to-start");
    }
    public onpress(): void { this.anim.skipToStart(); }
  }
  export class SkipToEnd extends Button {
    constructor(private anim: AnimModel) {
      super("Skip To End", "skip-to-end");
    }
    public onpress(): void { this.anim.skipToEnd(); }
  }
  export class PlayPause extends Button implements DirectionObserver {
    constructor(private anim: AnimModel) {
      super("Play", "play");
      this.anim.dispatcher.registerDirectionObserver(this);
    }
    public onpress(): void {
      if (this.anim.isPaused() && this.anim.isAtEnd()) {
        this.anim.skipToStart();
      }
      this.anim.togglePausePlayForward();
    }
    public animDirectionChanged(direction: Cursor.Direction): void {
      // TODO: Handle flash of pause button when pressed while the Twisty is already at the end.
      const newClass = direction === Cursor.Direction.Paused ? "play" : "pause";
      this.element.classList.remove("play", "pause");
      this.element.classList.add(newClass);

      this.element.title = direction === Cursor.Direction.Paused ? "Play" : "Pause";
    }
  }
  export class StepForward extends Button {
    constructor(private anim: AnimModel) {
      super("Step forward", "step-forward");
    }
    public onpress(): void { this.anim.stepForward(); }
  }
  export class StepBackward extends Button {
    constructor(private anim: AnimModel) {
      super("Step backward", "step-backward");
    }
    public onpress(): void { this.anim.stepBackward(); }
  }
}

export class ControlBar {
  public element: HTMLElement;
  constructor(anim: AnimModel, twistyElement: HTMLElement) {
    this.element = document.createElement("twisty-control-bar");

    this.element.appendChild((new Button.Fullscreen(twistyElement)).element);
    this.element.appendChild((new Button.SkipToStart(anim)).element);
    this.element.appendChild((new Button.StepBackward(anim)).element);
    this.element.appendChild((new Button.PlayPause(anim)).element);
    this.element.appendChild((new Button.StepForward(anim)).element);
    this.element.appendChild((new Button.SkipToEnd(anim)).element);
  }
}

export class Scrubber implements CursorObserver {
  public readonly element: HTMLInputElement;
  constructor(private anim: AnimModel) {
    this.element = document.createElement("input");
    this.element.classList.add("scrubber");
    this.element.type = "range";

    this.element.addEventListener("input", this.oninput.bind(this));
    this.updateFromAnim();
    this.anim.dispatcher.registerCursorObserver(this);
  }

  public updateFromAnim(): void {
    const bounds = this.anim.getBounds();
    this.element.min = String(bounds[0]);
    this.element.max = String(bounds[1]);
    this.element.value = String(this.anim.cursor.currentTimestamp());
  }

  public animCursorChanged(cursor: Cursor<Puzzle>): void {
    this.element.value = String(cursor.currentTimestamp());
    this.updateBackground();
  }

  public animBoundsChanged(): void {
    // TODO
    this.updateBackground();
  }

  private updateBackground(): void {
    // TODO: Figure out the most efficient way to do this.
    // TODO: Pad by the thumb radius at each end.
    const min = parseInt(this.element.min, 10);
    const max = parseInt(this.element.max, 10);
    const value = parseInt(this.element.value, 10);
    const v = (value - min) / max * 100;
    this.element.style.background = `linear-gradient(to right, \
      rgb(0, 63, 255) 0%, \
      rgb(0, 63, 255) ${v}%, \
      rgba(0, 0, 0, 0.25) ${v}%, \
      rgba(0, 0, 0, 0.25) 100%\
      )`;
  }

  private oninput(): void {
    // TODO: Ideally, we should prevent this from firing back.
    this.anim.skipAndPauseTo(parseInt(this.element.value, 10));
    this.updateBackground();
  }
}

export class CursorTextView implements CursorObserver {
  public readonly element: HTMLElement;
  constructor(private anim: AnimModel) {
    this.element = document.createElement("cursor-text-view");
    this.element.textContent = String(this.anim.cursor.currentTimestamp());
    this.anim.dispatcher.registerCursorObserver(this);
  }

  public animCursorChanged(cursor: Cursor<Puzzle>): void {
    this.element.textContent = String(Math.floor(cursor.currentTimestamp()));
  }
}

export class CursorTextMoveView implements CursorObserver {
  public readonly element: HTMLElement;
  constructor(private anim: AnimModel) {
    this.element = document.createElement("cursor-text-view");
    this.anim.dispatcher.registerCursorObserver(this);

    // var durFn = new Cursor.AlgDuration(Cursor.DefaultDurationForAmount); // TODO

    this.animCursorChanged(anim.cursor);
  }

  public animCursorChanged(cursor: Cursor<Puzzle>): void {
    const pos = cursor.currentPosition();
    let s = "" + Math.floor(cursor.currentTimestamp());
    if (pos.moves.length > 0) {
      // TODO: cache the name.
      // TODO: Don't wrap in Sequence if we can add toString() to AlgPart interface?
      s += " " + algToString(new Sequence([pos.moves[0].move])) + " " + this.formatFraction(pos.moves[0].fraction);
    }
    this.element.textContent = s;
  }

  private formatFraction(k: number): string {
    return (String(k) + (Math.floor(k) === k ? "." : "") + "000000").slice(0, 5);
  }
}

export class KSolveView implements CursorObserver, JumpObserver {
  public readonly element: HTMLElement;
  private svg: SVG;
  constructor(private anim: AnimModel, private definition: KPuzzleDefinition) {
    this.element = document.createElement("ksolve-svg-view");
    this.anim.dispatcher.registerCursorObserver(this);
    this.anim.dispatcher.registerJumpObserver(this);

    this.svg = new SVG(definition); // TODO: Dynamic puzzle
    this.element.appendChild(this.svg.element);
  }

  public animCursorChanged(cursor: Cursor<Puzzle>): void {
    const pos = cursor.currentPosition();
    if (pos.moves.length > 0) {

      const move = (pos.moves[0].move as BlockMove);

      const def = this.definition;
      const partialMove = new BlockMove(move.outerLayer, move.innerLayer, move.family, move.amount * pos.moves[0].direction);
      const newState = Combine(
        def,
        pos.state as Transformation,
        stateForBlockMove(def, partialMove),
      );
      this.svg.draw(this.definition, pos.state as Transformation, newState, pos.moves[0].fraction);
    } else {
      this.svg.draw(this.definition, pos.state as Transformation);
    }
  }

  public animCursorJumped(): void {
    if (showJumpingFlash) {
      this.element.classList.add("flash");
      setTimeout(() => this.element.classList.remove("flash"), 0);
    }
  }
}

interface Cube3DViewConfig {
  experimentalShowBackView?: boolean;
}

export class Cube3DView implements CursorObserver, JumpObserver {
  public readonly element: HTMLElement;
  private cube3D: Cube3D;
  constructor(private anim: AnimModel, definition: KPuzzleDefinition, private config: Cube3DViewConfig = {}) {
    this.element = document.createElement("cube3d-view");

    this.element.tabIndex = 0; // TODO: Use this to capture keyboard input.
    this.anim.dispatcher.registerCursorObserver(this);
    this.anim.dispatcher.registerJumpObserver(this);

    this.cube3D = new Cube3D(definition); // TODO: Dynamic puzzle

    const wrapper = document.createElement("cube3d-wrapper");
    wrapper.classList.add("front");
    this.element.appendChild(wrapper);
    setTimeout(() => {
      this.cube3D.newVantage(wrapper);
    }, 0);

    if (getConfigWithDefault(this.config.experimentalShowBackView, false)) {
      this.createBackViewForTesting();
    }
  }

  // TODO: Remove
  public createBackViewForTesting(): void {
    const wrapper = document.createElement("cube3d-wrapper");
    wrapper.classList.add("back");
    this.element.appendChild(wrapper);
    setTimeout(() => {
      this.cube3D.newVantage(wrapper, { position: new Vector3(-1.25, -2.5, -2.5) });
    }, 0);
  }

  public animCursorChanged(cursor: Cursor<Puzzle>): void {
    this.cube3D.draw(cursor.currentPosition());
  }

  public animCursorJumped(): void {
    if (showJumpingFlash) {
      this.element.classList.add("flash");
      setTimeout(() => this.element.classList.remove("flash"), 0);
    }
  }

  public experimentalGetCube3D(): Cube3D {
    return this.cube3D;
  }
}

interface PG3DViewConfig {
  stickerDat: any;
  sideBySide?: boolean;
  showFoundation?: boolean;
}

export class PG3DView implements CursorObserver, JumpObserver {
  public readonly element: HTMLElement;
  private pg3D: PG3D;
  constructor(private anim: AnimModel, private definition: KPuzzleDefinition,
              private config: PG3DViewConfig) {
    this.element = document.createElement("cube3d-view");
    if (getConfigWithDefault(this.config.sideBySide, false)) {
      this.element.classList.add("side-by-side");
    }
    const wrapper = document.createElement("cube3d-wrapper");
    wrapper.classList.add("front");
    this.element.appendChild(wrapper);
    this.anim.dispatcher.registerCursorObserver(this);
    this.anim.dispatcher.registerJumpObserver(this);

    this.pg3D = new PG3D(this.definition, this.config.stickerDat, getConfigWithDefault(this.config.showFoundation, false)); // TODO: Dynamic puzzle

    setTimeout(function(): void {
      this.pg3D.newVantage(wrapper, { position: new Vector3(0, 0, -8), shift: this.config.sideBySide ? -1 : 0 });
    }.bind(this), 0);

    this.createBackViewForTesting();
  }

  public animCursorChanged(cursor: Cursor<Puzzle>): void {
    this.pg3D.draw(cursor.currentPosition());
  }

  public animCursorJumped(): void {
    // console.log("jumped KSolve");
    if (showJumpingFlash) {
      this.element.classList.add("flash");
      setTimeout(() => this.element.classList.remove("flash"), 0);
    }
  }

  public experimentalGetPG3D(): PG3D {
    return this.pg3D;
  }

  // TODO: Remove
  private createBackViewForTesting(): void {
    const wrapper = document.createElement("cube3d-wrapper");
    wrapper.classList.add("back");
    this.element.appendChild(wrapper);
    setTimeout(function(): void {
      this.pg3D.newVantage(wrapper, { position: new Vector3(0, 0, 8), shift: this.config.sideBySide ? 1 : 0 });
    }.bind(this), 0);
  }
}

export interface PlayerConfig {
  visualizationFormat?: VisualizationFormat;
  experimentalShowControls?: boolean;
  experimentalCube3DViewConfig?: Cube3DViewConfig;
  experimentalPG3DViewConfig?: PG3DViewConfig;
}

export class Player {
  public element: HTMLElement;
  public cube3DView: Cube3DView; // TODO
  public pg3DView: PG3DView; // TODO
  private scrubber: Scrubber;
  constructor(private anim: AnimModel, definition: KPuzzleDefinition, private config: PlayerConfig = {}) {
    this.element = document.createElement("player");

    if (this.config.visualizationFormat === "PG3D") {
      this.element.appendChild((this.pg3DView = new PG3DView(this.anim, definition, config.experimentalPG3DViewConfig!)).element);
    } else if (this.config.visualizationFormat === "3D") {
      if (definition.name === "333") {
        this.element.appendChild((this.cube3DView = new Cube3DView(this.anim, definition, this.config.experimentalCube3DViewConfig)).element);
      } else {
        console.warn(`3D visualization specified for unsupported puzzle: ${definition.name}. Falling back to 2D.`);
        this.element.appendChild((new KSolveView(this.anim, definition)).element);
      }
    } else {
      if (!this.config.visualizationFormat && definition.name === "333") {
        this.element.appendChild((this.cube3DView = new Cube3DView(this.anim, definition, this.config.experimentalCube3DViewConfig)).element);
      } else {
        this.element.appendChild((new KSolveView(this.anim, definition)).element);
      }
    }
    this.scrubber = new Scrubber(this.anim);
    if (getConfigWithDefault(this.config.experimentalShowControls, true)) {
      this.element.appendChild(this.scrubber.element);
      this.element.appendChild((new ControlBar(this.anim, this.element)).element);
      this.element.appendChild((new CursorTextMoveView(this.anim)).element);
    }
  }

  public updateFromAnim(): void {
    this.scrubber.updateFromAnim();
  }
}
