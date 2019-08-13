import path from 'path'
import webpack from 'webpack'

var nodeExternals = require('webpack-node-externals');

const ROOT = path.resolve(__dirname)
const SRC = path.join(ROOT, 'BackEndUtils')
const DIST = path.join(ROOT, '../lib')
const NODE_MODULES = path.join(ROOT, 'node_modules')

export default env => {
  const moduleRules = [
    {
      test: /\.js$/,
      include: SRC,
      loader: 'babel-loader',
    }
  ]

  return {
    entry: [
      './BackEndUtils/index.js'
    ],
    devtool: 'source-map',
    output: {
      path: DIST,
      filename: './AuthUtils.js',
      library: 'authenticate',
      libraryTarget: 'commonjs2'
    },
    module: {
      rules: moduleRules,
    },
    mode: env === 'prod' ? 'production' : 'development',
    externals: [nodeExternals()]
  }
}
