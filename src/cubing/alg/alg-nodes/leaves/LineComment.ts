import type { ExperimentalSerializationOptions } from "cubing/alg/SerializationOptions";
import { AlgCommon, type Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import type { AlgLeaf } from "../AlgNode";

// TODO: hash
// TODO: this conflicts with the HTML `LineComment` class
/** @category Alg Nodes */
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

  invert(): LineComment {
    return this;
  }

  *experimentalExpand(
    _iterDir: IterationDirection = IterationDirection.Forwards,
    _depth: number = Infinity,
  ): Generator<AlgLeaf> {
    yield this;
  }

  toString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string {
    return `//${this.#text}`;
  }
  // toJSON(): LineCommentJSON {
  //   return {
  //     type: "comment",
  //     text: this.#text,
  //   };
  // }
}
