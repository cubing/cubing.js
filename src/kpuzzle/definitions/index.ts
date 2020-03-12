import { readFileSync } from "fs";
import { KPuzzleDefinition } from "../definition_types";

// Parcel will automatically inline file data from `readFileSync`:
//
//     https://parceljs.org/javascript.html
//     If you want to inline a file into the JavaScript bundle instead of
//     reference it by URL, you can use the Node.js `fs.readFileSync` API to do
//     that. The URL must be statically analyzable, meaning it cannot have any
//     variables in it (other than `__dirname` and `__filename`).
//
// This doesn't work for `rollup`. We're currently using `rollup.config.js` to
// copy the SVG files to the `cjs` output directory for now.

import cube222JSON from "./2x2x2.kpuzzle.json";
export const Cube222: KPuzzleDefinition = cube222JSON;
Cube222.svg = readFileSync(__dirname + "/svg/2x2x2.kpuzzle.svg", "utf-8");

import cube333JSON from "./3x3x3.kpuzzle.json";
export const Cube333: KPuzzleDefinition = cube333JSON;
Cube333.svg = readFileSync(__dirname + "/svg/3x3x3.kpuzzle.svg", "utf-8");

import PyraminxJSON from "./pyraminx.kpuzzle.json";
export const Pyraminx: KPuzzleDefinition = PyraminxJSON;
Pyraminx.svg = readFileSync(__dirname + "/svg/pyraminx.kpuzzle.svg", "utf-8");

import square1JSON from "./sq1-hyperorbit.kpuzzle.json";
export const Square1: KPuzzleDefinition = square1JSON;
Square1.svg = readFileSync(__dirname + "/svg/sq1-hyperorbit.kpuzzle.svg", "utf-8");
