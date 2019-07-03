start = SEQUENCE

NOTHING = ""
WHITESPACE = characters:[ ]+ { return characters.join(""); }
NEWLINE = [\n\r]

NUMBER = characters:[0-9]+ { return characters.join(""); }
DASH = "-"

LONG_FAMILY = characters:[_A-Za-z]+ { return characters.join(""); }

PRIME = "'"
PAUSE = "."

COMMENT_SHORT_START = "//"
COMMENT_SHORT_BODY = characters:[^\n\r]* { return characters.join(""); }
// TODO: Split into start, comment, end
COMMENT_LONG_START = "/\*"
COMMENT_LONG_BODY = characters:[^\*]* { return characters.join(""); }
COMMENT_LONG_END = "\*/"
OPEN_BRACKET = "["
CLOSE_BRACKET = "]"
OPEN_PARENTHESIS = "("
CLOSE_PARENTHESIS = ")"
COMMA = ","
COLON = ":"

LAYER
  = number:NUMBER { return parseInt(number); }

REPETITION
  = number:NUMBER { return parseInt(number); }

AMOUNT
  = REPETITION
  / repetition:REPETITION PRIME { return -repetition; }
  / PRIME { return -1; }

COMMENT
  = COMMENT_SHORT_START comment_short_body:COMMENT_SHORT_BODY { return {type: "commentShort", comment: comment_short_body}; }
  / COMMENT_LONG_START comment_long_body:COMMENT_LONG_BODY COMMENT_LONG_END { return {type: "commentLong", comment: comment_long_body}; }

FAMILY
  = long_family:LONG_FAMILY { return long_family; }

BLOCK_MOVE
  = family:FAMILY { return {type: "blockMove", family: family}; }
  / innerLayer:LAYER family:FAMILY { return {type: "blockMove", family: family, innerLayer: innerLayer}; }
  / innerLayer:LAYER DASH outerLayer:LAYER family:FAMILY { return {type: "blockMove", family: family, outerLayer: outerLayer, innerLayer: innerLayer}; }

// TODO
// TIMESTAMP

OPTIONAL_WHITESPACE
    = WHITESPACE OPTIONAL_WHITESPACE
    / NOTHING

REPEATABLE_UNIT
  = BLOCK_MOVE
  / OPEN_BRACKET a:SEQUENCE COMMA b:SEQUENCE CLOSE_BRACKET { return {"type": "commutator", "A": a, "B": b}; }
  / OPEN_BRACKET a:SEQUENCE COLON b:SEQUENCE CLOSE_BRACKET { return {"type": "conjugate", "A": a, "B": b}; }
  / OPEN_PARENTHESIS nestedSequence:SEQUENCE CLOSE_PARENTHESIS { return {"type": "group", "nestedSequence": nestedSequence}; }

REPEATED_UNIT
  = repeatable_unit:REPEATABLE_UNIT amount:AMOUNT { repeatable_unit.amount = amount; return repeatable_unit; }
  / repeatable_unit:REPEATABLE_UNIT { repeatable_unit.amount = 1; return repeatable_unit; }

ANNOTATION
  = NEWLINE { return {"type": "newLine"}; }
  / PAUSE { return {"type": "pause"}; }
  / COMMENT

UNIT_LIST_WITHOUT_WHITESPACE
  = repeated_unit:REPEATED_UNIT unit_list_without_whitespace:UNIT_LIST_WITHOUT_WHITESPACE { return [repeated_unit].concat(unit_list_without_whitespace); }
  / annotation:ANNOTATION unit_list_without_whitespace:UNIT_LIST_WITHOUT_WHITESPACE { return [annotation].concat(unit_list_without_whitespace); }
  / repeated_unit:REPEATED_UNIT { return [repeated_unit]; }
  / annotation:ANNOTATION { return [annotation]; }

UNIT_LIST
    = unit_list_without_whitespace:UNIT_LIST_WITHOUT_WHITESPACE WHITESPACE unit_list:UNIT_LIST { return unit_list_without_whitespace.concat(unit_list); }
    / UNIT_LIST_WITHOUT_WHITESPACE

SEQUENCE
    = OPTIONAL_WHITESPACE unit_list:UNIT_LIST OPTIONAL_WHITESPACE { return {"type": "sequence", "nestedUnits": unit_list}; }
    / OPTIONAL_WHITESPACE { return {"type": "sequence", "nestedUnits": []}; }

