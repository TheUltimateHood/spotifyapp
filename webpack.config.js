const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './test-simple.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-vector-icons': 'react-native-vector-icons/dist',
      'react-native-reanimated': path.resolve(__dirname, 'node_modules/react-native-reanimated/lib/module/index.js'),
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native|@react-native|react-native-.*|@react-navigation)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@react-native/babel-preset'],
            plugins: ['react-native-reanimated/plugin']
          }
        }
      },
      {
        test: /\.ttf$/,
        loader: 'url-loader',
        include: path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  devServer: {
    port: 5000,
    hot: true,
    open: false,
    host: '0.0.0.0',
    historyApiFallback: true
  }
};