import {} from 'fs-extra-promise';
import glob from 'glob-promise';
import webpack from 'webpack';
import config from '../webpack.config';
import { promisify } from 'util';
import * as path from 'path';
import { last, flatMap } from 'lodash';
import { Configuration } from 'webpack';

const cwd = process.cwd();

// Generate code?

export async function build() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const pages = await glob('pages/**/*');

  const compiler = webpack(
    flatMap(pages, (pagePath) => {
      const configs: Configuration[] = [
        {
          ...config(),
          entry: pagePath,
          output: {
            path: path.join(cwd, 'dist', pagePath.split('.')[0]),
          },
        },
        {
          ...config(),
          target: 'node',
          entry: pagePath,
          output: {
            filename: path.join(pagePath.split('.')[0], 'server.js'),
          },
        },
      ];
      return configs;
    }),
  );

  const run = promisify(compiler.run.bind(compiler));
  const stats = await run();
  console.log(stats?.toString({}));
}
