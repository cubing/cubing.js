import { Move } from "./Move";

describe("Move", () => {
  it("can be modified", () => {
    expect(new Move("R").modified({ repetition: 2 }).toString()).toBe("R2");
    expect(
      new Move("4r", 3)
        .modified({
          family: "u",
          outerLayer: 2,
        })
        .toString(),
    ).toBe("2-4u3");
  });
});
