/* tslint:disable no-bitwise */

import { type AlgLeaf, Move } from "../../alg";
import { KPattern, type KPuzzle } from "../../kpuzzle";
import { puzzles } from "../../puzzles";
import {
  importKey,
  unsafeDecryptBlock,
  unsafeEncryptBlock,
} from "../../vendor/public-domain/unsafe-raw-aes/unsafe-raw-aes";
import {
  type BluetoothConfig,
  BluetoothPuzzle,
  type ConnectionArguments,
} from "./bluetooth-puzzle";
import { getPatternData } from "./common";

const UUIDs = {
  qiyiMainService: 0xfff0,
  qiyiMainCharacteristic: 0xfff6,
};

const qiyiMoveToBlockMove: { [i: number]: Move } = {
  1: new Move("L", -1),
  2: new Move("L"),
  3: new Move("R", -1),
  4: new Move("R"),
  5: new Move("D", -1),
  6: new Move("D"),
  7: new Move("U", -1),
  8: new Move("U"),
  9: new Move("F", -1),
  10: new Move("F"),
  11: new Move("B", -1),
  12: new Move("B"),
};

const faceOrder = "LRDUFB";

//           ┌──┬──┬──┐
//           │00│01│02│
//           ├──┼──┼──┤
//           │03│04│05│
//           ├──┼──┼──┤
//           │06│07│08│
//           └──┴──┴──┘
// ┌──┬──┬──┐┌──┬──┬──┐┌──┬──┬──┐┌──┬──┬──┐
// │36│37│38││18│19│20││09│10│11││45│46│47│
// ├──┼──┼──┤├──┼──┼──┤├──┼──┼──┤├──┼──┼──┤
// │39│40│41││21│22│23││12│13│14││48│49│50│
// ├──┼──┼──┤├──┼──┼──┤├──┼──┼──┤├──┼──┼──┤
// │42│43│44││24│25│26││15│16│17││51│52│53│
// └──┴──┴──┘└──┴──┴──┘└──┴──┴──┘└──┴──┴──┘
//           ┌──┬──┬──┐
//           │27│28│29│
//           ├──┼──┼──┤
//           │30│31│32│
//           ├──┼──┼──┤
//           │33│34│35│
//           └──┴──┴──┘

const qiyiCornerMappings: number[][] = [
  [8, 20, 9], // UFR,
  [2, 11, 45], // URB,
  [0, 47, 36], // UBL,
  [6, 38, 18], // ULF,
  [29, 15, 26], // DRF,
  [27, 24, 44], // DFL,
  [33, 42, 53], // DLB,
  [35, 51, 17], // DBR,
];

const qiyiEdgeMappings: number[][] = [
  [7, 19], // UF,
  [5, 10], // UR,
  [1, 46], // UB,
  [3, 37], // UL,
  [28, 25], // DF,
  [32, 16], // DR,
  [34, 52], // DB,
  [30, 43], // DL,
  [23, 12], // FR,
  [21, 41], // FL,
  [48, 14], // BR,
  [50, 39], // BL,
];

/**
 * Generates the checksum of the data using the CRC-16 MODBUS algorithm
 * @param data The array of data to generate the checksum for
 * @param length The length of the data, excluding any 0 padding
 */
function generateChecksum(data: number[]) {
  const TABLE = new Uint16Array([
    0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601,
    0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0,
    0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81,
    0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941,
    0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01,
    0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0,
    0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081,
    0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240,
    0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00,
    0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0,
    0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981,
    0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41,
    0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700,
    0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0,
    0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281,
    0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441,
    0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01,
    0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1,
    0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80,
    0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541,
    0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101,
    0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0,
    0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481,
    0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40,
    0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801,
    0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1,
    0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581,
    0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341,
    0x4100, 0x81c1, 0x8081, 0x4040,
  ]);

  let crc = 0xffff;
  for (const dataPoint of data) {
    const xor = (dataPoint ^ crc) & 0xff;
    crc >>= 8;
    crc ^= TABLE[xor];
  }

  return crc;
}

/**
 * Prepares a message to be sent from the app to the cube by adding a checksum,
 * padding the message, and encrypting it with AES-ECB.
 * @param message the message to be sent to the cube, without the checksum
 * @param aesKey AES-ECB encryption key
 * @returns prepared message (including checksum, padding, and encryption)
 */
