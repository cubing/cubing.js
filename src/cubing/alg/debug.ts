type ReportingLevel = "none" | "warn" | "error";
let currentReportingLevel = "warn";

const MAX_NUMBER_OF_TIMES_TO_WARN = 10;
let numWarned = 0;

// TODO: Avoid creating the string message if it won't be used (e.g. by taking a function?).
export function reportTypeMismatch(msg: string): void {
  switch (currentReportingLevel) {
    case "error":
      throw new Error(msg);
    case "warn": {
      numWarned++;
      if (numWarned < MAX_NUMBER_OF_TIMES_TO_WARN) {
        if (numWarned + 1 === MAX_NUMBER_OF_TIMES_TO_WARN) {
          console.warn(msg);
        }
      }
      return;
    }
  }
}

export function setAlgPartTypeMismatchReportingLevel(
  level: ReportingLevel,
): void {
  currentReportingLevel = level;
}

export const algDebugGlobals: { caretNISSNotationEnabled: boolean } = {
  caretNISSNotationEnabled: true,
};

export function setAlgDebug(options: {
  caretNISSNotationEnabled?: boolean;
}): void {
  if ("caretNISSNotationEnabled" in options) {
    algDebugGlobals.caretNISSNotationEnabled =
      !!options.caretNISSNotationEnabled;
  }
}
