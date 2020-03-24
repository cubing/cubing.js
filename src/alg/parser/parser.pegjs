start = SEQUENCE

NUMBER = characters:[0-9]+ { return parseInt(characters.join(""), 10); }

AMOUNT = repetition:NUMBER "'" { return -repetition; }
       / NUMBER
       / "'" { return -1; }

FAMILY = characters:[_A-Za-z]+ { return characters.join(""); }
BLOCK_MOVE = family:FAMILY { return {type: "blockMove", family: family}; }
           / innerLayer:NUMBER family:FAMILY { return {type: "blockMove", family: family, innerLayer: innerLayer}; }
           / outerLayer:NUMBER "-" innerLayer:NUMBER family:FAMILY { return {type: "blockMove", family: family, outerLayer: outerLayer, innerLayer: innerLayer}; }

REPEATABLE_UNIT = BLOCK_MOVE
                // We parse commutators/conjugates together to reduce branching.
                / "[" a:SEQUENCE separator:[,:] b:SEQUENCE "]" { return {"type": separator === "," ? "commutator" : "conjugate", "A": a, "B": b}; }
                / "(" nestedSequence:SEQUENCE ")" { return {"type": "group", "nestedSequence": nestedSequence}; }

REPEATED_UNIT = repeatable_unit:REPEATABLE_UNIT amount:AMOUNT { repeatable_unit.amount = amount; return repeatable_unit; }
              / repeatable_unit:REPEATABLE_UNIT { repeatable_unit.amount = 1; return repeatable_unit; }

COMMENT = "//" body:[^\n\r]* { return {type: "comment", comment: body.join("")}; }

ANNOTATION = [\n\r] { return {"type": "newLine"}; }
           / "." { return {"type": "pause"}; }
           / COMMENT

SEGMENT_PART = REPEATED_UNIT
             / ANNOTATION

SEGMENT = segment_part:SEGMENT_PART segment:SEGMENT { return [segment_part].concat(segment); }
        / segment_part:SEGMENT_PART { return [segment_part]; }

UNIT_LIST = segment:SEGMENT [ ]+ unit_list:UNIT_LIST { return segment.concat(unit_list); }
          / SEGMENT

SEQUENCE = [ ]* unit_list:UNIT_LIST [ ]* { return {"type": "sequence", "nestedUnits": unit_list}; }
         / [ ]* { return {"type": "sequence", "nestedUnits": []}; }
