// Parcel-ism.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import supercubeSprite from "url:./supercube-sprite.png";
import { cubeDemo } from "./picture-cube-demo";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

const spriteURL =
  new URL(location.href).searchParams.get("sprite") ?? supercubeSprite;

const hintSpriteURL =
  new URL(location.href).searchParams.get("hint-sprite") ?? "";

cubeDemo(spriteURL, hintSpriteURL);
