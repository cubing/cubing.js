import { debugLog } from "../debug";
import { KPuzzle, KState, type KStateData } from "../../kpuzzle";
import { type BluetoothConfig, BluetoothPuzzle } from "./bluetooth-puzzle";
import {
    importKey,
    unsafeDecryptBlock,
    unsafeDecryptBlockWithIV,
    unsafeEncryptBlock,
} from "../../vendor/public-domain/unsafe-raw-aes/unsafe-raw-aes";
import { puzzles } from "../../puzzles";
import { Move } from "../../alg/alg-nodes/leaves/Move";
import { Quaternion } from "three";

/**
 * Block size used in crypto operations
 */
const BLOCK_SIZE = 16;

/**
 * Envelope size for encoding data
 */
const ENVELOPE_SIZE = 20;

/**
 * Operation types known for the read 
 * ({@link UUIDs.READ_CHARACTERISTIC}) and write
 * ({@link UUIDs.WRITE_CHARACTERISTIC}) characteristics of the 
 * {@link UUIDS.CUBE_SERVICE}.
 */
enum OperationType
{
    Gyro = 1,
    Translation = 2,
    Facelets = 4,
    HardwareInfo = 5,
    Battery = 9
}

/**
 * UUIDs discovered for Bluetooth GATT services on the device
 */
const UUIDs = {
    CUBE_SERVICE: "6e400001-b5a3-f393-e0a9-e50e24dc4179",
    READ_CHARACTERISTIC: "28be4cb6-cd67-11e9-a32f-2a2ae2dbcce4",
    WRITE_CHARACTERISTIC: "28be4a4a-cd67-11e9-a32f-2a2ae2dbcce4",
};

/** Zero'd array used to encapsulate data */
const emptyPayload = new Uint8Array(ENVELOPE_SIZE);

/**
 * Creates a command buffer for sending to the cube
 * @param data either a single number or array of numbers
 * @returns Command buffer
 */
function createCommand(data: number | ArrayLike<number>): Uint8Array {
    var command = emptyPayload.slice();
    if (typeof(data) === "number")
        command.set(new Uint8Array([data]), 0);
    else if (Array.isArray(data) && data.length > 0)
        command.set(data, 0);
    return command;    
}

/**
 * List of known commands that can be sent to the {@link UUIDs.writeCharacteristic}
 * characteristic
 */
const COMMANDS = {    
    /** Requests the battery state */
    GET_BATTERY_STATE: createCommand(OperationType.Battery),
    /** Request the facelets */
    GET_FACELETS: createCommand(OperationType.Facelets),
    /** Request the hardware info */
    GET_HARDWARE_INFO: createCommand(OperationType.HardwareInfo),
    /** Reset the cube state */
    RESET: createCommand([10, 5, 57, 119, 0, 0, 1, 35, 69, 103, 137, 171, 0, 0, 0, 0, 0, 0, 0, 0]),
};

/** 
 * Listen for GATT advertisements and inspect manufacturer data
 * for the device's MAC Address.
 * 
 * NOTE: The IO of each cube is encrypted using a key/iv pair 
 * derived from the device's own bluetooth MAC address. 
 * 
 * @see {@link getKeyIv}
 * 
 */
const getMacAddress = async (
    server: BluetoothRemoteGATTServer,
): Promise<string> => {

    var device = server.device;
    var abortController = new AbortController();

    return new Promise(function (resolve, reject) {

        var handleAdvertisementEvent = (event: any) => {
            debugLog("Advertisement: " + event);
            var manufacturerData = event.manufacturerData;            
            var dataView = manufacturerData instanceof DataView ? manufacturerData : manufacturerData.get(0x0001);
            if (dataView && dataView.byteLength >= 6) {
                var mac: string[] = [];
                for (var i = 0; i < 6; i++) {
                    var macAddressSegment = dataView.getUint8(dataView.byteLength - i - 1) + 0x100;
                    var hex = macAddressSegment.toString(16).slice(1);
                    mac.push(hex);
                }
                device.removeEventListener('advertisementreceived', handleAdvertisementEvent);
                abortController.abort();
                resolve(mac.join(':'));
            }
        };

        device.addEventListener('advertisementreceived', handleAdvertisementEvent);
        device.watchAdvertisements({ signal: abortController.signal });

        setTimeout(() => {
            device.removeEventListener('advertisementreceived', handleAdvertisementEvent);
            abortController.abort();
            reject();
        }, 5000);

    });

}

