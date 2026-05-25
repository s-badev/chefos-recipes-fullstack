const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
const mobileNodeModules = path.resolve(projectRoot, "node_modules");
const rootNodeModules = path.resolve(workspaceRoot, "node_modules");

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  mobileNodeModules,
  rootNodeModules
];

function resolveFromMobileOrRoot(moduleName) {
  try {
    return require.resolve(moduleName, {
      paths: [mobileNodeModules, rootNodeModules]
    });
  } catch {
    return require.resolve(moduleName);
  }
}

function resolvePackageJson(packageName) {
  return resolveFromMobileOrRoot(`${packageName}/package.json`);
}

function resolvePackageRoot(packageName) {
  return path.dirname(resolvePackageJson(packageName));
}

function readPackageVersion(packageName) {
  return require(resolvePackageJson(packageName)).version;
}

function assertExactPackageVersion(packageName, expectedVersion) {
  const actualVersion = readPackageVersion(packageName);

  if (actualVersion !== expectedVersion) {
    throw new Error(
      `Expected ${packageName}@${expectedVersion} for Expo mobile, but resolved ${actualVersion}.`
    );
  }
}

function assertPackageVersionPrefix(packageName, expectedPrefix) {
  const actualVersion = readPackageVersion(packageName);

  if (!actualVersion.startsWith(expectedPrefix)) {
    throw new Error(
      `Expected ${packageName}@${expectedPrefix}x for Expo mobile, but resolved ${actualVersion}.`
    );
  }
}

assertExactPackageVersion("react", "18.2.0");
assertExactPackageVersion("react-dom", "18.2.0");
assertPackageVersionPrefix("react-native-web", "0.19.");
assertPackageVersionPrefix("@expo/metro-runtime", "3.2.");

const runtimeModuleFiles = {
  react: resolveFromMobileOrRoot("react"),
  "react/jsx-runtime": resolveFromMobileOrRoot("react/jsx-runtime"),
  "react/jsx-dev-runtime": resolveFromMobileOrRoot("react/jsx-dev-runtime"),
  "react-dom": resolveFromMobileOrRoot("react-dom"),
  "react-dom/client": resolveFromMobileOrRoot("react-dom/client"),
  "react-native-web": resolveFromMobileOrRoot("react-native-web"),
  "@expo/metro-runtime": resolveFromMobileOrRoot("@expo/metro-runtime")
};

config.resolver.disableHierarchicalLookup = false;
config.resolver.extraNodeModules = {
  react: resolvePackageRoot("react"),
  "react/jsx-runtime": runtimeModuleFiles["react/jsx-runtime"],
  "react/jsx-dev-runtime": runtimeModuleFiles["react/jsx-dev-runtime"],
  "react-dom": resolvePackageRoot("react-dom"),
  "react-dom/client": runtimeModuleFiles["react-dom/client"],
  "react-native-web": resolvePackageRoot("react-native-web"),
  "@expo/metro-runtime": resolvePackageRoot("@expo/metro-runtime")
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const filePath = runtimeModuleFiles[moduleName];

  if (filePath) {
    return {
      type: "sourceFile",
      filePath
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
