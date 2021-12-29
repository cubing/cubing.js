import type { TwistyPlayer } from "../../../cubing/twisty";

export function setupHintFaceletsCheckbox(
  domID: string,
  twistyPlayer: TwistyPlayer,
): void {
  const elem = document.getElementById(domID) as HTMLInputElement;
  twistyPlayer.experimentalModel.hintFaceletProp.addFreshListener(
    (hintFaceletStyle) => {
      console.log({ hintFaceletStyle });
      elem.checked = !["none"].includes(hintFaceletStyle);
    },
  );
  elem.addEventListener("change", () => {
    console.log("change", elem.checked);
    twistyPlayer.hintFacelets = elem.checked ? "floating" : "none";
  });
}
