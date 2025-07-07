const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.web.js',
  devtool: 'cheap-module-source-map',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
    library: {
      type: 'module',
    },
    environment: {
      module: true,
    },
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'react-native$': 'react-native-web',
      // Disable mobile-only packages
      'react-native-track-player': false,
      'react-native-document-picker': false,
      'react-native-permissions': false,
      'react-native-fs': false,
      'react-native-gesture-handler': 'react-native-web',
      'react-native-reanimated': 'react-native-web/dist/exports/Animated',
      'react-native-safe-area-context': 'react-native-web',
      'react-native-screens': 'react-native-web',
    },
    fullySpecified: false,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native|@react-native|react-native-.*|@react-navigation)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: 'defaults',
                modules: false
              }],
              ['@babel/preset-react', {
                runtime: 'automatic'
              }],
              '@babel/preset-typescript'
            ],
          },
        },
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource',
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body',
      scriptLoading: 'defer'
    }),
  ],
  devServer: {
    port: 5000,
    hot: true,
    host: '0.0.0.0',
    allowedHosts: 'all',
    historyApiFallback: true,
  },
};