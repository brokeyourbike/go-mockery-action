import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as utils from '../src/utils';
import * as action from '../src/action';
import osm from 'os';
import path from 'path';

describe('setup-mockery', () => {
  let inputs = {} as any;
  let os = {} as any;

  let inputSpy: jest.SpyInstance;
  let findSpy: jest.SpyInstance;
  let downloadSpy: jest.SpyInstance;
  let extractSpy: jest.SpyInstance;
  let cacheSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;
  let stdoutWriteSpy: jest.SpyInstance;
  let findMockeryFileSpy: jest.SpyInstance;

  beforeAll(() => {
    process.env['GITHUB_PATH'] = ''; // Stub out ENV file functionality so we can verify it writes to standard out
    console.log('::stop-commands::stoptoken'); // Disable executing of runner commands when running tests in actions
  });

  beforeEach(() => {
    // @actions/core
    inputs = {};
    inputSpy = jest.spyOn(core, 'getInput');
    inputSpy.mockImplementation((name) => inputs[name]);

    // @actions/tool-cache
    findSpy = jest.spyOn(tc, 'find');
    downloadSpy = jest.spyOn(tc, 'downloadTool');
    extractSpy = jest.spyOn(tc, 'extractTar');
    cacheSpy = jest.spyOn(tc, 'cacheDir');

    // utils
    findMockeryFileSpy = jest.spyOn(utils, 'findMockeryFile');

    // write
    logSpy = jest.spyOn(core, 'info');
    debugSpy = jest.spyOn(core, 'debug');
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write');
  });

  afterAll(async () => {
    console.log('::stoptoken::'); // Re-enable executing of runner commands when running tests in actions
  }, 100000);

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('finds a version of mockery already in the cache', async () => {
    inputs['mockery-version'] = '1.1.1';

    const toolPath = path.normalize('/cache/mockery/1.1.1/x64');
    findSpy.mockImplementation(() => toolPath);
    await action.run();

    expect(logSpy).toHaveBeenCalledWith(`Found in cache @ ${toolPath}`);
  });

  it('finds a version in the cache and adds it to the path', async () => {
    inputs['mockery-version'] = '1.1.1';

    const toolPath = path.normalize('/cache/mockery/1.1.1/x64');
    findSpy.mockImplementation(() => toolPath);
    await action.run();

    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      `::add-path::${toolPath}${osm.EOL}`,
    );
  });

  it('downloads a version not in the cache', async () => {
    os.platform = 'linux';
    os.arch = 'x64';
    inputs['mockery-version'] = '1.1.1';

    findMockeryFileSpy.mockImplementation(
      () =>
        <utils.IMockeryVersionFile>{
          version: '1.1.1',
          filename: 'mockery_1.1.1_Linux_x64',
          checksum: 'sum12345',
          os: 'linux',
          arch: 'x64',
        },
    );

    findSpy.mockImplementation(() => '');
    downloadSpy.mockImplementation(() => '/some/temp/path');
    extractSpy.mockImplementation(() => '/some/other/temp/path');

    const toolPath = path.normalize('/cache/mockery/1.1.1/x64');
    cacheSpy.mockImplementation(() => toolPath);
    await action.run();

    expect(downloadSpy).toHaveBeenCalled();
    expect(extractSpy).toHaveBeenCalled();
    expect(stdoutWriteSpy).toHaveBeenCalledWith(
      `::add-path::${toolPath}${osm.EOL}`,
    );
  });

  it('handles unhandled error and reports error', async () => {
    const errMsg = 'unhandled error message';
    inputs['mockery-version'] = '1.1.1';

    findSpy.mockImplementation(() => {
      throw new Error(errMsg);
    });
    await action.run();

    expect(stdoutWriteSpy).toHaveBeenCalledWith('::error::' + errMsg + osm.EOL);
  });
});
