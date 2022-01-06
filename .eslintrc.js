module.exports = {
  extends: [
    // standard configuration
    "standard",

    // https://github.com/mysticatea/eslint-plugin-node#-rules
    "plugin:node/recommended",

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

    // uncomment if you are using a builder like Babel
    // "node/no-unsupported-features/es-syntax": "off",
  },
};
