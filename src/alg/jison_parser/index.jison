
/* lexical grammar */
%lex
/*
%s timestamp
*/
%%

/*
"@"                               { this.begin("timestamp"); return 'AT' }
<timestamp>[0-9]+("."[0-9]+)?     return 'FLOAT'
<timestamp>"s"                    { this.popState(); return 'SECONDS' }
*/

[^\S\r\n]+             return "WHITESPACE"
[0-9]+                 return "NUMBER"
"-"                    return "DASH"

[_A-Za-z]+             return "LONG_FAMILY"


"'"                    return "PRIME"
"."                    return "PAUSE"


"//"[^\n\r]*           return "COMMENT_SHORT"
"/*"[^]*?"*/"          return "COMMENT_LONG"
[\n\r]                 return "NEWLINE"

"["                    return "OPEN_BRACKET"
"]"                    return "CLOSE_BRACKET"
"("                    return "OPEN_PARENTHESIS"
")"                    return "CLOSE_PARENTHESIS"
","                    return "COMMA"
":"                    return "COLON"

<<EOF>>                return "EOF"
.                      return "INVALID"

/lex

%% /* language grammar */

expressions
    : TOP_LEVEL_ALG EOF
        { return $TOP_LEVEL_ALG; }
    ;

LAYER
    : NUMBER
        {$$ = parseInt($NUMBER);}
    ;

REPETITION
    : NUMBER
        {$$ = parseInt($NUMBER);}
    ;

AMOUNT
    : REPETITION
    | REPETITION PRIME
        {$$ = -$REPETITION;}
    | PRIME
        {$$ = -1;}
    ;

COMMENT
    : COMMENT_SHORT
        {$$ = {type: "commentShort", comment: $COMMENT_SHORT.slice(2)};}
    | COMMENT_LONG
        {$$ = {type: "commentLong", comment: $COMMENT_LONG.slice(2, -2)};}
    ;

FAMILY
    : LONG_FAMILY
    ;

BLOCK_MOVE
    : FAMILY
        {$$ = {type: "blockMove", family: $1};}
    | LAYER FAMILY
        {$$ = {type: "blockMove", family: $2, innerLayer: $1};}
    | LAYER DASH LAYER FAMILY
        {$$ = {type: "blockMove", family: $4, outerLayer: $1, innerLayer: $3};}
    ;

/*
TIMESTAMP
    : AT FLOAT SECONDS
        {$$ = {type: "timestamp", time: parseFloat($2)};}
    ;
*/

OPTIONAL_WHITESPACE
    : WHITESPACE OPTIONAL_WHITESPACE
    | /* nothing */
    ;

REPEATABLE_UNIT
    : BLOCK_MOVE
    | OPEN_BRACKET SEQUENCE COMMA SEQUENCE CLOSE_BRACKET
        {$$ = {"type": "commutator", "A": $2, "B": $4};}
    | OPEN_BRACKET SEQUENCE COLON SEQUENCE CLOSE_BRACKET
        {$$ = {"type": "conjugate", "A": $2, "B": $4};}
    | OPEN_PARENTHESIS SEQUENCE CLOSE_PARENTHESIS
        {$$ = {"type": "group", "nestedSequence": $SEQUENCE};}
    ;

REPEATABLE_UNIT
    : BLOCK_MOVE
    | OPEN_BRACKET SEQUENCE COMMA SEQUENCE CLOSE_BRACKET
        {$$ = {"type": "commutator", "A": $2, "B": $4};}
    | OPEN_BRACKET SEQUENCE COLON SEQUENCE CLOSE_BRACKET
        {$$ = {"type": "conjugate", "A": $2, "B": $4};}
    | OPEN_PARENTHESIS SEQUENCE CLOSE_PARENTHESIS
        {$$ = {"type": "group", "nestedSequence": $SEQUENCE};}
    ;

REPEATED_UNIT
    : REPEATABLE_UNIT
        {$REPEATABLE_UNIT.amount = 1; $$ = $REPEATABLE_UNIT;}
    | REPEATABLE_UNIT AMOUNT
        {$REPEATABLE_UNIT.amount = $AMOUNT; $$ = $REPEATABLE_UNIT;}
    ;

ANNOTATION
    : NEWLINE
        {$$ = {"type": "newLine"};}
    | PAUSE
        {$$ = {"type": "pause"};}
    | COMMENT
    ;

UNIT_LIST_WITHOUT_WHITESPACE
    : REPEATED_UNIT
        {$$ = [$1];}
    | UNIT_LIST_WITHOUT_WHITESPACE ANNOTATION UNIT_LIST_WITHOUT_WHITESPACE
        {$$ = $1.concat([$2]).concat($3);}
    | ANNOTATION UNIT_LIST_WITHOUT_WHITESPACE
        {$$ = [$1].concat($2);}
    | UNIT_LIST_WITHOUT_WHITESPACE ANNOTATION
        {$$ = $1.concat([$2]);}
    | ANNOTATION
        {$$ = [$1];}
    ;

UNIT_LIST
    : UNIT_LIST_WITHOUT_WHITESPACE
        {$$ = $UNIT_LIST_WITHOUT_WHITESPACE;}
    | UNIT_LIST WHITESPACE UNIT_LIST_WITHOUT_WHITESPACE
        {$$ = $UNIT_LIST.concat($UNIT_LIST_WITHOUT_WHITESPACE);}
    ;

SEQUENCE
    : OPTIONAL_WHITESPACE UNIT_LIST OPTIONAL_WHITESPACE
        {$$ = {"type": "sequence", "nestedUnits": $UNIT_LIST};}
    | OPTIONAL_WHITESPACE
        {$$ = {"type": "sequence", "nestedUnits": []};}
    ;

TOP_LEVEL_ALG
    : SEQUENCE
        {$$ = $1;}
/*
    | OPTIONAL_WHITESPACE TIMESTAMP OPTIONAL_WHITESPACE
        {$$ = [$TIMESTAMP];}
*/
    ;
