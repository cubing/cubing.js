import {parse as pegParse} from "./parser-source/parser-source"; // TODO
import {KPuzzleDefinition} from "./spec";

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
  return FixMoves(pegParse(s) as KPuzzleDefinition);
}
