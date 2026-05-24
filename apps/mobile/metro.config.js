const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];

config.resolver.disableHierarchicalLookup = false;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mobileRuntimeModules = new Map([
    ["react", require.resolve("react", { paths: [projectRoot] })],
    ["react/jsx-runtime", require.resolve("react/jsx-runtime", { paths: [projectRoot] })],
    ["react/jsx-dev-runtime", require.resolve("react/jsx-dev-runtime", { paths: [projectRoot] })],
    ["react-dom", require.resolve("react-dom", { paths: [projectRoot] })]
  ]);
  const filePath = mobileRuntimeModules.get(moduleName);

  if (filePath) {
    return {
      type: "sourceFile",
      filePath
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
