import {
  blockMoveToString,
  Comment,
  Commutator,
  Conjugate,
  Group,
  NewLine,
  parseAlg,
  Pause,
  Sequence,
  TraversalDownUp,
} from "../../alg";
import { BlockMove } from "../../puzzle-geometry/interfaces";
import { TwistyPlayer } from "../../twisty";
import {
  CSSSource,
  ManagedCustomElement,
} from "./element/ManagedCustomElement";
import { customElementsShim } from "./element/node-custom-element-shims";

const commonCSS = new CSSSource(".wrapper { display: inherit }");
const leafCSS = new CSSSource(
  ".wrapper { cursor: pointer; } .wrapper:hover { background: rgba(0, 0, 0, 0.1) } ",
);

class DataDown {
  earliestMoveIndex: number;
  twistyAlgViewer: ExperimentalTwistyAlgViewer;
}

class DataUp {
  moveCount: number;
  element: Element;
}

class TwistyAlgLeafElem extends ManagedCustomElement {
  constructor(text: string, dataDown: DataDown) {
    super({ mode: "open" });
    this.addCSS(commonCSS);
    this.addCSS(leafCSS);

    this.contentWrapper.textContent = text;

    this.addEventListener("click", () => {
      dataDown.twistyAlgViewer.jumpToIndex(dataDown.earliestMoveIndex);
    });
  }
}

customElementsShim.define("twisty-alg-leaf-elem", TwistyAlgLeafElem);

class TwistyAlgWrapperElem extends ManagedCustomElement {
  constructor(className: string) {
    super({ mode: "open" });
    this.addCSS(commonCSS);
    this.classList.add(className);
  }

  addString(str: string) {
    this.contentWrapper.append(str);
  }

  addElem(dataUp: DataUp): number {
    this.contentWrapper.append(dataUp.element);
    return dataUp.moveCount;
  }
}

customElementsShim.define("twisty-alg-wrapper-elem", TwistyAlgWrapperElem);

// TODO: this is a copy from the `algToString()` implementation.
function repetitionSuffix(amount: number): string {
  const absAmount = Math.abs(amount);
  let s = "";
  if (absAmount !== 1) {
    s += String(absAmount);
  }
  if (absAmount !== amount) {
    s += "'";
  }
  return s;
}

class AlgToDOMTree extends TraversalDownUp<DataDown, DataUp> {
  public traverseSequence(sequence: Sequence, dataDown: DataDown): DataUp {
    console.log("trav", sequence);
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("sequence");
    let first = true;
    for (const unit of sequence.nestedUnits) {
      console.log(first, { unit });
      if (!first) {
        element.addString(" ");
      }
      first = false;
      moveCount += element.addElem(
        this.traverse(unit, {
          earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
          twistyAlgViewer: dataDown.twistyAlgViewer,
        }),
      );
    }
    return {
      moveCount: moveCount,
      element,
    };
  }

  public traverseGroup(group: Group, dataDown: DataDown): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("group");
    element.addString("(");
    moveCount += element.addElem(
      this.traverse(group.nestedSequence, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
      }),
    );
    element.addString(")" + repetitionSuffix(group.amount));
    return {
      moveCount: moveCount * group.amount,
      element,
    };
  }

  public traverseBlockMove(blockMove: BlockMove, dataDown: DataDown): DataUp {
    return {
      moveCount: 1,
      element: new TwistyAlgLeafElem(blockMoveToString(blockMove), dataDown),
    };
  }

  public traverseCommutator(
    commutator: Commutator,
    dataDown: DataDown,
  ): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("commutator");
    element.addString("[");
    moveCount += element.addElem(
      this.traverse(commutator.A, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
      }),
    );
    element.addString(", ");
    moveCount += element.addElem(
      this.traverse(commutator.B, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
      }),
    );
    element.addString("]" + repetitionSuffix(commutator.amount));
    return {
      moveCount: moveCount * 2 * commutator.amount,
      element,
    };
  }

  public traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("conjugate");
    element.addString("[");
    const aLen = element.addElem(
      this.traverse(conjugate.A, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
      }),
    );
    moveCount += aLen;
    element.addString(": ");
    moveCount += element.addElem(
      this.traverse(conjugate.B, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
      }),
    );
    element.addString("]" + repetitionSuffix(conjugate.amount));
    return {
      moveCount: (moveCount + aLen) * conjugate.amount,
      element,
    };
  }

  public traversePause(_pause: Pause, dataDown: DataDown): DataUp {
    return {
      moveCount: dataDown.earliestMoveIndex + 1,
      element: new TwistyAlgLeafElem(".", dataDown),
    };
  }

  public traverseNewLine(_newLine: NewLine, _dataDown: DataDown): DataUp {
    return {
      moveCount: 0,
      element: document.createElement("br"),
    };
  }

  public traverseComment(comment: Comment, dataDown: DataDown): DataUp {
    return {
      moveCount: 0,
      element: new TwistyAlgLeafElem(`// ${comment.comment}`, dataDown),
    };
  }
}

