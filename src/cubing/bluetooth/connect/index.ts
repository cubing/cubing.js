import { debugLog } from "../debug";
import type { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";

/******** requestOptions ********/

function requestOptions<T>(
  configs: BluetoothConfig<T>[],
  acceptAllDevices: boolean = false,
): RequestDeviceOptions {
  const options = acceptAllDevices
    ? {
        acceptAllDevices: true,
        optionalServices: [] as BluetoothServiceUUID[],
      }
    : {
        filters: [] as BluetoothLEScanFilter[],
        optionalServices: [] as BluetoothServiceUUID[],
      };
  for (const config of configs) {
    if (!acceptAllDevices) {
      options.filters = options.filters!.concat(config.filters);
    }
    options.optionalServices = options.optionalServices.concat(
      config.optionalServices,
    );
  }
  debugLog({ requestOptions: options });
  return options;
}

/******** connect() ********/

/** Type representing a custom MAC address provider for smart cubes */
export type MacAddressProvider = () => Promise<string>;

export interface BluetoothConnectOptions {
  acceptAllDevices?: boolean;
  macAddressProvider?: MacAddressProvider;
}

// We globally track the number of connection failures,
// in order to offer the user recourse (accept all devices) if they're having issues.
// This allows us to future-proof situations where a device might not show up in
// the chooser, but works if we connect.
let consecutiveFailures = 0;
const MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK = 2;

// TODO: Debug options to allow connecting to any device?
export async function bluetoothConnect<T>(
  configs: BluetoothConfig<T>[],
  options: BluetoothConnectOptions = {},
): Promise<T> {
  debugLog("Attempting to pair.");
  let device: BluetoothDevice;
  try {
    let acceptAllDevices = options.acceptAllDevices;
    if (
      !acceptAllDevices &&
      consecutiveFailures >= MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK
    ) {
      console.info(
        `The last ${MAX_FAILURES_BEFORE_ACCEPT_ALL_FALLBACK} Bluetooth puzzle connection attempts failed. This time, the Bluetooth prompt will show all possible devices.`,
      );
      acceptAllDevices = true;
    }
    device = await navigator.bluetooth.requestDevice(
      requestOptions<T>(configs, acceptAllDevices),
    );
    consecutiveFailures = 0;
  } catch (e) {
    consecutiveFailures++;
    throw e;
  }
  debugLog("Device:", device);

  if (typeof device.gatt === "undefined") {
    return Promise.reject("Device did not have a GATT server.");
  }

  const server = await device.gatt.connect();
  debugLog("Server:", server);

  const name = server.device?.name || "";

  // TODO by reading supported matched filters or provided services.

  for (const config of configs) {
    for (const prefix of config.prefixes) {
      if (name?.startsWith(prefix)) {
        return config.connect({
          server,
          device,
          macAddressProvider: addMacAddressValidation(
            options.macAddressProvider || defaultMacAddressProvider,
          ),
        });
      }
    }
  }

  throw Error("Unknown Bluetooth device.");
}

const MAC_ADDRESS_REGEX = /^[0-9a-fA-F]{2}(?::[0-9a-fA-F]{2}){5}$/;
async function defaultMacAddressProvider(): Promise<string> {
  while (true) {
    const address = prompt("Enter your cube's MAC address:")?.trim();
    if (!address) {
      continue;
    }
    const isValidMacAddress = MAC_ADDRESS_REGEX.test(address);
    if (isValidMacAddress) {
      return address;
    }
  }
}

function addMacAddressValidation(
  macAddressProvider: MacAddressProvider,
): MacAddressProvider {
  return async () => {
    const providedMacAddress = await macAddressProvider();
    const isValidMacAddress = MAC_ADDRESS_REGEX.test(providedMacAddress);
    if (isValidMacAddress) {
      return providedMacAddress;
    } else {
      throw Error(`Invalid MAC address: ${providedMacAddress}`);
    }
  };
}
