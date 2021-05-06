import { Alg, algCubingNetLink } from "../../../cubing/alg";
import {
  BluetoothPuzzle,
  connectSmartPuzzle,
  debugKeyboardConnect,
  GoCube,
  MoveEvent,
  OrientationEvent,
} from "../../../cubing/bluetooth";
import { ProxyEvent, WebSocketProxySender } from "../../../cubing/stream";
import {
  experimentalShowRenderStats,
  Twisty3DCanvas,
  Twisty3DPuzzle,
} from "../../../cubing/twisty";
import { useNewFaceNames } from "../../../cubing/puzzle-geometry";
import "regenerator-runtime/runtime";
// @ts-ignore
import bluetoothSVG from "./bluetooth.svg";
// @ts-ignore
import clearSVG from "./clear.svg";
import { Action, SwipeyPuzzle } from "./input/SwipeyPuzzle";
import {
  DEFAULT_PUZZLE_ID,
  getPuzzleID,
  PuzzleID,
  sendingSocketOrigin,
  receivingSocketOrigin,
  coalesce,
  debugShowRenderStats,
} from "./url-params";
import { CallbackProxyReceiver } from "./websocket-proxy";
import type { Quaternion } from "three";
import type { AlgCubingNetOptions } from "../../../cubing/alg";

useNewFaceNames(true);

experimentalShowRenderStats(debugShowRenderStats());
// experimentalShowJumpingFlash(false); // TODO

let trackingOrientation: boolean = false;
let bluetoothPuzzle: BluetoothPuzzle | null = null;
// let callbackProxyReceiver: CallbackProxyReceiver | null = null;
let sender: WebSocketProxySender | null = null;

function puzzleName(puzzleID: PuzzleID): string {
  const puzzleNameMap: Record<string, string> = {
    megaminx: "Megaminx",
  };
  return puzzleNameMap[puzzleID] ?? puzzleID;
}

function maybeCoalesce(alg: Alg): Alg {
  return coalesce() ? alg.simplify() : alg;
}

