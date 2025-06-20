import { EXPERIMENTAL_PROP_NO_VALUE } from "../../../../cubing/twisty";
import type {
  AlgProp,
  AlgWithIssues,
} from "../../../../cubing/twisty/model/props/puzzle/state/AlgProp";
import type { TwistyPropSource } from "../../../../cubing/twisty/model/props/TwistyProp";
import type { TwistyPlayerModel } from "../../../../cubing/twisty/model/TwistyPlayerModel";
import {
  type TwistyPlayerAttribute,
  type TwistyPlayerConfig,
  twistyPlayerAttributeMap,
} from "../../../../cubing/twisty/views/TwistyPlayer";

function updateURL(url: URL): void {
  window.history.replaceState("", "", url.toString());
}

// TODO: Find a way to connect this to the `TwistyPlayer` constructor?

export type URLParamUpdaterOptions = {
  prefix?: string;
};

export class URLParamUpdater {
  #prefix: string;
  constructor(model: TwistyPlayerModel, options?: URLParamUpdaterOptions) {
    this.#prefix = options?.prefix ?? "";

    this.listenToAlgProp(model.alg, "alg");
    this.listenToAlgProp(model.setupAlg, "setup-alg");
    this.listenToStringOrNullProp(
      model.twistySceneModel.stickeringRequest,
      "stickering",
      "full",
    );
    this.listenToStringSourceProp(model.setupAnchor, "setup-anchor");
    this.listenToStringOrNullProp(model.title, "title");
    this.listenToStringOrNoValueProp(
      model.puzzleIDRequest,
      "puzzle",
      EXPERIMENTAL_PROP_NO_VALUE,
    );
    this.listenToStringOrNoValueProp(
      model.puzzleDescriptionRequest,
      "puzzle-description",
      EXPERIMENTAL_PROP_NO_VALUE,
    );
  }

  // TODO: Cache parsed URL?
  setURLParam(
    unprefixedKey: string,
    value: string,
    defaultString: string,
  ): void {
    const prefixedKey = this.#prefix + unprefixedKey;
    const url = new URL(location.href);
    if (value === defaultString) {
      url.searchParams.delete(prefixedKey);
    } else {
      url.searchParams.set(prefixedKey, value);
    }
    updateURL(url);
  }

  async listenToStringSourceProp<T extends string>(
    prop: TwistyPropSource<T>,
    key: string,
    defaultString?: T,
  ): Promise<void> {
    const actualDefaultString =
      defaultString ?? (await prop.getDefaultValue()) ?? ""; // TODO
    prop.addFreshListener((s: string) => {
      this.setURLParam(key, s, actualDefaultString);
    });
  }

  async listenToStringOrNullProp(
    prop: TwistyPropSource<string | null>,
    key: string,
    defaultString: string = "",
  ): Promise<void> {
    prop.addFreshListener((s: string | null) => {
      this.setURLParam(key, s ?? defaultString, defaultString);
    });
  }

  async listenToStringOrNoValueProp<T extends string>(
    prop: TwistyPropSource<T | typeof EXPERIMENTAL_PROP_NO_VALUE>,
    key: string,
    defaultString: T | typeof EXPERIMENTAL_PROP_NO_VALUE,
  ): Promise<void> {
    prop.addFreshListener((s: string | typeof EXPERIMENTAL_PROP_NO_VALUE) => {
      if (s === EXPERIMENTAL_PROP_NO_VALUE) {
        s = defaultString;
      }
      if (s === EXPERIMENTAL_PROP_NO_VALUE) {
        this.setURLParam(key, "", "");
      } else {
        this.setURLParam(key, s, ""); // TODO
      }
    });
  }

  listenToAlgProp(prop: AlgProp, key: string): void {
    prop.addFreshListener((algWithIssues: AlgWithIssues) => {
      this.setURLParam(key, algWithIssues.alg.toString(), "");
    });
  }
}

export function getConfigFromURL(
  prefix = "",
  url: string = location.href,
): TwistyPlayerConfig {
  // TODO: Why does `Object.entries(paramMapping)` crash if this is defined elswhere?
  const paramMapping: Record<string, TwistyPlayerAttribute> = {
    alg: "alg",
    "setup-alg": "experimental-setup-alg",
    "setup-anchor": "experimental-setup-anchor",
    puzzle: "puzzle",
    stickering: "experimental-stickering",
    "puzzle-description": "experimental-puzzle-description",
    title: "experimental-title",
    "video-url": "experimental-video-url",
    competition: "experimental-competition-id",
  };

  const params = new URL(url).searchParams;
  const config: TwistyPlayerConfig = {};
  for (const [ourParam, twistyPlayerParam] of Object.entries(paramMapping)) {
    const paramValue = params.get(prefix + ourParam);
    if (paramValue !== null) {
      // TODO: type
      const configKey = twistyPlayerAttributeMap[twistyPlayerParam];
      (config as any)[configKey] = paramValue;
    }
  }
  return config;
}

export function remapLegacyURLParams(
  mapping: Record<string, string | null>,
): void {
  const url = new URL(location.href);
  for (const [oldKey, newKey] of Object.entries(mapping)) {
    // `null` indicates there is no new key, i.e. just drop the old key
    if (newKey !== null) {
      // The new key takes precedents, so we only remap the old key if the new key
      // is not already set.
      if (!url.searchParams.has(newKey)) {
        const value = url.searchParams.get(oldKey);
        if (value !== null) {
          url.searchParams.set(newKey, value);
        }
      }
    }
    url.searchParams.delete(oldKey);
  }
  updateURL(url);
}
