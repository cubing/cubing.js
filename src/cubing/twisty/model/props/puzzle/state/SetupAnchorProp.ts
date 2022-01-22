import { SimpleTwistyPropSource } from "../../TwistyProp";

// TODO: turn these maps into lists?
export const setupToLocations = {
  start: true, // default // TODO: "beginning"
  end: true,
};
export type SetupToLocation = keyof typeof setupToLocations;

export class SetupAnchorProp extends SimpleTwistyPropSource<SetupToLocation> {
  getDefaultValue(): SetupToLocation {
    return "start";
  }
}
