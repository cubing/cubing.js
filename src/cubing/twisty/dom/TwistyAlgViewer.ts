import {
  blockMoveToString,
  Comment,
  Commutator,
  Conjugate,
  Group,
  NewLine,
  Pause,
  Sequence,
  TraversalDownUp,
} from "../../alg";
import { BlockMove } from "../../puzzle-geometry/interfaces";
import { TwistyPlayer } from "../../twisty";
import {
  customElementsShim,
  HTMLElementShim,
} from "./element/node-custom-element-shims";

class DataDown {
  earliestMoveIndex: number;
  twistyAlgViewer: ExperimentalTwistyAlgViewer;
}

class DataUp {
  moveCount: number;
  element: Element;
}

class TwistyAlgLeafElem extends HTMLElementShim {
  constructor(className: string, text: string, dataDown: DataDown) {
    super();
    this.textContent = text;
    this.classList.add(className);

    this.addEventListener("click", () => {
      dataDown.twistyAlgViewer.jumpToIndex(dataDown.earliestMoveIndex);
    });
  }
}

customElementsShim.define("twisty-alg-leaf-elem", TwistyAlgLeafElem);

class TwistyAlgWrapperElem extends HTMLElementShim {
  constructor(className: string) {
    super();
    this.classList.add(className);
  }

  addString(str: string) {
    this.append(str);
  }

  addElem(dataUp: DataUp): number {
    this.append(dataUp.element);
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
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("sequence");
    let first = true;
    for (const unit of sequence.nestedUnits) {
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
      element: new TwistyAlgLeafElem(
        "blockMove",
        blockMoveToString(blockMove),
        dataDown,
      ),
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
      moveCount: 1,
      element: new TwistyAlgLeafElem("pause", ".", dataDown),
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
      element: new TwistyAlgLeafElem(
        "comment",
        `// ${comment.comment}`,
        dataDown,
      ),
    };
  }
}

const algToDOMTreeInstance = new AlgToDOMTree();
const algToDOMTree = algToDOMTreeInstance.traverse.bind(
  algToDOMTreeInstance,
) as (alg: Sequence, dataDown: DataDown) => DataUp;

export class ExperimentalTwistyAlgViewer extends HTMLElementShim {
  #domTree: Element;
  twistyPlayer: TwistyPlayer | null = null;
  constructor(options?: { twistyPlayer?: TwistyPlayer }) {
    super();
    if (options?.twistyPlayer) {
      this.setTwistyPlayer(options?.twistyPlayer);
    }
  }

  protected connectedCallback(): void {
    // nothing to do?
  }

  private setAlg(alg: Sequence): void {
    this.#domTree = algToDOMTree(alg, {
      earliestMoveIndex: 0,
      twistyAlgViewer: this,
    }).element;
    this.textContent = "";
    this.appendChild(this.#domTree);
  }

  setTwistyPlayer(twistyPlayer: TwistyPlayer): void {
    if (this.twistyPlayer) {
      console.warn("twisty-player reassignment is not supported");
      return;
    }
    this.twistyPlayer = twistyPlayer;
    this.setAlg(this.twistyPlayer.alg);
  }

  jumpToIndex(index: number): void {
    if (this.twistyPlayer && this.twistyPlayer.cursor) {
      const timestamp =
        this.twistyPlayer.cursor.experimentalTimestampFromIndex(index) ?? 0;
      this.twistyPlayer?.timeline.setTimestamp(timestamp);
    }
  }

  protected attributeChangedCallback(
    attributeName: string,
    _oldValue: string,
    newValue: string,
  ): void {
    if (attributeName === "for") {
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
