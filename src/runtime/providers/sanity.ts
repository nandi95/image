import { joinURL, encodePath } from 'ufo'
import { defineProvider, createOperationsGenerator } from '#image'

const sanityCDN = 'https://cdn.sanity.io/images'

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    'format': 'fm',
    'height': 'h',
    'quality': 'q',
    'width': 'w',
    // Convenience modifiers
    'background': 'bg',
    'download': 'dl',
    'dpr': 'dpr',
    'sharpen': 'sharp',
    'orientation': 'or',
    'min-height': 'min-h',
    'max-height': 'max-h',
    'min-width': 'min-w',
    'max-width': 'max-w',
    'minHeight': 'min-h',
    'maxHeight': 'max-h',
    'minWidth': 'min-w',
    'maxWidth': 'max-w',
    'saturation': 'sat',
  },
  valueMap: {
    format: {
      jpeg: 'jpg',
    },
    fit: {
      cover: 'crop',
      contain: 'fill',
      fill: 'scale',
      inside: 'min',
      outside: 'max',
    },
  },
  formatter: (key, value: string | true | number | Record<string, unknown>) => String(value) === 'true' ? key : encodePath(`${key}=${value}`),
})

const getMetadata = (id: string) => {
  const result = id.match(/-(?<width>\d*)x(?<height>\d*)-(?<format>.*)$/)
  if (!result || !result.groups) {
    // Invalid Sanity image asset ID
    if (import.meta.dev) {
      console.warn(`An invalid image asset ID was passed in: ${id}`)
    }
    return { width: undefined, height: undefined, format: undefined }
  }

  const width = Number(result.groups.width)
  const height = Number(result.groups.height)

  return {
    width,
    height,
    format: result.groups.format,
  }
}

interface SanityOptions {
  projectId: string
  dataset?: string
  modifiers?: {
    'crop'?: string | { left: number, top: number, right: number, bottom: number }
    'rect'?: `${number},${number},${number},${number}`
    'hotspot'?: string | { x: number, y: number }
    'fp-x'?: number
    'fp-y'?: number
    'auto'?: string
    'bg'?: string
  }
}

export default defineProvider<SanityOptions>({
  getImage: (src, { modifiers, projectId, dataset = 'production' }) => {
    const { height: sourceHeight, width: sourceWidth } = getMetadata(src)
    if (modifiers.crop && typeof modifiers.crop !== 'string' && sourceWidth && sourceHeight) {
      const left = modifiers.crop.left * sourceWidth
      const top = modifiers.crop.top * sourceHeight
      const right = sourceWidth - modifiers.crop.right * sourceWidth
      const bottom = sourceHeight - modifiers.crop.bottom * sourceHeight
      modifiers.rect = [left, top, right - left, bottom - top].map(i => i.toFixed(0)).join(',') as `${number},${number},${number},${number}`
      delete modifiers.crop
    }
    if (modifiers.hotspot && typeof modifiers.hotspot !== 'string') {
      modifiers['fp-x'] = modifiers.hotspot.x
      modifiers['fp-y'] = modifiers.hotspot.y
      delete modifiers.hotspot
    }
    if (!modifiers.format || modifiers.format === 'auto') {
      if (modifiers.format === 'auto') {
        delete modifiers.format
      }
      modifiers.auto = 'format'
    }
    if (modifiers.fit === 'contain' && !modifiers.bg) {
      modifiers.bg = 'ffffff'
    }
    const operations = operationsGenerator(modifiers)

    const parts = src.split('-').slice(1)
    const format = parts.pop()

    const filenameAndQueries = parts.join('-') + '.' + format + (operations ? ('?' + operations) : '')

    return {
      url: joinURL(sanityCDN, projectId, dataset, filenameAndQueries),
    }
  },
})
