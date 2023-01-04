import { KPuzzle, KState } from "../../../../cubing/kpuzzle";
import { cube2x2x2 } from "../../../../cubing/puzzles";
import { experimentalSolveTwsearch } from "../../../../cubing/search";

const LOCALSTORAGE_DEF = "twsearch/text-ui/def";
const LOCALSTORAGE_SEARCH = "twsearch/text-ui/search";
const LOCALSTORAGE_CHECKED_MOVES = "twsearch/text-ui/checked-moves";

async function defaultDef() {
  return JSON.stringify((await cube2x2x2.kpuzzle()).definition, null, "  ")
    .replace(/,\n *(\d)/g, ", $1")
    .replace(/\[\n +(\d)/g, "[$1")
    .replace(/\n +\]/g, "]")
    .replace(/( *)\}\n( *)\}/g, "$2}}");
}

function validateAndSaveInput(
  input: HTMLTextAreaElement,
  localStorageField: string,
): void {
  try {
    new KPuzzle(JSON.parse(input.value));
    localStorage[localStorageField] = input.value;
    input.classList.add("valid");
    input.classList.remove("invalid");
  } catch (e) {
    input.classList.add("invalid");
    input.classList.remove("valid");
    throw e;
  }
}

(async () => {
  (
    document.querySelector("#reset-def-search") as HTMLButtonElement
  ).addEventListener("click", () => {
    delete localStorage[LOCALSTORAGE_DEF];
    delete localStorage[LOCALSTORAGE_SEARCH];
    location.reload();
  });
  (
    document.querySelector("#reset-move-subset") as HTMLButtonElement
  ).addEventListener("click", () => {
    delete localStorage[LOCALSTORAGE_CHECKED_MOVES];
    location.reload();
  });
  (
    document.querySelector("#toggle-move-subset") as HTMLButtonElement
  ).addEventListener("click", () => {
    for (const checkbox of Array.from(
      moveSubsetElem.querySelectorAll("input[type=checkbox"),
    ) as HTMLInputElement[]) {
      checkbox.checked = !checkbox.checked;
      checkedMoves[checkbox.value] = !checkedMoves[checkbox.value];
    }
    saveCheckedMoves();
  });

  const def = document.querySelector("#def") as HTMLTextAreaElement;
  def.value = localStorage[LOCALSTORAGE_DEF]
    ? localStorage[LOCALSTORAGE_DEF]
    : await defaultDef();
  validateAndSaveInput(def, LOCALSTORAGE_DEF);
  def.addEventListener("input", () =>
    validateAndSaveInput(def, LOCALSTORAGE_DEF),
  );

  const search = document.querySelector("#search") as HTMLTextAreaElement;
  search.value = localStorage[LOCALSTORAGE_SEARCH]
    ? localStorage[LOCALSTORAGE_SEARCH]
    : `{
  "CORNERS": {
    "pieces": [0, 1, 2, 3, 4, 5, 6, 7],
    "orientation": [1, 2, 0, 0, 0, 0, 0, 0]
  }
}`;
  validateAndSaveInput(search, LOCALSTORAGE_SEARCH);
  search.addEventListener("input", () =>
    validateAndSaveInput(search, LOCALSTORAGE_SEARCH),
  );

  const go = document.querySelector("#go") as HTMLButtonElement;
  const moveSubsetElem = document.querySelector(
    "#move-subset",
  ) as HTMLTextAreaElement;
  const minDepthElem = document.querySelector(
    "#min-depth",
  ) as HTMLTextAreaElement;
  const results = document.querySelector("#results") as HTMLTextAreaElement;

  let checkedMoves: Record<string, boolean> = {};
  try {
    checkedMoves = JSON.parse(
      localStorage.getItem(LOCALSTORAGE_CHECKED_MOVES) ?? "{}",
    );
  } catch {}

  async function updateMoveSubset(): Promise<void> {
    const kpuzzle = new KPuzzle(JSON.parse(def.value));
    moveSubsetElem.textContent = "";
    const moveNames = Object.keys(kpuzzle.definition.moves)
      .concat(Object.keys(kpuzzle.definition.experimentalDerivedMoves ?? {}))
      .sort(function (a, b) {
        return a.localeCompare(b);
      });
    // let lastMoveName = moveNames[0];
    for (const moveName of moveNames) {
      const id = `move-${moveName}`;
      const wrapper = moveSubsetElem.appendChild(
        document.createElement("label"),
      );
      wrapper.setAttribute("for", id);
      wrapper.setAttribute("style", "border: 1px solid; padding: 0 0.5em;");
      const checkbox = wrapper.appendChild(document.createElement("input"));
      checkbox.type = "checkbox";
      checkbox.value = moveName;
      checkbox.id = id;
      if (moveName in checkedMoves) {
        checkbox.checked = checkedMoves[moveName];
      } else {
        const moveDefault =
          !moveName.endsWith("v") && moveName.toLowerCase() !== moveName; // Exclude what is probably a rotation.
        checkedMoves[moveName] = moveDefault;
        checkbox.checked = moveDefault;
      }
      const label = wrapper.appendChild(document.createElement("label"));
      label.textContent = moveName;
      label.setAttribute("for", id);
      checkbox.addEventListener("input", () => {
        checkedMoves[moveName] = checkbox.checked;
        saveCheckedMoves();
      });
      // lastMoveName = moveName;
    }
    saveCheckedMoves();
  }

  def.addEventListener("input", updateMoveSubset);
  updateMoveSubset();

  function saveCheckedMoves() {
    localStorage.setItem(
      LOCALSTORAGE_CHECKED_MOVES,
      JSON.stringify(checkedMoves),
    );
  }

  function getMoveSubset(): string[] {
    const output = [];
    for (const checkbox of Array.from(
      moveSubsetElem.querySelectorAll("input[type=checkbox"),
    ) as HTMLInputElement[]) {
      if (checkbox.checked) {
        output.push(checkbox.value);
      }
    }
    return output;
  }

  go.addEventListener("click", async () => {
    const kpuzzle = new KPuzzle(JSON.parse(def.value));
    const kstate = new KState(kpuzzle, JSON.parse(search.value));
    results.value = "Searching...";
    try {
      results.value = (
        await experimentalSolveTwsearch(kpuzzle, kstate, {
          moveSubset: getMoveSubset(),
          minDepth: parseInt(minDepthElem.value),
        })
      ).toString();
    } catch (e) {
      results.value = "Error:\n" + e;
      throw e;
    }
  });
})();
