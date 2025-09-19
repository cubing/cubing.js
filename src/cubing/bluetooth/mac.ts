/**
 * Type of MAC address provider to use when a bluetooth device's MAC address
 * is needed and cannot automatically be determined, and as a fallback when
 * automatically determining the MAC address fails.
 *
 * - `"PROMPT"`: Use the built-in prompt-based provider (default).
 * - `"DIALOG"`: Use the built-in dialog-based provider.
 * - {@link MacAddressProvider}: Use a custom MAC address provider.
 */
export type MacAddressProviderOption =
  | "PROMPT"
  | "DIALOG"
  | MacAddressProvider
  | undefined;

/** Type representing a custom MAC address provider for bluetooth devices */
export type MacAddressProvider = () => Promise<string>;

/**
 * An error that should be thrown by a {@link MacAddressProvider} to
 * signal that the user cancelled entering a MAC address.
 */
export class MacAddressCancelledError extends Error {}

/**
 * Converts a {@link MacAddressProviderOption} to a {@link MacAddressProvider},
 * using `"PROMPT"` as the default option.
 * @param macAddressProviderOption {@link MacAddressProviderOption} provided by the user.
 * @returns final MAC address provider that can be called by bluetooth device configs
 */
export function getMacAddressProvider(
  macAddressProviderOption: MacAddressProviderOption,
): MacAddressProvider {
  macAddressProviderOption ||= "PROMPT";

  let provider: MacAddressProvider;
  switch (macAddressProviderOption) {
    case "DIALOG":
      provider = dialogMacAddressProvider;
      break;

    case "PROMPT":
      provider = promptMacAddressProvider;
      break;

    default:
      provider = macAddressProviderOption;
      break;
  }

  return async () => {
    const macAddress = (await provider()).trim();
    validateMacAddress(macAddress);
    return macAddress;
  };
}

const MAC_ADDRESS_REGEX = /^[0-9a-fA-F]{2}(?::[0-9a-fA-F]{2}){5}$/;

/**
 * Validates the MAC address returned by a {@link MacAddressProvider}.
 * @param macAddress MAC address returned by a {@link MacAddressProvider}
 * @throws error if the MAC address is invalid
 */
function validateMacAddress(macAddress: string) {
  if (!MAC_ADDRESS_REGEX.test(macAddress)) {
    throw new Error(`Invalid MAC address: ${macAddress}`);
  }
}

/**
 * Default prompt-based MAC address provider
 * @returns Bluetooth device MAC address
 */
export async function promptMacAddressProvider(): Promise<string> {
  while (true) {
    const address = prompt(
      "Enter your bluetooth device's MAC address:",
    )?.trim();
    if (address === undefined) {
      // User cancelled prompt
      throw new MacAddressCancelledError();
    }
    const isValidMacAddress = MAC_ADDRESS_REGEX.test(address);
    if (isValidMacAddress) {
      return address;
    }
  }
}

/**
 * Default dialog-based MAC address provider
 * @returns Bluetooth device MAC address
 */
export function dialogMacAddressProvider(): Promise<string> {
  return new Promise((resolve, reject) => {
    // TODO: Replace with a cleaner web component implementation
    const dialog = document.createElement("dialog");

    // TODO: Add custom CSS styles
    dialog.innerHTML = `
      <h2>Enter your bluetooth device's MAC address</h2>
      <form>
        <input type="text" placeholder="MAC Address">
        <p style="color: red;"></p>
        <button type="submit">Submit</button>
      </form>
    `;

    document.querySelector("body")!.appendChild(dialog);
    const feedback = dialog.querySelector("p")!;
    const macInput = dialog.querySelector("input")!;

    const button = dialog.querySelector("button")!;

    const validateInput = () => {
      if (!MAC_ADDRESS_REGEX.test(macInput.value)) {
        feedback.textContent = "Invalid MAC address.";
        button.disabled = true;
      } else {
        feedback.textContent = "";
        button.disabled = false;
      }
    };

    macInput.addEventListener("keyup", validateInput);
    validateInput();

    dialog.querySelector("form")!.addEventListener("submit", (e) => {
      e.preventDefault();
      document.querySelector("body")!.removeChild(dialog);
      resolve(macInput.value);
    });

    // TODO: clean up error handling
    dialog.addEventListener("close", () =>
      reject(new MacAddressCancelledError()),
    );

    dialog.showModal();
  });
}
