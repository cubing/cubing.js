import type { TwistyPlayerInitialConfig } from "../../../cubing/twisty";
import type {
  AlgProp,
  AlgWithIssues,
} from "../../../cubing/twisty/model/depth-0/AlgProp";
import type { TwistyPlayerModel } from "../../../cubing/twisty/model/TwistyPlayerModel";
import type { TwistyPropSource } from "../../../cubing/twisty/model/TwistyProp";
import type { TwistyPlayerAttribute } from "../../../cubing/twisty/views/TwistyPlayerV2";

export class URLParamUpdater {
  constructor(model: TwistyPlayerModel) {
    this.listenToAlgProp(model.algProp, "alg");
    this.listenToAlgProp(model.algProp, "experimental-setup-alg");
    this.listenToStringSourceProp(model.puzzleProp, "puzzle");
    this.listenToStringSourceProp(
      model.stickeringProp,
      "experimental-stickering",
    );
    this.listenToStringSourceProp(
      model.setupAnchorProp,
      "experimental-setup-anchor",
    );
  }

  // TODO: Cache parsed URL?
  setURLParam(key: string, value: string, defaultString: string): void {
    const url = new URL(location.href);
    if (value === defaultString) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
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

export function getConfigFromURL(): TwistyPlayerInitialConfig {
  const params = new URL(location.href).searchParams;
  const config: TwistyPlayerInitialConfig = {};
  for (const paramKey in paramKeys) {
    const paramValue = params.get(paramKey);
    if (paramValue !== null) {
      // TODO: type
      (config as any)[paramKey] = paramValue;
    }
  }
  return config;
}
