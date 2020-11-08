# Gan 356i state

# `0000fff5-0000-1000-8000-00805f9b34fb`

Descriptor: `Angle and Battery`

0xfff5 includes the following:

| Section          | Sample Bytes        | Notes                                                                  |
| ---------------- | ------------------- | ---------------------------------------------------------------------- |
| Cube Orientation | `96 fe 05 fe 46 ce` |                                                                        |
| Face Alignment   | `00 00 00 fa 00 00` | Order: URFDLB<br>Range:<br>`00`-`06`: 0-45° CW<br>`fa`-`ff`: 0-45° CCW |
| Move Count       | `82`                | # of quarter turns, loops from 255 to 0                                |
| Last 6 moves     | `02 03 05 0f 11 09` | see below                                                              |

## Moves

| Code | Move |
| ---- | ---- |
| `00` | U    |
| `02` | U'   |
| `03` | R    |
| `05` | R'   |
| `06` | F    |
| `08` | F'   |
| `09` | D    |
| `0b` | D'   |
| `0c` | L    |
| `0e` | L'   |
| `0f` | B    |
| `11` | B'   |

## Gravity sensors/compass

Start with cube in standard ori, perform z:

- CW: `00`-`3f` (`2d` at 90°)
- CCW: `c0`-`ff` (`d3` at 90°)
- fourth octet stays near `00`/`ff`.

The fourth octet behaves similarly when you perform x

6th octet behaves similarly, but mirrored across F/B

The 5th octet dosn't fluctuate much when the cube is still, but the 1st and 3rd do. Guess: this is the second octet of info for each sensor.

Flat on table:
00 01 66 00 8b ca
2b 01 40 01 92 cb
09 01 52 00 26 c9
x from standard orientation:
c8 e7 a3 26 6f db
y:
21 ff 32 fe cb 3e
z:
16 28 29 16 e1 d8

# `0000fff7-0000-1000-8000-00805f9b34fb`

Descriptor: `Gyroscopic Data` (???)

## Center orientation

0xfff7 includes the following:

| Section            | Sample Bytes              | Notes                                  |
| ------------------ | ------------------------- | -------------------------------------- |
| Center Orientation | `00 0c 24 00 18 28`       | URFDLB, `00`- `2f`                     |
| -                  | `00`                      | Unknown                                |
| -                  | `64`                      | Battery (multiple of 10 from 0 to 100) |
| -                  | `de`                      | High jitter                            |
| -                  | `0f`                      | Unknown                                |
| Unused             | `00 00 00 00 00 00 00 00` |                                        |

≈30-40% battery:
0000000000000028c40e0000000000000000

Battery sometimes jumps?

## Center Orientation

Quarter marks are: `00`, `0c`, `18`, `24`.

B is offset so that `0x10` is solved (the final value is still mod `0x30`).

# `0000fff2-0000-1000-8000-00805f9b34fb`/`0000fff3-0000-1000-8000-00805f9b34fb`

`fff2` descriptor: `FaceletStatus 1`
`fff3` descriptor: `FaceletStatus 2`

Sample values:

- `fff2`: `0x91924a532210b62ca1cc4951384809642bdaf6`
- `fff3`: `0xf6051103110002090b030305050e0c0c0e0e0c`

## `fff2`

| Section    | Sample Bytes                                            | Notes                                   |
| ---------- | ------------------------------------------------------- | --------------------------------------- |
| Unknown    | `18 08 20 28 49 92 24 41 6d 92 db b6 49 82 a2 24 6d db` |
| Move Count | `52`                                                    | # of quarter turns, loops from 255 to 0 |

solved
18 08 20 28 49 92 24 41 6d 92 db b6 49 82 a2 24 6d db 52
UF/UB flip
18 00 20 00 49 92 24 55 6d 92 db b6 49 82 aa 24 6d db b6
UF/UR flip
10 08 30 00 49 92 24 55 6d 92 db b6 49 82 a2 24 6d db d8
UF/UL flip
08 08 20 00 49 92 24 55 6d 92 db b6 49 86 a2 24 6d db f0
superflip
00 00 30 00 59 aa 42 55 69 9a eb c2 55 86 aa 1c 5d 99 26
corners solved, edges scrambled
04 10 2c 00 59 da 02 45 61 a2 e3 c2 15 96 ae 2c 55 b5 98
edges solved, corners scrambled
18 2a 40 ec c9 12 a4 a1 8c 95 58 b6 48 02 a2 a0 ab da d6
solved
18 08 20 28 49 92 24 41 6d 92 db b6 49 82 a2 24 6d db 10

