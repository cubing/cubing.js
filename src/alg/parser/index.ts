import { Sequence } from "../algorithm";
import { fromJSON } from "../json";
import { validateSiGNAlg, Validator } from "../validation";
import { parse as pegParse } from "./parser";

export interface ParseOptions {
  validators?: Validator[];
}

// TODO: Include token location info.
// TODO: Take validators in a way that allows optimizing parsing.
export function parse(s: string, options: ParseOptions = { validators: [] }): Sequence {
  options.validators = options.validators || [];

  const algo = fromJSON(pegParse(s));
  for (const validate of options.validators) {
    validate(algo);
  }
  return algo;
}

export function parseSiGN(s: string): Sequence {
  return parse(s, { validators: [validateSiGNAlg] });
}
