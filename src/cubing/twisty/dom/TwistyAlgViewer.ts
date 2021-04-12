import {
  Alg,


  Commutator,
  Conjugate, experimentalDirect, ExperimentalIterationDirection, Grouping,
  LineComment,


  Move,
  Newline,
  Pause,
  TraversalDownUp,
  Unit
} from "../../alg";
import { Parsed } from "../../alg/parse";
import { puzzles } from "../../puzzles";
import { TwistyPlayer } from "../../twisty";
import { KPuzzleWrapper } from "../3D/puzzles/KPuzzleWrapper";
import { TimeRange } from "../animation/cursor/AlgCursor";
import { MillisecondTimestamp } from "../animation/cursor/CursorTypes";
import { TreeAlgIndexer } from "../animation/indexer/tree/TreeAlgIndexer";
import {
  customElementsShim,
  HTMLElementShim
} from "./element/node-custom-element-shims";

const DEFAULT_OFFSET_MS = 250; // TODO: make this a fraction?

class DataDown {
  earliestMoveIndex: number;
  twistyAlgViewer: ExperimentalTwistyAlgViewer;
  direction: ExperimentalIterationDirection;
}

class DataUp {
  moveCount: number;
  element: TwistyAlgWrapperElem | TwistyAlgLeafElem;
}

class TwistyAlgLeafElem extends HTMLElementShim {
  constructor(className: string, text: string, dataDown: DataDown, public algOrUnit: Alg | Unit, offsetIntoMove: boolean) {
    super();
    this.textContent = text;
    this.classList.add(className);

    this.addEventListener("click", () => {
      dataDown.twistyAlgViewer.jumpToIndex(dataDown.earliestMoveIndex, offsetIntoMove);
    });
  }

  pathToIndex(_index: number): (TwistyAlgWrapperElem | TwistyAlgLeafElem)[] {
    return [];
  }
}

customElementsShim.define("twisty-alg-leaf-elem", TwistyAlgLeafElem);

class TwistyAlgWrapperElem extends HTMLElementShim {
  private queue: (Element | Text)[] = [];

