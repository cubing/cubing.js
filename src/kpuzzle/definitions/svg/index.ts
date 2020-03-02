import { readFileSync } from "fs";

// Parcel will automatically inline the data from this:
//
//     https://parceljs.org/javascript.html
//     If you want to inline a file into the JavaScript bundle instead of
//     reference it by URL, you can use the Node.js `fs.readFileSync` API to do
//     that. The URL must be statically analyzable, meaning it cannot have any
//     variables in it (other than `__dirname` and `__filename`).
export const sq1SVG = readFileSync(__dirname + "/sq1.svg", "utf-8");