/**
 * Derive a key/iv pair from {@link GanCubei3.key}, {@link GanCubei3.iv}
 * and the device's {@link macAddress}
 * @param macAddress 
 * @returns promise containing the derived key/iv pair
 */
async function getKeyIv(
    macAddress: string
): Promise<{ key: CryptoKey, iv: Uint8Array }> {

    const key = new Uint8Array([1, 2, 66, 40, 49, 145, 22, 7, 32, 5, 24, 84, 66, 17, 18, 83]);
    const iv = new Uint8Array([17, 3, 50, 40, 33, 1, 118, 39, 32, 149, 120, 20, 50, 18, 2, 67]);

    macAddress.split(":")
        .map(segment => parseInt(segment, 16))
        .forEach((_, i, arr) => {
            key.set([(key[i] + arr[5 - i]) % 255], i);
            iv.set([(iv[i] + arr[5 - i]) % 255], i);
        });

    return {
        key: await importKey(new Uint8Array(key)),
        iv: new Uint8Array(iv)
    }

}

export class GanCubei3 extends BluetoothPuzzle {

    /** -----------------------------------------------------------------------
     * Connectivity
     */

    public static async connect(
        server: BluetoothRemoteGATTServer,
    ): Promise<GanCubei3> {        

        // TODO: Try catch this, and find some other way to ask for MAC Address?        
        const macAddress = await getMacAddress(server);        

        // Calculate the crypto parameters based on the device mac address
        const cryptoResult = await getKeyIv(macAddress);
        debugLog("Crypto Result:", cryptoResult);

        // Establish service channels
        const ganCubeService: BluetoothRemoteGATTService = await server.getPrimaryService(
            UUIDs.CUBE_SERVICE,
        );
        const readCharacteristic: BluetoothRemoteGATTCharacteristic = await ganCubeService.getCharacteristic(
            UUIDs.READ_CHARACTERISTIC,
        );
        const writeCharacteristic: BluetoothRemoteGATTCharacteristic = await ganCubeService.getCharacteristic(
            UUIDs.WRITE_CHARACTERISTIC,
        );
        
        // NOTE: When the initial state of the cube is determined
        // (via cube.requestFacelets, and the subsequent characteristic
        // event handler for facelets) we resolve this promise which will 
        // return back to the initial connect() call.
        // TODO: Should probably pass reject to the cube as well and have 
        // some other exception handling
        return new Promise((resolve, reject) => {
            
            async function init() {
                
                // Instantiate the cube
                var cube = new GanCubei3(
                    await puzzles["3x3x3"].kpuzzle(),
                    server,
                    writeCharacteristic,
                    cryptoResult?.key,
                    cryptoResult?.iv,                    
                    resolve                     
                );
                
                // Subscribe to cube changes
                await readCharacteristic.startNotifications();
                readCharacteristic.addEventListener(
                    'characteristicvaluechanged',
                    cube.handleCharacteristicValueChanged,
                );
    
                // Prime initial state before returning                
                await cube.requestHardwareInfo();
                await cube.requestBattery();
                await cube.requestFacelets();

            }
            
            init();

        });

    }
    
    /** -----------------------------------------------------------------------
     * Bluetooth Puzzle Implementation
     */

    /**
     * Get the puzzle's name (ie. GANi3xxx)
     * @returns device name
     */
    public name(): string | undefined {
        return this.server.device.name;
    }
    
    /**
     * Get the current state of the puzzle
     * @returns current state
     */
    public override getState = async (): Promise<KState> => {
        return new Promise(
            (resolve, _) => resolve(this.state)
        );
    }

    /**
     * Send a 'reset' command to the cube so it's internal state
     * is solved. 
     * (It's expected that this would only be called if the 
     * physical cube was solved but the internal state was desynced.)
     */
    public override reset = async (): Promise<void> => {        
        await this.sendRequest(COMMANDS.RESET);
        await this.requestFacelets();
        this.moveCount = -1;
        this.previousMoveCount = -1;
        // TODO: Fix puzzle to initial state?
    }

