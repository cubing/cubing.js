import type { TwistyPlayer } from "../../../cubing/twisty";

// TODO: Consolidate
export function setup3DCheckbox(
  domID: string,
  twistyPlayer: TwistyPlayer,
): void {
  const elem = document.getElementById(domID) as HTMLInputElement;
  twistyPlayer.experimentalModel.visualizationFormatProp.addFreshListener(
    (visualizationFormat) => {
      elem.checked = !["2D"].includes(visualizationFormat);
    },
  );
  elem.addEventListener("change", () => {
    console.log("change", elem.checked);
    twistyPlayer.visualization = elem.checked ? "PG3D" : "2D";
  });
}

// TODO: Consolidate
export function setupSideBySideCheckbox(
  domID: string,
  twistyPlayer: TwistyPlayer,
): void {
  const elem = document.getElementById(domID) as HTMLInputElement;
  twistyPlayer.experimentalModel.backViewProp.addFreshListener(
    (backViewLayout) => {
      elem.checked = !["top-right"].includes(backViewLayout);
    },
  );
  elem.addEventListener("change", () => {
    twistyPlayer.backView = elem.checked ? "side-by-side" : "top-right";
  });
}

// TODO: Consolidate
export function setupFoundationDisplayCheckbox(
  domID: string,
  twistyPlayer: TwistyPlayer,
): void {
  const elem = document.getElementById(domID) as HTMLInputElement;
  twistyPlayer.experimentalModel.foundationDisplayProp.addFreshListener(
    (foundationDisplay) => {
      elem.checked = !["none"].includes(foundationDisplay);
    },
  );
  elem.addEventListener("change", () => {
    twistyPlayer.experimentalModel.foundationDisplayProp.set(
      elem.checked ? "opaque" : "none",
    );
  });
}

// TODO: Consolidate
export function setupHintFaceletsCheckbox(
  domID: string,
  twistyPlayer: TwistyPlayer,
): void {
  const elem = document.getElementById(domID) as HTMLInputElement;
  twistyPlayer.experimentalModel.hintFaceletProp.addFreshListener(
    (hintFaceletStyle) => {
      elem.checked = !["none"].includes(hintFaceletStyle);
    },
  );
  elem.addEventListener("change", () => {
    twistyPlayer.hintFacelets = elem.checked ? "floating" : "none";
  });
}