## `fff3`

| Section       | Sample Bytes                                            | Notes                       |
| ------------- | ------------------------------------------------------- | --------------------------- |
| Facelet       | `e5`                                                    | Last byte of facelet status |
| Last 18 moves | `03 00 03 00 03 00 03 00 03 00 03 00 03 00 03 02 05 00` | Last 18 moves               |

00 00 30 00 49 92 24 55 6d 92 db b6 49 86 aa 24 6d db da // H-perm
18 08 20 28 49 92 24 41 6d 92 db b6 49 82 a2 24 6d db b2 // UF/UR/UB/UL flip + H-perm
42 14 20 10 49 92 24 41 6d 92 db b6 49 82 a2 24 6d db 9e // UF/UR/UB/UL flip
00 00 24 10 49 92 44 41 6d 92 db b6 45 92 b6 24 6d db 56 // UF/LF flip
40 00 24 10 49 92 24 41 6d 92 db b6 49 82 b6 24 6d db 44 // UF/UL flip
00 14 24 10 49 92 24 41 6d 92 db b6 49 92 a2 24 6d db 30 // UF/UB flip
02 00 20 10 49 92 24 41 6d 92 db b6 49 92 b6 24 6d db 02 // UF/UR flip
00 60 24 00 a1 92 24 49 6d 64 1b ba 19 b2 b6 52 6c 57 ca // ULB sticker is yellow
00 a0 24 00 c9 92 24 49 76 62 1b 37 48 92 b5 12 6d d7 ea // ULB sticcker is blue
00 80 24 00 68 93 24 49 6d 89 6d b6 28 72 b6 a4 23 d7 af // ULB sticker is orange
00 20 24 00 d2 92 24 49 76 a4 1b b7 58 b2 b5 24 4d d6 a9 // ULB sticker is green
00 20 24 00 d2 92 24 49 76 a4 1b b7 58 b2 b5 24 4d d6 a9 // ULB sticker is red
92 24 49 49 92 24 00 00 92 00 24 49 db b6 6d 6d db b6 10 // centers: U -> R -> F
24 49 00 92 00 00 92 24 b6 49 6d db b6 6d 92 db 24 49 08 // centers: U -> F -> R
00 00 30 00 49 92 24 89 6d 92 db b6 c9 46 b6 24 6d 5b b1 // mirror T-perm
00 00 a5 00 49 12 a4 88 6d 92 db b6 c9 52 36 24 6d 5b 92 // E-perm
00 00 b1 00 49 12 a4 48 6d 92 db b6 49 86 36 24 6d db 73 // T-perm
01 00 44 01 49 92 24 08 6d 92 db b6 49 91 b6 24 6d db 44 // URF CCW, UFL CW
00 a0 44 01 49 92 24 48 6d 92 db b6 49 12 b6 24 6d 5b 2c // URF CCW, ULB CW
80 00 46 01 49 92 24 48 6d 92 db b6 49 92 16 24 6d db 1c // URF CCW, UBR CW
00 00 04 82 49 92 a4 88 6d 92 db b6 49 90 b6 24 6d db ea // URF CW, UFR CCW
00 80 04 02 49 92 a4 48 6d 92 db b6 49 b2 b4 24 6d 5b da // URF CW, ULB CCW
80 02 04 02 49 12 a4 48 6d 92 db b6 49 92 36 24 6d db c6 // URF CW, UBR CCW
42 14 20 10 59 aa 42 41 69 9a eb c2 55 82 a2 1c 5d 99 92 // superflip
00 00 24 00 6d 93 24 49 6d 49 db b6 48 92 b6 92 24 db 6d // D'
00 00 24 00 24 93 25 49 6d 6d db b6 48 92 b6 49 92 da 6c // D2
00 00 24 00 92 92 25 49 6d 24 db b6 49 92 b6 6d 49 da 6b // D
00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db 6a // solved
00 00 49 00 49 12 24 92 6d 92 db b6 c9 b6 24 24 6d db 61 // U'
00 00 92 00 49 12 a4 b6 6d 92 db b6 c9 24 49 24 6d 5b 62 // U2
00 00 b6 00 49 92 a4 24 6d 92 db b6 49 49 92 24 6d 5b 5f // U
00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db 5e // solved

