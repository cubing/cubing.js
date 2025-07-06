import { Alg } from "../../../../../cubing/alg";
import type { AlgLeaf } from "../../../../../cubing/alg/alg-nodes/AlgNode";
import { puzzles } from "../../../../../cubing/puzzles";
// import { BackViewLayout } from "../../../../../cubing/twisty";
import {
  type BackViewLayout,
  type ExperimentalStickering,
  TwistyPlayer,
  type TwistyPlayerConfig,
  type VisualizationFormat,
} from "../../../../../cubing/twisty";
import { getCancel, getSetup, type PuzzleID } from "../url-params";
import { SwipeGrid, type ThemeType, themes } from "./SwipeGrid";

const DEFAULT_THEME: ThemeType = "transparent-grid";

const megaminxAndKilominx = [
  ["", "U'", "U2'", "L", "dl", "u'", "L2", "", "/enter"],
  ["U", "", "U'", "BL", "Rv'", "BR'", "BL2", "Rv2'", "BR2'"],
  ["U2", "U", "", "u", "dr'", "R'", "Fv'", "", "R2'"],
  ["L'", "BL'", "u'", "", "Uv'", "Uv2'", "F'", "2L", "F2"],
  ["dl'", "Rv", "dr", "Uv", "", "Uv'", "d'", "Lv", "d"],
  ["u", "BR", "R", "Uv2", "Uv", "", "F2'", "2R'", "F"],
  ["L2'", "BL2'", "Fv", "F", "d", "F2", "", "FL", "D"],
  ["", "Rv2", "", "2L'", "Lv'", "2R", "FL'", "", "FR"],
  ["/space", "BR2", "R2", "F2'", "d'", "F'", "D'", "FR'", ""],
];

const ftoAndBabyFTO = [
  ["", "U'", "U2'", "L", "l", "u'", "L2", "2L2", "/enter"],
  ["U", "", "U'", "BL", "Rv'", "BR'", "BL2", "Rv2'", "BR2'"],
  ["U2", "U", "", "u", "r'", "R'", "Fv'", "2R2'", "R2'"],
  ["L'", "BL'", "u'", "", "Uv'", "Uv2'", "F'", "2L", "F2"],
  ["l'", "Rv", "r", "Uv", "", "Uv'", "d'", "Lv", "d"],
  ["u", "BR", "R", "Uv2", "Uv", "", "F2'", "2R'", "F"],
  ["L2'", "BL2'", "Fv", "F", "d", "F2", "", "D", "D"],
  ["2L2'", "Rv2", "2R2", "2L'", "Lv'", "2R", "D'", "", "D"],
  ["/space", "BR2", "R2", "F2'", "d'", "F'", "D'", "D'", ""],
];

export const moveMaps: Record<PuzzleID, string[][]> = {
  "3x3x3": [
    ["", "U'", "U2'", "L", "l", "u'", "L2", "M2", "/enter"],
    ["U", "", "U'", "B", "x'", "B'", "B2", "x2'", "B2'"],
    ["U2", "U", "", "u", "r'", "R'", "/backspace", "M2", "R2'"],
    ["L'", "B'", "u'", "", "y'", "y2'", "F'", "M", "F2"],
    ["l'", "x", "r", "y", "", "y'", "d'", "x'", "d"],
    ["u", "B", "R", "y2", "y", "", "F2'", "M", "F"],
    ["L2'", "B2'", "z", "F", "d", "F2", "", "D", "D2"],
    ["M2'", "x2", "M2'", "M'", "x", "M'", "D'", "", "D"],
    ["/space", "B2", "R2", "F2'", "d'", "F'", "D2'", "D'", ""],
  ],
  "2x2x2": [
    ["", "U'", "U2'", "L", "l", "u'", "L2", "M2", "/enter"],
    ["U", "", "U'", "B", "x'", "B'", "B2", "x2'", "B2'"],
    ["U2", "U", "", "u", "r'", "R'", "z'", "M2", "R2'"],
    ["L'", "B'", "u'", "", "y'", "y2'", "F'", "M", "F2"],
    ["l'", "x", "r", "y", "", "y'", "d'", "x'", "d"],
    ["u", "B", "R", "y2", "y", "", "F2'", "M", "F"],
    ["L2'", "B2'", "z", "F", "d", "F2", "", "D", "D2"],
    ["M2'", "x2", "M2'", "M'", "x", "M'", "D'", "", "D"],
    ["/space", "B2", "R2", "F2'", "d'", "F'", "D2'", "D'", ""],
  ],
  "4x4x4": [
    ["", "U'", "U2'", "L", "l", "u'", "L2", "2L2", "/enter"],
    ["U", "", "U'", "B", "Rv'", "B'", "B2", "Rv2'", "B2'"],
    ["U2", "U", "", "u", "r'", "R'", "Fv'", "2R2'", "R2'"],
    ["L'", "B'", "u'", "", "Uv'", "Uv2'", "F'", "2L", "F2"],
    ["l'", "Rv", "r", "Uv", "", "Uv'", "d'", "Lv", "d"],
    ["u", "B", "R", "Uv2", "Uv", "", "F2'", "2R'", "F"],
    ["L2'", "B2'", "Fv", "F", "d", "F2", "", "D", "D2"],
    ["2L2'", "Rv2", "2R2", "2L'", "Lv'", "2R", "D'", "", "D"],
    ["/space", "B2", "R2", "F2'", "d'", "F'", "D2'", "D'", ""],
  ],
  "5x5x5": [
    ["", "U'", "U2'", "L", "l", "u'", "L2", "2L2", "/enter"],
    ["U", "", "U'", "B", "Rv'", "B'", "B2", "Rv2'", "B2'"],
    ["U2", "U", "", "u", "r'", "R'", "Fv'", "2R2'", "R2'"],
    ["L'", "B'", "u'", "", "Uv'", "Uv2'", "F'", "2L", "F2"],
    ["l'", "Rv", "r", "Uv", "", "Uv'", "d'", "Lv", "d"],
    ["u", "B", "R", "Uv2", "Uv", "", "F2'", "2R'", "F"],
    ["L2'", "B2'", "Fv", "F", "d", "F2", "", "D", "D2"],
    ["2L2'", "Rv2", "2R2", "2L'", "Lv'", "2R", "D'", "", "D"],
    ["/space", "B2", "R2", "F2'", "d'", "F'", "D2'", "D'", ""],
  ],
  fto: ftoAndBabyFTO,
  megaminx: megaminxAndKilominx,
  kilominx: megaminxAndKilominx,
  baby_fto: ftoAndBabyFTO,
  tri_quad: [
    ["", "U'", "U2'", "", "", "", "", "", "/enter"],
    ["U", "", "U'", "", "", "", "", "", ""],
    ["U2", "U", "", "", "", "R'", "/backspace", "", "R2'"],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "R", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["/space", "", "R2", "", "", "", "", "", ""],
  ],
};

