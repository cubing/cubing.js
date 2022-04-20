import { cachedData222 } from "./sgs-side-events/search-dynamic-sgs-side-events";
import { cachedSGSDataMegaminx } from "./sgs-side-events/search-dynamic-sgs-side-events";
import { sgsDataPyraminx } from "./sgs-side-events/search-dynamic-sgs-side-events";
import { sgsDataSkewb } from "./sgs-side-events/search-dynamic-sgs-side-events";

describe("SGS", () => {
  it("Parses 2x2x2 SGS", () => {
    expect(cachedData222).not.toThrow();
  });

  it("Parses Megaminx SGS", () => {
    expect(cachedSGSDataMegaminx).not.toThrow();
  });

  it("Parses Pyraminx SGS", () => {
    expect(sgsDataPyraminx).not.toThrow();
  });

  it("Parses Skewb SGS", () => {
    expect(sgsDataSkewb).not.toThrow();
  });
});
