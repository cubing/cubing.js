import type {
  AlgProp,
  AlgWithIssues,
} from "../../../cubing/twisty/model/depth-0/AlgProp";
import type { TwistyPlayerModel } from "../../../cubing/twisty/model/TwistyPlayerModel";
import type { TwistyPropSource } from "../../../cubing/twisty/model/TwistyProp";
import type {
  TwistyPlayerAttribute,
  TwistyPlayerV2Config,
} from "../../../cubing/twisty/views/TwistyPlayerV2";

export class URLParamUpdater {
  constructor(model: TwistyPlayerModel) {
    this.listenToAlgProp(model.algProp, "alg");
    this.listenToAlgProp(model.setupProp, "experimental-setup-alg");
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
    console.log("setting", key, value, defaultString);
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

export function getConfigFromURL(): TwistyPlayerV2Config {
  const params = new URL(location.href).searchParams;
  const config: TwistyPlayerV2Config = {};
  for (const paramKey in paramKeys) {
    const paramValue = params.get(paramKey);
    if (paramValue !== null) {
      // TODO: type
      (config as any)[paramKey] = paramValue;
    }
  }
  return config;
}
