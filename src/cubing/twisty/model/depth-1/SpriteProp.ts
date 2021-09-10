import type { Texture, TextureLoader } from "three";
import { THREEJS } from "../../heavy-code-imports/3d";
import { TwistyPropDerived } from "../TwistyProp";

let cachedLoader: TextureLoader | null = null;
async function loader(): Promise<TextureLoader> {
  return (cachedLoader ??= new (await THREEJS).TextureLoader());
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
    return new Promise(async (resolve, reject) => {
      // TODO: return `null` in the rejection case?
      (await loader()).load(textureURL.toString(), resolve, () => {}, reject);
    });
  }
}
