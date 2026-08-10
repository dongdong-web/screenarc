import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
// @ts-expect-error The package verifier is a standalone Node ESM script without TypeScript declarations.
import { findPackagedResources, verifyWindowsPackage } from '../../../scripts/verify-windows-package.mjs'

const temporaryDirectories: string[] = []

function createTemporaryDirectory() {
  const directory = mkdtempSync(path.join(tmpdir(), 'screenarc-package-verifier-'))
  temporaryDirectories.push(directory)
  return directory
}

function createPackagedResources({
  missingPackage,
  missingBinding,
}: {
  missingPackage?: string
  missingBinding?: string
} = {}) {
  const outputDirectory = createTemporaryDirectory()
  const resourcesPath = path.join(outputDirectory, 'win-unpacked', 'resources')
  const modulesPath = path.join(resourcesPath, 'native-modules', 'node_modules')
  mkdirSync(modulesPath, { recursive: true })
  writeFileSync(path.join(resourcesPath, 'app.asar'), 'fixture')

  for (const packageName of ['global-mouse-events', 'node-win-cursor']) {
    if (packageName === missingPackage) continue
    const releasePath = path.join(modulesPath, packageName, 'build', 'Release')
    mkdirSync(releasePath, { recursive: true })
    if (packageName !== missingBinding) {
      writeFileSync(path.join(releasePath, `${packageName.replace(/-/g, '_')}.node`), 'fixture')
    }
  }

  return { outputDirectory, resourcesPath }
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('findPackagedResources', () => {
  it('finds the resources directory in an unpacked Windows build', () => {
    const { outputDirectory, resourcesPath } = createPackagedResources()
    expect(findPackagedResources(outputDirectory)).toBe(resourcesPath)
  })
})

describe('verifyWindowsPackage', () => {
  it('returns both packaged native dependencies and their bindings', () => {
    const { resourcesPath } = createPackagedResources()
    const result = verifyWindowsPackage(resourcesPath)

    expect(result.packages.map(({ packageName }: { packageName: string }) => packageName)).toEqual([
      'global-mouse-events',
      'node-win-cursor',
    ])
    expect(result.packages.every(({ bindings }: { bindings: string[] }) => bindings.length === 1)).toBe(true)
  })

  it('rejects a package that omits a required native dependency', () => {
    const { resourcesPath } = createPackagedResources({ missingPackage: 'global-mouse-events' })
    expect(() => verifyWindowsPackage(resourcesPath)).toThrow('global-mouse-events')
  })

  it('rejects a native dependency that has no compiled binding', () => {
    const { resourcesPath } = createPackagedResources({ missingBinding: 'node-win-cursor' })
    expect(() => verifyWindowsPackage(resourcesPath)).toThrow('no compiled .node binding')
  })
})