async function prepareMessage(
  message: number[],
  aesKey: CryptoKey,
): Promise<Uint8Array<ArrayBuffer>> {
  // TODO: this directly inside the `ArrayBugger.`
  const messageCopyForChecksum = structuredClone(message);
  const checksum = generateChecksum(messageCopyForChecksum);
  messageCopyForChecksum.push(checksum & 0xff);
  messageCopyForChecksum.push(checksum >> 8);

  const paddedLength = Math.ceil(messageCopyForChecksum.length / 16) * 16;
  const paddedArray = new Uint8Array([
    ...messageCopyForChecksum,
    ...Array(paddedLength - messageCopyForChecksum.length).fill(0),
  ]);

  const encryptedMessage = new Uint8Array(paddedLength);
  for (let i = 0; i < paddedArray.length / 16; i++) {
    const encryptedBlock = new Uint8Array(
      await unsafeEncryptBlock(aesKey, paddedArray.slice(i * 16, (i + 1) * 16)),
    );
    encryptedMessage.set(encryptedBlock, i * 16);
  }
  return encryptedMessage;
}

/**
 * Decrypts a message sent by the cube, using AES-EBC
 * @param encryptedMessage the encryped message sent by the cube
 * @param aesKey AES-EBC encryption key
 * @returns decrypted message
 */
async function decryptMessage(
  encryptedMessage: Uint8Array,
  aesKey: CryptoKey,
): Promise<Uint8Array<ArrayBuffer>> {
  const decryptedMessage = new Uint8Array(encryptedMessage.length);
  for (let i = 0; i < encryptedMessage.length / 16; i++) {
    const decryptedBlock = new Uint8Array(
      await unsafeDecryptBlock(
        aesKey,
        encryptedMessage.slice(i * 16, (i + 1) * 16),
      ),
    );
    decryptedMessage.set(decryptedBlock, i * 16);
  }
  return decryptedMessage;
}

/**
 * Guess the MAC address of the cube, based on its name.
 *
 * A QiYi smart cube device with the name 'QY-QYSC-S-A94B' has a MAC address of CC:A3:00:00:A9:4B.
 * @param device
 * @returns array of 8-bit integers equal to the MAC address in order
 */
function getMacAddress(device: BluetoothDevice): number[] | undefined {
  if (device.name === undefined) {
    return;
  }

  return [
    0xcc,
    0xa3,
    0x00,
    0x00,
    parseInt(device.name.slice(10, 12), 16),
    parseInt(device.name.slice(12, 14), 16),
  ];
}

/**
 * Maximum amount of timestamps stored, to limit memory usage, while
 * avoiding performing duplicate moves on the cube. 12 was chosen because
 * there are 55 bytes for previous moves (each one is five bytes), plus
 * one move, stored as the latest one.
 */
const MAX_TIMESTAMP_COUNT = 12;
const TIMESTAMP_SCALE = 1.6;

const CUBE_HELLO = 0x02;
const STATE_CHANGE = 0x03;
/** @category Smart Puzzles */
export class QiyiCube extends BluetoothPuzzle {
  private latestTimestamp: number | undefined;
  private allTimeStamps: Set<number>; // Without this set, moves are constantly duplicated
  private allTimeStampsQueue: number[];
  private stickers: number[] = [
    3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5,
    5, 5, 5, 5,
  ];
  private batteryLevel: number = 100;

  public static async connect({
    server,
  }: ConnectionArguments): Promise<BluetoothPuzzle> {
    const aesKey = await importKey(
      new Uint8Array([
        87, 177, 249, 171, 205, 90, 232, 167, 156, 185, 140, 231, 87, 140, 81,
        8,
      ]),
    );
    return new QiyiCube(await puzzles["3x3x3"].kpuzzle(), aesKey, server);
  }

  public constructor(
    private kpuzzle: KPuzzle,
    private aesKey: CryptoKey,
    private server: BluetoothRemoteGATTServer,
  ) {
    super();
    this.startNotifications().then(this.sendAppHello.bind(this));
    this.allTimeStamps = new Set();
    this.allTimeStampsQueue = [];
  }

  public async sendAppHello() {
    const mainService = await this.server.getPrimaryService(
      UUIDs.qiyiMainService,
    );
    const mainCharacteristic = await mainService.getCharacteristic(
      UUIDs.qiyiMainCharacteristic,
    );

    // Values of `0x00` and `0x01` have been observed for the 4th byte of the
    // MAC in the wild. We send some larger values for future-proofing, as the
    // QiYi cube doesn't seem to mind.
    for (let macGuessCounter = 0; macGuessCounter < 8; macGuessCounter++) {
      const mac = getMacAddress(this.server.device)!;
      mac[3] = macGuessCounter;
      const reversedMac = mac.reverse();

      const appHello = [
        0xfe,
        0x15,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        ...reversedMac,
      ];

      const appHelloMessage = await prepareMessage(appHello, this.aesKey);
      await mainCharacteristic.writeValue(appHelloMessage);
    }
  }