    /**
     * Disconnect from the bluetooth device
     */
    disconnect(): void {
        // TODO: Ensure this is called on error / timeout to clean up resources.
        this.server.disconnect();
    }

    /** -----------------------------------------------------------------------
     * Constructor
     */
    constructor(
        private puzzle: KPuzzle,
        private server: BluetoothRemoteGATTServer,
        private writeCharacteristic: BluetoothRemoteGATTCharacteristic,
        private key: CryptoKey,
        private iv: Uint8Array,
        private onReady: (value: GanCubei3 | PromiseLike<GanCubei3>) => void
    ) {        
        super();        
    }

    private handleCharacteristicValueChanged = async (event: Event): Promise<void> => {

        var encoded: DataView | undefined = (
            event.target as BluetoothRemoteGATTCharacteristic)?.value

        if (encoded === undefined)
            return;

        var data: DataView = await this.decrypt(
            new Uint8Array(encoded.buffer)
        );
        
        /** 
         * First 4 bits of the {@link plaintext} denote the {@link OperationType} 
         */
        var operation = data.getUint8(0) >> 4;
        var binary = GanCubei3.toBinaryString(data)
            .slice(4);
        
        switch (operation as OperationType)
        {
            case OperationType.Gyro:
                this.handleGyro(data);
                break;
            case OperationType.Translation:
                this.handleTranslation(binary);
                break;
            case OperationType.Facelets:
                this.handleFacelets(binary);
                break;
            case OperationType.HardwareInfo:
                this.handleHardwareInfo(data);
                break;
            case OperationType.Battery:
                this.handleBatteryValue(data);
                break;

            default:
                debugLog(`Unknown operation type: ${operation}`)
                break;
            
        }    

    }

    private normalizeMoves = (now: number) => {
        
        var moveDiff = (this.moveCount - this.previousMoveCount);
        if (moveDiff == 0)
            return;

        // TODO: We might need to go through the timestamps / moveDiff and 
        // emit the missing events, or readjust the state somehow.
        // It's not immediately apparent how the cube could desync like this, 
        // so will have to keep an eye on it.
        debugLog(`Cube desync detected.  ${moveDiff} moves lost`);        
        this.previousMoveCount = this.moveCount;        
        
    }

    /** -----------------------------------------------------------------------
     * Stream processing
     */

    private quat: Quaternion;

    private handleGyro(data: DataView): void {

        // NOTE: Trying the algo from gan.ts, but haven't spent much time
        // on it since I'm using the 2D SVG UI for debugging.
        
        // let x = data.getInt16(0, true) / 16384;
        // let y = data.getInt16(2, true) / 16384;
        // let z = data.getInt16(4, true) / 16384;
        // [x, y, z] = [-y, z, -x];
        // const wSquared = 1 - (x * x + y * y + z * z);
        // const w = wSquared > 0 ? Math.sqrt(wSquared) : 0;
        // this.quat = new Quaternion(x, y, z, w);

        // this.dispatchOrientation({
        //     quaternion: this.quat,
        //     timeStamp: new Date().getTime()
        // });
        
        // console.log(this.quat);

    }
    
    private moveCount: number           = -1;
    private previousMoves: Move[]       = [];
    private previousMoveCount: number   = -1;
    private times: number[]             = [];     
    
    private handleTranslation(binary: string): void {
        
        var now = new Date().getTime();
        this.moveCount = parseInt(binary.slice(0, 8), 2);
        
        // Dedupe
        if (this.moveCount == this.previousMoveCount)
            return;

        // Handle the initial state
        if (this.previousMoveCount == -1) {
            this.previousMoveCount = this.moveCount;
        }

        this.times = [];
		this.previousMoves = [];

        // Moves stored in array of 5-bits, offset by 8, latest is 0 indexed
        for (var i = 0; i < 7; i++) {                    
            var m = parseInt(binary.slice(8 + i * 5, 13 + i * 5), 2);
            this.previousMoves[i] = new Move("URFDLB".charAt(m >> 1), m & 1 ? -1 : 1);
            this.times[i] = parseInt(binary.slice(43 + i * 16, 59 + i * 16), 2);                        
        }

        debugLog(`Translation: ${JSON.stringify(this.previousMoves[0].toString())}`); 

        this.state = this.state.applyMove(this.previousMoves[0]);

        this.dispatchAlgLeaf({
            latestAlgLeaf: this.previousMoves[0],
            timeStamp: now,
            debug: undefined,
            state: this.state,
            // quaternion: physicalState.rotQuat(), // TODO: gyro usage?
        });

        
    }

