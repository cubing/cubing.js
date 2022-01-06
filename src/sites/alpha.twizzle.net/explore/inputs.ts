import type { TwistyPlayer } from "../../../cubing/twisty";
import type { TwistyPropSource } from "../../../cubing/twisty/model/props/TwistyProp";

function setupPropCheckbox<T extends string>(
  domID: string,
  prop: TwistyPropSource<T>,
  checkedValue: T,
  uncheckedValue: T,
) {
  const elem = document.getElementById(domID) as HTMLInputElement;
  prop.addFreshListener((value) => {
    elem.checked = ![uncheckedValue].includes(value);
  });
  elem.addEventListener("change", () => {
    prop.set(elem.checked ? checkedValue : uncheckedValue);
  });
}

export function setupCheckboxes(twistyPlayer: TwistyPlayer): void {
  setupPropCheckbox(
    "visualization-3D",
    twistyPlayer.experimentalModel.visualizationFormatProp,
    "PG3D",
    "2D",
  );
  setupPropCheckbox(
    "back-view-side-by-side",
    twistyPlayer.experimentalModel.backViewProp,
    "side-by-side",
    "top-right",
  );
  setupPropCheckbox(
    "foundation-display-opaque",
    twistyPlayer.experimentalModel.foundationDisplayProp,
    "opaque",
    "none",
  );
  setupPropCheckbox(
    "hint-facelets-floating",
    twistyPlayer.experimentalModel.hintFaceletProp,
    "floating",
    "none",
  );
}
