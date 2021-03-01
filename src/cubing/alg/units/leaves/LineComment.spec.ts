import { LineComment } from "./LineComment";

describe("LineComment", () => {
  const expectedErrorMessage = "LineComment cannot contain newline";

  it("throws an error when a newline is provided in the input", () => {
    expect(
      () => new LineComment("This is a comment \n with a newline"),
    ).toThrow(expectedErrorMessage);
    expect(() => new LineComment("A newline character \r")).toThrow(
      expectedErrorMessage,
    );
  });

  it("does not throw an error when emojis are provided in the input", () => {
    expect(
      () => new LineComment("This string contains emojis 😀 😅"),
    ).not.toThrow(expectedErrorMessage);
  });

  it("does not throw an error when text characters are provided in the input", () => {
    expect(
      () =>
        new LineComment(
          "This is just a bunch of text characters in a comment.",
        ),
    ).not.toThrow(expectedErrorMessage);
  });

  it("does not throw an error when special characters are provided in the input", () => {
    expect(() => new LineComment("Th!s cont@in$ $pec!@l ch@r$")).not.toThrow(
      expectedErrorMessage,
    );
  });
});
