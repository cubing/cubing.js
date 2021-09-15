import {
  Alg,
  Commutator,
  Conjugate,
  experimentalDirect,
  ExperimentalIterationDirection,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
  Unit,
} from "../../../alg";
import type { Parsed } from "../../../alg/parse";
import { puzzles } from "../../../puzzles";
import { TwistyPlayerV1 } from "../..";
import { KPuzzleWrapper } from "../../views/3D/puzzles/KPuzzleWrapper";
import type { TimeRange } from "../animation/cursor/AlgCursor";
import type { MillisecondTimestamp } from "../animation/cursor/CursorTypes";
import { TreeAlgIndexer } from "../animation/indexer/tree/TreeAlgIndexer";
import { ManagedCustomElement } from "./element/ManagedCustomElement";
import {
  customElementsShim,
  HTMLElementShim,
} from "./element/node-custom-element-shims";
import { twistyAlgViewerCSS } from "./TwistyAlgViewerV1.css_";

const DEFAULT_OFFSET_MS = 250; // TODO: make this a fraction?

class DataDown {
  earliestMoveIndex: number;
  twistyAlgViewer: TwistyAlgViewerV1;
  direction: ExperimentalIterationDirection;
}

class DataUp {
  moveCount: number;
  element: TwistyAlgWrapperElemV1 | TwistyAlgLeafElemV1;
}

class TwistyAlgLeafElemV1 extends ManagedCustomElement {
  constructor(
    className: string,
    text: string,
    dataDown: DataDown,
    public algOrUnit: Alg | Unit,
    offsetIntoMove: boolean,
    clickable: boolean,
  ) {
    super({ mode: "open" });
    this.classList.add(className);

    this.addCSS(twistyAlgViewerCSS);
    if (clickable) {
      const anchor = this.contentWrapper.appendChild(
        document.createElement("a"),
      );
      anchor.href = "#";
      anchor.textContent = text;

      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        dataDown.twistyAlgViewer.jumpToIndex(
          dataDown.earliestMoveIndex,
          offsetIntoMove,
        );
      });
    } else {
      this.contentWrapper.appendChild(
        document.createElement("span"),
      ).textContent = text;
    }
  }

  pathToIndex(
    _index: number,
  ): (TwistyAlgWrapperElemV1 | TwistyAlgLeafElemV1)[] {
    return [];
  }

  setCurrentMove(current: boolean) {
    this.contentWrapper.classList.toggle("current-move", current);
  }
}

customElementsShim.define("twisty-alg-leaf-elem-v1", TwistyAlgLeafElemV1);

class TwistyAlgWrapperElemV1 extends HTMLElementShim {
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

  pathToIndex(
    _index: number,
  ): (TwistyAlgWrapperElemV1 | TwistyAlgLeafElemV1)[] {
    return [];
  }
}

customElementsShim.define("twisty-alg-wrapper-elem-v1", TwistyAlgWrapperElemV1);

function oppositeDirection(
  direction: ExperimentalIterationDirection,
): ExperimentalIterationDirection {
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

function maybeReverseList<T>(
  l: T[],
  direction: ExperimentalIterationDirection,
): T[] {
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
    const element = new TwistyAlgWrapperElemV1("twisty-alg-alg", alg); // TODO: pick a better class name.
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
    const square1Tuple = grouping.experimentalAsSquare1Tuple();
    // if (square1Tuplle) {

    // }

    const direction = updateDirectionByAmount(
      dataDown.direction,
      grouping.amount,
    );
    let moveCount = 0;
    const element = new TwistyAlgWrapperElemV1("twisty-alg-grouping", grouping);
    element.addString("(");

    if (square1Tuple) {
      moveCount += element.addElem({
        moveCount: 1,
        element: new TwistyAlgLeafElemV1(
          "twisty-alg-move", // TODO: Mark the tuple with a special class?
          square1Tuple[0].amount.toString(),
          dataDown,
          square1Tuple[0],
          true,
          true,
        ),
      });
      element.addString(", ");
      moveCount += element.addElem({
        moveCount: 1,
        element: new TwistyAlgLeafElemV1(
          "twisty-alg-move", // TODO: Mark the tuple with a special class?
          square1Tuple[1].amount.toString(),
          dataDown,
          square1Tuple[1],
          true,
          true,
        ),
      });
    } else {
      moveCount += element.addElem(
        this.traverseAlg(grouping.alg, {
          earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
          twistyAlgViewer: dataDown.twistyAlgViewer,
          direction,
        }),
      );
    }

    element.addString(")" + grouping.experimentalRepetitionSuffix);
    element.flushQueue();
    return {
      moveCount: moveCount * Math.abs(grouping.amount),
      element,
    };
  }

  public traverseMove(move: Move, dataDown: DataDown): DataUp {
    const element = new TwistyAlgLeafElemV1(
      "twisty-alg-move",
      move.toString(),
      dataDown,
      move,
      true,
      true,
    );
    dataDown.twistyAlgViewer.highlighter.addMove(
      (move as Parsed<Move>).startCharIndex,
      element,
    );
    return {
      moveCount: 1,
      element,
    };
  }

  public traverseCommutator(
    commutator: Commutator,
    dataDown: DataDown,
  ): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElemV1(
      "twisty-alg-commutator",
      commutator,
    );
    element.addString("[");
    element.flushQueue();
    const [first, second]: Alg[] = maybeReverseList(
      [commutator.A, commutator.B],
      dataDown.direction,
    );
    moveCount += element.addElem(
      this.traverseAlg(first, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction: dataDown.direction,
      }),
    );
    element.addString(", ");
    moveCount += element.addElem(
      this.traverseAlg(second, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction: dataDown.direction,
      }),
    );
    element.flushQueue(dataDown.direction);
    element.addString("]");
    element.flushQueue();
    return {
      moveCount: moveCount * 2,
      element,
    };
  }

  public traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp {
    let moveCount = 0;
    const element = new TwistyAlgWrapperElemV1(
      "twisty-alg-conjugate",
      conjugate,
    );
    element.addString("[");
    const aLen = element.addElem(
      this.traverseAlg(conjugate.A, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction: dataDown.direction,
      }),
    );
    moveCount += aLen;
    element.addString(": ");
    moveCount += element.addElem(
      this.traverseAlg(conjugate.B, {
        earliestMoveIndex: dataDown.earliestMoveIndex + moveCount,
        twistyAlgViewer: dataDown.twistyAlgViewer,
        direction: dataDown.direction,
      }),
    );
    element.addString("]");
    element.flushQueue();
    return {
      moveCount: moveCount + aLen,
      element,
    };
  }

  public traversePause(pause: Pause, dataDown: DataDown): DataUp {
    return {
      moveCount: 1,
      element: new TwistyAlgLeafElemV1(
        "twisty-alg-pause",
        ".",
        dataDown,
        pause,
        true,
        true,
      ),
    };
  }

  public traverseNewline(newline: Newline, _dataDown: DataDown): DataUp {
    const element = new TwistyAlgWrapperElemV1("twisty-alg-newline", newline);
    element.append(document.createElement("br"));
    return {
      moveCount: 0,
      element,
    };
  }

  public traverseLineComment(
    lineComment: LineComment,
    dataDown: DataDown,
  ): DataUp {
    return {
      moveCount: 0,
      element: new TwistyAlgLeafElemV1(
        "twisty-alg-line-comment",
        `//${lineComment.text}`,
        dataDown,
        lineComment,
        false,
        false,
      ),
    };
  }
}