00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db 5e // solved
00 00 b1 00 49 12 a4 48 6d 92 db b6 49 86 36 24 6d db 73 // T-perm
** \* \* \* ** \*

00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db 5e // solved
00 00 28 00 49 92 24 51 6d 92 db b6 49 86 b6 24 6d db 06 // UL -> UF -> UR \* \*\* \*\*

00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db 5e // solved
00 00 30 00 49 92 24 45 6d 92 db b6 49 8a b6 24 6d db fa // UR -> UF -> UL
** \* **

04 00 a1 08 49 12 a4 40 6d 92 db b6 49 92 36 24 6d db URF/UBR UR/FU
06 00 b5 00 49 12 a4 48 6d 92 c3 b6 49 92 36 24 4d db URF/UBR UR/DB
06 00 a5 00 49 12 a4 48 6d 92 db b0 49 92 36 24 6d db URF/UBR UR/DR
06 00 a9 00 49 12 a4 48 61 8a db b6 49 92 36 24 6d db URF/UBR UR/DF
06 00 b1 00 49 12 a4 48 6d 92 db 86 49 92 36 0c 6d db URF/UBR UR/DL
0a 00 b1 00 49 12 a4 48 6d 92 db b6 19 92 36 24 6d d1 URF/UBR UR/BL
0a 00 a5 00 49 12 a4 48 6d 92 db b6 49 92 36 24 6d 8b URF/UBR UR/BR
04 00 a5 00 49 12 a0 48 6d 92 db b6 49 92 36 24 6d db URF/UBR UR/FR
04 00 b1 00 49 12 84 48 6d 92 db b6 43 92 36 24 6d db URF/UBR UR/FL
00 00 b5 00 49 12 a4 48 6d 92 db b6 49 92 26 24 6d db URF/UBR UR/UB
0a 04 a1 00 49 12 a4 48 6d 92 db b6 49 92 22 24 6d db URF/UBR UR/BU

00 00 b1 00 49 12 a4 48 6d 92 db b6 49 86 36 24 6d db URF/UBR UR/UL
•• • • • •• •  
00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db solved

18 00 a1 00 49 12 a4 48 6d 92 db b6 49 82 36 24 6d db URF/UBR UR/LU

04 00 a1 08 49 12 a4 40 6d 92 db b6 49 92 36 24 6d db URF/UBR UR/FU
• • • •  
00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db solved
•• • • • •  
00 00 a9 00 49 12 a4 44 6d 92 db b6 49 92 36 24 6d db URF/UBR UR/UF

