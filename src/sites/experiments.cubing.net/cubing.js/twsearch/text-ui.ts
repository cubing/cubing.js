import { Alg, Move } from "../../../../cubing/alg";
import {
  KPuzzle,
  KState,
  type KPuzzleDefinition,
  type KStateData,
} from "../../../../cubing/kpuzzle";
import { cube2x2x2, puzzles } from "../../../../cubing/puzzles";
import { experimentalSolveTwsearch } from "../../../../cubing/search";
import type { SolveTwsearchOptions } from "../../../../cubing/search/outside";
import {
  solveTwsearchServer,
  type TwsearchServerClientOptions,
} from "./twsearch-server";

const LOCALSTORAGE_DEF = "twsearch/text-ui/def";
const LOCALSTORAGE_SEARCH = "twsearch/text-ui/search";
const LOCALSTORAGE_CHECKED_MOVES = "twsearch/text-ui/checked-moves";

function neatStringify(s: any): string {
  return JSON.stringify(s, null, "  ")
    .replace(/,\n *(\d)/g, ", $1")
    .replace(/\[\n +(\d)/g, "[$1")
    .replace(/\n +\]/g, "]")
    .replace(/( *)\}\n( *)\}/g, "$2}}");
}

async function defaultDef() {
  return neatStringify((await cube2x2x2.kpuzzle()).definition);
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
    document.querySelector("#set-search-alg") as HTMLButtonElement
  ).addEventListener("click", () => {
    const kpuzzle = new KPuzzle(JSON.parse(defElem.value));
    const newSearchState = kpuzzle
      .startState()
      .applyAlg(
        new Alg(
          (document.querySelector("#search-alg") as HTMLInputElement).value,
        ),
      );
    const newSearchStateString = neatStringify(newSearchState.stateData);
    searchElem.value = newSearchStateString;
    localStorage[LOCALSTORAGE_SEARCH] = newSearchStateString;
  });
  (
    document.querySelector("#reset-move-subset") as HTMLButtonElement
  ).addEventListener("click", () => {
    delete localStorage[LOCALSTORAGE_CHECKED_MOVES];
    location.reload();
  });

  function mapCheckboxes(fn: (e: HTMLInputElement) => boolean): void {
    for (const checkbox of Array.from(
      moveSubsetElem.querySelectorAll("input[type=checkbox"),
    ) as HTMLInputElement[]) {
      const checked = fn(checkbox);
      checkbox.checked = checked;
      checkedMoves[checkbox.value] = checked;
    }
    saveCheckedMoves();
  }

  (
    document.querySelector("#toggle-move-subset") as HTMLButtonElement
  ).addEventListener("click", () => mapCheckboxes((e) => !e.checked));

  (
    document.querySelector("#move-subset-check-all") as HTMLButtonElement
  ).addEventListener("click", () => mapCheckboxes((e) => true));

  (
    document.querySelector("#move-subset-uncheck-all") as HTMLButtonElement
  ).addEventListener("click", () => mapCheckboxes((e) => false));

  const defElem = document.querySelector("#def") as HTMLTextAreaElement;
  defElem.value = localStorage[LOCALSTORAGE_DEF]
    ? localStorage[LOCALSTORAGE_DEF]
    : await defaultDef();
  validateAndSaveInput(defElem, LOCALSTORAGE_DEF);
  defElem.addEventListener("input", () =>
    validateAndSaveInput(defElem, LOCALSTORAGE_DEF),
  );
  function setDef(def: KPuzzleDefinition) {
    defElem.value = neatStringify(def);
    validateAndSaveInput(defElem, LOCALSTORAGE_DEF);
  }

  const searchElem = document.querySelector("#search") as HTMLTextAreaElement;
  searchElem.value = localStorage[LOCALSTORAGE_SEARCH]
    ? localStorage[LOCALSTORAGE_SEARCH]
    : `{
  "CORNERS": {
    "pieces": [0, 1, 2, 3, 4, 5, 6, 7],
    "orientation": [1, 2, 0, 0, 0, 0, 0, 0]
  }
}`;
  validateAndSaveInput(searchElem, LOCALSTORAGE_SEARCH);
  searchElem.addEventListener("input", () =>
    validateAndSaveInput(searchElem, LOCALSTORAGE_SEARCH),
  );
  function setSearch(state: KStateData) {
    searchElem.value = neatStringify(state);
    validateAndSaveInput(searchElem, LOCALSTORAGE_SEARCH);
  }

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

  function moveSortingKey(s: string): string {
    const move = Move.fromString(s);
    return `${move.family}|${move.innerLayer ?? "0"}|${move.outerLayer ?? "0"}`;
  }

  async function updateMoveSubset(): Promise<void> {
    const kpuzzle = new KPuzzle(JSON.parse(defElem.value));
    moveSubsetElem.textContent = "";
    const moveNames = Object.keys(kpuzzle.definition.moves)
      .concat(Object.keys(kpuzzle.definition.experimentalDerivedMoves ?? {}))
      .sort(function (a, b) {
        return moveSortingKey(a).localeCompare(moveSortingKey(b));
      });
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

  defElem.addEventListener("input", updateMoveSubset);
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
    results.value = "Searching...";
    try {
      const kpuzzle = new KPuzzle(JSON.parse(defElem.value));
      const kstate = new KState(kpuzzle, JSON.parse(searchElem.value));
      const options: TwsearchServerClientOptions = {
        searchArgs: {
          minDepth: parseInt(minDepthElem.value),
          moveSubset: getMoveSubset(),
        },
      };
      if ((document.querySelector("#use-server") as HTMLInputElement).checked) {
        results.value = (
          await solveTwsearchServer(kpuzzle, kstate, options)
        ).toString();
      } else {
        const twsearchOptions: SolveTwsearchOptions = {
          moveSubset: options.searchArgs?.moveSubset,
          minDepth: options.searchArgs?.minDepth,
        };
        results.value = (
          await experimentalSolveTwsearch(kpuzzle, kstate, twsearchOptions)
        ).toString();
      }
    } catch (e) {
      results.value = e;
      throw e;
    }
  });

  const select = document.querySelector("#puzzle-select") as HTMLSelectElement;
  for (const [puzzleID, puzzleInfo] of Object.entries(puzzles)) {
    const option = select.appendChild(document.createElement("option"));
    option.value = puzzleID;
    option.textContent = puzzleInfo.fullName;
  }
  select.addEventListener("change", async () => {
    const puzzle = puzzles[select.value];
    const kpuzzle = await puzzle.kpuzzle();
    const def = kpuzzle.definition;
    setDef(def);
    setSearch(kpuzzle.startState().stateData);
    location.reload();
  });
})();
