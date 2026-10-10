"use strict";

// Run by `npm version`: moves the unreleased changes under the new version.
var fs = require("fs");

var file = "CHANGELOG.md";
var heading = "## [Unreleased]";
var content = fs.readFileSync(file, "utf8");
if (content.indexOf(heading) === -1) {
  throw new Error("missing " + heading + " in " + file);
}

var date = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  file,
  content.replace(
    heading,
    heading + "\n\n## [" + process.env.npm_package_version + "] - " + date
  )
);
