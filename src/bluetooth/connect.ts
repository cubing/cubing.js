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

// TODO: Debug options to allow connecting to any device?
export async function connect(options: BluetoothConnectOptions = {}): Promise<BluetoothPuzzle> {
  debugLog("Attempting to pair.");
  const device = await navigator.bluetooth.requestDevice(requestOptions(options.acceptAllDevices));
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
