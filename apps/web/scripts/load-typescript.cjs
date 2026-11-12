const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const ts = require("typescript");

// Small test/inspection loader using the workspace's existing TypeScript, with explicit mocks.
exports.createLoader = function createLoader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const nativeRequire = createRequire(filename);
    const module = { exports: {} }; cache.set(filename, module);
    function requireModule(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      let resolved;
      if (id.startsWith(".")) {
        const base = path.resolve(path.dirname(filename), id);
        resolved = [base, base + ".ts", base + ".tsx", path.join(base, "index.ts")].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      }
      resolved ||= nativeRequire.resolve(id);
      return /\.tsx?$/.test(resolved) ? load(resolved) : nativeRequire(id);
    }
    const source = fs.readFileSync(filename, "utf8").replaceAll("import.meta.url", JSON.stringify(require("node:url").pathToFileURL(filename).href));
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    vm.runInThisContext(`(function(require,module,exports,__filename,__dirname){${code}\n})`, { filename })(requireModule, module, module.exports, filename, path.dirname(filename));
    return module.exports;
  }
  return load;
};
