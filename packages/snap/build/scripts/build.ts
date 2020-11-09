import glob from 'glob-promise';
import webpack from 'webpack';
import config from '../webpack.config';
import { promisify } from 'util';
import * as path from 'path';
import { last } from 'lodash';
import { merge } from 'webpack-merge';
import { Configuration } from 'webpack';
import { readFileAsync, copyAsync } from 'fs-extra-promise';
const VirtualModulesPlugin = require('webpack-virtual-modules');

const cwd = process.cwd();

export async function build() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const pages = await glob('pages/**/*');

  const pageNames = pages.map((item) => last(item.split('.')[0].split('/')));

  const serverRouterContents = `
    import { Route, Router as SolidRouter } from '@snap.js/core/router';
    import { createComponent } from 'solid-js/server';
    
    export function Router() {
      return (<SolidRouter>
        ${pageNames
          .map((pageName, index) => {
            return `<Route path="/${pageName}" component={createComponent(require('./${pages[index]}').default, {})} />`;
          })
          .join('\n')}
      </SolidRouter>);
    }
  `;

  const browserRouterContents = `
    import { Route, Router as SolidRouter, ContextProvider } from '@snap.js/core/router';
    import { lazy, Suspense, createComponent } from 'solid-js/dom';

    export function Router() {

      // TODO: 404
      return (<SolidRouter>
        ${pageNames
          .map((pageName, thisIndex) => {
            return `<Route path="/${pageName}" component={createComponent(lazy(() => import('./${pages[thisIndex]}')))} />`;
          })
          .join('\n')}
      </SolidRouter>);
    }
  `;

  const configs: Configuration[] = [
    merge(config({ target: 'server' }), {
      entry: './_entry.tsx',
      target: 'node',
      output: {
        filename: 'server.js',
        libraryTarget: 'commonjs',
      },
      externals: /^[^\.]/,
      plugins: [
        new VirtualModulesPlugin({
          './_router.tsx': serverRouterContents,
          './_entry.tsx': await readFileAsync(
            path.join(__dirname, '../../../lib/document.tsx'),
            'utf8',
          ),
          './app.tsx': await readFileAsync(
            path.join(__dirname, '../../../lib/app.tsx'),
            'utf8',
          ),
        }),
      ],
    }),
    merge(config({ target: 'browser' }), {
      // TODO: this needs to have
      entry: './_entry.tsx',
      output: {
        path: 'browser',
      },

      plugins: [
        new VirtualModulesPlugin({
          './_router.tsx': browserRouterContents,
          './_entry.tsx': `
            import { App } from './app';
            import { hydrate } from 'solid-js/dom';
            hydrate(document.getElementById('app), () => <App />)
          `,
          './app.tsx': await readFileAsync(
            path.join(__dirname, '../../../lib/app.tsx'),
            'utf8',
          ),
        }),
      ],
    }),
  ];

  const compiler = webpack(configs);

  const run = promisify(compiler.run.bind(compiler));

  const copyPromise = copyAsync('public', 'dist');

  const stats = await run();
  console.log(stats?.toString({}));

  await copyPromise;
}