  constructor(className: string, public algOrUnit: Alg | Unit) {
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

  flushQueue(
    direction: ExperimentalIterationDirection = ExperimentalIterationDirection.Forwards,
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

function oppositeDirection(direction: ExperimentalIterationDirection): ExperimentalIterationDirection {
  return direction === ExperimentalIterationDirection.Forwards
    ? ExperimentalIterationDirection.Backwards
    : ExperimentalIterationDirection.Forwards;
}

function updateDirectionByAmount(
  currentDirection: ExperimentalIterationDirection,
  amount: number,
): ExperimentalIterationDirection {
  return amount < 0 ? oppositeDirection(currentDirection) : currentDirection;
}

function maybeReverseList<T>(l: T[], direction: ExperimentalIterationDirection): T[] {
  if (direction === ExperimentalIterationDirection.Forwards) {
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
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-alg", alg); // TODO: pick a better class name.
    let first = true;
    for (const unit of experimentalDirect(alg.units(), dataDown.direction)) {
      if (!first) {
        element.addString(" ");
      }
      first = false;
      moveCount += element.addElem(
        this.traverseUnit(unit, {
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

  public traverseGrouping(grouping: Grouping, dataDown: DataDown): DataUp {
    const direction = updateDirectionByAmount(
      dataDown.direction,
      grouping.experimentalEffectiveAmount,
    );
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-grouping", grouping);
    element.addString("(");
    moveCount += element.addElem(
      this.traverseAlg(grouping.experimentalAlg, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString(")" + grouping.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      moveCount: moveCount * Math.abs(grouping.experimentalEffectiveAmount),
      element,
    };
  }

  public traverseMove(move: Move, dataDown: DataDown): DataUp {
    const element = new TwistyAlgLeafElem(
      "twisty-alg-move",
      move.toString(),
      dataDown,
      move,
      true
    );
    dataDown.twistyAlgViewer.highlighter.addMove((move as Parsed<Move>).charIndex, element);
    return {
      moveCount: 1,
      element
    };
  }

  public traverseCommutator(
    commutator: Commutator,
    dataDown: DataDown,
  ): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-commutator", commutator);
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
    moveCount += element.addElem(
      this.traverseAlg(first, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString(", ");
    moveCount += element.addElem(
      this.traverseAlg(second, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.flushQueue(direction);
    element.addString("]" + commutator.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      moveCount:
        moveCount * 2 * Math.abs(commutator.experimentalEffectiveAmount),
      element,
    };
  }

  public traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElem("twisty-alg-conjugate", conjugate);
    element.addString("[");
    const direction = updateDirectionByAmount(
      dataDown.direction,
      conjugate.experimentalEffectiveAmount,
    );
    const aLen = element.addElem(
      this.traverseAlg(conjugate.A, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    moveCount += aLen;
    element.addString(": ");
    moveCount += element.addElem(
      this.traverseAlg(conjugate.B, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction,
      }),
    );
    element.addString("]" + conjugate.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      moveCount:
        (moveCount + aLen) * Math.abs(conjugate.experimentalEffectiveAmount),
      element,
    };
  }

  public traversePause(pause: Pause, dataDown: DataDown): DataUp {
    return {
      moveCount: 1,
      element: new TwistyAlgLeafElem("twisty-alg-pause", ".", dataDown, pause, true),
    };
  }

  public traverseNewline(newline: Newline, _dataDown: DataDown): DataUp {
    const element = new TwistyAlgWrapperElem("twisty-alg-newline", newline);
    element.append(document.createElement("br"));
    return {
      moveCount: 0,
      element,
    };
  }

  public traverseLineComment(lineComment: LineComment, dataDown: DataDown): DataUp {
    return {
      moveCount: 0,
      element: new TwistyAlgLeafElem(
        "twisty-alg-line-comment",
        `//${lineComment.text}`,
        dataDown,
        lineComment,
        false
      ),
    };
  }
}

const algToDOMTreeInstance = new AlgToDOMTree();
const algToDOMTree = algToDOMTreeInstance.traverseAlg.bind(
  algToDOMTreeInstance,
) as (alg: Alg, dataDown: DataDown) => DataUp;

class MoveHighlighter {
  moveCharIndexMap: Map<number, TwistyAlgLeafElem> = new Map();
  currentElem: TwistyAlgLeafElem | null = null;

  addMove(charIndex: number, elem: TwistyAlgLeafElem): void {
    this.moveCharIndexMap.set(charIndex, elem);
  }

  set(move: Parsed<Move> | null): void {
    const newElem = move ? this.moveCharIndexMap.get(move.charIndex) ?? null : null
    if (this.currentElem === newElem) {
      return;
    }
    this.currentElem?.classList.remove("twisty-alg-current-move");
    newElem?.classList.add("twisty-alg-current-move")
    this.currentElem = newElem;
  }
}

export class ExperimentalTwistyAlgViewer extends HTMLElementShim {
  highlighter: MoveHighlighter = new MoveHighlighter();
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
      earliestMoveIndex: 0,
      twistyAlgViewer: this,
      direction: ExperimentalIterationDirection.Forwards,
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
    const alg = Alg.fromString(this.twistyPlayer.alg.toString()); // TODO: is there a better way to ensure this is parsed?
    this.setAlg(alg);
    (async () => {
      const wrapper = new KPuzzleWrapper(await puzzles[twistyPlayer!.puzzle].def());
      const indexer = new TreeAlgIndexer(wrapper, alg);
      twistyPlayer.timeline.addTimestampListener({
        onTimelineTimestampChange: (timestamp: MillisecondTimestamp): void => {
          // TODO: improve perf, e.g. only get notified when the move index changes.
          this.highlighter.set(indexer.getMove(indexer.timestampToIndex(timestamp)) as Parsed<Move> | null)
        },
        onTimeRangeChange(_timeRange: TimeRange): void {}
      })
    })();
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

  jumpToIndex(index: number, offsetIntoMove: boolean): void {
    if (this.twistyPlayer && this.twistyPlayer.cursor) {
      const offset = offsetIntoMove ? DEFAULT_OFFSET_MS : 0;
      const timestamp =
        (this.twistyPlayer.cursor.experimentalTimestampFromIndex(index) ??
          -offset) + offset;
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
