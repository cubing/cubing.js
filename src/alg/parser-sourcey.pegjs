
start = top_level_alg

top_level_alg
    = family

family
    = family:[A-Z]+ { return {type: "blockMove", family: family}; }
