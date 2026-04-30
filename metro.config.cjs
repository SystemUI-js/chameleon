const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = process.cwd();

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot, {
  isCSSEnabled: true,
});

// On web, alias react-native to our custom DOM shim that correctly maps
// className / onClick / onBlur / onKeyDown / role / testID to DOM attributes.
// The stock react-native-web Pressable/View/Text do not forward these props,
// which breaks theme class application and interactive controls (CSelect etc.).
config.resolver = config.resolver || {};
config.resolver.alias = {
  ...config.resolver.alias,
  // react-native$ (trailing $) = exact match, avoids also aliasing
  // sub-paths like react-native/Libraries/*/...
  'react-native$': path.resolve(projectRoot, 'src/runtime/react-native-web.tsx'),
};

module.exports = config;
