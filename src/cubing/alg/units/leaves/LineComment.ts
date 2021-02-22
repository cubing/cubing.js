import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { LeafUnit } from "../Unit";

// TODO: hash
// TODO: this conflicts with the HTML `LineComment` class
export class LineComment extends AlgCommon<LineComment> {
  readonly #text: string;

  constructor(commentText: string) {
    super();
    if (commentText.includes("\n") || commentText.includes("\r")) {
      throw new Error("LineComment cannot contain newline");
    }
    this.#text = commentText;
  }

  get text(): string {
    return this.#text;
  }

  isIdentical(other: Comparable): boolean {
    const otherAsLineComment = other as LineComment;
    return other.is(LineComment) && this.#text === otherAsLineComment.#text;
  }

  inverse(): LineComment {
    return this;
  }

  *experimentalLeafUnits(
    _iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
    yield this;
  }

  toString(): string {
    return `//${this.#text}`;
  }

  // toJSON(): LineCommentJSON {
  //   return {
  //     type: "comment",
  //     text: this.#text,
  //   };
  // }
}
