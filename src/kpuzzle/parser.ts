import {KPuzzleDefinition} from "./spec";
// import {parse as jison_parse} from "./jison_parser"; // TODO

function jison_parse(s: string): any {return null; } // TODO

function FixMoves(def: KPuzzleDefinition) {
   for (const moveName in def.moves) {
      const move = def.moves[moveName] ;
      for (const orbitName in def.orbits) {
         const moveOrbit = move[orbitName] ;
         const oldOrientation = moveOrbit.orientation ;
         const perm = moveOrbit.permutation ;
         const newOrientation = new Array(oldOrientation.length) ;
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