export type Action = "space" | "enter" | "backspace";

export function actionToUIText(action: Action): string {
  return {
    space: "⏮",
    enter: "▶️",
    backspace: "⃔",
  }[action];
}

function constructTwistyPlayer(
  puzzleName: PuzzleID,
  visualization: VisualizationFormat,
  experimentalStickering: ExperimentalStickering | null,
  tempoScale: number,
): TwistyPlayer {
  const config: TwistyPlayerConfig = {
    alg: new Alg(),
    puzzle: puzzleName,
    controlPanel: "none",
    background: "none",
    experimentalStickering: experimentalStickering ?? null,
    visualization,
    tempoScale,
    experimentalSetupAlg: getSetup(),
  };
  const backView = new URL(document.location.href).searchParams.get(
    "back-view",
  ) as BackViewLayout | undefined;
  if (backView) {
    config.backView = backView;
  }
  return new TwistyPlayer(config);
}

export class SwipeyPuzzle extends HTMLElement {
  public twistyPlayer: TwistyPlayer;

  theme: ThemeType;

  constructor(
    private puzzleName: PuzzleID,
    visualization: VisualizationFormat,
    stickering: ExperimentalStickering | null,
    tempoScale: number,
    private actionListener: (action: Action) => void,
    private algListener: () => void,
  ) {
    super();
    this.twistyPlayer = constructTwistyPlayer(
      puzzleName,
      visualization,
      stickering,
      tempoScale,
    );

    let theme: ThemeType | null = new URL(
      document.location.href,
    ).searchParams.get("theme") as ThemeType | null;
    if (!themes.includes(theme as ThemeType /* TODO*/)) {
      theme = DEFAULT_THEME;
    }
    this.theme = theme!;
    console.log("Using theme:", this.theme);
  }

  public setActionListener(actionListener: (action: Action) => void) {
    this.actionListener = actionListener;
  }

  public setAlgListener(algListener: () => void): void {
    this.algListener = algListener;
  }

  protected connectedCallback() {
    this.appendChild(this.twistyPlayer);

    if (this.puzzleName !== "3x3x3") {
      setTimeout(async () => {
        const icon = await this.twistyPlayer.experimentalScreenshot();
        // const icon = (
        //   this.twistyPlayer.viewerElems[0] as Twisty3DCanvas
        // ).renderToDataURL({
        //   squareCrop: true,
        // });
        console.log("Setting touch icon from canvas.");
        (
          document.querySelector(
            'link[rel="apple-touch-icon"]',
          ) as HTMLLinkElement
        ).href = icon;
      }, 100);
    }
  }

  public showGrid(): void {
    const swipeGrid: SwipeGrid = new SwipeGrid(
      this.puzzleName,
      this.onAlgLeaf.bind(this),
      (action: Action) => this.actionListener(action),
      this.theme === "grid-back" ? "blank" : this.theme,
      true,
    );
    this.appendChild(swipeGrid);

    if (this.theme === "transparent-grid" || this.theme === "grid-back") {
      const swipeGridExtra: SwipeGrid = new SwipeGrid(
        this.puzzleName,
        this.onAlgLeaf.bind(this),
        (action: Action) => this.actionListener(action),
        "transparent-grid-back",
        false,
      );
      this.prepend(swipeGridExtra);
    }
  }

  private onAlgLeaf(algLeaf: AlgLeaf): void {
    this.addAlgLeaf(algLeaf);
    this.algListener();
  }

  // TODO: move this somewhere better.
  public addAlgLeaf(algLeaf: AlgLeaf): void {
    try {
      // TODO: allow`TwistyPlayer` to handle this directly.
      this.twistyPlayer.experimentalAddAlgLeaf(algLeaf, {
        cancel: {
          directional: getCancel() ? "any-direction" : "none",
          puzzleSpecificModWrap: "gravity",
        },
        puzzleSpecificSimplifyOptions:
          puzzles[this.puzzleName]?.puzzleSpecificSimplifyOptions,
      });
    } catch {
      console.warn("Invalid alg leaf");
      // this.twistyPlayer.alg = oldAlg;
    }
  }
}

if (customElements) {
  customElements.define("swipey-puzzle", SwipeyPuzzle);
}
