
start = top_level_alg

top_level_alg
    = family

family
    = family:[A-Z]+ { return {type: "sequence", nestedUnits: [{type: "blockMove", family: "R", amount: 1}], amount: 1}; }

// WHITESPACE = [^\S\r\n]+
NUMBER = [0-9]+
DASH = "-"

LONG_FAMILY = [_A-Za-z]+


PRIME = "'"
PAUSE = "."


COMMENT_SHORT = "//"[^\n\r]*
COMMENT_LONG = "/\*[^\*]*\*/"
NEWLINE = [\n\r]

OPEN_BRACKET = "["
CLOSE_BRACKET = "]"
OPEN_PARENTHESIS = "("
CLOSE_PARENTHESIS = ")"
COMMA = ","
COLON = ":"
