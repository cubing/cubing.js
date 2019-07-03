// module.exports = require("parser-source.pegjs")

export function parse(s) {
  return {type: "sequence", nestedUnits: [{type: "blockMove", family: "R", amount: 1}], amount: 1};
}