  public async startNotifications() {
    const mainService = await this.server.getPrimaryService(
      UUIDs.qiyiMainService,
    );
    const mainCharacteristic = await mainService.getCharacteristic(
      UUIDs.qiyiMainCharacteristic,
    );

    mainCharacteristic.addEventListener(
      "characteristicvaluechanged",
      this.cubeMessageHandler.bind(this),
    );
    await mainCharacteristic.startNotifications();
  }

  public async cubeMessageHandler(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const decryptedMessage = await decryptMessage(
      new Uint8Array(characteristic.value!.buffer),
      this.aesKey,
    );

    const opCode = decryptedMessage[2];
    let needsAck = false;
    switch (opCode) {
      case CUBE_HELLO: {
        const initialState = decryptedMessage.slice(7, 34);
        this.updateState(initialState);
        this.batteryLevel = decryptedMessage[35];
        needsAck = true;
        break;
      }

      case STATE_CHANGE: {
        const state = decryptedMessage.slice(7, 34);
        this.updateState(state);

        const latestMove = qiyiMoveToBlockMove[decryptedMessage[34]];
        const latestTimestamp = new DataView(
          decryptedMessage.slice(3, 7).buffer,
        ).getInt32(0);

        const moves = [[latestMove, latestTimestamp]];

        const previousMoves = new DataView(
          decryptedMessage.slice(36, 91).buffer,
        );
        for (
          let i = previousMoves.byteLength - 1;
          i > 0 && previousMoves.getUint8(i) !== 255;
          i -= 5
        ) {
          const move = qiyiMoveToBlockMove[previousMoves.getUint8(i)];
          const timestamp = previousMoves.getUint32(i - 4);

          if (
            this.latestTimestamp === undefined ||
            timestamp <= this.latestTimestamp
          ) {
            continue;
          }

          moves.push([move, timestamp]);
        }

        moves.sort((a, b) => (a[1] as number) - (b[1] as number));

        for (const move of moves) {
          const latestAlgLeaf = move[0] as AlgLeaf;
          const timeStamp = Math.round((move[1] as number) / TIMESTAMP_SCALE);
          if (!this.allTimeStamps.has(timeStamp)) {
            this.dispatchAlgLeaf({
              latestAlgLeaf,
              timeStamp,
            });
            this.allTimeStamps.add(timeStamp);
            this.allTimeStampsQueue.push(timeStamp);
            if (this.allTimeStampsQueue.length > MAX_TIMESTAMP_COUNT) {
              this.allTimeStamps.delete(this.allTimeStampsQueue.shift()!);
            }
          }
        }

        this.latestTimestamp = latestTimestamp;

        needsAck = decryptedMessage[91] === 1;
        break;
      }

      default:
        console.error(`Opcode not implemented: ${opCode}`);
        break;
    }

    if (needsAck) {
      await characteristic.writeValue(
        await prepareMessage(
          [0xfe, 0x09, ...decryptedMessage.slice(2, 7)],
          this.aesKey,
        ),
      );
    }
  }

  private updateState(state: Uint8Array) {
    this.stickers = Array.from(state).flatMap((twoPieces) => [
      twoPieces & 0xf,
      twoPieces >> 4,
    ]);
  }

  public override name(): string | undefined {
    return this.server.device.name;
  }

  public override disconnect(): void {
    this.server.disconnect();
  }

  public override async getPattern(): Promise<KPattern> {
    return new KPattern(
      this.kpuzzle,
      getPatternData(
        this.stickers,
        faceOrder,
        qiyiEdgeMappings,
        qiyiCornerMappings,
      ),
    );
  }

  public getBattery(): number {
    return this.batteryLevel;
  }
}

export const qiyiConfig: BluetoothConfig<BluetoothPuzzle> = {
  connect: QiyiCube.connect.bind(QiyiCube),
  prefixes: ["QY-QYSC"],
  filters: [
    {
      namePrefix: "QY-QYSC",
    },
  ],
  optionalServices: [UUIDs.qiyiMainService],
};
