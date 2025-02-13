const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Ignore source-map-loader warnings for @mediapipe
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        resolve: {
          fullySpecified: false,
        },
      });

      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            ...webpackConfig.resolve.fallback,
            stream: require.resolve('stream-browserify'),
            process: require.resolve('process/browser'),
          },
        },
        plugins: [
          ...webpackConfig.plugins,
          new webpack.ProvidePlugin({
            process: 'process/browser',
          }),
        ],
        ignoreWarnings: [
          // Ignore source map warnings from @mediapipe
          function ignoreSourcemapsloaderWarnings(warning) {
            return (
              warning.module &&
              (warning.module.resource.includes('@mediapipe') ||
               warning.module.resource.includes('3dmol')) &&
              warning.details &&
              warning.details.includes('source-map-loader')
            );
          },
        ],
      };
    },
  },
};
