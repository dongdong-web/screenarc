#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const REQUIRED_NATIVE_PACKAGES = ['global-mouse-events', 'node-win-cursor']

function findNativeBindings(directory) {
  if (!existsSync(directory)) return []

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return findNativeBindings(entryPath)
    return entry.isFile() && entry.name.endsWith('.node') ? [entryPath] : []
  })
}

export function findPackagedResources(outputDirectory = path.resolve('dist')) {
  if (!existsSync(outputDirectory)) {
    throw new Error(`Package output directory does not exist: ${outputDirectory}`)
  }

  const candidates = readdirSync(outputDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.endsWith('-unpacked'))
    .map((entry) => path.join(outputDirectory, entry.name, 'resources'))
    .filter((resourcesPath) => existsSync(resourcesPath))

  if (candidates.length !== 1) {
    throw new Error(
      `Expected one unpacked Windows resources directory in ${outputDirectory}, found ${candidates.length}. ` +
        'Pass the resources directory explicitly when verifying a non-standard build.',
    )
  }

  return candidates[0]
}

export function verifyWindowsPackage(resourcesPath) {
  const resolvedResourcesPath = path.resolve(resourcesPath)
  const asarPath = path.join(resolvedResourcesPath, 'app.asar')
  if (!existsSync(asarPath) || !statSync(asarPath).isFile()) {
    throw new Error(`Packaged application archive is missing: ${asarPath}`)
  }

  const nativeModulesPath = path.join(resolvedResourcesPath, 'native-modules', 'node_modules')
  const results = REQUIRED_NATIVE_PACKAGES.map((packageName) => {
    const packagePath = path.join(nativeModulesPath, packageName)
    if (!existsSync(packagePath)) {
      throw new Error(
        `Required Windows native package is missing from resources/native-modules: ${packageName}. ` +
          'Do not publish this installer because mouse tracking will be disabled.',
      )
    }

    const bindings = findNativeBindings(packagePath)
    if (bindings.length === 0) {
      throw new Error(
        `Required Windows native package has no compiled .node binding: ${packageName}. ` +
          'Check the node-gyp and electron-builder rebuild logs before publishing.',
      )
    }

    return {
      packageName,
      bindings: bindings.map((bindingPath) => path.relative(resolvedResourcesPath, bindingPath)),
    }
  })

  return { resourcesPath: resolvedResourcesPath, packages: results }
}

function run() {
  const resourcesPath = process.argv[2] ? path.resolve(process.argv[2]) : findPackagedResources(path.resolve('dist'))
  const result = verifyWindowsPackage(resourcesPath)

  console.log(`Verified Windows package resources: ${result.resourcesPath}`)
  for (const nativePackage of result.packages) {
    console.log(`  ${nativePackage.packageName}: ${nativePackage.bindings.join(', ')}`)
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirectRun) {
  try {
    run()
  } catch (error) {
    console.error(`[verify-windows-package] ${error instanceof Error ? error.message : error}`)
    process.exitCode = 1
  }
}
