import {} from 'fs-extra-promise';
import glob from 'glob-promise';

const cwd = process.cwd();

export async function build() {
  const pages = await glob('pages/**/*');
  console.log('pages', pages);
}
