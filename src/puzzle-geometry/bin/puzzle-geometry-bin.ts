// To run this file directly: npx ts-node src/puzzle-geometry/bin/puzzle-geometry-bin.ts

import { PuzzleGeometry, SchreierSims } from "..";

//  Global epsilon; any difference less than this is ignored.
// const eps = 1e-9;

let dosvg = false;
let doss = false;
let doksolve = false;
let dogap = false;
let docanon = false;
let do3d = false;
if (typeof (process) !== "undefined" &&
   process.argv && process.argv.length >= 3) {
   let desc;
   const puzzleList = PuzzleGeometry.getpuzzles();
   let argp = 2;
   const optionlist = [];
   let showargs = true;
   while (argp < process.argv.length && process.argv[argp][0] === "-") {
      const option = process.argv[argp++];
      if (option === "--verbose" || option === "-v") {
         optionlist.push("verbose", true);
      } else if (option === "--quiet" || option === "-q") {
         optionlist.push("quiet", true);
         showargs = false;
      } else if (option === "--ksolve") {
         doksolve = true;
      } else if (option === "--svg") {
         showargs = false;
         optionlist.push("quiet", true);
         dosvg = true;
      } else if (option === "--gap") {
         dogap = true;
      } else if (option === "--ss") {
         doss = true;
      } else if (option === "--3d") {
         do3d = true;
      } else if (option === "--canon") {
         docanon = true;
      } else if (option === "--rotations") {
         optionlist.push("rotations", true);
      } else if (option === "--allmoves") {
         optionlist.push("allmoves", true);
      } else if (option === "--outerblockmoves") {
         optionlist.push("outerblockmoves", true);
      } else if (option === "--vertexmoves") {
         optionlist.push("vertexmoves", true);
      } else if (option === "--nocorners") {
         optionlist.push("cornersets", false);
      } else if (option === "--noedges") {
         optionlist.push("edgesets", false);
      } else if (option === "--noorientation") {
         optionlist.push("killorientation", true);
      } else if (option === "--nocenters") {
         optionlist.push("centersets", false);
      } else if (option === "--moves") {
         optionlist.push("movelist", process.argv[argp].split(","));
         argp++;
      } else if (option === "--optimize") {
         optionlist.push("optimize", true);
      } else if (option === "--scramble") {
         optionlist.push("scramble", 100);
      } else if (option === "--fixcorner") {
         optionlist.push("fix", "v");
      } else if (option === "--fixedge") {
         optionlist.push("fix", "e");
      } else if (option === "--fixcenter") {
         optionlist.push("fix", "f");
      } else if (option === "--orientcenters") {
         optionlist.push("orientcenters", true);
      } else {
         throw new Error("Bad option: " + option);
      }
   }
   for (let i = 0; i < puzzleList.length; i += 2) {
      if (puzzleList[i + 1] === process.argv[argp]) {
         desc = puzzleList[i];
         break;
      }
   }
   let createargs = [];
   if (showargs) {
      console.log("# " + process.argv.join(" "));
   }
   if (desc !== undefined) {
      createargs = PuzzleGeometry.parsedesc(desc);
      argp++;
   } else {
      const cuts = [];
      const cutarg = argp++;
      while (argp + 1 < process.argv.length && process.argv[argp].length === 1) {
         cuts.push([process.argv[argp], process.argv[argp + 1]]);
         argp += 2;
      }
      createargs = [process.argv[cutarg], cuts];
   }
   const pg = new PuzzleGeometry(createargs[0], createargs[1], optionlist);
   pg.allstickers();
   pg.genperms();
   // TODO: if (optionlist.indexOf("verbose") !== -1)
   // if (this.verbose) {
   //    console.log("# Stickers " + pg.stickersperface + " cubies " +
   //       pg.cubies.length + " orbits " + pg.orbits +
   //       " shortedge " + pg.shortedge);
   // }
   if (argp < process.argv.length) {
      throw new Error("Unprocessed content at end of command line");
   }
   if (dogap) {
      console.log(pg.writegap());
   } else if (doksolve) {
      console.log(pg.writeksolve()); // TODO: Update arguments
   } else if (dosvg) {
      console.log(pg.generatesvg()); // TODO: Update arguments
   } else if (do3d) {
      console.log(JSON.stringify(pg.get3d()));
   } else if (doss) {
      const os = pg.getOrbitsDef(false);
      const as = os.reassemblySize();
      console.log("Reassembly size is " + as);
      const ss = SchreierSims.schreiersims(os.moveops.map((_) => _.toPerm()),
         (_) => console.log(_));
      const r = as / ss;
      console.log("Ratio is " + r);
   } else if (docanon) {
      pg.showcanon((_) => console.log(_));
   }
}
