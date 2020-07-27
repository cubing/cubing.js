import { CSSSource } from "../ManagedCustomElement";

export const buttonGridCSS = new CSSSource(`
.wrapper {
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
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
  border: none;
}

button:enabled {
  background: rgba(0, 0, 0, 0.1);
}

button:enabled:hover {
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
`);
