const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
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
      };
    },
  },
};
