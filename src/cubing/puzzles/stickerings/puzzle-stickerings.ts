import type { PuzzleID } from "../../twisty";

export const experimentalStickerings: Record<
  string,
  { groups?: Partial<Record<PuzzleID, string>> }
> = {
  full: { groups: { "3x3x3": "Stickering" } }, // default
  OLL: { groups: { "3x3x3": "Last Layer" } },
  PLL: { groups: { "3x3x3": "Last Layer" } },
  LL: { groups: { "3x3x3": "Last Layer" } },
  EOLL: { groups: { "3x3x3": "Last Layer" } },
  COLL: { groups: { "3x3x3": "Last Layer" } },
  OCLL: { groups: { "3x3x3": "Last Layer" } },
  CLL: { groups: { "3x3x3": "Last Layer" } },
  ELL: { groups: { "3x3x3": "Last Layer" } },
  ZBLL: { groups: { "3x3x3": "Last Layer" } },
  LS: { groups: { "3x3x3": "Last Slot" } },
  ELS: { groups: { "3x3x3": "Last Slot" } },
  CLS: { groups: { "3x3x3": "Last Slot" } },
  ZBLS: { groups: { "3x3x3": "Last Slot" } },
  VLS: { groups: { "3x3x3": "Last Slot" } },
  WVLS: { groups: { "3x3x3": "Last Slot" } },
  F2L: { groups: { "3x3x3": "CFOP (Fridrich)" } },
  Daisy: { groups: { "3x3x3": "CFOP (Fridrich)" } },
  Cross: { groups: { "3x3x3": "CFOP (Fridrich)" } },
  EO: { groups: { "3x3x3": "ZZ" } },
  EOline: { groups: { "3x3x3": "ZZ" } },
  EOcross: { groups: { "3x3x3": "ZZ" } },
  CMLL: { groups: { "3x3x3": "Roux" } },
  L10P: { groups: { "3x3x3": "Roux" } },
  L6E: { groups: { "3x3x3": "Roux" } },
  L6EO: { groups: { "3x3x3": "Roux" } },
  "2x2x2": { groups: { "3x3x3": "Petrus" } },
  "2x2x3": { groups: { "3x3x3": "Petrus" } },
  L2C: {
    groups: {
      "4x4x4": "Reduction",
      "5x5x5": "Reduction",
      "6x6x6": "Reduction",
    },
  },
  PBL: {
    groups: {
      "2x2x2": "Ortega",
    },
  },
  "Void Cube": { groups: { "3x3x3": "Miscellaneous" } },
  invisible: { groups: { "3x3x3": "Miscellaneous" } },
  picture: { groups: { "3x3x3": "Miscellaneous" } },
  "centers-only": { groups: { "3x3x3": "Miscellaneous" } }, // TODO
  "experimental-centers-U": {},
  "experimental-centers-U-D": {},
  "experimental-centers-U-L-D": {},
  "experimental-centers-U-L-B-D": {},
  "experimental-centers": {},
  "experimental-fto-fc": { groups: { fto: "Bencisco" } },
  "experimental-fto-f2t": { groups: { fto: "Bencisco" } },
  "experimental-fto-sc": { groups: { fto: "Bencisco" } },
  "experimental-fto-l2c": { groups: { fto: "Bencisco" } },
  "experimental-fto-lbt": { groups: { fto: "Bencisco" } },
  "experimental-fto-l3t": { groups: { fto: "Bencisco" } },
};
