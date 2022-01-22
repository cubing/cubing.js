const stub = document.querySelector("#stub") as HTMLElement;

function newTable(
  stub: HTMLElement,
): [HTMLTableElement, HTMLTableSectionElement] {
  const table = stub.appendChild(document.createElement("table"));

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
  const [, tbody] = newTable(stub);

  const tr1 = tbody.appendChild(document.createElement("tr"));
  entry(tr1, "EP", "edge", 16);

  const tr2 = tbody.appendChild(document.createElement("tr"));
  entry(tr2, "EP (continued)", "edge", 13);
  entry(tr2, "EO", "edge", 3);

  const tr3 = tbody.appendChild(document.createElement("tr"));
  entry(tr3, "EO (continued)", "edge", 9);
  entry(tr3, "CP", "corner", 7);

  const tr4 = tbody.appendChild(document.createElement("tr"));
  entry(tr4, "CP (continued)", "corner", 9);
  entry(tr4, "CO", "corner", 7);

  const tr5 = tbody.appendChild(document.createElement("tr"));
  entry(tr5, "CO (continued)", "corner", 6);
  entry(tr5, "PO_U", "puzzOri", 3);
  entry(tr5, "PO_L", "puzzOri", 2);
  entry(tr5, "MO_Q", "centerOri", 1);
  entry(tr5, "MO", "centerOri", 4);

  const tr6 = tbody.appendChild(document.createElement("tr"));
  entry(tr6, "MO", "centerOri", 8);
}
