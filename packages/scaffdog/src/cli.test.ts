import { LogLevels } from 'consola';
import { describe, expect, test, vi } from 'vitest';
import { createCLI } from './cli.js';
import { createCommandContainer } from './command-container.js';
import type { CommandModule } from './command.js';
import { createCommand } from './command.js';
import { createScaffdogInitializerMock } from './mocks/api.js';
import { createLibraryMock } from './mocks/lib.js';
import { createLogger } from './mocks/logger.js';

const pkg = {
  name: 'scaffdog',
  version: '1.0.0',
};

describe('run', () => {
  const lib = createLibraryMock();
  const api = createScaffdogInitializerMock().createScaffdog;

  const createContainer = (commands: CommandModule<any, any>[] = []) => {
    return createCommandContainer([
      createCommand({
        name: 'help',
        summary: '',
        args: {},
        flags: {},
      })(vi.fn().mockResolvedValueOnce(0)),
      createCommand({
        name: 'version',
        summary: '',
        args: {},
        flags: {},
      })(vi.fn().mockResolvedValueOnce(0)),
      ...commands,
    ]);
  };

  test('0 arguments', async () => {
    const { logger } = createLogger();
    const container = createContainer();
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
      api,
    });

    expect(await cli.run([])).toBe(0);
    expect(container.mustGet('help').run).toBeCalledWith(
      expect.objectContaining({
        args: {
          command: [],
        },
      }),
    );
  });

  test('help', async () => {
    const { logger } = createLogger();
    const container = createContainer();
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
      api,
    });

    expect(await cli.run(['--help'])).toBe(0);
    expect(container.mustGet('help').run).toBeCalledWith(
      expect.objectContaining({
        args: {
          command: [],
        },
      }),
    );
  });

  test('command with help', async () => {
    const { logger } = createLogger();
    const cmd = createCommand({
      name: 'foo',
      summary: '',
      args: {},
      flags: {},
    })(async () => 0);
    const container = createContainer([cmd]);
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
      api,
    });

    expect(await cli.run(['foo', '--help'])).toBe(0);
    expect(container.mustGet('help').run).toBeCalledWith(
      expect.objectContaining({
        args: {
          command: ['foo'],
        },
      }),
    );
  });

  test('version', async () => {
    const { logger } = createLogger();
    const container = createContainer();
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
      api,
    });

    expect(await cli.run(['--version'])).toBe(0);
    expect(container.mustGet('version').run).toBeCalled();
  });

  test('verbose', async () => {
    const { logger } = createLogger();
    const container = createContainer();
    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
      api,
    });

    expect(await cli.run(['--verbose'])).toBe(0);
    expect(logger.level).toBe(LogLevels.verbose);
  });

  test('command (valid)', async () => {
    const { logger, getStdout } = createLogger();
    const cmd = createCommand({
      name: 'cmd',
      summary: '',
      args: {},
      flags: {},
    })(async ({ logger }) => {
      logger.log('CALL CMD');
      return 1234;
    });
    const container = createContainer([cmd]);

    const cli = createCLI({
      pkg,
      logger,
      container,
      lib,
      api,
    });

    expect(await cli.run(['cmd'])).toBe(1234);
    expect(getStdout()).toEqual(expect.stringMatching(/CALL\sCMD/));
  });

  test('command (not found)', async () => {
    const { logger } = createLogger();
    const cli = createCLI({
      pkg,
      logger,
      container: createCommandContainer([]),
      lib,
      api,
    });

    expect(await cli.run(['cmd'])).toBe(1);
  });
});
