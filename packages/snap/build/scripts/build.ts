import {} from 'fs-extra-promise';
import glob from 'glob-promise';
import webpack from 'webpack';
import config from '../webpack.config';
import { promisify } from 'util';
import * as path from 'path';
import { last } from 'lodash';

const cwd = process.cwd();

// Generate code?

export async function build() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const pages = await glob('pages/**/*');

  const compiler = webpack(
    pages.map((pagePath) => ({
      ...config(),
      entry: pagePath,
      output: {
        path: path.join(cwd, 'dist', pagePath.split('.')[0]),
      },
      alias: {
        router: `
          export default function AppRouter() {
            return <Router>
              ${pages
                .map(
                  (pagePath) =>
                    `<Route path=${last(
                      pagePath.split('.')[0].split('/'),
                    )} component={lazy(() => import('${pagePath}'))}>`,
                )
                .join('\n')}
            </Router>
          }
        `,
      },
    })),
  );

  const run = promisify(compiler.run.bind(compiler));
  const stats = await run();
  console.log(stats?.toString({}));
}
