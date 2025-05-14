import type { Alg } from "./Alg";
import type { AlgNode } from "./alg-nodes/AlgNode";
import { Commutator } from "./alg-nodes/containers/Commutator";
import { Conjugate } from "./alg-nodes/containers/Conjugate";
import { Grouping } from "./alg-nodes/containers/Grouping";
import { LineComment } from "./alg-nodes/leaves/LineComment";
import { Move } from "./alg-nodes/leaves/Move";
import { Newline } from "./alg-nodes/leaves/Newline";
import { Pause } from "./alg-nodes/leaves/Pause";
import type { Comparable } from "./common";

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
  public override traverseAlgNode(algNode: AlgNode): DataAlgNodeUp {
    return dispatch<unknown, DataAlgUp, DataAlgNodeUp>(
      this,
      algNode,
      undefined,
    );
  }

  public override traverseIntoAlgNode(algNode: AlgNode): AlgNode {
    return mustBeAlgNode(this.traverseAlgNode(algNode) as any);
  }

  public abstract override traverseAlg(alg: Alg): DataAlgUp;
  public abstract override traverseGrouping(grouping: Grouping): DataAlgNodeUp;
  public abstract override traverseMove(move: Move): DataAlgNodeUp;
  public abstract override traverseCommutator(
    commutator: Commutator,
  ): DataAlgNodeUp;
  public abstract override traverseConjugate(
    conjugate: Conjugate,
  ): DataAlgNodeUp;
  public abstract override traversePause(pause: Pause): DataAlgNodeUp;
  public abstract override traverseNewline(newline: Newline): DataAlgNodeUp;
  public abstract override traverseLineComment(
    comment: LineComment,
  ): DataAlgNodeUp;
}

export function functionFromTraversal<
  DataDown,
  DataAlgUp,
  ConstructorArgs extends unknown[],
>(
  traversalConstructor: {
    new (...args: ConstructorArgs): TraversalDownUp<DataDown, DataAlgUp, any>;
  },
  constructorArgs?: ConstructorArgs,
): undefined extends DataDown
  ? (alg: Alg) => DataAlgUp
  : (alg: Alg, v: DataDown) => DataAlgUp {
  const instance = new traversalConstructor(
    ...(constructorArgs ?? ([] as any)),
  );
  return instance.traverseAlg.bind(instance) as any;
}
