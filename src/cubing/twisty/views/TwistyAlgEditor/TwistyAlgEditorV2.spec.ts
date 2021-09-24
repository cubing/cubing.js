/**
 * @jest-environment jsdom
 */
import "../../../alg/test/alg-comparison";
import { Alg } from "../../../alg";
import { TwistyAlgEditorV2 } from "./TwistyAlgEditorV2";
import { TwistyPlayer } from "../TwistyPlayer";

class ResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }
}

(window as any).ResizeObserver = ResizeObserver;

describe("TwistyAlgEditorV2", () => {
  it("can be constructed without arguments", () => {
    const twistyAlgEditorV2 = new TwistyAlgEditorV2();
    expect(twistyAlgEditorV2.twistyPlayer).toBeNull();
  });
  it("can be constructed with a player", () => {
    const twistyPlayer = new TwistyPlayer();
    const twistyAlgEditorV2 = new TwistyAlgEditorV2({ twistyPlayer });
    expect(twistyAlgEditorV2.twistyPlayer).not.toBeNull();
  });
  it("can have a player set as an attribute", () => {
    // TODO: 2D is to avoid WebGL error. Can we do this in another way?
    const twistyPlayer = new TwistyPlayer({ visualization: "2D" });
    twistyPlayer.id = "test-id-1";
    document.body.appendChild(twistyPlayer);
    const twistyAlgEditorV2 = new TwistyAlgEditorV2();
    twistyAlgEditorV2.setAttribute("for-twisty-player", "test-id-1");
    expect(twistyAlgEditorV2.twistyPlayer).not.toBeNull();
  });
  it("sets timestamp from textarea", async () => {
    const twistyPlayer = new TwistyPlayer({ alg: "F2", visualization: "2D" });
    const alg = async () =>
      (await twistyPlayer.experimentalModel.algProp.get()).alg;
    document.body.appendChild(twistyPlayer);
    expect(await alg()).toBeIdentical(new Alg("F2"));
    const twistyAlgEditorV2 = new TwistyAlgEditorV2({ twistyPlayer });
    twistyAlgEditorV2.algString = "R      U R' D2";
    expect(await alg()).toBeIdentical(new Alg("R U R' D2"));

    // TODO: get this working.
    // const textarea = TwistyAlgEditorV2.shadow.querySelector("textarea");
    // expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    // textarea!.setSelectionRange(8, 8);
    // textarea!.dispatchEvent(new CustomEvent("input"));
    // expect(twistyPlayer.timeline.timestamp).toBe(2000);
  });
});
