import {
  BlockMove,
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
import { TwistyPlayer } from "../../twisty";
import { TimeRange } from "../animation/cursor/AlgCursor";
import {
  Direction,
  MillisecondTimestamp,
} from "../animation/cursor/CursorTypes";
import {
  customElementsShim,
  HTMLElementShim,
} from "./element/node-custom-element-shims";

type DefiniteDirection = Direction.Forwards | Direction.Backwards;

class DataDown {
  earliestMoveIndex: number;
  twistyAlgViewer: ExperimentalTwistyAlgViewer;
  direction: DefiniteDirection;
}

class DataUp {
  moveCount: number;
  element: TwistyAlgWrapperElem | TwistyAlgLeafElem;
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

  pathToIndex(_index: number): (TwistyAlgWrapperElem | TwistyAlgLeafElem)[] {
    return [];
  }
}

customElementsShim.define("twisty-alg-leaf-elem", TwistyAlgLeafElem);

class TwistyAlgWrapperElem extends HTMLElementShim {
  private queue: (Element | Text)[] = [];

  constructor(className: string) {
    super();
    this.classList.add(className);
  }

  addString(str: string) {
    this.queue.push(document.createTextNode(str));
  }

  addElem(dataUp: DataUp): number {
    this.queue.push(dataUp.element);
    return dataUp.moveCount;
  }

  flushQueue(direction: DefiniteDirection = Direction.Forwards): void {
    for (const node of maybeReverseList(this.queue, direction)) {
      this.append(node);
    }
    this.queue = [];
  }

  pathToIndex(_index: number): (TwistyAlgWrapperElem | TwistyAlgLeafElem)[] {
    return [];
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

function oppositeDirection(direction: DefiniteDirection): DefiniteDirection {
  return direction === Direction.Forwards
    ? Direction.Backwards
    : Direction.Forwards;
}

function updateDirectionByAmount(
  currentDirection: DefiniteDirection,
  amount: number,
): DefiniteDirection {
  return amount < 0 ? oppositeDirection(currentDirection) : currentDirection;
}

function maybeReverseList<T>(l: T[], direction: DefiniteDirection): T[] {
  if (direction === Direction.Forwards) {
    return l;
  }
  // console.log("rev", Array.from(l).reverse());
  // return Array.from(l).reverse();
  const copy = Array.from(l);
  copy.reverse();
  return copy;
}

class AlgToDOMTree extends TraversalDownUp<DataDown, DataUp> {
  public traverseSequence(sequence: Sequence, dataDown: DataDown): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-sequence");
    let first = true;
    for (const unit of maybeReverseList(
      sequence.nestedUnits,
      dataDown.direction,
    )) {
      if (!first) {
        element.addString(" ");
      }
      first = false;
      moveCount += element.addElem(
        this.traverse(unit, {
          earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
          twistyAlgViewer: dataDown.twistyAlgViewer,
          direction: dataDown.direction,
        }),
      );
    }
    element.flushQueue(dataDown.direction);
    return {
      moveCount: moveCount,
      element,
    };
  }

  public traverseGroup(group: Group, dataDown: DataDown): DataUp {
    const direction = updateDirectionByAmount(dataDown.direction, group.amount);
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-group");
    element.addString("(");
    moveCount += element.addElem(
      this.traverse(group.nestedSequence, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString(")" + repetitionSuffix(group.amount));
    element.flushQueue();
    return {
      moveCount: moveCount * Math.abs(group.amount),
      element,
    };
  }

  public traverseBlockMove(blockMove: BlockMove, dataDown: DataDown): DataUp {
    return {
      moveCount: 1,
      element: new TwistyAlgLeafElem(
        "twisty-alg-blockMove",
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
    const element = new TwistyAlgWrapperElem("twisty-alg-commutator");
    element.addString("[");
    element.flushQueue();
    const direction = updateDirectionByAmount(
      dataDown.direction,
      commutator.amount,
    );
    const [first, second]: Sequence[] = maybeReverseList(
      [commutator.A, commutator.B],
      direction,
    );
    moveCount += element.addElem(
      this.traverse(first, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString(", ");
    moveCount += element.addElem(
      this.traverse(second, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.flushQueue(direction);
    element.addString("]" + repetitionSuffix(commutator.amount));
    element.flushQueue();
    return {
      moveCount: moveCount * 2 * Math.abs(commutator.amount),
      element,
    };
  }

  public traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-conjugate");
    element.addString("[");
    const direction = updateDirectionByAmount(
      dataDown.direction,
      conjugate.amount,
    );
    const aLen = element.addElem(
      this.traverse(conjugate.A, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    moveCount += aLen;
    element.addString(": ");
    moveCount += element.addElem(
      this.traverse(conjugate.B, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString("]" + repetitionSuffix(conjugate.amount));
    element.flushQueue();
    return {
      moveCount: (moveCount + aLen) * Math.abs(conjugate.amount),
      element,
    };
  }

  public traversePause(_pause: Pause, dataDown: DataDown): DataUp {
    return {
      moveCount: 1,
      element: new TwistyAlgLeafElem("twisty-alg-pause", ".", dataDown),
    };
  }

  public traverseNewLine(_newLine: NewLine, _dataDown: DataDown): DataUp {
    const element = new TwistyAlgWrapperElem("twisty-alg-newLine");
    element.append(document.createElement("br"));
    return {
      moveCount: 0,
      element,
    };
  }

  public traverseComment(comment: Comment, dataDown: DataDown): DataUp {
    return {
      moveCount: 0,
      element: new TwistyAlgLeafElem(
        "twisty-alg-comment",
        `//${comment.comment}`,
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
  #domTree: TwistyAlgWrapperElem | TwistyAlgLeafElem;
  twistyPlayer: TwistyPlayer | null = null;
  lastClickTimestamp: number | null = null;
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
      direction: Direction.Forwards,
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
    twistyPlayer.timeline.addTimestampListener({
      onTimelineTimestampChange: (timestamp: MillisecondTimestamp) => {
        if (timestamp !== this.lastClickTimestamp) {
          this.lastClickTimestamp = null;
        }
        const index =
          this.twistyPlayer?.cursor?.experimentalIndexFromTimestamp(
            timestamp,
          ) ?? null;
        if (index !== null) {
          // console.log(index);
          // console.log(this.#domTree.pathToIndex(index));
        }
      },
      onTimeRangeChange: (_timeRange: TimeRange) => {
        // TODO
      },
    });
  }

  jumpToIndex(index: number): void {
    if (this.twistyPlayer && this.twistyPlayer.cursor) {
      const timestamp =
        (this.twistyPlayer.cursor.experimentalTimestampFromIndex(index) ??
          -250) + 250;
      this.twistyPlayer?.timeline.setTimestamp(timestamp);
      if (this.lastClickTimestamp === timestamp) {
        this.twistyPlayer.timeline.play();
        this.lastClickTimestamp = null;
      } else {
        this.lastClickTimestamp = timestamp;
      }
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
