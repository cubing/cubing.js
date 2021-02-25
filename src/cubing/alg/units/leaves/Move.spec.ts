import { Turn } from "./Turn";

describe("Turn", () => {
  it("can be modified", () => {
    expect(new Turn("R").modified({ repetition: 2 }).toString()).toBe("R2");
    expect(
      new Turn("4r", 3)
        .modified({
          family: "u",
          outerLayer: 2,
        })
        .toString(),
    ).toBe("2-4u3");
  });
});
