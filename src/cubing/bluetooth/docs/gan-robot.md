# Gan Robot (v1)

| Characteristic | Purpose              |
| -------------- | -------------------- |
| `0xFFF1`       | (SpecialInstr)       |
| `0xFFF2`       | Status               |
| `0xFFF3`       | Write or read moves  |
| `0xFFF4`       | (Characteristic 4)   |
| `0xFFF5`       | (Disrupt formula2)   |
| `0xFFF6`       | (Reduction formula1) |
| `0xFFF7`       | (Reduction formula2) |
| `0xFFF8`       | (Device Name Config) |

# `0xFFF2`: Status

Descriptor: `RobotStatus`

`0xFFF2` includes the following:

| Section              | Sample Bytes | Notes                                          |
| -------------------- | ------------ | ---------------------------------------------- |
| # of moves remaining | `02`         | Sample means: 2 moves remaining from the queue |

# `0xFFF3`: Write or read moves

Descriptor: `RobotStatus`

`0xFFF3` includes the following:

| Section | Sample Bytes | Notes                  |
| ------- | ------------ | ---------------------- |
| Moves   | `31 6F`      | Sample means: `F R2 D` |

- Characteristic write: queue moves
- Characteristic read: returns the last moves queued (padded to 18 bytes)

Each move is one nibble (4 bits). With the power cable plugged in at BR, the meanings are:

| Nibble | Meaning |
| ------ | ------- |
| `0x0`  | `R`     |
| `0x1`  | `R2`    |
| `0x2`  | `R'`    |
| `0x3`  | `F`     |
| `0x4`  | `F2`    |
| `0x5`  | `F'`    |
| `0x6`  | `D`     |
| `0x7`  | `D2`    |
| `0x8`  | `D'`    |
| `0x9`  | `L`     |
| `0xA`  | `L2`    |
| `0xB`  | `L'`    |
| `0xC`  | `B`     |
| `0xD`  | `B2`    |
| `0xE`  | `B'`    |
| `0xF`  | no move |

`0xF` is used to pad the final byte if there are an odd number of moves (like in the sample).

The robot will execute moves from the queue in order (no simultaneous moves, even when possible). If you write to this characteristic before the queue is finished, the new value will be ignored. The status characteristic can be used to determine when the queue is empty again.
