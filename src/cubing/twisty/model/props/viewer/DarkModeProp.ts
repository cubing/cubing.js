import { TwistyPropDerived } from "../TwistyProp";
import type {
  DarkModeTheme,
  DarkModeThemeWithAuto,
} from "./DarkModeRequestProp";

interface DarkModePropInputs {
  darkModeRequest: DarkModeThemeWithAuto;
}

export class DarkModeProp extends TwistyPropDerived<
  DarkModePropInputs,
  DarkModeTheme
> {
  protected derive(inputs: DarkModePropInputs): DarkModeTheme {
    // TODO: Once the theme is ready, use `prefers-color-scheme` for automatic dark mode by default.
    return inputs.darkModeRequest === "dark" ? "dark" : "light";
  }
}
