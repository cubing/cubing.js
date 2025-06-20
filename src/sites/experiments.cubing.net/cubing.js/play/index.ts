import { Alg, Move } from "../../../../cubing/alg";
import {
  type BluetoothPuzzle,
  connectSmartPuzzle,
  debugKeyboardConnect,
  type GoCube,
  type OrientationEvent,
} from "../../../../cubing/bluetooth";
import type { AlgLeafEvent } from "../../../../cubing/bluetooth/smart-puzzle/bluetooth-puzzle";
import {
  type ExperimentalProxyEvent,
  ExperimentalWebSocketProxySender,
} from "../../../../cubing/stream";
import { setTwistyDebug } from "../../../../cubing/twisty";
import { type Action, SwipeyPuzzle } from "./input/SwipeyPuzzle";
import {
  DEFAULT_PUZZLE_ID,
  debugShowRenderStats,
  getPuzzleID,
  getStickering,
  getTempoScale,
  getVisualizationFormat,
  type PuzzleID,
  receivingSocketOrigin,
  sendingSocketOrigin,
} from "./url-params";
import { CallbackProxyReceiver } from "./websocket-proxy";

const bluetoothSVG = new URL("./bluetooth.svg", import.meta.url).toString();
const clearSVG = new URL("./clear.svg", import.meta.url).toString();

setTwistyDebug({ showRenderStats: debugShowRenderStats() });
// experimentalShowJumpingFlash(false); // TODO

let trackingOrientation: boolean = false;
let bluetoothPuzzle: BluetoothPuzzle | null = null;
// let callbackProxyReceiver: CallbackProxyReceiver | null = null;
let sender: ExperimentalWebSocketProxySender | null = null;

function puzzleName(puzzleID: PuzzleID): string {
  const puzzleNameMap: Record<string, string> = {
    megaminx: "Megaminx",
  };
  return puzzleNameMap[puzzleID] ?? puzzleID;
}

