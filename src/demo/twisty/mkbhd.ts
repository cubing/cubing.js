// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import m12Cube from "url:./M12Cube.gif";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mkbhdHintSpriteURL from "url:./mkbhd-sprite-red-hint.png";
// Parcel-ism.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mkbhdSpriteURL from "url:./mkbhd-sprite-red.png";
import { cubeDemo } from "./picture-cube-demo";

(window as any).m12Cube = m12Cube;

const spriteURL =
  new URL(location.href).searchParams.get("sprite") ?? mkbhdSpriteURL;

const hintSpriteURL =
  new URL(location.href).searchParams.get("hint-sprite") ?? mkbhdHintSpriteURL;

cubeDemo(spriteURL, hintSpriteURL);
