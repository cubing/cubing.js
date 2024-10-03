export type PuzzleDescriptionString = string;

export const PGPuzzles: { [name: string]: PuzzleDescriptionString } = {
  "2x2x2": "c f 0",
  "3x3x3": "c f 0.333333333333333",
  "4x4x4": "c f 0.5 f 0",
  "5x5x5": "c f 0.6 f 0.2",
  "6x6x6": "c f 0.666666666666667 f 0.333333333333333 f 0",
  "7x7x7": "c f 0.714285714285714 f 0.428571428571429 f 0.142857142857143",
  "8x8x8": "c f 0.75 f 0.5 f 0.25 f 0",
  "9x9x9":
    "c f 0.777777777777778 f 0.555555555555556 f 0.333333333333333 f 0.111111111111111",
  "10x10x10": "c f 0.8 f 0.6 f 0.4 f 0.2 f 0",
  "11x11x11":
    "c f 0.818181818181818 f 0.636363636363636 f 0.454545454545455 f 0.272727272727273 f 0.0909090909090909",
  "12x12x12":
    "c f 0.833333333333333 f 0.666666666666667 f 0.5 f 0.333333333333333 f 0.166666666666667 f 0",
  "13x13x13":
    "c f 0.846153846153846 f 0.692307692307692 f 0.538461538461538 f 0.384615384615385 f 0.230769230769231 f 0.0769230769230769",
  "20x20x20": "c f 0 f .1 f .2 f .3 f .4 f .5 f .6 f .7 f .8 f .9",
  "30x30x30":
    "c f 0 f .066667 f .133333 f .2 f .266667 f .333333 f .4 f .466667 f .533333 f .6 f .666667 f .733333 f .8 f .866667 f .933333",
  "40x40x40":
    "c f 0 f .05 f .1 f .15 f .2 f .25 f .3 f .35 f .4 f .45 f .5 f .55 f .6 f .65 f .7 f .75 f .8 f .85 f .9 f .95",
  skewb: "c v 0",
  "master skewb": "c v 0.275",
  "professor skewb": "c v 0 v 0.38",
  "compy cube": "c v 0.915641442663986",
  helicopter: "c e 0.707106781186547",
  "curvy copter": "c e 0.83",
  dino: "c v 0.577350269189626",
  "little chop": "c e 0",
  pyramorphix: "t e 0",
  mastermorphix: "t e 0.346184634065199",
  pyraminx: "t v 0.333333333333333 v 1.66666666666667",
  tetraminx: "t v 0.333333333333333",
  "master pyraminx": "t v 0 v 1 v 2",
  "master tetraminx": "t v 0 v 1",
  "professor pyraminx": "t v -0.2 v 0.6 v 1.4 v 2.2",
  "professor tetraminx": "t v -0.2 v 0.6 v 1.4",
  "royal pyraminx":
    "t v -0.333333333333333 v 0.333333333333333 v 1 v 1.66666666666667 v 2.33333333333333",
  "royal tetraminx":
    "t v -0.333333333333333 v 0.333333333333333 v 1 v 1.66666666666667",
  "emperor pyraminx":
    "t v -0.428571428571429 v 0.142857142857143 v 0.714285714285714 v 1.28571428571429 v 1.85714285714286 v 2.42857142857143",
  "emperor tetraminx":
    "t v -0.428571428571429 v 0.142857142857143 v 0.714285714285714 v 1.28571428571429 v 1.85714285714286",
  "Jing pyraminx": "t f 0",
  "master pyramorphix": "t e 0.866025403784437",
  megaminx: "d f 0.7",
  gigaminx: "d f 0.64 f 0.82",
  teraminx: "d f 0.64 f 0.76 f 0.88",
  petaminx: "d f 0.64 f 0.73 f 0.82 f 0.91",
  examinx: "d f 0.64 f 0.712 f 0.784 f 0.856 f 0.928",
  zetaminx: "d f 0.64 f 0.7 f 0.76 f 0.82 f 0.88 f 0.94",
  yottaminx: "d f 0.64 f 0.6914 f 0.7429 f 0.7943 f 0.8457 f 0.8971 f 0.9486",
  pentultimate: "d f 0",
  "master pentultimate": "d f 0.1",
  "elite pentultimate": "d f 0 f 0.145905",
  // exact value for starminx is sqrt(5(5-2 sqrt(5))/3)
  starminx: "d v 0.937962370425399",
  "starminx 2": "d f 0.23606797749979",
  "pyraminx crystal": "d f 0.447213595499989",
  chopasaurus: "d v 0",
  "big chop": "d e 0",
  "skewb diamond": "o f 0",
  FTO: "o f 0.333333333333333",
  "master FTO": "o f 0.5 f 0",
  "Christopher's jewel": "o v 0.577350269189626",
  octastar: "o e 0",
  "Trajber's octahedron": "o v 0.433012701892219",
  "radio chop": "i f 0",
  icosamate: "i v 0",
  "Regular Astrominx": "i v 0.18759247376021",
  "Regular Astrominx + Big Chop": "i v 0.18759247376021 e 0",
  Redicosahedron: "i v 0.794654472291766",
  "Redicosahedron with centers": "i v 0.84",
  Icosaminx: "i v 0.73",
  "Eitan's star": "i f 0.61803398874989",
  "2x2x2 + dino": "c f 0 v 0.577350269189626",
  "2x2x2 + little chop": "c f 0 e 0",
  "dino + little chop": "c v 0.577350269189626 e 0",
  "2x2x2 + dino + little chop": "c f 0 v 0.577350269189626 e 0",
  "megaminx + chopasaurus": "d f 0.61803398875 v 0",
  "starminx combo": "d f 0.23606797749979 v 0.937962370425399",
};

export const legacyPuzzleNameMapping: Partial<Record<string, string>> = {
  "icosahedron 2": "Regular Astrominx",
  "icosahedron 3": "Regular Astrominx + Big Chop",
  "icosahedron static faces": "Redicosahedron with centers",
  "icosahedron moving faces": "Icosaminx",
};

export type PuzzleName = keyof typeof PGPuzzles;
