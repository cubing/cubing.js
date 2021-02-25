import { Alg } from "../../alg";
import { TwistyPlayer } from "./TwistyPlayer";

describe("TwistyPlayer", () => {
  it("can be constructed", () => {
    const twistyPlayer = new TwistyPlayer({
      alg: new Alg("R U R'"),
    });
    expect(twistyPlayer.alg.experimentalNumUnits()).toEqual(3);
  });
});
