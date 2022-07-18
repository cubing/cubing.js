import type { MillisecondTimestamp } from "../../twisty/controllers/AnimationTypes";
import type { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";

// TODO: Short IDs
const UUIDs = {
  ganTimerService: "0000fff0-0000-1000-8000-00805f9b34fb",
  timeCharacteristic: "0000fff2-0000-1000-8000-00805f9b34fb",
};

interface GanTimerDetail {
  currentTime: MillisecondTimestamp;
  latestTimes: [
    MillisecondTimestamp,
    MillisecondTimestamp,
    MillisecondTimestamp,
  ];
}

/** @category Timers */
export class GanTimer extends EventTarget {
  private polling = false;
  private previousDetail: GanTimerDetail | null = null;

  constructor(
    _service: BluetoothRemoteGATTService,
    private server: BluetoothRemoteGATTServer,
    device: BluetoothDevice,
    private timeCharacteristic: BluetoothRemoteGATTCharacteristic,
  ) {
    super();
    this.startPolling();
    console.log(server);
    device.addEventListener(
      "gattserverdisconnected",
      this.onDisconnect.bind(this),
    );
  }

  // We have to perform async operations before we call the constructor.
  static async connect(
    server: BluetoothRemoteGATTServer,
    device: BluetoothDevice,
  ) {
    const ganTimerService = await server.getPrimaryService(
      UUIDs.ganTimerService,
    );
    console.log("Service:", ganTimerService);
    const timeCharacteristic = await ganTimerService.getCharacteristic(
      UUIDs.timeCharacteristic,
    );
    console.log("Characteristic:", timeCharacteristic);
    const timer = new GanTimer(
      ganTimerService,
      server,
      device,
      timeCharacteristic,
    );
    return timer;
  }

  disconnect(): void {
    this.server.disconnect();
  }

  async poll() {
    if (!this.polling) {
      return;
    }
    const value = await this.getTimeCharacteristic();

    const detail: GanTimerDetail = {
      currentTime: this.decodeTimeMs(value.slice(0, 4)),
      latestTimes: [
        this.decodeTimeMs(value.slice(4, 8)),
        this.decodeTimeMs(value.slice(8, 12)),
        this.decodeTimeMs(value.slice(12, 16)),
      ],
    };

    if (detail.currentTime === 0) {
      if (this.previousDetail && this.previousDetail.currentTime !== 0) {
        this.dispatchEvent(new CustomEvent("reset"));
      }
    }

    if (detail.currentTime !== 0 && this.previousDetail) {
      if (this.previousDetail.currentTime === 0) {
        this.dispatchEvent(new CustomEvent("start"));
      }

      if (detail.currentTime !== this.previousDetail.currentTime) {
        this.dispatchEvent(new CustomEvent("update", { detail }));

        if (
          detail.currentTime === detail.latestTimes[0] &&
          detail.latestTimes[1] === this.previousDetail.latestTimes[0] &&
          detail.latestTimes[2] === this.previousDetail.latestTimes[1]
        ) {
          this.dispatchEvent(new CustomEvent("stop", { detail }));
        }
      }
    }

    this.previousDetail = detail;

    this.poll();
  }

  onDisconnect(): void {
    this.dispatchEvent(new CustomEvent("disconnect"));
  }

  async getTimeCharacteristic() {
    return new Uint8Array((await this.timeCharacteristic.readValue()).buffer);
  }

  async getTime() {
    const value = await this.getTimeCharacteristic();
    return this.decodeTimeMs(value.slice(0, 4));
  }

  decodeTimeMs(bytes: Uint8Array) {
    return (bytes[0] * 60 + bytes[1]) * 1000 + bytes[2] + bytes[3] * 256;
  }

  startPolling() {
    this.polling = true;
    this.poll();
  }

  stopPolling() {
    this.polling = false;
  }
}

// // TODO: Move this into a factory?
export const ganTimerConfig: BluetoothConfig<GanTimer> = {
  connect: GanTimer.connect.bind(GanTimer),
  prefixes: ["GAN"],
  filters: [{ namePrefix: "GAN" }],
  optionalServices: [UUIDs.ganTimerService],
};
