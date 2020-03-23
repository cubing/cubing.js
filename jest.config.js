module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.js$": "babel-jest",
    "^.+\\.ts$": "ts-jest",
    "^.+\\.pegjs$": "pegjs-jest",
    "\\.svg$": "jest-raw-loader"
  },
}
