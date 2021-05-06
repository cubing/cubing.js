// If the `selector` is not specified, the `tagName` is as `selector`.
// TODO: Allow specifying classname. Requires classname validation to be safe.
// TODO: Only query direct children.
export function findOrCreateChild<T extends HTMLElement>(
  parentElem: Element,
  selector: string,
  tagName: string,
): T {
  const existingElem = parentElem.querySelector(selector);
  if (existingElem) {
    return existingElem as T;
  }
  const elem = document.createElement(tagName);
  parentElem.appendChild(elem);
  return elem as T;
}

export function findOrCreateChildWithClass<T extends HTMLElement>(
  parentElem: Element,
  className: string,
  tagName: string = "div",
): T {
  const elem = findOrCreateChild<T>(
    parentElem,
    `${tagName}.${className}`,
    tagName,
  );
  elem.classList.add(className);
  return elem;
}
