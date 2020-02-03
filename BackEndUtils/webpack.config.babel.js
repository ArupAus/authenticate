import path from 'path'
import webpack from 'webpack'

var nodeExternals = require('webpack-node-externals');

const ROOT = path.resolve(__dirname)
const SRC = path.join(ROOT, 'BackEndUtils')
const DIST = path.join(ROOT, '../lib')
const NODE_MODULES = path.join(ROOT, 'node_modules')

let config = {
  entry: [
    './BackEndUtils/index.js'
  ],

  output: {
    path: DIST,
    filename: './AuthUtils.js',
    library: 'authenticate',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()]
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
              test: /\.js$/,
              include: SRC,
              loader: 'babel-loader',
            }
          ]
        }
      }
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
