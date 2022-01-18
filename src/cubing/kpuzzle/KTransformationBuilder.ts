import type { KPuzzle, KTransformation } from ".";

export class KTransformationBuilder {
  currentTransformation: KTransformation | undefined;
  constructor(public readonly kpuzzle: KPuzzle) {}

  applyKTransformation(
    transformation: KTransformation,
  ): KTransformationBuilder {
    if (!this.currentTransformation) {
      this.currentTransformation = transformation;
    } else {
      // TODO: Unnecessary optimization?
      this.currentTransformation =
        this.currentTransformation.applyTransformation(transformation);
    }
    return this;
  }

  applyMove;

  getKTransformation(): KTransformation {
    return this.currentTransformation ?? this.kpuzzle.identityTransformation();
  }
}
