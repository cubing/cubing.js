import { BlockMove } from "../../alg";
import { algPartToStringForTesting, experimentalBlockMoveQuarterName } from "../../alg/traversal";
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

type Timeline = TimelineEntry[];

function isSameAxis(move1: BlockMove, move2: BlockMove): boolean {
  const familyRoots = move1.family[0].toLowerCase() + move2.family[0].toLowerCase();
  // console.log(familyRoots);
  return ["uu", "ud", "du", "dd", "ll", "lr", "rl", "rr", "ff", "fb", "bf", "bb"].indexOf(familyRoots) !== -1;
}

export function toAxes(events: Event[], diameterMs: Cursor.Duration): TimelineEntry[][] {
  const axes: TimelineEntry[][] = [];
  const axisMoveTracker = new Map();
  let lastEntry: TimelineEntry | null = null;
  for (const event of events) {
    if (!lastEntry) {
      lastEntry = {
        event,
        start: event.timeStamp - diameterMs / 2,
        end: event.timeStamp + diameterMs / 2,
      };
      axes.push([lastEntry]);
      axisMoveTracker.set(experimentalBlockMoveQuarterName(lastEntry.event.move), lastEntry);
      continue;
    }
    const newEntry: TimelineEntry = {
      event,
      start: event.timeStamp - diameterMs / 2,
      end: event.timeStamp + diameterMs / 2,
    };
    if (isSameAxis(lastEntry.event.move, event.move)) {
      const quarterName = experimentalBlockMoveQuarterName(newEntry.event.move);
      console.log(quarterName);
      const prev = axisMoveTracker.get(quarterName);
      console.log("prev", prev);
      if (prev && prev.end > newEntry.start && Math.sign(prev.event.move.amount) === Math.sign(newEntry.event.move.amount)) {
        prev.event.move = new BlockMove(prev.event.move.outerLayer, prev.event.move.innerLayer, prev.event.move.family, prev.event.move.amount + newEntry.event.move.amount);
      } else {
        axes[axes.length - 1].push(newEntry);
        axisMoveTracker.set(quarterName, newEntry);
      }
    } else {
      console.log("--", algPartToStringForTesting(newEntry.event.move));
      axes.push([newEntry]);
      axisMoveTracker.clear();
      axisMoveTracker.set(experimentalBlockMoveQuarterName(newEntry.event.move), newEntry);
      if (newEntry.start < lastEntry.end) {
        const midpoint = (newEntry.start + lastEntry.end) / 2;
        newEntry.start = midpoint;
        lastEntry.end = midpoint;
      }
    }
    lastEntry = newEntry;
  }
  return axes;
}

// TODO: turn into an optional param
const defaultDiameterMs: Cursor.Duration = 200;

export function toTimeline(events: Event[], diameterMs: number = defaultDiameterMs): Timeline {
  const axes: TimelineEntry[][] = toAxes(events, diameterMs);
  console.log(axes);
  return axes.flat();
}
