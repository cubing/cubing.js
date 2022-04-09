// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../../cubing/alg";
import { KPuzzle } from "../../../../cubing/kpuzzle";
import { cube3x3x3KPuzzleDefinition } from "../../../../cubing/kpuzzle/3x3x3/3x3x3.kpuzzle.json";
import "../../../../cubing/twisty";

const AnySpeechRecognition = webkitSpeechRecognition;
const AnySpeechGrammarList = webkitSpeechGrammarList;
// const AnySpeechRecognitionEvent = webkitSpeechRecognitionEvent;

const colors = "ULFRBDxyzMES".split("");
const grammar =
  "#JSGF V1.0; grammar colors; public <color> = " + colors.join(" | ") + " ;";

const recognition = new AnySpeechRecognition();
const speechRecognitionList = new AnySpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 10;

document.body.onclick = function () {
  recognition.start();
  console.log("Ready to receive a color command.");
};

const kpuzzle = new KPuzzle(cube3x3x3KPuzzleDefinition);
const player = document.querySelector("twisty-player")!;

recognition.onresult = function (event) {
  const latestResult = event.results.item(event.results.length - 1);
  for (const alternative of Array.from(latestResult)) {
    let transcript = alternative.transcript.trim().toUpperCase();
    console.log(alternative);
    transcript = transcript
      .replace("YOU", "U")
      .replace(" PRIME", "'")
      .replace(" TWO", "2")
      .replace(" TO", "2")
      .replace("WHY", "Y")
      .replace("ALL", "Y")
      .replace("EL", "Y");
    switch (transcript) {
      case "UNDO":
        player.experimentalModel.alg.set(
          (async () => {
            const alg = (await player.experimentalModel.alg.get()).alg;
            const units = Array.from(alg.units());
            return new Alg(units.slice(0, units.length - 1));
          })(),
        );
        break;
      case "CLEAR":
        player.alg = "";
        break;
    }
    transcript = transcript
      .replace("X", "x")
      .replace("Y", "y")
      .replace("Z", "z");
    try {
      kpuzzle.moveToTransformation(transcript);
      player.experimentalAddMove(transcript);
      break;
    } catch (e) {
      // ignore
    }
  }
  console.log(latestResult);

  const color = event.results[0][0].transcript;
  console.log(color);
  console.log("Confidence: " + event.results[0][0].confidence);
};

recognition.onspeechend = function () {
  recognition.stop();
};

recognition.onnomatch = function (_event: SpeechRecognitionEvent) {
  // diagnostic.textContent = "I didn't recognise that color.";
};

recognition.onerror = function (_event: Event) {
  // diagnostic.textContent = "Error occurred in recognition: " + event.error;
};
