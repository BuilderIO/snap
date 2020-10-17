import {} from 'fs-extra-promise';
import glob from 'glob-promise';
import webpack from 'webpack';
import config from '../webpack.config';
import { promisify } from 'util';
import * as path from 'path';
import { last, flatMap, join } from 'lodash';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

var VirtualModulesPlugin = require('webpack-virtual-modules');

const cwd = process.cwd();

export async function build() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const pages = await glob('pages/**/*');

  const pageNames = pages.map((item) => last(item.split('.')[0].split('/')));

  const compiler = webpack([
    merge(config({ target: 'server' }), {
      entry: join(__dirname, '../document'),
      output: {
        path: path.join(cwd, 'dist/server.js'),
      },
      plugins: [
        new VirtualModulesPlugin({
          _router: `
            import { Route } from 'solid-router';
            export function Router() {

              return <>
                ${pageNames
                  .map((pageName, index) => {
                    return `<Route path="/${pageName}" component={require('${pages[index]}')}`;
                  })
                  .join('\n')}
              </>;
            }
            `,
        }),
      ],
    }),
    ...pages.map((pagePath, index) => {
      const pageName = pageNames[index];
      return merge(config({ target: 'browser' }), {
        ...config(),
        target: 'node',
        // TODO: this needs to have hydrate(document.getElementById('app), () => <App />)
        entry: join(__dirname, '../app'),
        output: {
          filename: path.join(pagePath.split('.')[0], 'server.js'),
        },
        plugins: [
          new VirtualModulesPlugin({
            _router: `
            import { Route, SolidRouter, ContextProvider } from 'solid-router';
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
                        : `createComponent(lazy(() => import('${pages[thisIndex]}')))`
                    }} />`;
                  })
                  .join('\n')}
              </>;
            }
            `,
          }),
        ],
      });
    }),
  ]);

  const run = promisify(compiler.run.bind(compiler));
  const stats = await run();
  console.log(stats?.toString({}));
}
