Object.assign(global, {
  globalThis: global,
  isSSR: global,
});

import glob from 'glob-promise';
import { join } from 'path';
import { last } from 'lodash';
import { server } from '../../lib/server';
import { extractCss } from 'goober';
import { Router } from 'solid-app-router';

const cwd = process.cwd();

// Generate code?

export async function start() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const pages = await glob('pages/**/*');

  for (const page of pages) {
    const path = last(page.split('.')[0].split('/'));
    server.get(`/${path === 'index' ? '' : path}`, async (req, res) => {
      const {
        getProps,
        Document,
        renderToString,
        createComponent,
      } = require(join(process.cwd(), 'dist/server'));

      // const url = new URL(req.url, `${req.protocol}//${req.hostname}`);
      // const { props } = await getProps?.({ req, res, url });

      const str = renderToString(() =>
        createComponent(ContextProvider, {
          options: {
            initialEntries: [req.url],
          },
          children: [
            createComponent(Document, {
              //   ...props,
            }),
          ],
        }),
      );
      // TODO: pass this to head down as props
      const css = extractCss();
      res.type('text/html');
      res.send(str);
    });
  }

  server.listen(process.env.PORT || 3000);
}
