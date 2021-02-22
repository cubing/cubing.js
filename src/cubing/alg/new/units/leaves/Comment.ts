import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { LeafUnit } from "../Unit";

// TODO: hash
export class Comment extends AlgCommon<Comment> {
  readonly #text: string;

  constructor(commentText: string) {
    super();
    if (commentText.includes("\n") || commentText.includes("\r")) {
      throw new Error("Comment cannot contain newline");
    }
    this.#text = commentText;
  }

  get text(): string {
    return this.#text;
  }

  isIdentical(other: Comparable): boolean {
    const otherAsComment = other as Comment;
    return other.is(Comment) && this.#text === otherAsComment.#text;
  }

  inverse(): Comment {
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

  // toJSON(): CommentJSON {
  //   return {
  //     type: "comment",
  //     text: this.#text,
  //   };
  // }
}
