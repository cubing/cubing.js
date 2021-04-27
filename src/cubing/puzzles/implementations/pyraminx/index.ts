import type { PuzzleLoader } from "../../PuzzleLoader";

export const pyraminx: PuzzleLoader = {
  id: "pyraminx",
  fullName: "Pyraminx",
  inventedBy: ["Uwe Meffert"],
  inventionYear: 1970, // https://en.wikipedia.org/wiki/Pyraminx#Description
  def: async () => {
    return await import("./pyraminx.kpuzzle.json");
  },
  svg: async () => {
    return (await import("./pyraminx.kpuzzle.svg")).default;
  },
};
