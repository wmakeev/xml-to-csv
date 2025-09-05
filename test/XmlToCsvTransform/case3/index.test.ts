import { stringify as stringifyStream } from 'csv-stringify'
import { stringify as stringifySync } from 'csv-stringify/sync'
import assert from 'node:assert'
import { createReadStream, createWriteStream } from 'node:fs'
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
import { ymlMappings } from './mappings.js'

const createXmlReadableFromUrl = async (url: string) => {
  const xmlResponse = await fetch(url)

  assert.ok(xmlResponse.body)

  const xmlReadable = Readable.fromWeb(xmlResponse.body, {
    encoding: 'utf8',
    highWaterMark: 256 * 1024
  })

  return xmlReadable
}

const createXmlReadableFromFile = (file: string) =>
  createReadStream(file, {
    encoding: 'utf8',
    highWaterMark: 512 * 1024
  })

async function* rowsToCsv(src: AsyncGenerator<string[][]>) {
  for await (const rows of src) {
    yield stringifySync(rows)
  }
}

async function* rowsFlatten(src: AsyncGenerator<string[][]>) {
  for await (const rows of src) {
    for (const row of rows) {
      yield row
    }
  }
}

test('Load form url and parse #1', async () => {
  const PRICE_URL = 'https://dc-electro.ru/bitrix/catalog_export/export_EFo.xml'

  const composeWriteStream = (fileName: string) =>
    compose(rowsToCsv, createWriteStream(fileName))

  const xmlReadable = await createXmlReadableFromUrl(PRICE_URL)

  for (const [key, mapping] of Object.entries(ymlMappings)) {
    const timeStart = Date.now()

    await pipeline(
      // Read source XML
      xmlReadable,

      // Create XML to CSV transformer
      createXmlToCsvTransformer(mapping),

      composeWriteStream(
        path.join(process.cwd(), `__temp/output/export_dc_electro_${key}.csv`)
      )
    )

    const duration = (Date.now() - timeStart) / 1000

    console.log(`* ${key} parsed (${duration}s)`)
  }

  console.log('DONE all.')
})

test.skip('Per item stringify workflow #2', async () => {
  const PRICE_FILE = path.join(process.cwd(), '__temp/income/export_EFo.xml')

  const timeStart = Date.now()

  await pipeline(
    // Read source XML
    createXmlReadableFromFile(PRICE_FILE),

    // Create XML to CSV transformer
    createXmlToCsvTransformer(ymlMappings.offer),

    compose(rowsFlatten, stringifyStream()),

    createWriteStream(
      path.join(process.cwd(), '__temp/output/export_dc_electro_offer_2.csv')
    )
  )

  const duration = (Date.now() - timeStart) / 1000

  console.log(`* per item offer parsed (${duration}s)`) // 43s
})

test.skip('Batch items stringify workflow #3', async () => {
  const PRICE_FILE = path.join(process.cwd(), '__temp/income/export_EFo.xml')

  const timeStart = Date.now()

  await pipeline(
    // Read source XML
    createXmlReadableFromFile(PRICE_FILE),

    // Create XML to CSV transformer
    createXmlToCsvTransformer(ymlMappings.offer),

    compose(
      rowsToCsv,
      createWriteStream(
        path.join(process.cwd(), '__temp/output/export_dc_electro_offer_3.csv')
      )
    )
  )

  const duration = (Date.now() - timeStart) / 1000

  // Группировка по батчу работает в 2 раза быстрее
  console.log(`* per item offer parsed (${duration}s)`) // 26s
})