    /**
     * State of the cube
     */
    private state: KState;

    /**
     * Receive cube updates regarding the orientation and position of cubelets
     * @param binary encoded data from the cube
     * @returns 
     */
    private async handleFacelets(binary: string): Promise<void> {
        
        this.moveCount = parseInt(binary.slice(0, 8), 2);

        if (this.moveCount != this.previousMoveCount && this.previousMoveCount != -1)
            return;

        const stateData: KStateData = {
            CORNERS: {
                pieces: [],
                orientation: [],
            },
            EDGES: {
                pieces: [],
                orientation: [],
            },
            CENTERS: {
                pieces: [0, 1, 2, 3, 4, 5],
                orientation: [0, 0, 0, 0, 0, 0],
            },
        };
                
        var edgeChecksum = 0;        
        var cornerChecksum = 0xf00;

        for (var i = 0; i < 7; i++) {
            var permutation = parseInt(binary.slice(8 + i * 3, 11 + i * 3), 2);
            var orientation = parseInt(binary.slice(29 + i * 2, 31 + i * 2), 2);
            cornerChecksum -= orientation << 3;
            cornerChecksum ^= permutation;
            stateData.CORNERS.pieces[i] = permutation;                    
            stateData.CORNERS.orientation[i] = orientation;
        }

        var last = (cornerChecksum & 0xff8) % 24 | cornerChecksum & 0x7;
        stateData.CORNERS.pieces[7] = last & 0x7;
        stateData.CORNERS.orientation[7] = last >> 3;

        for (var i = 0; i < 11; i++) {
            var perm = parseInt(binary.slice(43 + i * 4, 47 + i * 4), 2);
            var ori = parseInt(binary.slice(87 + i, 88 + i), 2);
            edgeChecksum ^= perm << 1 | ori;
            stateData.EDGES.pieces[i] = perm
            stateData.EDGES.orientation[i] = ori;
        }

        stateData.EDGES.pieces[11] = edgeChecksum >> 1
        stateData.EDGES.orientation[11] = edgeChecksum & 0x1;
                
        this.previousMoveCount = this.moveCount;        
        this.state = new KState(this.puzzle, stateData);
        
        // TODO: when we call `reset()`, we will reset the internal state of the 
        // cube, but also send a request for the facelets, meaning the current 
        // function will be triggered again.  However, `this.onReady()` was only
        // intended to be used once.  I'll need to rethink the pattern here, 
        // perhaps instead of `onReady` we have a `onInitialized`?  Or maybe 
        // the implementation is fine, as-is, not sure.
        this.onReady(this);

        this.dispatchAlgLeaf({
            latestAlgLeaf: this.previousMoves[0],
            timeStamp: new Date().getTime(),
            debug: undefined,
            state: this.state,
            // quaternion: physicalState.rotQuat(), // TODO: gyro usage
        });

    }

    /**
     * Handles {@link OperationType.HardwareInfo} characteristic updates from the cube
     * @param data Plaintext data from characteristic update buffer
     */
    private handleHardwareInfo(data: DataView): void {

        var hardwareVersion = `${data.getUint8(1)}.${data.getUint8(2)}`;
        var softwareVersion = `${data.getUint8(3)}.${data.getUint8(4)}`;
        var name = '';
        for (var i = 0; i < 5; i++)
            name += String.fromCharCode(data.getUint8(8 + i));
        var gyroState = data.getUint8(13) >> 7 == 1;
        
        debugLog("Hardware Version: " + hardwareVersion);
        debugLog("Software Version: " + softwareVersion);
        debugLog("Cube Name: " + name);
        debugLog("Gyro State: " + gyroState);
        
    }

