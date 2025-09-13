import { stringify as stringifySync } from 'csv-stringify/sync'
import assert from 'node:assert'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import {
  Readable,
  // @ts-expect-error no typings
  compose
} from 'node:stream'
import { pipeline } from 'node:stream/promises'
import test from 'node:test'
import { fetch } from 'undici'

import { createXmlToCsvTransformer } from '../../../src/index.js'
import { ymlBindings } from './mappings.js'

const createXmlReadableFromUrl = async (url: string) => {
  const xmlResponse = await fetch(url)

  assert.ok(xmlResponse.body)

  const xmlReadable = Readable.fromWeb(xmlResponse.body, {
    encoding: 'utf8',
    highWaterMark: 256 * 1024
  })

  return xmlReadable
}

async function* rowsToCsv(src: AsyncGenerator<string[][]>) {
  for await (const rows of src) {
    yield stringifySync(rows)
  }
}

test('Load form url and parse #1', async () => {
  const composeWriteStream = (fileName: string) =>
    compose(rowsToCsv, createWriteStream(fileName))

  for (const binding of ymlBindings) {
    if (binding.active !== true) continue

    console.log(`* ${binding.name} parsing..`)

    const xmlReadable = await createXmlReadableFromUrl(binding.url)

    const timeStart = Date.now()

    await pipeline(
      // Read source XML
      xmlReadable,

      // Create XML to CSV transformer
      createXmlToCsvTransformer(binding.mapping),

      composeWriteStream(
        path.join(
          process.cwd(),
          `__temp/output/case5/${binding.outFilename}.csv`
        )
      )
    )

    const duration = (Date.now() - timeStart) / 1000

    console.log(`* ${binding.name} parsed (${duration}s)`)
  }

  console.log('DONE all.')
})
