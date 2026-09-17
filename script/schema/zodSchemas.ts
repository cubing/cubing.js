/**
 * This approach is a compromise.
 *
 * It is possible to define the types themselves using `zod` — in fact, it's
 * quite straightforward (https://github.com/cubing/cubing.js/pull/438) — and
 * the types are a correct drop-in replacement. However, this would have the
 * following effects:
 *
 * - Comments are no longer associated with fields in some cases, particularly
 *   in the generated and published type files. It's unclear if there is a
 *   simple and robust workaround.
 * - Although the types have the same shape and type-check the same, they are
 *   not compiled into simple `interface`s and `Record`s. It takes significant
 *   effort to wade through the indirection while using the types.
 * - This adds `zod` as yet another dependency. This is not *so* bad (and we may
 *   want to bring it in so that we can validate input to `TwistyProp` setters
 *   for more ergonomic errors), but it would be nice to avoid for now.
 *
 * Generating simplified TypeScript from `zod` is not super straightforward
 * (there are libraries that do this, but who knows how
 * safe/correct/long-lasting they are), and would probably still best be done by
 * vendoring the output. So instead we do something simple and about equally
 * robust: we leave the TypeScript definitions in `KPuzzleDefinitionJSON.ts` and
 * *also* maintain separate definitions here using `zod`, then use Zod's
 * [`toZod()`](https://zod.dev/api?id=matching-an-existing-type#matching-an-existing-type)
 * function to check/generate the schema in a way that also allows TypeScript to
 * check for an exact type match.
 *
 * This means that any change in a definition (including extra/missing fields) —
 * whether in this file or in `KPuzzleDefinitionJSON.ts` — will cause `make
 * lint-tsc` to fail. It also means that any change will have to be made
 * simultaneously in both places (which of course is the intended effect of this
 * approach).
 */

import {
  array,
  exactOptional,
  number,
  object,
  record,
  string,
  toZod,
} from "zod/mini";
import type {
  KPatternData,
  KPatternOrbitData,
  KPuzzleOrbitDefinition,
  KTransformationData,
  KTransformationOrbitData,
} from "../../src/cubing/kpuzzle";
import type { KPuzzleDefinitionJSON } from "../../src/cubing/kpuzzle/KPuzzleDefinitionJSON";

const ZodKPatternOrbitData = toZod<KPatternOrbitData>()(
  object({
    pieces: array(number()),
    orientation: array(number()),
    orientationMod: exactOptional(array(number())),
  }),
);

export const ZodKPatternData = toZod<KPatternData>()(
  record(string(), ZodKPatternOrbitData),
);

const ZodKTransformationOrbitData = toZod<KTransformationOrbitData>()(
  object({
    permutation: array(number()),
    orientationDelta: array(number()),
  }),
);
export const ZodKTransformationData = toZod<KTransformationData>()(
  record(string(), ZodKTransformationOrbitData),
);

const ZodKPuzzleOrbitDefinition = toZod<KPuzzleOrbitDefinition>()(
  object({
    orbitName: string(),
    numPieces: number(),
    numOrientations: number(),
  }),
);

export const ZodKPuzzleDefinitionJSON = toZod<KPuzzleDefinitionJSON>()(
  object({
    name: string(),
    orbits: array(ZodKPuzzleOrbitDefinition),
    defaultPattern: ZodKPatternData,
    moves: record(string(), record(string(), ZodKTransformationOrbitData)),
    derivedMoves: exactOptional(record(string(), string())),
  }),
);