function f(a, b) {
out = "";
for (var i = 0; i < a.length; i++) {
out = out + ( (a[i] == b[i]) ? " " : "•");
}
return out;}

    00 00 24 18 49 92 24 49 61 aa db b6 49 92 aa 24 6d db -- // DF UB UF
             ••              • ••             ••
    00 08 24 10 49 92 24 4d 61 aa db b6 49 92 a2 24 6d db -- // DF UB FU
        •    •            •  • ••             ••
    30 00 24 00 49 92 24 49 61 aa db b6 49 8a b2 24 6d db -- // DF UB UL
    •                        • ••          ••  •
    20 10 24 00 49 92 24 49 61 aa db b6 49 8e a2 24 6d db -- // DF UB LU
    •  •                     • ••          •• ••
    06 00 28 00 49 92 24 49 61 aa db b6 49 92 a6 24 6d db -- // DF UB UR
     •     •                 • ••             •
    04 04 2c 00 49 92 24 49 61 aa db b6 49 92 a2 24 6d db -- // DF UB RU
     •  •  •                 • ••             ••

    00 0c 24 00 51 92 24 49 61 aa db b6 49 92 a6 24 6d db -- // DF UB DR
        •       ••           • ••             •
    00 04 24 00 59 92 24 49 61 aa db b4 49 92 ae 24 6d db -- // DF UB RD
        •       •            • ••     •       ••
    00 0c 24 00 49 92 24 49 61 aa db b6 49 92 b6 24 55 db -- // DF UB DB
        •                    • ••                   ••
    00 14 24 00 49 92 24 49 61 aa d3 b6 49 92 ae 24 5d db -- // DF UB BD
       ••                    • ••  •          ••    •
    00 0c 24 00 49 92 24 49 61 aa db b6 49 92 b2 14 6d db -- // DF UB DL
        •                    • ••              • •
    00 10 24 00 49 92 24 49 61 aa db a6 49 92 ae 1c 6d db -- // DF UB LD
       •                     • ••    •        •• ••

    00 08 24 00 49 92 34 49 61 aa db b6 45 92 b2 24 6d db -- // DF UB FL
        •             •      • ••        •     •
    00 10 24 00 49 92 24 49 61 aa db b6 47 92 aa 24 6d db -- // DF UB LF
       •                     • ••        •    ••
    00 14 24 00 49 92 24 49 61 aa db b6 29 92 b2 24 6d d7 -- // DF UB BL
       ••                    • ••       •      •        •
    00 10 24 00 49 92 24 49 61 aa db b6 39 92 b6 24 6d d5 -- // DF UB LB
       •                     • ••       •               •
    00 14 24 00 49 94 24 49 61 aa db b6 49 92 a6 24 6d bb -- // DF UB BR
       ••           •        • ••             •        •
    00 04 24 00 49 96 24 49 61 aa db b6 49 92 b6 24 6d ab -- // DF UB RB
        •           •        • ••                      •
    00 08 24 00 49 a2 26 49 61 aa db b6 49 92 a6 24 6d db -- // DF UB FR
        •          •   •     • ••             •
    00 04 24 00 49 b2 24 49 61 aa db b6 49 92 aa 24 6d db -- // DF UB RF
        •          •         • ••             ••

    00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db -- // solved

    Edge Correlations:
    UL UB?--?--?      FL       FD?   LD          LD DB?
     UR BU?RU UF RD    FR FU    FD?      LF       DL DB?

    00 0c 44 00 49 92 24 2a 61 aa db b6 49 91 aa 24 6d db f9 // DF UB URF UFL
        • •              ••  • ••           • ••
    00 0c 84 00 49 92 a4 4a 61 aa db b6 49 32 a9 24 6d 5b ed // DF UB URF ULB
        • •           •   •  • ••          •  ••       •
    00 0c 44 03 89 92 a4 48 60 a9 db 36 49 92 aa 24 6d db d9 // DF UB URF DFR
        • •   • •     •   •  • ••    •        ••
    00 0c 84 03 49 92 24 49 01 aa db b6 49 92 aa 21 6d db c7 // DF UB URF DLF
        • •   •             •• ••             ••  •
    00 0c a4 03 49 92 24 4a 61 aa 1b b6 48 92 aa a4 69 db b3 // DF UB URF DBL
        • •   •           •  • •• •      •    •• •   •
    00 0c 24 03 49 92 a4 4a 61 aa d8 b6 49 92 aa 24 ad da 9f // DF UB URF DRB
        •     •       •   •  • ••  •          ••    •   •
    00 0d 24 05 49 92 24 48 61 aa db b6 49 92 0a 24 6d db 65 // DF UB URF BRU
        •     •           •  • ••             ••
    80 0c 04 01 49 12 a4 4a 61 aa db b6 49 92 4a 24 6d db 55 // DF UB URF RUB
    •   • •   •    •  •   •  • ••             ••
    00 0c a5 00 49 12 a4 48 61 aa db b6 49 92 2a 24 6d db 45 // DF UB URF UBR
        • ••       •  •   •  • ••             ••
    00 00 24 00 49 92 24 49 6d 92 db b6 49 92 b6 24 6d db 2a //

    Corner Correlations:


    UL UB?--?--?      FL       FD?   LD          LD DB?
     UR BU?RU UF RD    FR FU    FD?      LF       DL DB?

    Multiples of 0x12: 12, 24, 36, 48, 5a, 6c, 7f

Base 10:
000 000 036 000 073 146 036 073 109 146 219 182 073 146 182 036 109 219
Base 36:
10 21 42 10 21 31 42 63 52 31 42 52 10 31 63

Last digits:
0: 3+3
1: 5
2: 5
3: 2

First digits:

1: |||
2: ||
3: |||
4: |||
5: ||
6: ||

Base 6, solved:
0000 0000 0100 0000 0201 0402 0100 0201 0301 0402 1003 0502 0201 0402 0502 0100 0301 1003
H-perm:
0000 0000 0120 0000 0201 0402 0100 0221 0301 0402 1003 0502 0201 0342 0442 0100 0301 1003
• • •• ••  
UL UF UR
0000 0000 0104 0000 0201 0402 0100 0213 0301 0402 1003 0502 0201 0342 0502 0100 0301 1003
• •• ••  
UR UF UL
0000 0000 0120 0000 0201 0402 0100 0153 0301 0402 1003 0502 0201 0350 0502 0100 0301 1003
• ••• •••
