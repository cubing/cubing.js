const stub = document.querySelector("#stub")!;

function newTable(
  section: HTMLElement,
): [HTMLTableElement, HTMLTableSectionElement] {
  const table = section.appendChild(document.createElement("table"));

  const thead = table.appendChild(document.createElement("thead"));
  const theadTr = thead.appendChild(document.createElement("tr"));

  for (let i = 0; i < 16; i++) {
    theadTr.appendChild(document.createElement("td"));
  }

  const tbody = table.appendChild(document.createElement("tbody"));
  return [table, tbody];
}

function entry(
  tr: HTMLTableRowElement,
  text: string,
  classNames: string,
  colSpan: number,
): void {
  const val = tr.appendChild(document.createElement("td"));
  val.textContent = text;
  val.classList.add(...classNames.split(" "));
  val.colSpan = colSpan;
}

{
  const section = stub.appendChild(document.createElement("section"));
  section.id = "full-format";

  const h1 = section.appendChild(document.createElement("h1"));
  h1.textContent = "Full Format (11 bytes)";

  const [, tbody] = newTable(section);
  const tr4 = tbody.appendChild(document.createElement("tr"));
  entry(tr4, "CP", "perm", 16);

  const tr3 = tbody.appendChild(document.createElement("tr"));

  entry(tr3, "CO", "ori", 13);
  entry(tr3, "PO_U", "puzzOri", 3);

  const tr1 = tbody.appendChild(document.createElement("tr"));
  entry(tr1, "EP", "perm", 16);

  const tr2 = tbody.appendChild(document.createElement("tr"));
  entry(tr2, "EP (continued)", "perm", 13);
  entry(tr2, "PO_L", "puzzOri", 2);
  entry(tr2, "MO?", "centerOri", 1);

  const tr5 = tbody.appendChild(document.createElement("tr"));
  entry(tr5, "EO", "ori", 12);
  entry(tr5, "MO", "centerOri optional", 4);

  const tr6 = tbody.appendChild(document.createElement("tr"));
  entry(tr6, "MO", "centerOri optional", 8);

  section.appendChild(
    document.createElement("h3"),
  ).innerHTML = `Optional Components`;

  section.appendChild(
    document.createElement("p"),
  ).innerHTML = `If puzzle orientation is not encoded:
  <ul>
    <li><span class="componentName">PO_U</span> is set to <code>0b111</code>.</li>
    <li><span class="componentName">PO_L</span> is ignored.</li>
  </ul>`;

  section.appendChild(
    document.createElement("p"),
  ).innerHTML = `If center orientation is not encoded:
<ul>
  <li><span class="componentName">MO?</span> is set to <code>0b0</code>.</li>
  <li>The <span class="componentName">MO</span> bits are ignored.</li>
</ul>
If <span class="componentName">MO?</span> is set to <code>0b0</code>, decoders must not read the <span class="componentName">MO</span> bits. This allows the format to be used as a 76-bit encoding without affecting interoperability, even when followed by unrelated bits.`;
}

{
  const section = stub.appendChild(document.createElement("section"));
  section.id = "fixed-center-format";

  const h1 = section.appendChild(document.createElement("h1"));
  h1.textContent = "Fixed-Center Format (9 bytes)";

  section.appendChild(document.createElement("p")).innerHTML = `
  This format does not contain either of the optional components.
<ul>
  <li>This format is indicated with the value <code>0b110</code> in the former <span class="componentName">PO_U</span> slot.</li>
  <li>Puzzle orientation and center orientation are not encoded</li>
  <li><span class="componentName">EO</span> changes:
    <ul>
      <li>The location has moved forward by 3 bits, making space for 11 bits total.</li>
      <li>The final (12th) bit is <i>not</i> encoded, and is equal to the parity of the other 11 bits.</li>
    </ul>
  </li>
</ul>`;

  section.appendChild(
    document.createElement("p"),
  ).innerHTML = `Note that the number of possible 3x3x3 positions (ignoring centers and orientation) does not fit in 8 bytes, so this encoding is still the minimum number of whole bytes that can be used for an encoding.`;

  const [, tbody] = newTable(section);

  const tr4 = tbody.appendChild(document.createElement("tr"));
  entry(tr4, "CP", "perm", 16);

  const tr2 = tbody.appendChild(document.createElement("tr"));
  entry(tr2, "CO", "ori", 13);
  entry(tr2, "1", "format-indicator", 1);
  entry(tr2, "1", "format-indicator", 1);
  entry(tr2, "0", "format-indicator", 1);

  const tr1 = tbody.appendChild(document.createElement("tr"));
  entry(tr1, "EP", "perm", 16);

  const tr3 = tbody.appendChild(document.createElement("tr"));
  entry(tr3, "EP (continued)", "perm", 13);
  entry(tr3, "EO", "ori", 3);

  const tr5 = tbody.appendChild(document.createElement("tr"));
  entry(tr5, "EO (continued)", "ori", 8);
}
