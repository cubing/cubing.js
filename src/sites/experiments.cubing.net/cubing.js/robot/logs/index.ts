// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../../../cubing/alg";
import { normalize } from "./normalize";

const ROBOT_SENT_PREFIX = "robot-sent-";
const ROBOT_RECORDED_PREFIX = "robot-recorded-";

function setSession(session: string): void {
  const sentText: string = localStorage[`${ROBOT_SENT_PREFIX}${session}`];
  const receivedText: string =
    localStorage[`${ROBOT_RECORDED_PREFIX}${session}`];
  (document.querySelector("#left") as HTMLTextAreaElement).value = sentText;
  (document.querySelector("#right") as HTMLTextAreaElement).value =
    receivedText;

  (document.querySelector("#left-normalized") as HTMLTextAreaElement).value =
    new Alg(normalize(Alg.fromString(sentText))).toString();

  (document.querySelector("#right-normalized") as HTMLTextAreaElement).value =
    new Alg(normalize(Alg.fromString(receivedText))).toString();
}

let sessions: string[] = [];
for (const key of Object.keys(localStorage)) {
  if (key.startsWith(ROBOT_SENT_PREFIX)) {
    sessions.push(key.slice(ROBOT_SENT_PREFIX.length));
  }
}
sessions = sessions.sort();

const select = document.querySelector("select") as HTMLSelectElement;
for (const session of sessions) {
  const option = select.appendChild(document.createElement("option"));
  option.textContent = session;
  option.value = session;
}
select.addEventListener("change", () => {
  setSession(select.value);
});
if (sessions.length > 0) {
  setSession(sessions[0]);
}
