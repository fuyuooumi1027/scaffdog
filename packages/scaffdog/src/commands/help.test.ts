import { expect, test } from 'vitest';
import { createCommand } from '../command';
import { createCommandContainer } from '../command-container';
import { createCommandRunner } from '../mocks/command-test-utils';
import cmd from './help';

const run = createCommandRunner(cmd, {
  args: {
    command: [],
  },
  flags: {},
});

test('command', async () => {
  const foo = createCommand({
    name: 'foo',
    summary: 'foo summary.',
    args: {
      name: {
        type: 'string',
        description: 'foo.name.description.',
      },
    },
    flags: {
      key1: {
        type: 'string',
        description: 'key1.description.',
      },
      key2: {
        type: 'boolean',
        description: 'key2.description.',
      },
      key3: {
        type: 'number',
        description: 'key3.description.',
        alias: 'k',
      },
    },
  })(async () => 0);

  const container = createCommandContainer([foo]);

  const { code, stdout } = await run({
    args: {
      command: ['foo'],
    },
    container,
  });

  expect(code).toBe(0);

  expect(stdout).toMatchSnapshot();
});

test('global', async () => {
  const { code, stdout } = await run({});

  expect(code).toBe(0);

  expect(stdout).toMatchSnapshot();
});
