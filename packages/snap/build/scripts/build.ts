import glob from 'glob-promise';
import webpack from 'webpack';
import config from '../webpack.config';
import { promisify } from 'util';
import * as path from 'path';
import { last } from 'lodash';
import { merge } from 'webpack-merge';
import { Configuration } from 'webpack';
import { readFileSync } from 'fs-extra-promise';
const VirtualModulesPlugin = require('webpack-virtual-modules');

const cwd = process.cwd();

export async function build() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const pages = await glob('pages/**/*');

  const pageNames = pages.map((item) => last(item.split('.')[0].split('/')));

  const routerContents = `
    import { Route, SolidRouter } from '@builder.io/snap/router';
    export function Router() {

      return <SolidRouter>
        ${pageNames
          .map((pageName, index) => {
            return `<Route path="/${pageName}" component={createComponent(require('./${pages[index]}').default, {})}`;
          })
          .join('\n')}
      </SolidRouter>;
    }
  `;

  console.log({ routerContents });

  const configs: Configuration[] = [
    merge(config({ target: 'server' }), {
      entry: './_entry.tsx',
      target: 'node',
      output: {
        filename: 'server.js',
        libraryTarget: 'commonjs',
      },
      plugins: [
        new VirtualModulesPlugin({
          './_router.tsx': routerContents,
          './_entry.tsx': readFileSync(
            path.join(__dirname, '../../../lib/document.tsx'),
          ),
          './app.tsx': readFileSync(path.join(__dirname, '../../../lib/app.tsx')),
        }),
      ],
    }),
    ...pages.map((pagePath, index) => {
      const pageName = pageNames[index];
      const pageRouterContents = `
        import { Route, SolidRouter, ContextProvider } from '@builder.io/snap/router';
        import { lazy, Suspense, createComponent } from 'solid-js';
        import Main from './pages/${pageName}';

        export function Router() {

          // TODO: 404
          return <SolidRouter>
            ${pageNames
              .map((pageName, thisIndex) => {
                return `<Route path="/${pageName}" component={${
                  thisIndex === index
                    ? '<Main />'
                    : `createComponent(lazy(() => import('./${pages[thisIndex]}')))`
                }} />`;
              })
              .join('\n')}
          </SolidRouter>;
        }
        `;

      return merge(config({ target: 'browser' }), {
        // TODO: this needs to have hydrate(document.getElementById('app), () => <App />)
        entry: './_entry.tsx',
        output: {
          path: path.join(process.cwd(), 'dist', pagePath.split('.')[0]),
        },
        plugins: [
          new VirtualModulesPlugin({
            './_router.tsx': pageRouterContents,
            './_entry.tsx': readFileSync(
              path.join(__dirname, '../../../lib/app.tsx'),
            ),
          }),
        ],
      });
    }),
  ];

  const compiler = webpack(configs);

  const run = promisify(compiler.run.bind(compiler));
  const stats = await run();
  console.log(stats?.toString({}));
}
