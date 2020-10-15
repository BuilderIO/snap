import {} from 'fs-extra-promise';
import glob from 'glob-promise';

const cwd = process.cwd();

export async function dev() {
  const pages = await glob('pages/**/*');
}
