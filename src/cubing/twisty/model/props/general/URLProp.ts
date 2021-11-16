import { TwistyPropSource } from "../TwistyProp";

export class URLProp extends TwistyPropSource<URL | null, URL | string | null> {
  getDefaultValue(): URL | null {
    return null;
  }

  derive(input: URL | string | null): URL | null {
    if (typeof input === "string") {
      return new URL(input, location.href); // TODO
    }
    return input;
  }
}