    /**
     * Battery level for the cube
     */
    private batteryLevel = 0;

    /**
     * Handles {@link OperationType.Battery} characteristic updates from the cube
     * @param data Plaintext data from characteristic update buffer
     */
    private handleBatteryValue(data: DataView): void {
        this.batteryLevel = data.getUint8(1)
        debugLog("Battery Level: " + this.batteryLevel);
    }

    /** -----------------------------------------------------------------------
     * Encryption / Encoding
     **/

    /**
     * Encrypt the request data
     * @param ret Plaintext array
     * @returns 
     */
    private encrypt = async (value: Uint8Array): Promise<Uint8Array> => {

        var plaintext = value.slice()

        for (var i = 0; i < BLOCK_SIZE; i++) {
            plaintext[i] ^= ~~this.iv[i];
        }

        var offset = value.byteLength - BLOCK_SIZE;

        var cyphertext = new Uint8Array(plaintext.byteLength);
        cyphertext.set(new Uint8Array(
                await unsafeEncryptBlock(
                    this.key,
                    plaintext,
                )
            ), 0);

        if (plaintext.byteLength > BLOCK_SIZE) {

            var block = cyphertext.slice(offset);
            for (var i = 0; i < BLOCK_SIZE; i++) {
                block[i] ^= ~~this.iv[i];
            }

            var block2 = new Uint8Array((await unsafeEncryptBlock(
                this.key,
                block,
            )));

            for (var i = 0; i < BLOCK_SIZE; i++) {
                cyphertext[i + offset] = block2[i];
            }

        }

        return cyphertext;

    }

    /**
     * Decrypt the cube data
     * @param value Encrypted array
     * @returns 
     */
    private decrypt = async (value: Uint8Array): Promise<DataView> => {

        var buffer = new Uint8Array(value.byteLength)
        buffer.set(value, 0);

        if (buffer.byteLength > BLOCK_SIZE) {
            var offset = buffer.length - BLOCK_SIZE;
            var offsetBlock = new Uint8Array(
                await unsafeDecryptBlock(
                    this.key,
                    buffer.slice(offset),
                )
            );
            for (var i = 0; i < BLOCK_SIZE; i++) {
                buffer[i + offset] = offsetBlock[i] ^ (~~this.iv[i]);
            }
        }

        var dataBlock = new Uint8Array(
            await unsafeDecryptBlockWithIV(
                this.key,
                buffer,
                this.iv,
            )
        );

        var plaintext = new Uint8Array(value.byteLength)
        plaintext.set(dataBlock, 0);
        return new DataView(plaintext.buffer);

    }

    /**
     * Convert the DataView to a binary string representation
     * @param value Dataview to encode as binary
     */
    private static toBinaryString(value: DataView): string {
        
        return Array.from(new Uint8Array(value.buffer))
            .map(x => (x + 256).toString(2).slice(1))
            .join('');

    }

    /** -----------------------------------------------------------------------
     * IO
     */

    /**
     * Request facelet data from the cube.
     * @returns Promise<void>
     * @description Facelet data is returned on the read channel
     */
    async requestFacelets(): Promise<void> {
        return await this.sendRequest(COMMANDS.GET_FACELETS);
    }

    async requestHardwareInfo(): Promise<void> {
        return await this.sendRequest(COMMANDS.GET_HARDWARE_INFO);
    }

    async requestBattery(): Promise<void> {
        return await this.sendRequest(COMMANDS.GET_BATTERY_STATE);
    }

    /**
     * Encrypt and send data to the cube
     * @param data Encoded request data
     * @returns Promise<void>
     */
    async sendRequest(data: Uint8Array): Promise<void> {
        var encodedReq = await this.encrypt(data);
        return await this.writeCharacteristic.writeValue(encodedReq);
    }

}

export const gani3Config: BluetoothConfig<BluetoothPuzzle> = {
    connect: GanCubei3.connect.bind(GanCubei3),
    prefixes: ["GANi3"],
    filters: [{ namePrefix: "GANi3" }],
    optionalServices: [UUIDs.CUBE_SERVICE],
    optionalManufacturerData: [0x0001],
};