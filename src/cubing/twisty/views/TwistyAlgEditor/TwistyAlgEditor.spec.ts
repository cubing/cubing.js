import { expect } from "../../../../test/chai-workarounds";

import { TwistyPlayer } from "../TwistyPlayer";
import {
  TwistyAlgEditor,
  pasteIntoTextAreaForTesting,
} from "./TwistyAlgEditor";

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

function createMockTextArea(
  originalValue: string,
  selectionStart: number,
  selectionEnd: number,
): HTMLTextAreaElement {
  const mockObject = {
    value: originalValue,
    selectionStart,
    selectionEnd,
    newValue: null,
  } as any as HTMLTextAreaElement;
  mockObject.setRangeText = (
    replacement: string,
    start?: number,
    end?: number,
    selectionMode?: SelectionMode,
  ) => {
    expect(start).to.equal(selectionStart);
    expect(end).to.equal(selectionEnd);
    expect(selectionMode).to.equal("end");
    mockObject.value =
      originalValue.slice(0, selectionStart) +
      replacement +
      originalValue.slice(selectionEnd);
  };
  return mockObject;
}

function mockPaste(
  originalValue: string,
  selectionStart: number,
  selectionEnd: number,
  pastedText: string,
): string {
  const mockTextArea = createMockTextArea(
    originalValue,
    selectionStart,
    selectionEnd,
  );
  pasteIntoTextAreaForTesting(mockTextArea, pastedText);
  return mockTextArea.value;
}

describe("pasteIntoTextArea", () => {
  it("handles basic spacing", () => {
    expect(mockPaste("R  L2", 2, 2, "U'")).to.equal("R U' L2");
    expect(mockPaste("R L2", 2, 2, "U'")).to.equal("R U' L2");
    expect(mockPaste("R L2", 1, 1, "2-5u'")).to.equal("R 2-5u' L2");
    expect(mockPaste("R L2", 1, 2, "2-5Uw'")).to.equal("R 2-5Uw' L2");
    expect(mockPaste("R L2", 0, 2, "U'")).to.equal("U' L2");
    expect(mockPaste("R D", 2, 2, "U L\n")).to.equal("R U L\nD");
    expect(mockPaste("R D", 1, 1, "U L\n")).to.equal("R U L\n D");
    expect(mockPaste("R U ", 4, 4, "L")).to.equal("R U L");
    expect(mockPaste("D B", 0, 0, "L")).to.equal("L D B");
  });
  it("does smart quote correction", () => {
    expect(mockPaste("R  L2", 2, 2, "U’")).to.equal("R U' L2");
    expect(mockPaste("R L2", 2, 2, "U’")).to.equal("R U' L2");
    expect(mockPaste("R L2", 1, 1, "U’")).to.equal("R U' L2");
    expect(mockPaste("R L2", 1, 2, "U’")).to.equal("R U' L2");
    expect(mockPaste("R L2", 1, 2, "U’ // It’s fancy!\n")).to.equal(
      "R U' // It’s fancy!\nL2",
    );
  });
  it("handles non-semantic paste", () => {
    expect(mockPaste("R L2'", 2, 3, "U")).to.equal("R U2'");
    expect(mockPaste("(3, 4) /", 8, 8, "/ comment’")).to.equal(
      "(3, 4) // comment’",
    );
  });
});
