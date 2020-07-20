import { CSSSource } from "../ManagedCustomElement";

export const buttonGridCSS = new CSSSource(`
.wrapper {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
`);

export const buttonCSS = new CSSSource(`
.wrapper {
  width: 100%;
  height: 100%;
}

button {
  width: 100%;
  height: 100%;
}
`);
