import * as util from 'util'
import * as core from '@actions/core'
import * as semver from 'semver'

class SemVer extends semver.SemVer {
  clone(): SemVer {
    return new SemVer(this.raw, this.options)
  }

  isPrerelease(): boolean {
    return this.prerelease.length > 0
  }

  toJSON(): {
    version: string
    raw: string
    major: number
    minor: number
    patch: number
    prerelease: readonly (string | number)[]
    isPrerelease: boolean
    build: readonly (string | number)[]
  } {
    return {
      version: this.version,
      raw: this.raw,
      major: this.major,
      minor: this.minor,
      patch: this.patch,
      prerelease: this.prerelease,
      isPrerelease: this.isPrerelease(),
      build: this.build
    }
  }
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const value: string = core.getInput('value', { required: true })
  const identifier: string = core.getInput('identifier')
  let identifierBase: string | boolean = core.getInput('identifier-base')

  try {
    identifierBase = core.getBooleanInput('identifier-base')
  } catch (error) {
    /**/
  }

  const parsedVersion: semver.SemVer | null = semver.parse(value, {
    loose: true
  })

  if (!parsedVersion) {
    return core.setFailed(`Value "${value}" is not a valid semver version`)
  }

  const version = new SemVer(parsedVersion.raw, parsedVersion.options)
  const results: {
    version: string
    raw: string
    major: number
    minor: number
    patch: number
    prerelease: readonly (string | number)[]
    isPrerelease: boolean
    build: readonly (string | number)[]
    next: {
      premajor: SemVer
      preminor: SemVer
      prepatch: SemVer
      major: SemVer
      minor: SemVer
      patch: SemVer
      pre: SemVer
      prerelease: SemVer
    }
  } = {
    version: version.version,
    raw: version.raw,
    major: version.major,
    minor: version.minor,
    patch: version.patch,
    prerelease: version.prerelease,
    isPrerelease: version.isPrerelease(),
    build: version.build,
    next: {
      // @ts-expect-error: 3rd parameter is valid
      premajor: version.clone().inc('premajor', identifier, identifierBase),
      // @ts-expect-error: 3rd parameter is valid
      preminor: version.clone().inc('preminor', identifier, identifierBase),
      // @ts-expect-error: 3rd parameter is valid
      prepatch: version.clone().inc('prepatch', identifier, identifierBase),
      // @ts-expect-error: 3rd parameter is valid
      major: version.clone().inc('major', identifier, identifierBase),
      // @ts-expect-error: 3rd parameter is valid
      minor: version.clone().inc('minor', identifier, identifierBase),
      // @ts-expect-error: 3rd parameter is valid
      patch: version.clone().inc('patch', identifier, identifierBase),
      // @ts-expect-error: 3rd parameter is valid
      pre: version.clone().inc('pre', identifier, identifierBase),
      // @ts-expect-error: 3rd parameter is valid
      prerelease: version.clone().inc('prerelease', identifier, identifierBase)
    }
  }

  core.setOutput('version', results.version)
  core.setOutput('raw', results.raw)
  core.setOutput('major', results.major)
  core.setOutput('minor', results.minor)
  core.setOutput('patch', results.patch)
  core.setOutput('prerelease', results.prerelease)
  core.setOutput('isPrerelease', results.isPrerelease)
  core.setOutput('build', results.build)
  core.setOutput('next.premajor', results.next.premajor.version)
  core.setOutput('next.preminor', results.next.preminor.version)
  core.setOutput('next.prepatch', results.next.prepatch.version)
  core.setOutput('next.major', results.next.major.version)
  core.setOutput('next.minor', results.next.minor.version)
  core.setOutput('next.patch', results.next.patch.version)
  core.setOutput('next.pre', results.next.pre.version)
  core.setOutput('next.prerelease', results.next.prerelease.version)
  core.setOutput('json', results)

  core.group('Output', async () => {
    core.info(
      util.inspect(JSON.parse(JSON.stringify(results)), {
        colors: true,
        depth: 3
      })
    )
  })
}
