const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = process.cwd();

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot, {
  isCSSEnabled: true,
});

config.resolver = config.resolver || {};

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'src/runtime/react-native-web.tsx'),
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
