// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../../cubing/alg";
import { KPuzzle } from "../../../../cubing/kpuzzle";
import { experimentalCube3x3x3KPuzzleDefinition } from "../../../../cubing/puzzles/cubing-private";
import "../../../../cubing/twisty";

const AnySpeechRecognition = webkitSpeechRecognition;
const AnySpeechGrammarList = webkitSpeechGrammarList;
// const AnySpeechRecognitionEvent = webkitSpeechRecognitionEvent;

const colors = "ULFRBDxyzMES".split("");
const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(
  " | ",
)} ;`;

const recognition = new AnySpeechRecognition();
const speechRecognitionList = new AnySpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 10;

document.body.onclick = () => {
  recognition.start();
  console.log("Ready to receive a color command.");
};

const kpuzzle = new KPuzzle(experimentalCube3x3x3KPuzzleDefinition);
const player = document.querySelector("twisty-player")!;
const alternativeListElem = document.querySelector("alternative-list")!;

recognition.onresult = (event) => {
  const latestResult = event.results.item(event.results.length - 1);
  alternativeListElem.textContent =
    "Raw alternatives: " +
    Array.from(latestResult)
      .map((alternative) => alternative.transcript)
      .join(" / ");
  for (const alternative of Array.from(latestResult)) {
    let transcript = alternative.transcript.trim().toUpperCase();
    console.log(alternative);
    transcript = transcript
      .replace("YOUTUBE", "U2")
      .replace("YOU", "U")
      .replace(" PRIME", "'")
      .replace(" WIDE", "w")
      .replace(" TWO", "2")
      .replace(" TO", "2")
      .replace("WHY", "Y")
      .replace("DEEP", "D")
      .replace("DEE", "D")
      .replace("ARE", "R")
      .replace("OUR", "R")
      .replace("ALL", "L")
      .replace("EL", "L")
      .replace("WHITE", "WIDE")
      .replace("WHY DO", "WIDE")
      .replace("WHY ARE", "WIDE R");
    switch (transcript) {
      case "UNDO": {
        player.experimentalModel.alg.set(
          (async () => {
            const alg = (await player.experimentalModel.alg.get()).alg;
            const algNode = Array.from(alg.childAlgNodes());
            return new Alg(algNode.slice(0, algNode.length - 1));
          })(),
        );
        return;
      }
      case "CLEAR": {
        player.alg = "";
        return;
      }
      case "MEGAMINX":
      case "PYRAMINX":
      case "FTO": {
        player.puzzle = transcript.toLowerCase() as any;
        return;
      }
      case "START": {
        player.timestamp = "start";
        return;
      }
      case "PLAY": {
        player.play();
        return;
      }
      case "TWIZZLE": {
        player.controller.visitTwizzleLink();
        return;
      }
      case "FAST": {
        player.tempoScale = 5;
        return;
      }
      case "SLOW": {
        player.tempoScale = 1;
        return;
      }
    }
    transcript = transcript
      .replace("X", "x")
      .replace("Y", "y")
      .replace("Z", "z")
      .replace("WIDE U", "Uw")
      .replace("WIDE F", "Fw")
      .replace("WIDE L", "Lw")
      .replace("WIDE R", "Rw")
      .replace("WIDE B", "Bw")
      .replace("WIDE D", "Dw");
    try {
      kpuzzle.moveToTransformation(transcript);
      player.experimentalAddMove(transcript);
      break;
    } catch {
      // ignore
    }
  }
  console.log(latestResult);

  const color = event.results[0][0].transcript;
  console.log(color);
  console.log(`Confidence: ${event.results[0][0].confidence}`);
};

recognition.onspeechend = () => {
  recognition.stop();
};

recognition.onnomatch = (_event: SpeechRecognitionEvent) => {
  // diagnostic.textContent = "I didn't recognise that color.";
};

recognition.onerror = (_event: Event) => {
  // diagnostic.textContent = "Error occurred in recognition: " + event.error;
};
