#!/usr/bin/env node

import { program } from 'commander';
import { build } from './scripts/build';
import { dev } from './scripts/dev';

program.version('0.0.1');

program
  .command('build')
  .description('Build your site')
  .action((source, destination) => {
    build();
  });
program
  .command('dev')
  .description('Build your site')
  .action((source, destination) => {
    dev();
  });

program.parse(process.argv);
