import {BluetoothPuzzle} from "./bluetooth-puzzle"
import {debugLog} from "./debug"
import {giiKERConfig, GiiKERCube} from "./giiker"
import {ganConfig, GanCube} from "./gan"

/******** requestOptions ********/

export type BluetoothConfig = {
    filters: BluetoothRequestDeviceFilter[];
    optionalServices: BluetoothServiceUUID[];
};

function requestOptions(): RequestDeviceOptions {
const requestOptions = {
    filters: <Array<BluetoothRequestDeviceFilter>>[],
    optionalServices: <Array<BluetoothServiceUUID>>[]
};
for (var config of [
    giiKERConfig,
    ganConfig
]) {
    requestOptions.filters = requestOptions.filters.concat(config.filters);
    requestOptions.optionalServices = requestOptions.optionalServices.concat(config.optionalServices);
}
debugLog({requestOptions});
return requestOptions;
};

/******** connect() ********/

// TODO: Debug options to allow connecting to any device?
export async function connect(): Promise<BluetoothPuzzle> {
  debugLog("Attempting to pair.")
  const device = await navigator.bluetooth.requestDevice(requestOptions());
  debugLog("Device:", device);

  if (typeof device.gatt === "undefined") {
      return Promise.reject("Device did not have a GATT server.");
  }

  const server = await device.gatt.connect();
  debugLog("Server:", server);

  // TODO by reading supported matched filters or provided services.
  if (server.device!.name!.substring(0, 3) == "GAN") {
    return await GanCube.connect(server);
  } else {
    return await GiiKERCube.connect(server);
  }
}
