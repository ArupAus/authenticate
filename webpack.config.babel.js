import path from 'path'
import webpack from 'webpack'

const ROOT = path.resolve(__dirname)
const SRC = path.join(ROOT, 'src')
const DIST = path.join(ROOT, 'lib')
const NODE_MODULES = path.join(ROOT, 'node_modules')

export default env => {
  const moduleRules = [
    {
      test: /\.js$/,
      include: SRC,
      loader: 'babel-loader',
    }
  ]
  if (env === 'dev') {
    moduleRules.push({
      test: /\.(js|jsx)$/,
      include: SRC,
      loader: require.resolve('babel-loader'),
      options: {
        cacheDirectory: true,
        plugins: ['react-hot-loader/babel'],
      },
    })
  }

  return {
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
      rules: moduleRules,
    },
    mode: env === 'prod' ? 'production' : 'development',
    node: {
     fs: "empty",
     tls: "empty",
     net: "empty"
   }
  }
}
