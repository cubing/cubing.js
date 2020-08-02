import {
  BlockMove,
  experimentalAppendBlockMove,
  parse,
  Sequence,
} from "../../alg";
import { Puzzles, KPuzzleDefinition } from "../../kpuzzle";
import { AlgCursor } from "../animation/alg/AlgCursor";
import { Timeline } from "../animation/Timeline";
import { TwistyControlButtonPanel } from "./controls/buttons";
import { TwistyControlElement } from "./controls/TwistyControlElement.ts";
import { TwistyScrubber } from "./controls/TwistyScrubber";
import { ManagedCustomElement } from "./ManagedCustomElement";
import { twistyPlayerCSS } from "./TwistyPlayer.css";
import { Cube3DCanvas } from "./viewers/Cube3DCanvas";
import { getPG3DCanvasDefinition, PG3DCanvas } from "./viewers/PG3DCanvas";
import { Twisty2DSVG } from "./viewers/Twisty2DSVG";
import { TwistyViewerElement } from "./viewers/TwistyViewerElement";
import { StickerDat } from "../../puzzle-geometry";
import { Vector3 } from "three";
import { PG3D } from "../../twisty-old/3D/pg3D";

export type VisualizationFormat = "2D" | "3D" | "PG3D";
const visualizationFormats: VisualizationFormat[] = ["2D", "3D", "PG3D"];

export interface LegacyExperimentalPG3DViewConfig {
  def: KPuzzleDefinition;
  stickerDat: StickerDat;
  experimentalPolarVantages?: boolean;
  sideBySide?: boolean;
  showFoundation?: boolean;
  experimentalInitialVantagePosition?: Vector3;
}

export interface TwistyPlayerInitialConfig {
  alg?: Sequence;
  puzzle?: string;
  visualization?: VisualizationFormat;

  legacyExperimentalPG3DViewConfig?: LegacyExperimentalPG3DViewConfig;
}

class TwistyPlayerConfig {
  alg: Sequence;
  puzzle: string;
  visualization: VisualizationFormat;
  constructor(initialConfig: TwistyPlayerInitialConfig) {
    this.alg = initialConfig.alg ?? new Sequence([]);
    this.puzzle = initialConfig.puzzle ?? "3x3x3";
    this.visualization = initialConfig.visualization ?? "3D";
  }
}

// <twisty-player>
export class TwistyPlayer extends ManagedCustomElement {
  viewers: TwistyViewerElement[];
  controls: TwistyControlElement[];
  timeline: Timeline;
  #cursor: AlgCursor;
  #currentConfig: TwistyPlayerConfig;
  private legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null;
  public legacyExperimentalCoalesceModFunc: (mv: BlockMove) => number = (
    _mv: BlockMove,
  ): number => 0;

  public legacyExperimentalPG3D: PG3D | null = null;
  // TODO: support config from DOM.
  constructor(initialConfig: TwistyPlayerInitialConfig = {}) {
    super();
    this.#currentConfig = new TwistyPlayerConfig(initialConfig);

    this.legacyExperimentalPG3DViewConfig =
      initialConfig.legacyExperimentalPG3DViewConfig ?? null;
  }

  protected connectedCallback(): void {
    this.processAttributes();

    this.timeline = new Timeline();

    const viewer = this.createViewer(
      this.timeline,
      this.#currentConfig.alg,
      this.#currentConfig.visualization,
      this.#currentConfig.puzzle,
    );
    const scrubber = new TwistyScrubber(this.timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(this.timeline, this);

    this.viewers = [viewer];
    this.controls = [scrubber, controlButtonGrid];

    this.addElement(this.viewers[0]);
    this.addElement(this.controls[0]);
    this.addElement(this.controls[1]);

    this.addCSS(twistyPlayerCSS);
  }

  protected createViewer(
    timeline: Timeline,
    alg: Sequence,
    visualization: VisualizationFormat,
    puzzleName: string,
  ): TwistyViewerElement {
    switch (visualization) {
      case "2D":
        console.log("2D", puzzleName);
        try {
          this.#cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg);
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.#cursor = new AlgCursor(
            timeline,
            Puzzles[puzzleName],
            new Sequence([]),
          );
        }
        this.timeline.addCursor(this.#cursor);
        this.timeline.jumpToEnd();
        return new Twisty2DSVG(this.#cursor, Puzzles[puzzleName]);
      case "3D":
        console.log("3D", puzzleName);
        if (puzzleName === "3x3x3") {
          try {
            this.#cursor = new AlgCursor(timeline, Puzzles["3x3x3"], alg);
          } catch (e) {
            // TODO: Deduplicate fallback.
            this.#cursor = new AlgCursor(
              timeline,
              Puzzles["3x3x3"],
              new Sequence([]),
            );
          }
          this.timeline.addCursor(this.#cursor);
          this.timeline.jumpToEnd();
          return new Cube3DCanvas(this.#cursor);
        }
      // fallthrough for 3D when not 3x3x3
      case "PG3D": {
        const def =
          this.legacyExperimentalPG3DViewConfig?.def ??
          getPG3DCanvasDefinition(puzzleName);
        try {
          this.#cursor = new AlgCursor(timeline, def, alg);
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.#cursor = new AlgCursor(timeline, def, new Sequence([]));
        }
        this.timeline.addCursor(this.#cursor);
        this.timeline.jumpToEnd();
        const pg3dCanvas = new PG3DCanvas(
          this.#cursor,
          puzzleName,
          this.legacyExperimentalPG3DViewConfig,
        );
        this.legacyExperimentalPG3D = pg3dCanvas.legacyExperimentalPG3D();
        return pg3dCanvas;
      }
    }
  }

  setAlg(alg: Sequence): void {
    this.#currentConfig.alg = alg;
    this.#cursor.setAlg(this.#currentConfig.alg);
  }

  // TODO: Handle playing the new move vs. just modying the alg.
  experimentalAddMove(move: BlockMove): void {
    const newAlg = experimentalAppendBlockMove(
      this.#currentConfig.alg,
      move,
      true,
      this.legacyExperimentalCoalesceModFunc(move),
    );

    this.timeline.jumpToEnd();
    this.setAlg(newAlg);
    this.timeline.play();
  }

  fullscreen(): void {
    this.requestFullscreen();
  }

  private processAttributes(): void {
    const config = this.#currentConfig;

    const algAttribute = this.getAttribute("alg");
    if (algAttribute) {
      try {
        config.alg = parse(algAttribute);
      } catch (e) {
        console.log("Invalid initial alg:", e);
      }
    }

    config.puzzle = this.getAttribute("puzzle") ?? config.puzzle;

    const visualizationAttribute = this.getAttribute("visualization");
    if (
      visualizationAttribute &&
      (visualizationFormats as string[]).includes(visualizationAttribute)
    ) {
      config.visualization = visualizationAttribute as VisualizationFormat;
    }
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player", TwistyPlayer);
}
