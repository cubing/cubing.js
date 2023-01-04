import { KPuzzle, KState } from "../../../../cubing/kpuzzle";
import { cube2x2x2 } from "../../../../cubing/puzzles";
import { experimentalSolveTwsearch } from "../../../../cubing/search";

(async () => {
  const def = document.querySelector("#def") as HTMLTextAreaElement;
  def.value = JSON.stringify((await cube2x2x2.kpuzzle()).definition, null, "  ")
    .replace(/,\n *(\d)/g, ", $1")
    .replace(/\[\n +(\d)/g, "[$1")
    .replace(/\n +\]/g, "]")
    .replace(/( *)\}\n( *)\}/g, "$2}}");

  const search = document.querySelector("#search") as HTMLTextAreaElement;
  const go = document.querySelector("#go") as HTMLButtonElement;
  const moveSubsetElem = document.querySelector(
    "#move-subset",
  ) as HTMLTextAreaElement;
  const minDepthElem = document.querySelector(
    "#min-depth",
  ) as HTMLTextAreaElement;
  const results = document.querySelector("#results") as HTMLTextAreaElement;

  const CHECKED_MOVES_LOCALSTORAGE = "twsearch/text-ui/checked-moves";
  let checkedMoves: Record<string, boolean> = {};
  try {
    checkedMoves = JSON.parse(
      localStorage.getItem(CHECKED_MOVES_LOCALSTORAGE) ?? "{}",
    );
  } catch {}

  async function updateMoveSubset(): Promise<void> {
    const kpuzzle = new KPuzzle(JSON.parse(def.value));
    moveSubsetElem.textContent = "";
    const moves = Object.keys(kpuzzle.definition.moves).concat(
      Object.keys(kpuzzle.definition.experimentalDerivedMoves ?? {}),
    );
    for (const move of moves) {
      const checkbox = moveSubsetElem.appendChild(
        document.createElement("input"),
      );
      checkbox.type = "checkbox";
      checkbox.value = move;
      const id = `move-${move}`;
      checkbox.id = id;
      if (move in checkedMoves) {
        checkbox.checked = checkedMoves[move];
      } else {
        checkedMoves[move] = true;
        checkbox.checked = true;
      }
      const label = moveSubsetElem.appendChild(document.createElement("label"));
      label.textContent = move;
      label.setAttribute("for", id);
      checkbox.addEventListener("input", () => {
        checkedMoves[move] = checkbox.checked;
        saveCheckedMoves();
      });
    }
    saveCheckedMoves();
  }

  def.addEventListener("input", updateMoveSubset);
  updateMoveSubset();

  function saveCheckedMoves() {
    localStorage.setItem(
      CHECKED_MOVES_LOCALSTORAGE,
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
    }
  });
})();
