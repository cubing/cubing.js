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

export const algDebugGlobals: { caratNISSNotationEnabled: boolean } = {
  caratNISSNotationEnabled: false,
};

export function setAlgDebug(options: {
  caratNISSNotationEnabled?: boolean;
}): void {
  if ("caratNISSNotationEnabled" in options) {
    algDebugGlobals.caratNISSNotationEnabled =
      !!options.caratNISSNotationEnabled;
  }
}
