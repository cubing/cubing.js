import { SimpleTwistyPropSource } from "../../TwistyProp";

export const indexerStrategyNames = {
  auto: true,
  simple: true,
  tree: true,
  simultaneous: true,
};
export type IndexerStrategyName = keyof typeof indexerStrategyNames;

export class IndexerConstructorRequestProp extends SimpleTwistyPropSource<IndexerStrategyName> {
  getDefaultValue(): IndexerStrategyName {
    return "auto";
  }
}
