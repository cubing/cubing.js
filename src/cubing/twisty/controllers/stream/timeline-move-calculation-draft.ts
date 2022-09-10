import { Move, QuantumMove } from "../../../alg";
import type { Duration, Timestamp } from "../AnimationTypes";

interface Event {
  timeStamp: Timestamp;
  move: Move;
}

export interface TimelineEntry {
  event: Event;
  start: Timestamp;
  end: Timestamp;
}

type Timeline = TimelineEntry[];

function isSameAxis(move1: Move, move2: Move): boolean {
  const familyRoots =
    move1.family[0].toLowerCase() + move2.family[0].toLowerCase();
  // console.log(familyRoots);
  return ![
    "uu",
    "ud",
    "du",
    "dd",
    "ll",
    "lr",
    "rl",
    "rr",
    "ff",
    "fb",
    "bf",
    "bb",
  ].includes(familyRoots);
}

export function toAxes(
  events: Event[],
  diameterMs: Duration,
): TimelineEntry[][] {
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
      axisMoveTracker.set(lastEntry.event.move.quantum.toString(), lastEntry);
      continue;
    }
    const newEntry: TimelineEntry = {
      event,
      start: event.timeStamp - diameterMs / 2,
      end: event.timeStamp + diameterMs / 2,
    };
    if (isSameAxis(lastEntry.event.move, event.move)) {
      const quarterName = newEntry.event.move.quantum.toString();
      // console.log(quarterName);
      const prev = axisMoveTracker.get(quarterName);
      // console.log("prev", prev);
      if (
        prev &&
        prev.end > newEntry.start &&
        Math.sign(prev.event.move.amount) ===
          Math.sign(newEntry.event.move.amount)
      ) {
        prev.event.move = new Move(
          new QuantumMove(
            prev.event.move.family,
            prev.event.move.innerLayer,
            prev.event.move.outerLayer,
          ),
          (prev.event.move.amount as number) + newEntry.event.move.amount,
        );
      } else {
        axes[axes.length - 1].push(newEntry);
        axisMoveTracker.set(quarterName, newEntry);
      }
    } else {
      // console.log("--", algPartToStringForTesting(newEntry.event.move));
      axes.push([newEntry]);
      axisMoveTracker.clear();
      axisMoveTracker.set(newEntry.event.move.quantum.toString(), newEntry);
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
const defaultDiameterMs: Duration = 200;

export function toTimeline(
  events: Event[],
  diameterMs: number = defaultDiameterMs,
): Timeline {
  const axes: TimelineEntry[][] = toAxes(events, diameterMs);
  // console.log(axes);
  return axes.flat();
}
/*

Input: list of {move: {base, amount}}, centerTime} events sorted by centerTime of halfway through "quarter" turns.
Output list of {move, centerTime, start, end}
Options:
  - radius # milliseconds
  - maxImbalance # maximum ratio of (centerTime - end)/(centerTime - start)

eventsToTimeline(events):
  frontier = empty set # only needed for performance, not correctness
  for e of events:
    add event to timeline with range {start: e.centerTime - radius, end: e.centerTime + radius}
    for each event d of the frontier:
      if d.base === e.base && sign(d.amount) === sign(e.amount): # d and e have the same base move in the same direction:
        coalesce(d, e)
        continue outer loop
      if d.end > e.start and conflicts(d, e):
        d.end   = min(e.end, (d.centerTime + e.centerTime) / 2)
        e.start = max(e.end, (d.centerTime + e.centerTime) / 2)
        remove d from the frontier
      if d.centerTime < e.centerTime - radius
        drop d from the frontier # optimization: too old to overlap with future events
    e.end = min(e.end, e.centerTime + maxImbalance * (e.centerTime - e.start))
    add e to the frontier

coalesce(d, e):
  {
    start: d.start
    centerTime: weighted_avg(
      d.centerTime with weight abs(d.amount)
      e.centerTime with weight abs(e.amount)
    )
    end: e.end
  }

conflicts(d, e):
  if d.base === e.base && sign(d.amount) !== sign(e.amount):
    return true
  # else, depends on the puzzle

Thoughts:
- Alternative to max imbalance: animate first and second part separately?
- Fingertrick mode: allow an optional overlap amount between any two conflicting moves (possibly depending on the moves)

Properties:
- An event's start time will never change after it is added.
- An event might take up less time than it "can".
  - i.e. its start and/or end time could be extended after the algorithm finishes, without overlapping with conflicting moves.
  - This is an acceptable compromise for simplicity.
- As written, moves are only removed from the frontier opportunistically. This shouldn't be a problem.

*/
