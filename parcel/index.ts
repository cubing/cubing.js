import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085

import {algToString, invert, parse} from "../alg";
import {debugKeyboardConnect, KeyboardPuzzle} from "../bluetooth";
import {Twisty} from "../twisty";

function asyncSetup(twisty: Twisty): void {
  console.log("asyncSetup");
  debugKeyboardConnect(twisty.element).then((keyboard: KeyboardPuzzle): void => {
    console.log("keyboard", twisty, keyboard);
    keyboard.addMoveListener(console.log);
  });
}

console.log(algToString(invert(parse("R U R' F D"))));
window.addEventListener("load", () => {
  const twistyElem = document.createElement("twisty");
  const twisty = new Twisty(twistyElem);
  document.body.appendChild(twisty.element);

  asyncSetup(twisty);
});
