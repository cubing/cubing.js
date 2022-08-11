const { expect: untypedExpect } = await import("@esm-bundle/chai");
const expect: typeof import("chai").expect = untypedExpect;

import { cachedData222 } from "./sgs-side-events/search-dynamic-sgs-side-events";
import { cachedSGSDataMegaminx } from "./sgs-side-events/search-dynamic-sgs-side-events";
import { sgsDataPyraminx } from "./sgs-side-events/search-dynamic-sgs-side-events";
import { sgsDataSkewb } from "./sgs-side-events/search-dynamic-sgs-side-events";

describe("SGS", () => {
  it("Parses 2x2x2 SGS", () => {
    expect(cachedData222).not.to.throw();
  });

  it("Parses Megaminx SGS", () => {
    expect(cachedSGSDataMegaminx).not.to.throw();
  });

  it("Parses Pyraminx SGS", () => {
    expect(sgsDataPyraminx).not.to.throw();
  });

  it("Parses Skewb SGS", () => {
    expect(sgsDataSkewb).not.to.throw();
  });
});
