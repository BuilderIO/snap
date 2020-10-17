import {} from 'fs-extra-promise';
import glob from 'glob-promise';
import webpack from 'webpack';
import config from '../webpack.config';
import { promisify } from 'util';
import { join } from 'path';
import { server } from '../../lib/server';
import { last } from 'lodash';

const cwd = process.cwd();

// Generate code?

export async function start() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  const pages = await glob('pages/**/*');

  for (const page of pages) {
    const path = last(page.split('.')[0].split('/'));
    server.get(`/${path}`, (req, res) => {
      const { getProps, default: Component } = require(join(
        process.cwd(),
        'dist/pages',
        path!,
        'server',
      ));
    });
  }

  server.listen(process.env.PORT || 3000);
}
