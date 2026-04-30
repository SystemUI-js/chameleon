module.exports = function babelConfig(api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo', { disableFlowStripTypesTransform: true }]],
    plugins: [
      ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
          extensions: [
            '.ios.ts',
            '.ios.tsx',
            '.android.ts',
            '.android.tsx',
            '.web.ts',
            '.web.tsx',
            '.ts',
            '.tsx',
            '.js',
            '.jsx',
            '.json',
          ],
        },
      ],
    ],
  };
};
