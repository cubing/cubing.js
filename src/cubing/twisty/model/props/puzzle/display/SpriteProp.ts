import type { Texture, TextureLoader } from "three/src/Three.js";
import { bulk3DCode } from "../../../../heavy-code-imports/3d";
import { TwistyPropDerived } from "../../TwistyProp";

let cachedLoader: TextureLoader | null = null;
async function loader(): Promise<TextureLoader> {
  return (cachedLoader ??= new (await bulk3DCode()).ThreeTextureLoader());
}

type SpritePropInputs = {
  spriteURL: URL | null;
};

// TODO: Find a way to make the 3D elements own this, instead of the main `TwistyPlayerModel`.
export class SpriteProp extends TwistyPropDerived<
  SpritePropInputs,
  Texture | null
> {
  async derive(inputs: SpritePropInputs): Promise<Texture | null> {
    const { spriteURL: textureURL } = inputs;
    if (textureURL === null) {
      return null;
    }
    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: TODO: Find a different way to handle `onLoadingError`?
    return new Promise(async (resolve, _reject) => {
      const onLoadingError = (): void => {
        console.warn("Could not load sprite:", textureURL.toString());
        resolve(null);
      };
      // TODO: provide a way to listen for errors?
      try {
        (await loader()).load(
          textureURL.toString(),
          resolve,
          onLoadingError,
          onLoadingError,
        );
      } catch {
        onLoadingError();
      }
    });
  }
}
