import {} from 'fs-extra-promise';
import glob from 'glob-promise';
import webpack from 'webpack';
import config from '../webpack.config';
import { promisify } from 'util';

const cwd = process.cwd();

// Generate code?

export async function build() {
  const pages = await glob('pages/**/*');

  const compiler = webpack(
    pages.map((path) => ({
      ...config(),
      entry: path,
      output: {
        filename: path + '.js',
      },
    })),
  );

  const run = promisify(compiler.run.bind(compiler));
  const result = await run();
}
