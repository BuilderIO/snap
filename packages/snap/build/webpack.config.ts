import { Configuration } from 'webpack';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import * as path from 'path';
const solid = require('babel-preset-solid');
const ts = require('@babel/preset-typescript');
const env = require('@babel/preset-env');
const TerserPlugin = require('terser-webpack-plugin');

type Options = {
  env?: 'development' | 'production';
  target?: 'server' | 'browser';
};


const config = (
  options: Options = {},
  { mode = 'none' }: Configuration = {},
): Configuration => ({
  mode,
  devtool: mode === 'development' ? 'inline-source-map' : false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: [new TsconfigPathsPlugin({})],
  },
  resolveLoader: { modules: [path.join(__dirname, '../../node_modules')] },
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
            [
              solid,
              {
                hydratable: true,
                generate: options.target === 'server' ? 'ssr' : 'dom',
              },
            ],
            ts,
            [
              env,
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