const fn = async (
  fromMouse: boolean,
  fromKeyboard: boolean,
  e: KeyboardEvent,
) => {
  if (!fromMouse && fromKeyboard) {
    if (e?.which && e.which !== 32) {
      return;
    }
  }

  const twizzleLogo = document.querySelector("#twizzle-logo")!;
  twizzleLogo.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 200,
    easing: "ease-in",
  }).onfinish = () => {
    document.body.removeChild(twizzleLogo);
  };
  twizzleLogo.classList.add("faded-away");

  const swipeWrapper = document.createElement("div");
  swipeWrapper.classList.add("swipe-wrapper");
  document.body.appendChild(swipeWrapper);

  const controlBar = document.createElement("div");
  controlBar.classList.add("control-bar");
  swipeWrapper.appendChild(controlBar);

  function moveListener(e: MoveEvent) {
    // TODO: This is a total hack. Needs to be pushed down into the keyboard map.
    if (getPuzzleID() !== "3x3x3") {
      // TODO: allmoves
      switch (e.latestMove.family) {
        // case "x":
        //   // TODO: distinguish between Rv and Lv
        //   e.latestMove = modifiedBlockMove(e.latestMove, {
        //     family: "Rv"
        //   })
        //   break;
        case "y":
          e.latestMove = e.latestMove.modified({
            family: "Uv",
          });
          break;
        // case "z":
        //   // TODO: map this to a corner turn for FTO
        //   e.latestMove = modifiedBlockMove(e.latestMove, {
        //     family: "Fv"
        //   })
        //   break;
      }
    }
    swipeyPuzzle.addMove(e.latestMove);

    if (sender) {
      sender.sendMoveEvent(e);
    }

    updateAlgLink();
  }

  const clearButton = document.createElement("button");
  const clearIcon = document.createElement("img");
  clearIcon.src = clearSVG;
  clearButton.appendChild(clearIcon);
  controlBar.appendChild(clearButton);
  clearButton.addEventListener("click", space);

  function toLink(alg: Alg): string {
    const url = new URL("https://experiments.cubing.net/cubing.js/twizzle/");
    const puzzleID = getPuzzleID();
    if (puzzleID === "3x3x3") {
      const opts: AlgCubingNetOptions = {
        alg: alg,
      };
      const setup = swipeyPuzzle.twistyPlayer.experimentalSetupAlg;
      if (!setup.experimentalIsEmpty()) {
        opts.setup = setup;
      }
      return algCubingNetLink(opts);
    } else {
      url.searchParams.set("puzzle", puzzleID);
      url.searchParams.set("alg", alg.toString());
      return url.toString();
    }
  }

  const algLink = document.createElement("a");
  const instructions =
    fromKeyboard || fromMouse ? "Type to add moves" : "Swipe to add moves.";
  algLink.textContent = instructions;
  controlBar.appendChild(algLink);
  function updateAlgLink(): void {
    const seq = maybeCoalesce(swipeyPuzzle.twistyPlayer.alg);
    const alg = seq.toString();
    if (alg === "") {
      algLink.textContent = instructions;
      algLink.removeAttribute("href");
    } else {
      algLink.textContent = alg;
      algLink.href = toLink(seq);
    }
  }

  const bluetoothButton = document.createElement("button");
  const bluetoothIcon = document.createElement("img");
  bluetoothIcon.src = bluetoothSVG;
  bluetoothButton.appendChild(bluetoothIcon);
  controlBar.appendChild(bluetoothButton);

  function resetCamera() {
    if (trackingOrientation) {
      (swipeyPuzzle.twistyPlayer
        .viewerElems[0] as Twisty3DCanvas).camera.position.set(0, 4, 5);
    }
  }

  function orientationEventListener(event: OrientationEvent): void {
    if (!trackingOrientation) {
      // First orientation event.
      trackingOrientation = true;
      resetCamera();
    }
    swipeyPuzzle.twistyPlayer.scene!.twisty3Ds.forEach(
      (twisty3DPuzzle: Twisty3DPuzzle) => {
        twisty3DPuzzle.quaternion.copy(event.quaternion as Quaternion); // TODO
      },
    );
    // TODO: expose a way to scheduler renders on objects.
    (swipeyPuzzle.twistyPlayer.timeline as any).dispatchTimestamp(); // TODO

    if (sender) {
      sender.sendOrientationEvent(event);
    }
  }

  bluetoothButton.addEventListener("click", async () => {
    try {
      bluetoothPuzzle = await connectSmartPuzzle();
      bluetoothPuzzle.addMoveListener(moveListener);
      bluetoothButton.style.display = "none";
      bluetoothPuzzle?.addOrientationListener(orientationEventListener);
    } finally {
      swipeyPuzzle.twistyPlayer.blur();
    }
  });
  if (!navigator.bluetooth) {
    bluetoothButton.style.display = "none";
  }

  swipeWrapper.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 200,
    easing: "ease-in",
  });
  swipeWrapper.appendChild(swipeyPuzzle);

  if (!fromKeyboard && !fromMouse) {
    swipeyPuzzle.showGrid();
  }

  const kbp = await debugKeyboardConnect(document.body);
  kbp.addMoveListener(moveListener);

  window.removeEventListener("keydown", keyboardCallback);
  document.body.removeEventListener("mousedown", mouseCallback);
  document.body.removeEventListener("touchstart", swipeCallback);

  function space() {
    resetCamera();
    swipeyPuzzle.twistyPlayer.alg = new Alg();
    updateAlgLink();

    if (sender) {
      console.log("resetting!");
      sender.sendResetEvent();
    }

    if ((bluetoothPuzzle as GoCube)?.resetOrientation) {
      (bluetoothPuzzle as GoCube)?.resetOrientation();
    }
    clearButton.blur();
  }

  function enter() {
    const seq = maybeCoalesce(swipeyPuzzle.twistyPlayer.alg);
    const a = document.createElement("a");
    a.href = toLink(seq);
    a.click();
  }

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.which === 32) {
      space();
    }
    if (e.which === 13) {
      enter();
    }
  });

  swipeyPuzzle.setActionListener((action: Action) => {
    switch (action) {
      case "space":
        space();
        break;
      case "enter":
        enter();
        break;
    }
  });

  swipeyPuzzle.setAlgListener(updateAlgLink);

  document.addEventListener("copy", (e) => {
    const seq = maybeCoalesce(swipeyPuzzle.twistyPlayer.alg); // TODO
    const alg = seq.toString();
    e.clipboardData!.setData("text/plain", alg);

    const a = document.createElement("a");
    a.href = toLink(seq);
    a.textContent = alg;
    const html = new XMLSerializer().serializeToString(a);
    e.clipboardData!.setData("text/html", html);

    e.preventDefault();
  });

  if (fromKeyboard) {
    e?.preventDefault();
  }

  const receivingOrigin = receivingSocketOrigin();
  if (receivingOrigin) {
    console.log("Registering receiver");
    const url = new URL(receivingOrigin);
    url.pathname = "/register-receiver";
    new CallbackProxyReceiver(url.toString(), (e: ProxyEvent) => {
      console.log(e);
      switch (e.event) {
        case "move":
          moveListener(e.data);
          break;
        case "orientation":
          orientationEventListener(e.data);
          break;
        case "reset":
          space();
          break;
      }
    });
  }

  const sendingOrigin = sendingSocketOrigin();
  if (sendingOrigin) {
    console.log("Registering senter");
    const url = new URL(sendingOrigin);
    url.pathname = "/register-sender";
    sender = new WebSocketProxySender(url.toString());
  }
};

const keyboardCallback = fn.bind(fn, false, true);
const mouseCallback = fn.bind(fn, true, false);
const swipeCallback = fn.bind(fn, false, false);

window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("keydown", keyboardCallback);
  document.body.addEventListener("mousedown", mouseCallback);
  document.body.addEventListener("touchstart", swipeCallback);

  let go = new URL(document.location.href).searchParams.get("go");
  switch (go) {
    case "keyboard":
      keyboardCallback();
      break;
    case "swipe":
      swipeCallback();
      break;
  }

  if (getPuzzleID() !== DEFAULT_PUZZLE_ID) {
    document.title = `Twizzle | ${puzzleName(getPuzzleID())}`;
  }
});

// Initialize ahead of time so that it can render more quickly.
const swipeyPuzzle = new SwipeyPuzzle(
  getPuzzleID(),
  () => {},
  () => {},
);
