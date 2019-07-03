
start = top_level_alg

top_level_alg
    = family

family
    = family:[A-Z]+ { return {type: "sequence", nestedUnits: [{type: "blockMove", family: "R", amount: 1}], amount: 1}; }
