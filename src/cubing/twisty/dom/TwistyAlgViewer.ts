import {
  Alg,
  Grouping,
  LineComment,
  Commutator,
  Conjugate,
  Turn,
  Newline,
  Pause,
  TraversalDownUp,
} from "../../alg";
import { direct, IterationDirection } from "../../alg/iteration";
import { TwistyPlayer } from "../../twisty";
import { TimeRange } from "../animation/cursor/AlgCursor";
import { MillisecondTimestamp } from "../animation/cursor/CursorTypes";
import {
  customElementsShim,
  HTMLElementShim,
} from "./element/node-custom-element-shims";

class DataDown {
  earliestTurnIndex: number;
  twistyAlgViewer: ExperimentalTwistyAlgViewer;
  direction: IterationDirection;
}

class DataUp {
  turnCount: number;
  element: TwistyAlgWrapperElem | TwistyAlgLeafElem;
}

class TwistyAlgLeafElem extends HTMLElementShim {
  constructor(className: string, text: string, dataDown: DataDown) {
    super();
    this.textContent = text;
    this.classList.add(className);

    this.addEventListener("click", () => {
      dataDown.twistyAlgViewer.jumpToIndex(dataDown.earliestTurnIndex);
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
    return dataUp.turnCount;
  }

  flushQueue(
    direction: IterationDirection = IterationDirection.Forwards,
  ): void {
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

function oppositeDirection(direction: IterationDirection): IterationDirection {
  return direction === IterationDirection.Forwards
    ? IterationDirection.Backwards
    : IterationDirection.Forwards;
}

function updateDirectionByAmount(
  currentDirection: IterationDirection,
  amount: number,
): IterationDirection {
  return amount < 0 ? oppositeDirection(currentDirection) : currentDirection;
}

function maybeReverseList<T>(l: T[], direction: IterationDirection): T[] {
  if (direction === IterationDirection.Forwards) {
    return l;
  }
  // console.log("rev", Array.from(l).reverse());
  // return Array.from(l).reverse();
  const copy = Array.from(l);
  copy.reverse();
  return copy;
}

class AlgToDOMTree extends TraversalDownUp<DataDown, DataUp, DataUp> {
  public traverseAlg(alg: Alg, dataDown: DataDown): DataUp {
    let turnCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-sequence");
    let first = true;
    for (const unit of direct(alg.units(), dataDown.direction)) {
      if (!first) {
        element.addString(" ");
      }
      first = false;
      turnCount += element.addElem(
        this.traverseUnit(unit, {
          earliestTurnIndex: dataDown.earliestTurnIndex + turnCount,
          twistyAlgViewer: dataDown.twistyAlgViewer,
          direction: dataDown.direction,
        }),
      );
    }
    element.flushQueue(dataDown.direction);
    return {
      turnCount: turnCount,
      element,
    };
  }

  public traverseGrouping(grouping: Grouping, dataDown: DataDown): DataUp {
    const direction = updateDirectionByAmount(
      dataDown.direction,
      grouping.experimentalEffectiveAmount,
    );
    let turnCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-group");
    element.addString("(");
    turnCount += element.addElem(
      this.traverseAlg(grouping.experimentalAlg, {
        earliestTurnIndex: dataDown.earliestTurnIndex + turnCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString(")" + grouping.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      turnCount: turnCount * Math.abs(grouping.experimentalEffectiveAmount),
      element,
    };
  }

  public traverseTurn(blockTurn: Turn, dataDown: DataDown): DataUp {
    return {
      turnCount: 1,
      element: new TwistyAlgLeafElem(
        "twisty-alg-blockTurn",
        blockTurn.toString(),
        dataDown,
      ),
    };
  }

  public traverseCommutator(
    commutator: Commutator,
    dataDown: DataDown,
  ): DataUp {
    let turnCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-commutator");
    element.addString("[");
    element.flushQueue();
    const direction = updateDirectionByAmount(
      dataDown.direction,
      commutator.experimentalEffectiveAmount,
    );
    const [first, second]: Alg[] = maybeReverseList(
      [commutator.A, commutator.B],
      direction,
    );
    turnCount += element.addElem(
      this.traverseAlg(first, {
        earliestTurnIndex: dataDown.earliestTurnIndex + turnCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString(", ");
    turnCount += element.addElem(
      this.traverseAlg(second, {
        earliestTurnIndex: dataDown.earliestTurnIndex + turnCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.flushQueue(direction);
    element.addString("]" + commutator.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      turnCount:
        turnCount * 2 * Math.abs(commutator.experimentalEffectiveAmount),
      element,
    };
  }

  public traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp {
    let turnCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-conjugate");
    element.addString("[");
    const direction = updateDirectionByAmount(
      dataDown.direction,
      conjugate.experimentalEffectiveAmount,
    );
    const aLen = element.addElem(
      this.traverseAlg(conjugate.A, {
        earliestTurnIndex: dataDown.earliestTurnIndex + turnCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    turnCount += aLen;
    element.addString(": ");
    turnCount += element.addElem(
      this.traverseAlg(conjugate.B, {
        earliestTurnIndex: dataDown.earliestTurnIndex + turnCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString("]" + conjugate.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      turnCount:
        (turnCount + aLen) * Math.abs(conjugate.experimentalEffectiveAmount),
      element,
    };
  }

  public traversePause(_pause: Pause, dataDown: DataDown): DataUp {
    return {
      turnCount: 1,
      element: new TwistyAlgLeafElem("twisty-alg-pause", ".", dataDown),
    };
  }

  public traverseNewline(_newLine: Newline, _dataDown: DataDown): DataUp {
    const element = new TwistyAlgWrapperElem("twisty-alg-newLine");
    element.append(document.createElement("br"));
    return {
      turnCount: 0,
      element,
    };
  }

  public traverseLineComment(comment: LineComment, dataDown: DataDown): DataUp {
    return {
      turnCount: 0,
      element: new TwistyAlgLeafElem(
        "twisty-alg-comment",
        `//${comment.text}`,
        dataDown,
      ),
    };
  }
}

const algToDOMTreeInstance = new AlgToDOMTree();
const algToDOMTree = algToDOMTreeInstance.traverseAlg.bind(
  algToDOMTreeInstance,
) as (alg: Alg, dataDown: DataDown) => DataUp;

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

  private setAlg(alg: Alg): void {
    this.#domTree = algToDOMTree(alg, {
      earliestTurnIndex: 0,
      twistyAlgViewer: this,
      direction: IterationDirection.Forwards,
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
