import { Configuration } from 'webpack';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
const TerserPlugin = require('terser-webpack-plugin');

const config = (
  _env: unknown,
  { mode = 'none' }: Configuration,
): Configuration => ({
  mode,
  devtool: mode === 'development' ? 'inline-source-map' : false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: [new TsconfigPathsPlugin({})],
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: 'file-loader',
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            'solid',
            '@babel/preset-typescript',
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'entry',
                corejs: '3.0.0',
              },
            ],
          ],
        },
      },
    ],
  },
  plugins: [
    ...(mode === 'development'
      ? [new ForkTsCheckerWebpackPlugin()]
      : [new CleanWebpackPlugin()]),
  ],
  optimization: {
    minimizer: [...(mode === 'development' ? [] : [new TerserPlugin()])],
  },
});

export default config;
