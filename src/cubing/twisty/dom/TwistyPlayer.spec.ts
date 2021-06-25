/**
 * @jest-environment jsdom
 */

import { Alg } from "../../alg";
import { TwistyPlayer } from "./TwistyPlayer";
import "../../alg/test/alg-comparison";

describe("TwistyPlayer", () => {
  it("can be constructed", () => {
    const twistyPlayer = new TwistyPlayer({
      alg: "R U R'",
    });
    expect(twistyPlayer.alg.experimentalNumUnits()).toEqual(3);
  });

  it("can set alg using string", () => {
    const twistyPlayer = new TwistyPlayer({
      alg: "R U R'",
    });
    // TODO(https://github.com/microsoft/TypeScript/pull/42425): remove `@ts-ignore`.
    // @ts-ignore
    twistyPlayer.alg = "F2";
    expect(twistyPlayer.alg).toBeIdentical(new Alg("F2"));
  });
});
