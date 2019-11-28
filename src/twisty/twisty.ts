import { BlockMove, Example, parse, Sequence } from "../alg";
import { KPuzzleDefinition, Puzzles } from "../kpuzzle";

import { AnimModel } from "./anim";
import { Cursor } from "./cursor";
import { KSolvePuzzle, Puzzle } from "./puzzle";
import { Player, PlayerConfig } from "./widget";

class TwistyParams {
  public alg?: Sequence;
  public puzzle?: KPuzzleDefinition;
  public playerConfig?: PlayerConfig;
}

// TODO: Turn Twisty into a module and move Twisty.Twisty into Twisty proper.
export class Twisty {
  private alg: Sequence;
  private anim: AnimModel;
  private cursor: Cursor<Puzzle>;
  private puzzleDef: KPuzzleDefinition; // TODO: Replace this with a Puzzle instance.
  private player: Player;
  constructor(public element: Element, config: TwistyParams = {}) {
    this.alg = config.alg || Example.Niklas;
    this.puzzleDef = config.puzzle || Puzzles["333"];
    this.cursor = new Cursor(this.alg, new KSolvePuzzle(this.puzzleDef));
    // this.timeline = new Timeline(Example.HeadlightSwaps);
    this.anim = new AnimModel(this.cursor);

    this.player = new Player(this.anim, this.puzzleDef, config.playerConfig);
    this.element.appendChild((this.player).element);
  }

  // Plays the full final move if there is one.
  public experimentalSetAlg(alg: Sequence): void {
    this.anim.skipToStart();
    this.alg = alg;
    this.cursor.experimentalSetMoves(alg);
    this.anim.skipToEnd();
    this.player.updateFromAnim();
    if (this.anim.cursor.currentTimestamp() > 0) {
      // TODO: This is a hack.
      this.cursor.backward(0.01, false); // TODO: Give this API to `Cursor`/`AnimModel`.
      this.cursor.backward(100000, true); // TODO: Give this API to `Cursor`/`AnimModel`.
      this.anim.stepForward();
    }
  }

  public experimentalAddMove(move: BlockMove): void {
    const newAlg = new Sequence(this.alg.nestedUnits.concat([move]));
    this.experimentalSetAlg(newAlg);
  }

  public experimentalGetPlayer(): Player {
    return this.player;
  }

  public experimentalGetCursor(): Cursor<Puzzle> {
    return this.cursor;
  }
}

function paramsFromTwistyElem(elem: Element): TwistyParams {
  const params = new TwistyParams();

  const puzzle = elem.getAttribute("puzzle");
  if (puzzle) {
    params.puzzle = Puzzles[puzzle];
  }

  const algo = elem.getAttribute("alg");
  if (algo) {
    params.alg = parse(algo); // TODO: parse
  }

  const visualization = elem.getAttribute("visualization");
  // TODO: Factor this code out for testing.
  if (visualization) {
    if (visualization === "2D" || visualization === "3D") {
      params.playerConfig = { visualizationFormat: visualization };
    } else {
      console.warn(`Invalid visualization: ${visualization}`);
    }
  }

  return params;
}

// Initialize a Twisty for the given Element unless the element's
// `initialization` attribute is set to `custom`.
function autoInitialize(elem: Element): Twisty | null {
  const ini = elem.getAttribute("initialization");
  const params = paramsFromTwistyElem(elem);
  if (ini !== "custom") {
    return new Twisty(elem, params);
  }
  return null;
}

function autoInitializePage(): void {
  const elems = document.querySelectorAll("twisty");
  if (elems.length > 0) {
    console.log(`Found ${elems.length} twisty elem${elems.length === 1 ? "" : "s"} on page.`);
  }

  elems.forEach(autoInitialize);
}

if (typeof window !== "undefined") {
  window.addEventListener("load", autoInitializePage);
}
