export type ExperimentalNotationType = "auto" | "LGN";

export interface ExperimentalSerializationOptions {
  // TODO: this will still serialize caret NISS notation as normal.
  notation?: ExperimentalNotationType;
}
