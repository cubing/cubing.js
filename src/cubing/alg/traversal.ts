import type { Alg } from "./Alg";
import { Grouping } from "./alg-nodes/containers/Grouping";
import type { Comparable } from "./common";
import { Commutator } from "./alg-nodes/containers/Commutator";
import { Move, QuantumMove } from "./alg-nodes/leaves/Move";
import { Newline } from "./alg-nodes/leaves/Newline";
import { Pause } from "./alg-nodes/leaves/Pause";
import { Conjugate } from "./alg-nodes/containers/Conjugate";
import { LineComment } from "./alg-nodes/leaves/LineComment";
import type { AlgNode } from "./alg-nodes/AlgNode";

function dispatch<DataDown, DataAlgUp, DataAlgNodeUp>(
  t: TraversalDownUp<DataDown, DataAlgUp, DataAlgNodeUp>,
  algNode: AlgNode,
  dataDown: DataDown,
): DataAlgNodeUp {
  // TODO: Can we turn this back into a `switch` or something more efficiently?
  if (algNode.is(Grouping)) {
    return t.traverseGrouping(algNode as Grouping, dataDown);
  }
  if (algNode.is(Move)) {
    return t.traverseMove(algNode as Move, dataDown);
  }
  if (algNode.is(Commutator)) {
    return t.traverseCommutator(algNode as Commutator, dataDown);
  }
  if (algNode.is(Conjugate)) {
    return t.traverseConjugate(algNode as Conjugate, dataDown);
  }
  if (algNode.is(Pause)) {
    return t.traversePause(algNode as Pause, dataDown);
  }
  if (algNode.is(Newline)) {
    return t.traverseNewline(algNode as Newline, dataDown);
  }
  if (algNode.is(LineComment)) {
    return t.traverseLineComment(algNode as LineComment, dataDown);
  }
  throw new Error("unknown AlgNode");
}

function mustBeAlgNode(t: Comparable): AlgNode {
  if (
    t.is(Grouping) ||
    t.is(Move) ||
    t.is(Commutator) ||
    t.is(Conjugate) ||
    t.is(Pause) ||
    t.is(Newline) ||
    t.is(LineComment)
  ) {
    return t as AlgNode;
  }
  throw new Error("internal error: expected AlgNode"); // TODO: Make more helpful, add tests
}

export abstract class TraversalDownUp<
  DataDown,
  DataAlgUp,
  DataAlgNodeUp = DataAlgUp,
> {
  // Immediate subclasses should overwrite this.
  public traverseAlgNode(algNode: AlgNode, dataDown: DataDown): DataAlgNodeUp {
    return dispatch(this, algNode, dataDown);
  }

  public traverseIntoAlgNode(algNode: AlgNode, dataDown: DataDown): AlgNode {
    return mustBeAlgNode(this.traverseAlgNode(algNode, dataDown) as any);
  }

  public abstract traverseAlg(alg: Alg, dataDown: DataDown): DataAlgUp;

  public abstract traverseGrouping(
    grouping: Grouping,
    dataDown: DataDown,
  ): DataAlgNodeUp;

  public abstract traverseMove(move: Move, dataDown: DataDown): DataAlgNodeUp;

  public abstract traverseCommutator(
    commutator: Commutator,
    dataDown: DataDown,
  ): DataAlgNodeUp;

  public abstract traverseConjugate(
    conjugate: Conjugate,
    dataDown: DataDown,
  ): DataAlgNodeUp;

  public abstract traversePause(
    pause: Pause,
    dataDown: DataDown,
  ): DataAlgNodeUp;
  public abstract traverseNewline(
    newline: Newline,
    dataDown: DataDown,
  ): DataAlgNodeUp;

  public abstract traverseLineComment(
    comment: LineComment,
    dataDown: DataDown,
  ): DataAlgNodeUp;
}

export abstract class TraversalUp<
  DataAlgUp,
  DataAlgNodeUp = DataAlgUp,
> extends TraversalDownUp<undefined, DataAlgUp, DataAlgNodeUp> {
  public traverseAlgNode(algNode: AlgNode): DataAlgNodeUp {
    return dispatch<unknown, DataAlgUp, DataAlgNodeUp>(
      this,
      algNode,
      undefined,
    );
  }

  public traverseIntoAlgNode(algNode: AlgNode): AlgNode {
    return mustBeAlgNode(this.traverseAlgNode(algNode) as any);
  }

  public abstract traverseAlg(alg: Alg): DataAlgUp;
  public abstract traverseGrouping(grouping: Grouping): DataAlgNodeUp;
  public abstract traverseMove(move: Move): DataAlgNodeUp;
  public abstract traverseCommutator(commutator: Commutator): DataAlgNodeUp;
  public abstract traverseConjugate(conjugate: Conjugate): DataAlgNodeUp;
  public abstract traversePause(pause: Pause): DataAlgNodeUp;
  public abstract traverseNewline(newline: Newline): DataAlgNodeUp;
  public abstract traverseLineComment(comment: LineComment): DataAlgNodeUp;
}

// TOOD: allow "normal" "twisty" puzzles to hardcode axis concepts without hardcoding too much in `Alg` that's not relevant to all puzzles.
export interface PuzzleSpecificAlgSimplificationInfo {
  quantumMoveOrder?: (quantumMove: QuantumMove) => number;
  doQuantumMovesCommute?: (
    quantumMove1: QuantumMove,
    quantumMove2: QuantumMove,
  ) => boolean;
  areQuantumMovesSameAxis?: (
    quantumMove1: QuantumMove,
    quantumMove2: QuantumMove,
  ) => boolean;
  simplifySameAxisMoves?: (moves: Move[]) => Move[];
}

