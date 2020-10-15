import {} from 'fs-extra-promise';
import glob from 'glob-promise';
import webpack from 'webpack';
import config from '../webpack.config';
import { promisify } from 'util';
import * as path from 'path';

const cwd = process.cwd();

// Generate code?

export async function build() {
  const pages = await glob('pages/**/*');

  const compiler = webpack(
    pages.map((pagePath) => ({
      ...config(),
      entry: pagePath,
      output: {
        path: path.join(cwd, 'dist', pagePath.split('.')[0]),
      },
    })),
  );

  const run = promisify(compiler.run.bind(compiler));
  const stats = await run();
  console.log(stats?.toString());
}
