export function parseoptions(
  argv: string[],
  optionlist: Array<string | boolean | number | Array<string>>,
): number {
  let argp = 0;
  while (argp < argv.length && argv[argp][0] === "-") {
    const option = argv[argp++];
    if (option === "--rotations") {
      optionlist.push("rotations", true);
    } else if (option === "--allmoves") {
      optionlist.push("allmoves", true);
    } else if (option === "--outerblockmoves") {
      optionlist.push("outerblockmoves", true);
    } else if (option === "--vertexmoves") {
      optionlist.push("vertexmoves", true);
    } else if (option === "--nocorners") {
      optionlist.push("cornersets", false);
    } else if (option === "--noedges") {
      optionlist.push("edgesets", false);
    } else if (option === "--noorientation") {
      optionlist.push("killorientation", true);
    } else if (option === "--nocenters") {
      optionlist.push("centersets", false);
    } else if (option === "--omit") {
      optionlist.push("omit", argv[argp].split(","));
      argp++;
    } else if (option === "--moves") {
      optionlist.push("movelist", argv[argp].split(","));
      argp++;
    } else if (option === "--optimize") {
      optionlist.push("optimize", true);
    } else if (option === "--scramble") {
      optionlist.push("scramble", 100);
    } else if (option === "--fixcorner") {
      optionlist.push("fix", "v");
    } else if (option === "--fixedge") {
      optionlist.push("fix", "e");
    } else if (option === "--fixcenter") {
      optionlist.push("fix", "f");
    } else if (option === "--orientcenters") {
      optionlist.push("orientcenters", true);
    } else if (option === "--puzzleorientation") {
      optionlist.push("puzzleorientation", argv[argp]);
      argp++;
    } else {
      throw new Error("Bad option: " + option);
    }
  }
  return argp;
}
