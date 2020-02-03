import path from 'path'
import webpack from 'webpack'

const ROOT = path.resolve(__dirname)
const SRC = path.join(ROOT, 'src')
const DIST = path.join(ROOT, 'lib')
const NODE_MODULES = path.join(ROOT, 'node_modules')

let config = {
  entry: [
    './src/index.js'
  ],
  devtool: 'source-map',
  resolve: {
    alias: {
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
      react: path.resolve(__dirname, 'node_modules', 'react')
    },
  },
  output: {
    path: DIST,
    filename: 'index.js',
    library: 'authenticate',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: SRC,
      loader: 'babel-loader',
    }],
  },
  //mode: env === 'prod' ? 'production' : 'development',
  node: {
    fs: "empty",
    tls: "empty",
    net: "empty"
  }
}

export default (env, argv) => {
  if (argv.mode === 'development') {
    config = {
      ...config,
      ...{
        mode: 'development',
        devtool: 'inline-source-map',
        module: {
          rules: [
            {
              test: /\.(js|jsx)$/,
              include: SRC,
              loader: require.resolve('babel-loader'),
              options: {
                cacheDirectory: true,
                plugins: ['react-hot-loader/babel'],
              },
            },
          ]
        },
        plugins: [
          ...config.plugins,
          ...[
            new webpack.NoEmitOnErrorsPlugin(),
          ],
        ],
      },
    }
  }

  if (argv.mode === 'production') {
    config = {
      ...config,
      ...{
        mode: 'production',
        plugins: [
          ...config.plugins,
          ...[new webpack.optimize.ModuleConcatenationPlugin()],
        ],
        optimization: {
          splitChunks: {
            cacheGroups: {
              defaultVendors: {
                filename: '[name].bundle.js'
              },
              commons: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
            },
          },
          minimize: true,
          minimizer: [
            new TerserPlugin({
              cache: true,
              parallel: true,
              sourceMap: false,
              terserOptions: {
                ie8: false,
                safari10: false,
              },
            }),
          ],
        },
      },
    }
  }
  return config
}
