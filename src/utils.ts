import * as httpm from '@actions/http-client'
import * as tc from '@actions/tool-cache'
import * as core from '@actions/core'

export const CHECKSUM_FILENAME = 'checksum.txt'

export interface IMockeryVersionFile {
  version: string
  filename: string
  checksum: string
  os: string
  arch: string
}

export function prepareDownloadUrl (version: string, filename: string): string {
  return `https://github.com/vektra/mockery/releases/download/v${version}/${filename}`
}

export function parseChecksumContent (version: string, text: string): IMockeryVersionFile[] {
  const files: IMockeryVersionFile[] = []

  for (const record of text.split('\n')) {
    const [checksum, filename] = record.split('  ')

    if (typeof checksum !== 'string' || typeof filename !== 'string') {
      continue
    }

    const os = detectOsForFilename(filename)
    const arch = detectArchForFilename(filename)

    if (typeof os !== 'string' || typeof arch !== 'string') {
      continue
    }

    const file: IMockeryVersionFile = { version, filename, checksum, os, arch }
    files.push(file)
  }

  return files
}

export function detectOsForFilename (filename: string): string | undefined {
  const target = filename.toLowerCase()

  if (target.includes('darwin')) {
    return 'darwin'
  }
  if (target.includes('linux')) {
    return 'linux'
  }
  if (target.includes('windows')) {
    return 'win32'
  }

  return undefined
}

export function detectArchForFilename (filename: string): string | undefined {
  const target = filename.toLowerCase()

  if (target.includes('x86_64')) {
    return 'x64'
  }
  if (target.includes('arm64')) {
    return 'arm64'
  }

  return undefined
}

export async function findMockeryFile (
  versionSpec: string,
  platform: string,
  arch: string
): Promise<IMockeryVersionFile> {
  const checksumUrl = prepareDownloadUrl(versionSpec, 'checksum.txt')

  try {
    const http: httpm.HttpClient = new httpm.HttpClient('setup-mockery', [])
    const res = await http.get(checksumUrl)
    const checksumContent = await res.readBody()

    const files = parseChecksumContent(versionSpec, checksumContent)

    for (const file of files) {
      if (file.os === platform && file.arch === arch) {
        return file
      }
    }

    throw new Error(`No file for platform: ${platform} arch: ${arch}`)
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : ''
    throw new Error(`Failed to find ${versionSpec}: ${errMessage}`)
  }
}

export async function installMockery (
  file: IMockeryVersionFile,
  auth: string | undefined
): Promise<string> {
  const downloadUrl = prepareDownloadUrl(file.version, file.filename)
  core.info(`Acquiring ${file.version} from ${downloadUrl}`)
  const downloadPath = await tc.downloadTool(downloadUrl, undefined, auth)

  core.info('Extracting mockery...')
  const extPath = await extractMockeryArchive(downloadPath)
  core.info(`Successfully extracted mockery to ${extPath}`)

  return extPath
}

export async function extractMockeryArchive (archivePath: string): Promise<string> {
  return await tc.extractTar(archivePath)
}
