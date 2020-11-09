import { parse } from "../../alg";
import { TwistyPlayer } from "./TwistyPlayer";

describe("TwistyPlayer", () => {
  it("can be constructed", () => {
    const twistyPlayer = new TwistyPlayer({
      alg: parse("R U R'"),
    });
    expect(twistyPlayer.alg.nestedUnits.length).toEqual(3);
  });
});
