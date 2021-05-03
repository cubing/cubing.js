import { Move, QuantumMove } from "../../cubing/alg";
import type { StreamMessageEvent } from "./stream-types";

class TwizzleStream extends EventTarget {
  socket: WebSocket;
  constructor(url: string) {
    super();
    this.socket = new WebSocket(url);
    this.socket.onmessage = this.onMessage.bind(this); // TODO: Can we "add a listener instead"?
  }

  onMessage(msg: MessageEvent): void {
    try {
      const json: StreamMessageEvent = JSON.parse(msg.data);
      if (json.event === "move") {
        const move = json.data.latestMove;
        if (move.type !== "blockMove") {
          throw new Error("Invalid move!");
        }
        this.dispatchEvent(
          new CustomEvent("move", {
            detail: {
              move: new Move(new QuantumMove(move.family), move.amount),
            },
          }),
        );
      }
    } catch (e) {
      console.error("Could not handle message:", e);
    }
  }
}

export class TwizzleStreamServer {
  async streams(): Promise<
    {
      streamID: string;
      senders: { name: string; twizzleUserID: string; wcaID: string | null }[];
    }[]
  > {
    return (await (await fetch("https://api.twizzle.net/v0/streams")).json())
      .streams;
  }

  connect(streamID: string): TwizzleStream {
    return new TwizzleStream(
      `wss://api.twizzle.net/v0/streams/${streamID}/socket`,
    );
  }
}
