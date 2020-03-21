import { KPuzzleDefinition } from "../definition_types";

// TODO: Figure out how to import SVGs directly, in a way that works with all our build systems.
import svgJSON from "./svg/index.json";

import cube222JSON from "./2x2x2.kpuzzle.json";
export const Cube222: KPuzzleDefinition = cube222JSON;
Cube222.svg = svgJSON["2x2x2.kpuzzle.svg"];

import cube333JSON from "./3x3x3.kpuzzle.json";
export const Cube333: KPuzzleDefinition = cube333JSON;
Cube333.svg = svgJSON["3x3x3.kpuzzle.svg"];

import PyraminxJSON from "./pyraminx.kpuzzle.json";
export const Pyraminx: KPuzzleDefinition = PyraminxJSON;
Pyraminx.svg = svgJSON["pyraminx.kpuzzle.svg"];

import square1JSON from "./sq1-hyperorbit.kpuzzle.json";
export const Square1: KPuzzleDefinition = square1JSON;
Square1.svg = svgJSON["sq1-hyperorbit.kpuzzle.svg"];

import clockJSON from "./clock.kpuzzle.json";
export const Clock: KPuzzleDefinition = clockJSON;
Clock.svg = svgJSON["clock.kpuzzle.svg"];
