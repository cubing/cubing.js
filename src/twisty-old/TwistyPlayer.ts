import {
  BlockMove,
  experimentalAppendBlockMove,
  parse,
  Sequence,
} from "../alg";
import { KPuzzleDefinition, Puzzles } from "../kpuzzle";
import { AnimModel } from "./anim";
import { mainStyleText } from "./css";
import { Cursor } from "./cursor";
import { KSolvePuzzle, Puzzle } from "./puzzle";
import { Player, PlayerConfig } from "./widget";

export class TwistyParams {
  public alg?: Sequence;
  public puzzle?: KPuzzleDefinition;
  public playerConfig?: PlayerConfig;
}

// TODO: Turn Twisty into a module and move Twisty.Twisty into Twisty proper.
export class TwistyPlayer extends HTMLElement {
  #shadow: ShadowRoot;
  #wrapper: HTMLDivElement = document.createElement("div");
  #styleElem: HTMLStyleElement;

  #cachedParams: TwistyParams | undefined;

  // tslint:disable-next-line: member-access // TODO: Remove once we have a linter that understands private fields.
  #anim: AnimModel;
  // tslint:disable-next-line: member-access // TODO: Remove once we have a linter that understands private fields.
  #cursor: Cursor<Puzzle>;
  // tslint:disable-next-line: member-access // TODO: Remove once we have a linter that understands private fields.
  #player: Player;
  private alg: Sequence;
  private puzzleDef: KPuzzleDefinition; // TODO: Replace this with a Puzzle instance.
  private coalesceModFunc: (mv: BlockMove) => number;
  constructor(cachedParams?: TwistyParams) {
    super();

    this.#cachedParams = cachedParams;

    this.#shadow = this.attachShadow({ mode: "closed" });
    this.#wrapper.classList.add("wrapper");
    this.#shadow.appendChild(this.#wrapper);

    this.#styleElem = document.createElement("style");
    this.#styleElem.textContent = mainStyleText;
    this.#shadow.appendChild(this.#styleElem);
  }

  protected connectedCallback(): void {
    // TODO: unify config storage
    let params = this.#cachedParams;
    if (!params) {
      params = {
        alg: parse(this.getAttribute("alg") ?? ""),
        puzzle: Puzzles[this.getAttribute("puzzle") ?? "3x3x3"],
        playerConfig: {
          visualizationFormat: (this.getAttribute("visualization") ??
            undefined) as any, // TODO
        },
      };
    }

    this.alg = params.alg ?? new Sequence([]);
    this.puzzleDef = params.puzzle ?? Puzzles["3x3x3"];
    this.#cursor = new Cursor(this.alg, new KSolvePuzzle(this.puzzleDef));
    // this.timeline = new Timeline(Example.HeadlightSwaps);
    this.#anim = new AnimModel(this.#cursor);

    this.#player = new Player(this.#anim, this.puzzleDef, params.playerConfig);
    this.#wrapper.appendChild(this.#player.element);
    this.coalesceModFunc = (_mv: BlockMove): number => 0;
  }

  // Set the callback function to get the modulo for coalescing from a BlockMove.
  public setCoalesceModFunc(f: (mv: BlockMove) => number): void {
    this.coalesceModFunc = f;
  }

  // Plays the full final move if there is one.
  public experimentalSetAlg(
    alg: Sequence,
    allowAnimation: boolean = false,
  ): void {
    this.#cursor.experimentalSetMoves(alg);
    this.#anim.skipToStart();
    this.alg = alg;
    this.#anim.skipToEnd();
    this.#player.updateFromAnim();
    if (allowAnimation && this.#anim.cursor.currentTimestamp() > 0) {
      // TODO: This is a hack.
      this.#cursor.backward(0.01, false); // TODO: Give this API to `Cursor`/`AnimModel`.
      this.#cursor.backward(100000, true); // TODO: Give this API to `Cursor`/`AnimModel`.
      this.#anim.stepForward();
    }
  }
  // We append a move as normal, except we animate *just* the last move *even* if
  // the last move was merged with a previous one.
  public experimentalSetAlgAnimateBlockMove(
    alg: Sequence,
    move: BlockMove,
  ): void {
    this.#anim.skipToStart();
    this.alg = alg;
    this.#anim.skipToEnd();
    this.#cursor.experimentalUpdateAlgAnimate(alg, move);
    this.#player.updateFromAnim();
    this.#anim.stepForward();
  }

  public experimentalAddMove(move: BlockMove): void {
    const coalesceMod = this.coalesceModFunc(move);
    const newAlg = experimentalAppendBlockMove(
      this.alg,
      move,
      true,
      coalesceMod,
    );
    this.experimentalSetAlgAnimateBlockMove(newAlg, move);
  }

  public experimentalGetAnim(): AnimModel {
    return this.#anim;
  }

  public experimentalGetPlayer(): Player {
    return this.#player;
  }

  public experimentalGetCursor(): Cursor<Puzzle> {
    return this.#cursor;
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player", TwistyPlayer);
}
