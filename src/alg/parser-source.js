import parser from "./parser-source.pegjs";
const {parse} = parser;
export {parse};

// const parse = import("./parser-source.pegjs").parse;

// export {parse};

// module.exports = {
//   parse: .parse
// } 

// export function parse(s) {
//   return {type: "sequence", nestedUnits: [{type: "blockMove", family: "R", amount: 1}], amount: 1};
// }
