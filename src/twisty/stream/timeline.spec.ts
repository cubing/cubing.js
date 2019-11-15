import { BareBlockMove } from "../../alg";
import { algPartToStringForTesting } from "../../alg/traversal";
import { toTimeline } from "./timeline";

const moves = [
  {
    timeStamp: 4356,
    move: BareBlockMove("L"),
  },
  {
    timeStamp: 4358,
    move: BareBlockMove("R", -1),
  },
  {
    timeStamp: 4360,
    move: BareBlockMove("L"),
  },
  {
    timeStamp: 4417,
    move: BareBlockMove("R", -1),
  },
  {
    timeStamp: 4777,
    move: BareBlockMove("D", -1),
  },
  {
    timeStamp: 4836,
    move: BareBlockMove("R", -1),
  },
  {
    timeStamp: 4837,
    move: BareBlockMove("L"),
  },
  {
    timeStamp: 4838,
    move: BareBlockMove("L"),
  },
  {
    timeStamp: 4897,
    move: BareBlockMove("R", -1),
  },
  // {
  //   timeStamp: 4957,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 5137,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 5196,
  //   move: BareBlockMove("L"),
  // },
  // {
  //   timeStamp: 5197,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 5198,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 5257,
  //   move: BareBlockMove("L"),
  // },
  // {
  //   timeStamp: 5377,
  //   move: BareBlockMove("D", -1),
  // },
  // {
  //   timeStamp: 5436,
  //   move: BareBlockMove("L"),
  // },
  // {
  //   timeStamp: 5437,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 5438,
  //   move: BareBlockMove("L"),
  // },
  // {
  //   timeStamp: 5496,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 6096,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 6216,
  //   move: BareBlockMove("U"),
  // },
  // {
  //   timeStamp: 6217,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 6277,
  //   move: BareBlockMove("U"),
  // },
  // {
  //   timeStamp: 6337,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 6396,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 6398,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 6457,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 6877,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 6998,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 7057,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 7117,
  //   move: BareBlockMove("D", -1),
  // },
  // {
  //   timeStamp: 7177,
  //   move: BareBlockMove("U"),
  // },
  // {
  //   timeStamp: 7417,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 7478,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 7538,
  //   move: BareBlockMove("U"),
  // },
  // {
  //   timeStamp: 7597,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 7657,
  //   move: BareBlockMove("U"),
  // },
  // {
  //   timeStamp: 7836,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 7838,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 7897,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 8017,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 8076,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 8078,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 8137,
  //   move: BareBlockMove("D"),
  // },
  // {
  //   timeStamp: 8857,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 8977,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 9098,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 9278,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 9337,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 9458,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 9577,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 9637,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 9698,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 10478,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 10717,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 10898,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 10957,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 11018,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 11138,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 11318,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 11378,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 11497,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 11499,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 11677,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 11679,
  //   move: BareBlockMove("F"),
  // },
  // {
  //   timeStamp: 11798,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 11917,
  //   move: BareBlockMove("U"),
  // },
  // {
  //   timeStamp: 11919,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 12037,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 12157,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 12337,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 12517,
  //   move: BareBlockMove("R", -1),
  // },
  // {
  //   timeStamp: 12937,
  //   move: BareBlockMove("F", -1),
  // },
  // {
  //   timeStamp: 12997,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 13057,
  //   move: BareBlockMove("R"),
  // },
  // {
  //   timeStamp: 13177,
  //   move: BareBlockMove("U", -1),
  // },
  // {
  //   timeStamp: 13237,
  //   move: BareBlockMove("U", -1),
  // },
];

const moves2 = [
  {
    timeStamp: 100,
    move: BareBlockMove("R"),
  },
  {
    timeStamp: 300,
    move: BareBlockMove("U"),
  },
  {
    timeStamp: 450,
    move: BareBlockMove("R", -1),
  },
  {
    timeStamp: 550,
    move: BareBlockMove("U", -1),
  },
  {
    timeStamp: 575,
    move: BareBlockMove("D"),
  },
  {
    timeStamp: 750,
    move: BareBlockMove("R"),
  },
  {
    timeStamp: 800,
    move: BareBlockMove("R"),
  },
];

describe("Timeline", () => {
  it("should convert", () => {
    console.log(toTimeline(moves2).map((t) => `@${t.start}-${t.end} ${algPartToStringForTesting(t.event.move)}`).join("\n"));
    console.log(toTimeline(moves, 250).map((t) => `@${t.start}-${t.end} ${algPartToStringForTesting(t.event.move)}`).join("\n"));
  });
});

// 0   1   2   3   4   5   6   7   8   9
//  ---R---
//          ---U--
//                --R'-
//                     --U'--
//                            ---R--R--
