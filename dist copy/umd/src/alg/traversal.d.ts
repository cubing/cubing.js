import { AlgPart, BlockMove, CommentLong, CommentShort, Commutator, Conjugate, Group, NewLine, Pause, Sequence, Unit } from "./algorithm";
export declare abstract class TraversalDownUp<DataDown, DataUp> {
    traverse(algPart: AlgPart, dataDown: DataDown): DataUp;
    traverseIntoUnit(algPart: AlgPart, dataDown: DataDown): Unit;
    abstract traverseSequence(sequence: Sequence, dataDown: DataDown): DataUp;
    abstract traverseGroup(group: Group, dataDown: DataDown): DataUp;
    abstract traverseBlockMove(blockMove: BlockMove, dataDown: DataDown): DataUp;
    abstract traverseCommutator(commutator: Commutator, dataDown: DataDown): DataUp;
    abstract traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp;
    abstract traversePause(pause: Pause, dataDown: DataDown): DataUp;
    abstract traverseNewLine(newLine: NewLine, dataDown: DataDown): DataUp;
    abstract traverseCommentShort(commentShort: CommentShort, dataDown: DataDown): DataUp;
    abstract traverseCommentLong(commentLong: CommentLong, dataDown: DataDown): DataUp;
}
export declare abstract class TraversalUp<DataUp> extends TraversalDownUp<undefined, DataUp> {
    traverse(algPart: AlgPart): DataUp;
    traverseIntoUnit(algPart: AlgPart): Unit;
    abstract traverseSequence(sequence: Sequence): DataUp;
    abstract traverseGroup(group: Group): DataUp;
    abstract traverseBlockMove(blockMove: BlockMove): DataUp;
    abstract traverseCommutator(commutator: Commutator): DataUp;
    abstract traverseConjugate(conjugate: Conjugate): DataUp;
    abstract traversePause(pause: Pause): DataUp;
    abstract traverseNewLine(newLine: NewLine): DataUp;
    abstract traverseCommentShort(commentShort: CommentShort): DataUp;
    abstract traverseCommentLong(commentLong: CommentLong): DataUp;
}
export declare class Invert extends TraversalUp<AlgPart> {
    traverseSequence(sequence: Sequence): Sequence;
    traverseGroup(group: Group): AlgPart;
    traverseBlockMove(blockMove: BlockMove): AlgPart;
    traverseCommutator(commutator: Commutator): AlgPart;
    traverseConjugate(conjugate: Conjugate): AlgPart;
    traversePause(pause: Pause): AlgPart;
    traverseNewLine(newLine: NewLine): AlgPart;
    traverseCommentShort(commentShort: CommentShort): AlgPart;
    traverseCommentLong(commentLong: CommentLong): AlgPart;
}
export declare class Expand extends TraversalUp<AlgPart> {
    traverseSequence(sequence: Sequence): Sequence;
    traverseGroup(group: Group): AlgPart;
    traverseBlockMove(blockMove: BlockMove): AlgPart;
    traverseCommutator(commutator: Commutator): AlgPart;
    traverseConjugate(conjugate: Conjugate): AlgPart;
    traversePause(pause: Pause): AlgPart;
    traverseNewLine(newLine: NewLine): AlgPart;
    traverseCommentShort(commentShort: CommentShort): AlgPart;
    traverseCommentLong(commentLong: CommentLong): AlgPart;
    private flattenSequenceOneLevel;
    private repeat;
}
export declare class StructureEquals extends TraversalDownUp<AlgPart, boolean> {
    traverseSequence(sequence: Sequence, dataDown: AlgPart): boolean;
    traverseGroup(group: Group, dataDown: AlgPart): boolean;
    traverseBlockMove(blockMove: BlockMove, dataDown: AlgPart): boolean;
    traverseCommutator(commutator: Commutator, dataDown: AlgPart): boolean;
    traverseConjugate(conjugate: Conjugate, dataDown: AlgPart): boolean;
    traversePause(pause: Pause, dataDown: AlgPart): boolean;
    traverseNewLine(newLine: NewLine, dataDown: AlgPart): boolean;
    traverseCommentShort(commentShort: CommentShort, dataDown: AlgPart): boolean;
    traverseCommentLong(commentLong: CommentLong, dataDown: AlgPart): boolean;
}
export declare class CoalesceBaseMoves extends TraversalUp<AlgPart> {
    traverseSequence(sequence: Sequence): Sequence;
    traverseGroup(group: Group): AlgPart;
    traverseBlockMove(blockMove: BlockMove): AlgPart;
    traverseCommutator(commutator: Commutator): AlgPart;
    traverseConjugate(conjugate: Conjugate): AlgPart;
    traversePause(pause: Pause): AlgPart;
    traverseNewLine(newLine: NewLine): AlgPart;
    traverseCommentShort(commentShort: CommentShort): AlgPart;
    traverseCommentLong(commentLong: CommentLong): AlgPart;
    private sameBlock;
}
export declare function blockMoveToString(blockMove: BlockMove): string;
export declare class ToString extends TraversalUp<string> {
    traverseSequence(sequence: Sequence): string;
    traverseGroup(group: Group): string;
    traverseBlockMove(blockMove: BlockMove): string;
    traverseCommutator(commutator: Commutator): string;
    traverseConjugate(conjugate: Conjugate): string;
    traversePause(pause: Pause): string;
    traverseNewLine(newLine: NewLine): string;
    traverseCommentShort(commentShort: CommentShort): string;
    traverseCommentLong(commentLong: CommentLong): string;
    private spaceBetween;
}
export declare const invert: (a: Sequence) => Sequence;
export declare const expand: (a: Sequence) => Sequence;
export declare const structureEquals: (a1: Sequence, a2: Sequence) => boolean;
export declare const coalesceBaseMoves: (a: Sequence) => Sequence;
export declare const algToString: (a: Sequence) => string;
export declare const algPartStructureEqualsForTesting: (a1: AlgPart, a2: AlgPart) => boolean;
export declare const algPartToStringForTesting: (a: AlgPart) => string;
export declare function experimentalBlockMoveQuantumName(move: BlockMove): string;
//# sourceMappingURL=traversal.d.ts.map