
/* lexical grammar */
%lex
%s id
%%

"Name"                 { this.begin("id"); return "TOKEN_Name" }
"Set"                  return "TOKEN_Set"
"Move"                 { this.begin("id"); return "TOKEN_Move" }
"Solved"               return "TOKEN_Solved"
"End"                  return "TOKEN_End"
/* TODO: Split this up into smaller, more understandable parts. */
<id>(([1-9][0-9]*)(([1-9][0-9]*)*)?)*(([A-Za-z]+)|(\<[A-Za-z]+(_[A-Za-z]+)*\>)) { this.popState(); return "IDENTIFIER" }
[A-Za-z][A-Za-z0-9]*   return "SET_IDENTIFIER"
[0-9]+                 return "INTEGER"
"#"[^\r\n]*            /* ignore comment */
" "                    return "SPACE"
\r?[\n]                return "NEWLINE"
<<EOF>>                return "EOF"
.                      return "INVALID"

/lex

%% /* language grammar */

expressions
    : DEFINITION_FILE EOF
        { return $1; }
    ;

NAME_DEFINITION
    : TOKEN_Name SPACE IDENTIFIER
        {$$ = $IDENTIFIER;}
    ;

ORBIT_DEFINITION
    : TOKEN_Set SPACE SET_IDENTIFIER SPACE INTEGER SPACE INTEGER
        {$$ = [$SET_IDENTIFIER, {numPieces: parseInt($5), orientations: parseInt($7)}];}
    ;

ORBIT_DEFINITIONS
    : ORBIT_DEFINITION
        {$$ = {};               $$[$ORBIT_DEFINITION[0]] = $ORBIT_DEFINITION[1];}
    | ORBIT_DEFINITIONS INTERSTITIAL ORBIT_DEFINITION
        {$$ = $ORBIT_DEFINITIONS; $$[$ORBIT_DEFINITION[0]] = $ORBIT_DEFINITION[1];}
    ;

INTERSTITIAL
    : NEWLINE
    | INTERSTITIAL NEWLINE
    ;

OPTIONAL_NEWLINES
    :
    | INTERSTITIAL
    ;

NUMBERS
    : INTEGER
        {$$ = [parseInt($INTEGER)];}
    | NUMBERS SPACE INTEGER
        {$$ = $NUMBERS.concat([parseInt($INTEGER)]);}
    ;

PERMUTATION
    : NUMBERS
        {$$ = $NUMBERS.map(function(x) {return x - 1;});}
    ;

DEFINITION
    : SET_IDENTIFIER NEWLINE PERMUTATION NEWLINE
        {
            $$ = [$SET_IDENTIFIER, {permutation: $PERMUTATION, orientation: []}];
            for (var i = 0; i < $PERMUTATION.length; i++) {
                $$[1].orientation.push(0);
            }
        }
    | SET_IDENTIFIER NEWLINE PERMUTATION NEWLINE NUMBERS NEWLINE
        {$$ = [$SET_IDENTIFIER, {permutation: $PERMUTATION, orientation: $NUMBERS}];}
    ;

DEFINITIONS
    : DEFINITION
        {$$ = {};           $$[$DEFINITION[0]] = $DEFINITION[1];}
    | DEFINITIONS DEFINITION
        {$$ = $DEFINITIONS; $$[$DEFINITION[0]] = $DEFINITION[1];}
    ;

START_PIECES
    : TOKEN_Solved NEWLINE DEFINITIONS TOKEN_End
        {$$ = $DEFINITIONS}
    ;

MOVE
    : TOKEN_Move SPACE IDENTIFIER NEWLINE DEFINITIONS TOKEN_End
        {$$ = [$IDENTIFIER, $DEFINITIONS];}
    ;

MOVES
    : MOVE
        {$$ = {};     $$[$MOVE[0]] = $MOVE[1];}
    | MOVES INTERSTITIAL MOVE
        {$$ = $MOVES; $$[$MOVE[0]] = $MOVE[1];}
    ;

DEFINITION_FILE
    : NAME_DEFINITION INTERSTITIAL ORBIT_DEFINITIONS INTERSTITIAL START_PIECES INTERSTITIAL MOVES OPTIONAL_NEWLINES
        {$$ = {name: $NAME_DEFINITION, orbits: $ORBIT_DEFINITIONS, moves: $MOVES, startPieces: $START_PIECES};}
    ;
