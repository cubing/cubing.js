import { Quat } from "./Quat";

describe("Quat", () => {
  it("should multiply", () => {
    const a = new Quat(3, 1, 4, 1);
    const b = new Quat(5, 9, 2, 6);
    const c = a.mul(b);
    expect(c.dist(new Quat(-8, 54, 29, -11))).toBe(0);
  });
});
