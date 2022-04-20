import { cachedData222 } from "./side-events/search-dynamic-side-events";
import { cachedSGSDataMegaminx } from "./side-events/search-dynamic-side-events";
import { sgsDataPyraminx } from "./side-events/search-dynamic-side-events";
import { sgsDataSkewb } from "./side-events/search-dynamic-side-events";

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