const algToDOMTreeInstance = new AlgToDOMTree();
const algToDOMTree = algToDOMTreeInstance.traverse.bind(
  algToDOMTreeInstance,
) as (alg: Sequence, dataDown: DataDown) => DataUp;

export class ExperimentalTwistyAlgViewer extends ManagedCustomElement {
  #alg: Sequence;
  #domTree: Element;
  twistyPlayer: TwistyPlayer | null = null;
  constructor(options?: { twistyPlayer?: TwistyPlayer }) {
    super({ mode: "open" });
    this.addCSS(commonCSS);
    if (options?.twistyPlayer) {
      this.setTwistyPlayer(options?.twistyPlayer);
    }
  }

  protected connectedCallback(): void {
    // nothing to do?
  }

  private setAlg(alg: Sequence): void {
    this.#alg = alg;
    this.#domTree = algToDOMTree(alg, {
      earliestMoveIndex: 0,
      twistyAlgViewer: this,
    }).element;
    this.contentWrapper.textContent = "";
    this.contentWrapper.appendChild(this.#domTree);
  }

  setTwistyPlayer(twistyPlayer: TwistyPlayer): void {
    this.twistyPlayer = twistyPlayer;
    this.setAlg(this.twistyPlayer.alg);
  }

  jumpToIndex(index: number): void {
    console.log(index);
    if (this.twistyPlayer && this.twistyPlayer.cursor) {
      console.log(this.twistyPlayer, index);
      const timestamp =
        this.twistyPlayer.cursor.experimentalTimestampFromIndex(index) ?? 0;
      console.log(timestamp);
      this.twistyPlayer?.timeline.setTimestamp(timestamp);
    }
  }

  protected attributeChangedCallback(
    attributeName: string,
    _oldValue: string,
    newValue: string,
  ): void {
    if (attributeName === "for") {
      if (this.twistyPlayer) {
        console.warn("for= reassignment is not supported");
        return;
      }
      const elem = document.getElementById(newValue);
      if (!elem) {
        console.warn("for= elem does not exist");
        return;
      }
      if (!(elem instanceof TwistyPlayer)) {
        console.warn("for= elem is not a twisty-player");
        return;
      }
      this.setTwistyPlayer(elem);
    }
  }

  static get observedAttributes(): string[] {
    return ["for"];
  }
}

customElementsShim.define(
  "experimental-twisty-alg-viewer",
  ExperimentalTwistyAlgViewer,
);

// const alg = parseAlg("R U R'");
const alg = parseAlg(
  "y x' // inspection\nU R2 U' F' L F' U' L' // XX-Cross + EO\nU' R U R' // 3rd slot\nR' U R U2' R' U R // 4th slot\nU R' U' R U' R' U2 R // OLL / ZBLL\nU // AUF",
);

// from http://cubesolv.es/solve/5757");
const twistyPlayer = new TwistyPlayer({
  experimentalSetupAlg: parseAlg("F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2"),
  alg,
});
twistyPlayer.id = "hello-there";

document.body.appendChild(twistyPlayer);
const twistyAlgViewer = new ExperimentalTwistyAlgViewer({ twistyPlayer });
// twistyAlgViewer.setAlg(alg);
document.body.appendChild(twistyAlgViewer);
