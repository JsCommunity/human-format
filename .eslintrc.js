"use strict";

module.exports = {
  extends: [
    // standard configuration
    "standard",

    // https://github.com/mysticatea/eslint-plugin-n#-rules
    "plugin:n/recommended",

    // disable rules handled by prettier
    "prettier",
  ],

  parserOptions: {
    ecmaVersion: 5,
    sourceType: "script",
  },

  reportUnusedDisableDirectives: true,

  rules: {
    "no-var": "off",
    "object-shorthand": "off",

    // uncomment if you are using a builder like Babel
    // "n/no-unsupported-features/es-syntax": "off",
  },
};
