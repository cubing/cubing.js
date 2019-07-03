import {KPuzzleDefinition} from "./spec";
// import {parse as jison_parse} from "./jison_parser"; // TODO

function jison_parse(s: string): any {return null; } // TODO

function FixMoves(def: KPuzzleDefinition) {
   for (let moveName in def.moves) {
      let move = def.moves[moveName] ;
      for (let orbitName in def.orbits) {
         let moveOrbit = move[orbitName] ;
         let oldOrientation = moveOrbit.orientation ;
         let perm = moveOrbit.permutation ;
         let newOrientation = new Array(oldOrientation.length) ;
         for (let i = 0; i < perm.length; i++) {
            newOrientation[i] = oldOrientation[perm[i]] ;
         }
         moveOrbit.orientation = newOrientation ;
      }
   }
   return def ;
}

export function parse(s: string): KPuzzleDefinition {
  return FixMoves(jison_parse(s) as KPuzzleDefinition);
}
