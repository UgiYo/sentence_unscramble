const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function createElementStub() {
  return {
    append() {},
    setAttribute() {},
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    classList: {
      remove() {},
    },
    style: {},
  };
}

const sandbox = {
  console,
  navigator: { clipboard: { writeText() {} } },
  window: {
    print() {},
    setTimeout() {},
  },
  document: {
    querySelector() {
      return createElementStub();
    },
    createElement: createElementStub,
    createDocumentFragment: createElementStub,
  },
  Number,
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("script.js", "utf8"), sandbox);

const result = sandbox.buildQuestion("The weather is nice today.", 1);

assert.equal(result.scrambled, "is / today. / The / nice / weather");
assert.equal(result.blankQuestion, "_____ _____ _____ _____ _____");
