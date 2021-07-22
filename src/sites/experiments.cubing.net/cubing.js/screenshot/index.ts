import { TwistyPlayer } from "../../../../cubing/twisty";

window.addEventListener("DOMContentLoaded", () => {
  const options = JSON.parse(
    new URL(location.href).searchParams.get("options") || "{}",
  );
  document.body.appendChild(new TwistyPlayer(options));
});
