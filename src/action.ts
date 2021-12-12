import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import os from 'os'
import * as utils from './utils'

export async function run (): Promise<void> {
  try {
    const platform: string = os.platform()
    const arch: string = os.arch()

    const versionSpec = core.getInput('mockery-version')
    const token = core.getInput('token')

    const auth = token === '' ? undefined : `token ${token}`

    if (versionSpec === '') {
      core.setFailed('Version is not specified')
      return
    }

    core.info(`Setup mockery version spec ${versionSpec}`)

    let mockeryPath: string

    mockeryPath = tc.find(utils.CACHE_KEY, versionSpec, arch)
    if (mockeryPath !== '') {
      core.info(`Found in cache @ ${mockeryPath}`)
    } else {
      const file = await utils.findMockeryFile(versionSpec, platform, arch)
      mockeryPath = await utils.installMockery(file, auth)
    }

    core.addPath(mockeryPath)
    core.info('Added mockery to the path')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to `run`'
    core.setFailed(message)
  }
}
