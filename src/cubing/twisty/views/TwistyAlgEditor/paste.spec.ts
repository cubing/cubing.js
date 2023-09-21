import { expect } from "../../../../test/chai-workarounds";

import { pasteIntoTextArea } from "./paste";

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
  pasteIntoTextArea(mockTextArea, pastedText);
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
    expect(mockPaste("R  L2 // '’", 2, 2, "U’")).to.equal("R U' L2 // '’");
    expect(mockPaste("R L2 // '’", 2, 2, "U’")).to.equal("R U' L2 // '’");
    expect(mockPaste("R L2 // '’", 1, 1, "U’")).to.equal("R U' L2 // '’");
    expect(mockPaste("R L2 // '’", 1, 2, "U’")).to.equal("R U' L2 // '’");
    expect(mockPaste("R D", 1, 1, "’")).to.equal("R' D");
    expect(mockPaste("R L2", 1, 2, "U’ // It’s fancy!\n")).to.equal(
      "R U' // It’s fancy!\nL2",
    );
  });
  it("handles non-semantic paste", () => {
    expect(mockPaste("R L2'", 2, 3, "U")).to.equal("R U2'");
    expect(mockPaste("R D2", 1, 3, " R U R’ D2")).to.equal("R R U R' D22");
    expect(mockPaste("(3, 4) /", 8, 8, "/ comment’")).to.equal(
      "(3, 4) // comment’",
    );
  });
});
