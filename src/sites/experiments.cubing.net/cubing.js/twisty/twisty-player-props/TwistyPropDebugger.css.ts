import { cssStyleSheetShim } from "../../../../../cubing/twisty/views/node-custom-element-shims";

export const twistyPropDebuggerCSS = new cssStyleSheetShim();
twistyPropDebuggerCSS.replaceSync(
  `

.wrapper {
font-family: Ubuntu, sans-serif;
display: grid;
grid-template-rows: 1.5em 3.5em;
max-width: 20em;

border: 2px solid #ddd;
overflow: hidden;
box-sizing: border-box;

cursor: pointer;
}

.wrapper > :nth-child(2) {
border-top: 1px solid #000;
width: 100%;
height: 3.5em;
overflow-wrap: anywhere;
padding: 0.25em;
}

.wrapper > span {
padding: 0.25em;
max-width: 100%;
white-space: nowrap;
text-overflow: ellipsis;
line-height: 1em;
}

.wrapper.highlight-de-emphasize {
opacity: 0.25;
}

/* .wrapper:hover > span::before { content: "⭐️ "; margin-right: 0.1em; } */

.wrapper.highlight-grandchild-or-further,
.wrapper.highlight-grandparent-or-further                { background: rgba(0, 0, 0, 0.2); }
.wrapper.highlight-grandparent-or-further > span::before { content: "⏬ "; margin-right: 0.1em; }

.wrapper.highlight-child,
.wrapper.highlight-parent                { background: rgba(0, 0, 0, 0.6); color: white; }
.wrapper.highlight-parent > span::before { content: "🔽 "; margin-right: 0.1em; }

.wrapper.highlight-self                { background: rgba(0, 0, 0, 0.8); color: white; }
.wrapper.highlight-self > span::before { content: "⭐️ "; margin-right: 0.1em; }

.wrapper.highlight-child > span::before { content: "🔼 "; margin-right: 0.1em; }

.wrapper.highlight-grandchild-or-further > span::before { content: "⏫ "; margin-right: 0.1em; }

.wrapper:hover {
border: 2px solid #000;
opacity: 1;
}

.wrapper.highlight-self:hover {
/* border: 2px solid #f00; */
}
.wrapper.highlight-self:hover > span::before { content: "🌟 "; margin-right: 0.1em; }

`,
);

export const twistyPlayerDebuggerCSS = new cssStyleSheetShim();
twistyPlayerDebuggerCSS.replaceSync(
  `
.wrapper {
width: 100%;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(12em, 1fr));
}

twisty-prop-debugger.hidden {
/* display: none; */
}

twisty-prop-debugger.first-in-group,
twisty-prop-debugger.highlighted {
/* grid-column-start: 1; */
}

twisty-prop-debugger.highlighted {
/* grid-column: 1 / -1; */
/* margin: 1em 0; */
}
`,
);
