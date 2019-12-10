import { BluetoothPuzzle } from "./bluetooth-puzzle";
import { debugLog } from "./debug";
import { ganConfig, GanCube } from "./gan";
import { giiKERConfig, GiiKERCube } from "./giiker";
import { GoCube, goCubeConfig } from "./gocube";

/******** requestOptions ********/

export interface BluetoothConfig {
  filters: BluetoothRequestDeviceFilter[];
  optionalServices: BluetoothServiceUUID[];
}

function requestOptions(acceptAllDevices: boolean = false): RequestDeviceOptions {
  const options = acceptAllDevices ? {
    acceptAllDevices: true,
    optionalServices: [] as BluetoothServiceUUID[],
  } : {
      filters: [] as BluetoothRequestDeviceFilter[],
      optionalServices: [] as BluetoothServiceUUID[],
    };
  for (const config of [
    ganConfig,
    giiKERConfig,
    goCubeConfig,
  ]) {
    if (!acceptAllDevices) {
      options.filters = options.filters!.concat(config.filters);
    }
    options.optionalServices = options.optionalServices.concat(config.optionalServices);
  }
  debugLog({ requestOptions: options });
  return options;
}

/******** connect() ********/

interface BluetoothConnectOptions {
  acceptAllDevices?: boolean;
}

// We globally track the number of connection failures,
// in order to offer the user recourse (accept all devices) if they're having issues.
// This allows us to future-proof situations where a device might not show up in
// the chooser, but works if we connect.
let consecutiveFailures = 0;
const MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK = 2;

// TODO: Debug options to allow connecting to any device?
export async function connect(options: BluetoothConnectOptions = {}): Promise<BluetoothPuzzle> {
  debugLog("Attempting to pair.");
  let device;
  try {
    let acceptAllDevices = options.acceptAllDevices;
    if (!acceptAllDevices && consecutiveFailures >= MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK) {
      console.info(`The last ${MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK} Bluetooth puzzle connection attempts failed. This time, the Bluetooth prompt will show all possible devices.`);
      acceptAllDevices = true;
    }
    device = await navigator.bluetooth.requestDevice(requestOptions(acceptAllDevices));
    consecutiveFailures = 0;
  } catch (e) {
    consecutiveFailures++;
    throw new Error(e);
  }
  debugLog("Device:", device);

  if (typeof device.gatt === "undefined") {
    return Promise.reject("Device did not have a GATT server.");
  }

  const server = await device.gatt.connect();
  debugLog("Server:", server);

  const name = server.device!.name || "";

  // TODO by reading supported matched filters or provided services.
  if (name && name.startsWith("GAN")) {
    return await GanCube.connect(server);
  } else if (name && name.startsWith("GoCube")) {
    return await GoCube.connect(server);
  } else {
    return await GiiKERCube.connect(server);
  }
}
