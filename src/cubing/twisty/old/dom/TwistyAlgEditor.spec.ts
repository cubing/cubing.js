/**
 * @jest-environment jsdom
 */
import "../../../alg/test/alg-comparison";
import { Alg } from "../../../alg";
import { TwistyAlgEditor } from "./TwistyAlgEditor";
import { TwistyPlayerV1 } from "./TwistyPlayer";

class ResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }
}

(window as any).ResizeObserver = ResizeObserver;

describe("TwistyAlgEditor", () => {
  it("can be constructed without arguments", () => {
    const twistyAlgEditor = new TwistyAlgEditor();
    expect(twistyAlgEditor.twistyPlayer).toBeNull();
  });
  it("can be constructed with a player", () => {
    const twistyPlayer = new TwistyPlayerV1();
    const twistyAlgEditor = new TwistyAlgEditor({ twistyPlayer });
    expect(twistyAlgEditor.twistyPlayer).not.toBeNull();
  });
  it("can have a player set as an attribute", () => {
    // TODO: 2D is to avoid WebGL error. Can we do this in another way?
    const twistyPlayer = new TwistyPlayerV1({ visualization: "2D" });
    twistyPlayer.id = "test-id-1";
    document.body.appendChild(twistyPlayer);
    const twistyAlgEditor = new TwistyAlgEditor();
    twistyAlgEditor.setAttribute("for-twisty-player", "test-id-1");
    expect(twistyAlgEditor.twistyPlayer).not.toBeNull();
  });
  it("sets timestamp from textarea", async () => {
    const twistyPlayer = new TwistyPlayerV1({ alg: "F2", visualization: "2D" });
    document.body.appendChild(twistyPlayer);
    expect(twistyPlayer.alg).toBeIdentical(new Alg("F2"));
    const twistyAlgEditor = new TwistyAlgEditor({ twistyPlayer });
    twistyAlgEditor.algString = "R      U R' D2";
    expect(twistyPlayer.alg).toBeIdentical(new Alg("R U R' D2"));

    // TODO: get this working.
    // const textarea = TwistyAlgEditor.shadow.querySelector("textarea");
    // expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    // textarea!.setSelectionRange(8, 8);
    // textarea!.dispatchEvent(new CustomEvent("input"));
    // expect(twistyPlayer.timeline.timestamp).toBe(2000);
  });
});
