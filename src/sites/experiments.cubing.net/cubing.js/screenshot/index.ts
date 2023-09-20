import { TwistyPlayer } from "../../../../cubing/twisty";

window.addEventListener("DOMContentLoaded", async () => {
  const options = JSON.parse(
    new URL(location.href).searchParams.get("options") || "{}",
  );
  const twistyPlayer = new TwistyPlayer({
    experimentalInitialHintFaceletsAnimation: "none",
    ...options,
  });
  const screenshot = await twistyPlayer.experimentalScreenshot({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const img = document.createElement("img");
  img.id = "screenshot";
  img.src = screenshot;

  document.body.appendChild(img);
});
