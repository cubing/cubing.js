import { CSSSource } from "./element/ManagedCustomElement";

export const algTrackerCSS = new CSSSource(`
:host {
  width: 384px;
  height: 256px;
  display: grid;
}

textarea, .carbon-copy {
  font-family: monospace;
  padding: 0.1em;
  box-sizing: border-box;
  font-size: 1.25em;
  line-height: 1.2em;
  position: absolute;
}

textarea {
  width: 100%;
  height: 100%;
  resize: none;
  background: none;
}

.wrapper {
  position: relative;
}

.carbon-copy {
  border: 1px solid rgba(0, 0, 0, 0);
  white-space: pre-wrap;
  word-wrap: break-word;
  color: transparent;
}

.carbon-copy .highlight {
  background: rgba(255, 128, 0, 0.5);
  padding: 0.1em 0.2em;
  margin: -0.1em -0.2em;
  border-radius: 0.2em;
}

.wrapper.issue-warning textarea,
.wrapper.valid-for-puzzle-warning textarea {
  outline: none;
  border: 1px solid rgba(200, 200, 0, 0.5);
  background: rgba(255, 255, 0, 0.1);
}

.wrapper.issue-error textarea,
.wrapper.valid-for-puzzle-error textarea {
  outline: none;
  border: 1px solid red;
  background: rgba(255, 0, 0, 0.1);
}
`);
