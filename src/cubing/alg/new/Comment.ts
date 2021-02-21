// TODO: hash
export class Comment {
  readonly #text: string;

  constructor(commentText: string) {
    if (commentText.includes("\n") || commentText.includes("\r")) {
      throw new Error("Comment cannot contain newline");
    }
    this.#text = commentText;
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
