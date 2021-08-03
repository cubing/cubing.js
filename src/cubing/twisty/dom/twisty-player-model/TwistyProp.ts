// TODO: add stale marker?
export class TwistyProp extends EventTarget {
  dispatch() {
    this.dispatchEvent(new CustomEvent("update"));
  }
}