const fn = async (
  fromMouse: boolean,
  fromKeyboard: boolean,
  e?: KeyboardEvent,
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

  function algLeafListener(e: AlgLeafEvent) {
    // TODO: This is a total hack. Needs to be pushed down into the keyboard map.
    if (getPuzzleID() !== "3x3x3") {
      const move = e.latestAlgLeaf.as(Move);
      if (move) {
        // TODO: allmoves
        switch (move.family) {
          // case "x":
          //   // TODO: distinguish between Rv and Lv
          //   e.latestAlgLeaf = modifiedBlockMove(e.latestAlgLeaf, {
          //     family: "Rv"
          //   })
          //   break;
          case "y": {
            e = { ...e }; // Copy
            e.latestAlgLeaf = move.modified({
              family: "Uv",
            });
            break;
          }
          // case "z":
          //   // TODO: map this to a corner turn for FTO
          //   e.latestAlgLeaf = modifiedBlockMove(e.latestAlgLeaf, {
          //     family: "Fv"
          //   })
          //   break;
        }
      }
    }
    swipeyPuzzle.addAlgLeaf(e.latestAlgLeaf);

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

  // function toLink(alg: Alg): string {
  //   const url = new URL("../edit/", import.meta.url);
  //   const puzzleID = getPuzzleID();
  //   if (puzzleID === "3x3x3") {
  //     const opts: AlgCubingNetOptions = {
  //       alg: alg,
  //     };
  //     /// TODO
  //     // const setup = swipeyPuzzle.twistyPlayer.experimentalSetupAlg;
  //     // if (!setup.experimentalIsEmpty()) {
  //     //   opts.setup = setup;
  //     // }
  //     return algCubingNetLink(opts);
  //   } else {
  //     url.searchParams.set("puzzle", puzzleID);
  //     url.searchParams.set("alg", alg.toString());
  //     return url.toString();
  //   }
  // }

  const algLink = document.createElement("a");
  const instructions =
    fromKeyboard || fromMouse ? "Type to add moves" : "Swipe to add moves.";
  algLink.textContent = instructions;
  controlBar.appendChild(algLink);
  async function updateAlgLink(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    const alg = await swipeyPuzzle.twistyPlayer.experimentalGet.alg();
    if (alg.experimentalIsEmpty()) {
      algLink.textContent = instructions;
      algLink.removeAttribute("href");
    } else {
      algLink.textContent = alg.toString();
      algLink.href =
        await swipeyPuzzle.twistyPlayer.experimentalModel.twizzleLink();
    }
  }

  const bluetoothButton = document.createElement("button");
  const bluetoothIcon = document.createElement("img");
  bluetoothIcon.src = bluetoothSVG;
  bluetoothButton.appendChild(bluetoothIcon);
  controlBar.appendChild(bluetoothButton);

  function resetCamera() {
    if (trackingOrientation) {
      // TODO
    }
  }

  function orientationEventListener(event: OrientationEvent): void {
    if (!trackingOrientation) {
      // First orientation event.
      trackingOrientation = true;
      resetCamera();
    }
    // TODO
    // swipeyPuzzle.twistyPlayer.scene!.twisty3Ds.forEach(
    //   (twisty3DPuzzle: Twisty3DPuzzle) => {
    //     twisty3DPuzzle.quaternion.copy(event.quaternion as Quaternion); // TODO
    //   },
    // );
    // // TODO: expose a way to scheduler renders on objects.
    // (swipeyPuzzle.twistyPlayer.timeline as any).dispatchTimestamp(); // TODO

    if (sender) {
      sender.sendOrientationEvent(event);
    }
  }

  bluetoothButton.addEventListener("click", async () => {
    try {
      bluetoothPuzzle = await connectSmartPuzzle();
      bluetoothPuzzle.addAlgLeafListener(algLeafListener);
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

  if (!(fromKeyboard || fromMouse)) {
    swipeyPuzzle.showGrid();
  }

  const kbp = await debugKeyboardConnect(document.body, getPuzzleID());
  kbp.addAlgLeafListener(algLeafListener);

  window.removeEventListener("keydown", keyboardCallback);
  document.body.removeEventListener(
    "mousedown",
    mouseCallback as any as EventListener,
  ); // TODO: https://github.com/microsoft/TypeScript/issues/28357
  document.body.removeEventListener(
    "touchstart",
    swipeCallback as any as EventListener,
  ); // TODO: https://github.com/microsoft/TypeScript/issues/28357

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

  function backspace() {
    swipeyPuzzle.twistyPlayer.experimentalRemoveFinalChild();
    updateAlgLink();
  }

  async function enter() {
    const url = await swipeyPuzzle.twistyPlayer.experimentalModel.twizzleLink();
    // const seq = maybeCoalesce(swipeyPuzzle.twistyPlayer.alg);
    const a = document.createElement("a");
    a.href = url;
    a.click();
  }

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.which === 32) {
      space();
    }
    if (e.which === 13) {
      enter();
    }
    if (e.code === "Backspace") {
      backspace();
    }
  });

  swipeyPuzzle.setActionListener((action: Action) => {
    switch (action) {
      case "space": {
        space();
        break;
      }
      case "enter": {
        enter();
        break;
      }
      case "backspace": {
        backspace();
        break;
      }
    }
  });

  swipeyPuzzle.setAlgListener(updateAlgLink);

  document.addEventListener("copy", async (e) => {
    const alg = await swipeyPuzzle.twistyPlayer.experimentalGet.alg(); // TODO
    e.clipboardData!.setData("text/plain", alg.toString());

    const a = document.createElement("a");
    a.href = await swipeyPuzzle.twistyPlayer.experimentalModel.twizzleLink();
    a.textContent = alg.toString();
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
    new CallbackProxyReceiver(url.toString(), (e: ExperimentalProxyEvent) => {
      console.log(e);
      switch (e.event) {
        case "move": {
          algLeafListener(e.data);
          break;
        }
        case "orientation": {
          orientationEventListener(e.data);
          break;
        }
        case "reset": {
          space();
          break;
        }
      }
    });
  }

  const sendingOrigin = sendingSocketOrigin();
  if (sendingOrigin) {
    console.log("Registering sender…");
    const url = new URL(sendingOrigin);
    url.pathname = "/register-sender";
    sender = new ExperimentalWebSocketProxySender(url.toString());
  }
};

const keyboardCallback = fn.bind(fn, false, true);
const mouseCallback = fn.bind(fn, true, false);
const swipeCallback = fn.bind(fn, false, false);

window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("keydown", keyboardCallback);
  document.body.addEventListener(
    "mousedown",
    mouseCallback as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
  );
  document.body.addEventListener(
    "touchstart",
    swipeCallback as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
  );

  const go = new URL(document.location.href).searchParams.get("go");
  switch (go) {
    case "keyboard": {
      keyboardCallback();
      break;
    }
    case "swipe": {
      swipeCallback();
      break;
    }
  }

  if (getPuzzleID() !== DEFAULT_PUZZLE_ID) {
    document.title = `Twizzle | ${puzzleName(getPuzzleID())}`;
  }
});

// Initialize ahead of time so that it can render more quickly.
const swipeyPuzzle = new SwipeyPuzzle(
  getPuzzleID(),
  getVisualizationFormat(),
  getStickering(),
  getTempoScale(),
  () => {
    /* */
  },
  () => {
    /* */
  },
);
