// Normally we'd capitalize `ID`, but `Id` matches DOM API function names.
export async function firstElementWithId(id: string): Promise<Element> {
  return new Promise((resolve, reject) => {
    const currentElem = document.getElementById(id);
    if (currentElem) {
      resolve(currentElem);
    }
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (
          mutation.attributeName === "id" &&
          mutation.target instanceof Element &&
          mutation.target.getAttribute("id") === id
        ) {
          resolve(mutation.target);
          observer.disconnect();
        }
      }
    });

    observer.observe(document.body, {
      attributeFilter: ["id"],
      subtree: true,
    });
  });
}
