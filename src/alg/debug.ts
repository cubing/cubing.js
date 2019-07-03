type ReportingLevel = "none" | "warn" | "error"
var currentReportingLevel = "warn";

var MAX_NUMBER_OF_TIMES_TO_WARN = 10;
var numWarned = 0;

export function reportTypeMismatch(msg: string): void {
  switch (currentReportingLevel) {
    case "error":
      throw msg;
    case "warn":
      numWarned++;
      if (numWarned < MAX_NUMBER_OF_TIMES_TO_WARN) {
        if (numWarned +1 == MAX_NUMBER_OF_TIMES_TO_WARN) {
          console.warn(msg);
        }
      }
      return;
  }
}

export function setAlgPartTypeMismatchReportingLevel(level: ReportingLevel): void {
  currentReportingLevel = level;
}