import { TwistyPropDerived } from "../TwistyProp";
import type {
  ColorScheme,
  ColorSchemeWithAuto,
} from "./ColorSchemeRequestProp";

interface ColorSchemePropInputs {
  colorSchemeRequest: ColorSchemeWithAuto;
}

export class ColorSchemeProp extends TwistyPropDerived<
  ColorSchemePropInputs,
  ColorScheme
> {
  protected derive(inputs: ColorSchemePropInputs): ColorScheme {
    // TODO: Once the theme is ready, use `prefers-color-scheme` for automatic dark mode by default.
    return inputs.colorSchemeRequest === "dark" ? "dark" : "light";
  }
}
