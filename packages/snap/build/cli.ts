#!/usr/bin/env node

import { program } from 'commander';
import { build } from './scripts/build';
import { dev } from './scripts/dev';
import { start } from './scripts/start';

program.version('0.0.1');

program
  .command('build')
  .description('Build your site')
  .action((source, destination) => {
    build();
  });
program
  .command('dev')
  .description('Dev your site')
  .action((source, destination) => {
    dev();
  });
program
  .command('start')
  .description('Start your site')
  .action((source, destination) => {
    start();
  });

program.parse(process.argv);
