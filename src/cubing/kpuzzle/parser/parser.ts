import { KPuzzleDefinition } from "../definition_types";
import { parse as importedParse } from "./parser-shim";

const parseKPuzzle: (s: string) => KPuzzleDefinition = importedParse;

export { parseKPuzzle };
