"use strict";

var js = require("@eslint/js");
var n = require("eslint-plugin-n");
var prettier = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  n.configs["flat/recommended-script"],
  prettier,
  {
    languageOptions: { ecmaVersion: 5 },
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  {
    // tests only run on the Node versions used for development and CI
    files: ["index.spec.js"],
    settings: { n: { version: ">=22" } },
  },
];
