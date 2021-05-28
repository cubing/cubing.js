// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyPlayer } from "../../../cubing/twisty";
import { AlgTracker } from "../../../cubing/twisty/dom/AlgTracker";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");
console.log(new TwistyPlayer());

const algTracker = new AlgTracker();
document.body.appendChild(algTracker);

const algTracker2 = new AlgTracker();
document.body.appendChild(algTracker2);
