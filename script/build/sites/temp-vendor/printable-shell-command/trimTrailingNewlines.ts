const DEFAULT_TRIM_TRAILING_NEWLINE_BEHAVIOUR = "never";
export interface TrailingNewlineOptions {
  trimTrailingNewlines?: "single-required" | "single-if-present" | "never";
}

// TODO: Handle carriage return?
export async function handleTrailingNewlines(
  text: Promise<string>,
  options?: TrailingNewlineOptions,
): Promise<string> {
  const awaitedText = await text;
  switch (
    options?.trimTrailingNewlines ??
    DEFAULT_TRIM_TRAILING_NEWLINE_BEHAVIOUR
  ) {
    case "single-required": {
      if (!awaitedText.endsWith("\n")) {
        throw new Error("Trailing newline required, but not present.");
      }
      return awaitedText.slice(0, -1);
    }
    case "single-if-present": {
      if (awaitedText.endsWith("\n")) {
        return awaitedText.slice(0, -1);
      } else {
        return awaitedText;
      }
    }
    case "never": {
      return awaitedText;
    }
    default:
      throw new Error("Invalid value for `trimTrailingNewlines`.");
  }
}

function wrapHandleTrailingNewlines(
  fn: () => Promise<string>,
): (options?: TrailingNewlineOptions) => Promise<string> {
  return (options?: TrailingNewlineOptions) =>
    handleTrailingNewlines(fn(), options);
}

export function wrapHandleTrailingNewlinesForResponder(v: {
  response(): {
    text: () => Promise<string>;
  };
}): (options?: TrailingNewlineOptions) => Promise<string> {
  const response = v.response();
  const originalTextFn = response.text.bind(response);
  return wrapHandleTrailingNewlines(originalTextFn);
}

export function wrapHandleTrailingNewlinesForResponse(
  response: Response,
): Response & { text: (options?: TrailingNewlineOptions) => Promise<string> } {
  const textFn = wrapHandleTrailingNewlinesForResponder({
    response: () => response,
  });
  Object.defineProperty(response, "text", {
    get: () => {
      return textFn;
    },
  });
  return response;
}
