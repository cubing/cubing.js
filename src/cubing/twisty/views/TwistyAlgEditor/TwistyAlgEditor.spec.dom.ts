import { expect } from "../../../../test/chai-workarounds";

import { TwistyPlayer } from "../TwistyPlayer";
import { TwistyAlgEditor } from "./TwistyAlgEditor";

class ResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }
}

if (globalThis.window) {
  (window as any).ResizeObserver = ResizeObserver;
}

describe("TwistyAlgEditor", () => {
  it("can be constructed without arguments", () => {
    const twistyAlgEditor = new TwistyAlgEditor();
    expect(twistyAlgEditor.twistyPlayer).to.be.null;
  });
  it("can be constructed with a player", () => {
    const twistyPlayer = new TwistyPlayer();
    const twistyAlgEditor = new TwistyAlgEditor({ twistyPlayer });
    expect(twistyAlgEditor.twistyPlayer).not.to.be.null;
  });
  it("can have a player set as an attribute", () => {
    // TODO: 2D is to avoid WebGL error. Can we do this in another way?
    const twistyPlayer = new TwistyPlayer({ visualization: "2D" });
    twistyPlayer.id = "test-id-1";
    document.body.appendChild(twistyPlayer);
    const twistyAlgEditor = new TwistyAlgEditor();
    twistyAlgEditor.setAttribute("for-twisty-player", "test-id-1");
    expect(twistyAlgEditor.twistyPlayer).not.to.be.null;
  });
  it("sets timestamp from textarea", async () => {
    const twistyPlayer = new TwistyPlayer({ alg: "F2", visualization: "2D" });
    const alg = async () =>
      (await twistyPlayer.experimentalModel.alg.get()).alg;
    document.body.appendChild(twistyPlayer);
    expect(await alg()).to.be.identicalAlg("F2");
    const twistyAlgEditor = new TwistyAlgEditor({ twistyPlayer });
    twistyAlgEditor.algString = "R      U R' D2";
    expect(await alg()).to.be.identicalAlg("R U R' D2");
    // TODO: get this working.
    // const textarea = TwistyAlgEditor.shadow.querySelector("textarea");
    // expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
    // textarea!.setSelectionRange(8, 8);
    // textarea!.dispatchEvent(new CustomEvent("input"));
    // expect(twistyPlayer.timeline.timestamp).toBe(2000);
  });
});
