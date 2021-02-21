import { AlgCommon, Comparable } from "./common";

// TODO: hash
export class Comment extends AlgCommon {
  readonly #text: string;

  constructor(commentText: string) {
    super();
    if (commentText.includes("\n") || commentText.includes("\r")) {
      throw new Error("Comment cannot contain newline");
    }
    this.#text = commentText;
  }

  isIdentical(other: Comparable): boolean {
    const otherAsComment = other as Comment;
    return other.is(Comment) && this.#text === otherAsComment.#text;
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
