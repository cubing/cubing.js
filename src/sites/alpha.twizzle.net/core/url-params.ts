import type {
  AlgProp,
  AlgWithIssues,
} from "../../../cubing/twisty/model/depth-0/AlgProp";
import type { TwistyPlayerModel } from "../../../cubing/twisty/model/TwistyPlayerModel";
import {
  NoValueType,
  NO_VALUE,
  TwistyPropSource,
} from "../../../cubing/twisty/model/TwistyProp";
import {
  TwistyPlayerAttribute,
  twistyPlayerAttributeMap,
  TwistyPlayerConfig,
} from "../../../cubing/twisty/views/TwistyPlayer";

// TODO: Find a way to connect this to the `TwistyPlayer` constructor?

export class URLParamUpdater {
  constructor(model: TwistyPlayerModel, private prefix = "") {
    this.listenToAlgProp(model.algProp, "alg");
    this.listenToAlgProp(model.setupProp, "experimental-setup-alg");
    this.listenToStringSourceProp(
      model.stickeringProp,
      "experimental-stickering",
    );
    this.listenToStringSourceProp(
      model.setupAnchorProp,
      "experimental-setup-anchor",
    );
    this.listenToPuzzleIDRequestProp(
      model.puzzleIDRequestProp,
      "puzzle",
      "3x3x3",
    );
  }

  // TODO: Cache parsed URL?
  setURLParam(
    unprefixedKey: string,
    value: string,
    defaultString: string,
  ): void {
    const prefixedKey = this.prefix + unprefixedKey;
    const url = new URL(location.href);
    if (value === defaultString) {
      url.searchParams.delete(prefixedKey);
    } else {
      url.searchParams.set(prefixedKey, value);
    }
    window.history.replaceState("", "", url.toString());
  }

  async listenToStringSourceProp(
    prop: TwistyPropSource<string>,
    key: string,
    defaultString?: string,
  ): Promise<void> {
    const actualDefaultString = defaultString ?? (await prop.getDefaultValue());
    prop.addFreshListener((s: string) => {
      this.setURLParam(key, s, actualDefaultString);
    });
  }

  async listenToPuzzleIDRequestProp(
    prop: TwistyPropSource<string | NoValueType>,
    key: string,
    defaultString: string,
  ): Promise<void> {
    prop.addFreshListener((s: string | NoValueType) => {
      if (s === NO_VALUE) {
        s = defaultString;
      }
      this.setURLParam(key, s, defaultString);
    });
  }

  listenToAlgProp(prop: AlgProp, key: string): void {
    prop.addFreshListener((algWithIssues: AlgWithIssues) => {
      this.setURLParam(key, algWithIssues.alg.toString(), "");
    });
  }
}

const paramKeys: TwistyPlayerAttribute[] = [
  "alg",
  "experimental-setup-alg",
  "experimental-setup-anchor",
  "puzzle",
  "experimental-stickering",
];

export function getConfigFromURL(prefix = ""): TwistyPlayerConfig {
  const params = new URL(location.href).searchParams;
  const config: TwistyPlayerConfig = {};
  for (const paramKey of paramKeys) {
    const paramValue = params.get(prefix + paramKey);
    if (paramValue !== null) {
      // TODO: type
      const configKey = twistyPlayerAttributeMap[paramKey];
      (config as any)[configKey] = paramValue;
    }
  }
  return config;
}
