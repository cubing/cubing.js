import { BlockMove, CommentLong, CommentShort, Commutator, Conjugate, Group, NewLine, Pause, Sequence } from "./algorithm";
import { TraversalUp } from "./traversal";
export declare class ValidationError extends Error {
}
export declare abstract class ValidatorTraversal extends TraversalUp<void> {
}
declare abstract class BaseMoveValidator extends ValidatorTraversal {
    traverseSequence(sequence: Sequence): void;
    traverseGroup(group: Group): void;
    traverseCommutator(commutator: Commutator): void;
    traverseConjugate(conjugate: Conjugate): void;
    traversePause(pause: Pause): void;
    traverseNewLine(newLine: NewLine): void;
    traverseCommentShort(commentShort: CommentShort): void;
    traverseCommentLong(commentLong: CommentLong): void;
}
export declare class BlockMoveValidator extends BaseMoveValidator {
    traverseBlockMove(blockMove: BlockMove): void;
}
export declare class FlatAlgValidator extends ValidatorTraversal {
    traverseSequence(sequence: Sequence): void;
    traverseGroup(group: Group): void;
    traverseBlockMove(blockMove: BlockMove): void;
    traverseCommutator(commutator: Commutator): void;
    traverseConjugate(conjugate: Conjugate): void;
    traversePause(pause: Pause): void;
    traverseNewLine(newLine: NewLine): void;
    traverseCommentShort(commentShort: CommentShort): void;
    traverseCommentLong(commentLong: CommentLong): void;
}
export declare type Validator = (a: Sequence) => void;
export declare const validateSiGNMoves: Validator;
export declare const validateFlatAlg: Validator;
export declare function validateSiGNAlg(a: Sequence): void;
export {};
//# sourceMappingURL=validation.d.ts.map