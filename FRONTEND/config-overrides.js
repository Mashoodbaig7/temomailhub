const webpack = require('webpack');

module.exports = function override(config, env) {
  // Fix for Webpack 5 and ESM modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    assert: require.resolve('assert'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser.js'),
    stream: require.resolve('stream-browserify'),
    url: require.resolve('url'),
    util: require.resolve('util'),
    zlib: require.resolve('browserify-zlib'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    crypto: false,
    fs: false,
    net: false,
    tls: false,
    child_process: false,
  };
  
  // Add extensions for proper resolution
  config.resolve.extensions = [
    ...config.resolve.extensions,
    '.js',
    '.mjs',
  ];
  
  // Disable fullySpecified for .mjs files
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });
  
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];
  
  config.ignoreWarnings = [/Failed to parse source map/];
  
  return config;
};