export interface SimplifyOptions {
  collapseMoves?: boolean;
  puzzleSpecificAlgSimplificationInfo?: PuzzleSpecificAlgSimplificationInfo;
  depth?: number | null; // TODO: test
}

// TODO: Test that inverses are bijections.
class Simplify extends TraversalDownUp<SimplifyOptions, Generator<AlgNode>> {
  #newPlaceholderAssociationsMap?: Map<Grouping, Pause>;
  #newPlaceholderAssociations(): Map<Grouping, Pause> {
    return (this.#newPlaceholderAssociationsMap ??= new Map<Grouping, Pause>());
  }

  static #newAmount(
    move: Move,
    deltaAmount: number,
    options: SimplifyOptions,
  ): number {
    let newAmount = move.amount + deltaAmount;
    if (options?.puzzleSpecificAlgSimplificationInfo?.quantumMoveOrder) {
      const order =
        options.puzzleSpecificAlgSimplificationInfo.quantumMoveOrder(
          move.quantum,
        );
      // Examples:
      // • order 4 → min -1 (e.g. cube)
      // • order 5 → min -2 (e.g. Megaminx)
      // • order 3 → min -1 (e.g. Pyraminx)
      const min = Math.floor(order / 2) + 1 - order;
      newAmount = (((newAmount % order) + order - min) % order) + min; // TODO
    }
    return newAmount;
  }

  // TODO: Handle
  public *traverseAlg(alg: Alg, options: SimplifyOptions): Generator<AlgNode> {
    if (options.depth === 0) {
      yield* alg.childAlgNodes();
      return;
    }

    const newAlgNodes: AlgNode[] = [];
    let lastAlgNode: AlgNode | null = null;
    const collapseMoves = options?.collapseMoves ?? true;
    function appendMoveWithNewAmount(move: Move, deltaAmount: number): boolean {
      const newAmount = Simplify.#newAmount(move, deltaAmount, options);
      if (newAmount === 0) {
        return false;
      }
      const newMove = new Move(move.quantum, newAmount);
      newAlgNodes.push(newMove);
      lastAlgNode = newMove;
      return true;
    }
    function appendCollapsed(newAlgNode: AlgNode) {
      if (
        collapseMoves &&
        lastAlgNode?.is(Move) &&
        newAlgNode.is(Move) &&
        (lastAlgNode as Move).quantum.isIdentical((newAlgNode as Move).quantum)
      ) {
        newAlgNodes.pop();
        if (
          !appendMoveWithNewAmount(
            lastAlgNode as Move,
            (newAlgNode as Move).amount,
          )
        ) {
          lastAlgNode = newAlgNodes.slice(-1)[0];
        }
      } else {
        if (newAlgNode.is(Move)) {
          appendMoveWithNewAmount(newAlgNode as Move, 0);
        } else {
          newAlgNodes.push(newAlgNode);
          lastAlgNode = newAlgNode;
        }
      }
    }

    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    for (const algNode of alg.childAlgNodes()) {
      for (const ancestorAlgNode of this.traverseAlgNode(algNode, newOptions)) {
        appendCollapsed(ancestorAlgNode);
      }
    }
    for (const newAlgNode of newAlgNodes) {
      yield newAlgNode;
    }
  }

  public *traverseGrouping(
    grouping: Grouping,
    options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (options.depth === 0) {
      yield grouping;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    const newGrouping = new Grouping(
      this.traverseAlg(grouping.alg, newOptions),
      grouping.amount,
    );

    const newPlaceholder = this.#newPlaceholderAssociations().get(grouping);
    if (newPlaceholder) {
      newGrouping.experimentalNISSPlaceholder = newPlaceholder;
      newPlaceholder.experimentalNISSGrouping = newGrouping;
    }

    yield newGrouping;
  }

  public *traverseMove(
    move: Move,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    yield move;
  }

  public *traverseCommutator(
    commutator: Commutator,
    options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (options.depth === 0) {
      yield commutator;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    yield new Commutator(
      this.traverseAlg(commutator.A, newOptions),
      this.traverseAlg(commutator.B, newOptions),
    );
  }

  public *traverseConjugate(
    conjugate: Conjugate,
    options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (options.depth === 0) {
      yield conjugate;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    yield new Conjugate(
      this.traverseAlg(conjugate.A, newOptions),
      this.traverseAlg(conjugate.B, newOptions),
    );
  }

  public *traversePause(
    pause: Pause,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (pause.experimentalNISSGrouping) {
      const newPause = new Pause();
      this.#newPlaceholderAssociations().set(
        pause.experimentalNISSGrouping,
        newPause,
      );
      yield newPause;
    } else {
      yield pause;
    }
  }

  public *traverseNewline(
    newline: Newline,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    yield newline;
  }

  public *traverseLineComment(
    comment: LineComment,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    yield comment;
  }
}

const simplifyInstance = new Simplify();
export const simplify = simplifyInstance.traverseAlg.bind(simplifyInstance) as (
  alg: Alg,
  options: SimplifyOptions,
) => Generator<AlgNode>;