const algToDOMTreeInstance = new AlgToDOMTree();
const algToDOMTree = algToDOMTreeInstance.traverseAlg.bind(
  algToDOMTreeInstance,
) as (alg: Alg, dataDown: DataDown) => DataUp;

class MoveHighlighter {
  moveCharIndexMap: Map<number, TwistyAlgLeafElemV1> = new Map();
  currentElem: TwistyAlgLeafElemV1 | null = null;

  addMove(charIndex: number, elem: TwistyAlgLeafElemV1): void {
    this.moveCharIndexMap.set(charIndex, elem);
  }

  set(move: Parsed<Move> | null): void {
    const newElem = move
      ? this.moveCharIndexMap.get(move.startCharIndex) ?? null
      : null;
    if (this.currentElem === newElem) {
      return;
    }
    this.currentElem?.classList.remove("twisty-alg-current-move");
    this.currentElem?.setCurrentMove(false);
    newElem?.classList.add("twisty-alg-current-move");
    newElem?.setCurrentMove(true);
    this.currentElem = newElem;
  }
}

export class TwistyAlgViewerV1 extends HTMLElementShim {
  highlighter: MoveHighlighter = new MoveHighlighter();
  #domTree: TwistyAlgWrapperElemV1 | TwistyAlgLeafElemV1;
  twistyPlayer: TwistyPlayerV1 | null = null;
  lastClickTimestamp: number | null = null;
  constructor(options?: { twistyPlayer?: TwistyPlayerV1 }) {
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

  setTwistyPlayer(twistyPlayer: TwistyPlayerV1): void {
    if (this.twistyPlayer) {
      console.warn("twisty-player reassignment is not supported");
      return;
    }
    this.twistyPlayer = twistyPlayer;

    this.twistyPlayer.addEventListener(
      "experimental-alg-update",
      (e: CustomEvent<{ alg: Alg }>) => {
        this.setAlg(e.detail.alg);
      },
    );

    const sourceAlg = this.twistyPlayer.alg;
    // TODO: Use proper architecture instead of a heuristic to ensure we have a parsed alg annotated with char indices.
    const parsedAlg =
      "charIndex" in (sourceAlg as Partial<Parsed<Alg>>)
        ? sourceAlg
        : Alg.fromString(sourceAlg.toString());
    this.setAlg(parsedAlg);
    (async () => {
      const wrapper = new KPuzzleWrapper(
        await puzzles[twistyPlayer!.puzzle].def(),
      );
      const indexer = new TreeAlgIndexer(wrapper, parsedAlg);
      twistyPlayer.timeline.addTimestampListener({
        onTimelineTimestampChange: (timestamp: MillisecondTimestamp): void => {
          // TODO: improve perf, e.g. only get notified when the move index changes.
          this.highlighter.set(
            indexer.getAnimLeaf(
              indexer.timestampToIndex(timestamp),
            ) as Parsed<Move> | null,
          );
        },
        onTimeRangeChange(_timeRange: TimeRange): void {},
      });
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
      if (!(elem instanceof TwistyPlayerV1)) {
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

customElementsShim.define("twisty-alg-viewer-v1", TwistyAlgViewerV1);
