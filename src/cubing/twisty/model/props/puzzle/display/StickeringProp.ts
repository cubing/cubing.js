import { SimpleTwistyPropSource } from "../../TwistyProp";

// TODO: turn these maps into lists?
// TODO: alg.cubing.net parity
export const experimentalStickerings = {
  "full": true, // default
  "centers-only": true, // TODO
  "PLL": true,
  "CLS": true,
  "OLL": true,
  "COLL": true,
  "OCLL": true,
  "CLL": true,
  "ELL": true,
  "ELS": true,
  "LL": true,
  "F2L": true,
  "ZBLL": true,
  "ZBLS": true,
  "WVLS": true,
  "VLS": true,
  "LS": true,
  "EO": true,
  "EOline": true,
  "EOcross": true,
  "CMLL": true,
  "L10P": true,
  "L6E": true,
  "L6EO": true,
  "Daisy": true,
  "Cross": true,
  "2x2x2": true,
  "2x2x3": true,
  "Void Cube": true,
  "invisible": true,
  "picture": true,
  "experimental-centers-U": true,
  "experimental-centers-U-D": true,
  "experimental-centers-U-L-D": true,
  "experimental-centers-U-L-B-D": true,
  "experimental-centers": true,
  "experimental-fto-fc": true,
  "experimental-fto-f2t": true,
  "experimental-fto-sc": true,
  "experimental-fto-l2c": true,
  "experimental-fto-lbt": true,
  "experimental-fto-l3t": true,
  "experimental-global-custom-1": true,
  "experimental-global-custom-2": true,
};
export type ExperimentalStickering = keyof typeof experimentalStickerings;

export class StickeringProp extends SimpleTwistyPropSource<ExperimentalStickering> {
  getDefaultValue(): ExperimentalStickering {
    return "full"; // TODO: auto
  }
}
