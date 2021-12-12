import {expect, test, it} from '@jest/globals'
import * as utils from '../src/utils'

const filenamesDataProvider = [
  {filename: 'mockery_1.1.1_Darwin_x86_64.tar.gz', wantOs: 'darwin', wantArch: 'x64'},
  {filename: 'mockery_1.1.1_Darwin_arm64.tar.gz', wantOs: 'darwin', wantArch: 'arm64'},
  {filename: 'mockery_1.1.1_Linux_x86_64.tar.gz', wantOs: 'linux', wantArch: 'x64'},
  {filename: 'mockery_1.1.1_Linux_arm64.tar.gz', wantOs: 'linux', wantArch: 'arm64'},
  {filename: 'mockery_1.1.1_Windows_x86_64.tar.gz', wantOs: 'win32', wantArch: 'x64'},
]

describe.each(filenamesDataProvider)('detectOsForFilename', (data) => {
  it(`should return correct OS with filename '${data.filename}'`, () => {
    const animal = utils.detectOsForFilename(data.filename)
    expect(animal).toEqual(data.wantOs)
  })
})

describe.each(filenamesDataProvider)('detectArchForFilename', (data) => {
  it(`should return correct arch with filename '${data.filename}'`, () => {
    const animal = utils.detectArchForFilename(data.filename)
    expect(animal).toEqual(data.wantArch)
  })
})

test('can prepare download url', () => {
  const version = '1.0.0'
  const filename = 'somefile.txt'

  const url = utils.prepareDownloadUrl(version, filename)
  expect(url).toBe('https://github.com/vektra/mockery/releases/download/v1.0.0/somefile.txt')
})

test('can parse checksumn data', () => {
  const version = '1.1.1'
  const data = `sum1  mockery_1.1.1_Darwin_x86_64.tar.gz\nsum2  mockery_1.1.1_Linux_x86_64.tar.gz`

  const parsed = utils.parseChecksumContent(version, data)

  const expected = [
    {filename: 'mockery_1.1.1_Darwin_x86_64.tar.gz', checksum: 'sum1', os: 'darwin', arch: 'x64', version},
    {filename: 'mockery_1.1.1_Linux_x86_64.tar.gz', checksum: 'sum2', os: 'linux', arch: 'x64', version},
  ]
  expect(parsed).toStrictEqual(expected)
})
