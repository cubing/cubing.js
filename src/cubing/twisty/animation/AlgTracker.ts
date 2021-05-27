// TODO: see if this can replace AlgCursor?

import { Alg } from "../../alg";
import { ManagedCustomElement } from "../dom/element/ManagedCustomElement";

export class AlgTracker extends ManagedCustomElement {
  #alg: Alg = new Alg();
  #textarea: HTMLTextAreaElement = document.createElement("textarea");

  constructor() {
    super();
    this.addElement(this.#textarea);
  }
}
