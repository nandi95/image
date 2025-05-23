import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { images } from '../providers'
import { providers as playgroundProviders } from '../../playground/providers'

const missingProviderTests = [
  'ipxStatic', // build-time-only alias for ipx
  'strapi', // covered in a unique test
  'strapi5', // covered in a unique test
]

describe('Provider coverage', async () => {
  const providers = await readdir(fileURLToPath(new URL('../../src/runtime/providers', import.meta.url)))
  it.each(providers)('should have tests for %s', (file) => {
    const provider = file.replace(/\.ts$/, '')
    // TODO: remove this once all providers have tests
    if (missingProviderTests.includes(provider)) {
      return
    }
    expect(playgroundProviders.find(p => p.name === provider)).toBeTruthy()
    expect(provider in images[0]).toBeTruthy()
  })
})
