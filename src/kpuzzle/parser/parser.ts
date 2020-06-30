import { KPuzzleDefinition } from "../definition_types";
import { parse as importedParse } from "./parser-shim";

const parse: (s: string) => KPuzzleDefinition = importedParse;

export { parse };
