import { BlockMove } from "../../alg";
import { Cursor } from "../cursor";
interface Event {
    timeStamp: Cursor.Timestamp;
    move: BlockMove;
}
export interface TimelineEntry {
    event: Event;
    start: Cursor.Timestamp;
    end: Cursor.Timestamp;
}
declare type Timeline = TimelineEntry[];
export declare function toAxes(events: Event[], diameterMs: Cursor.Duration): TimelineEntry[][];
export declare function toTimeline(events: Event[], diameterMs?: number): Timeline;
export {};
//# sourceMappingURL=timeline.d.ts.map