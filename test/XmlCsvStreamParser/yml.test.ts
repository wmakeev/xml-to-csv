import assert from 'node:assert'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import {
  // @ts-expect-error no typings
  compose,
  Readable
} from 'node:stream'
import { fetch } from 'undici'
// import { stringify } from 'csv-stringify'
import { stringify } from 'csv-stringify/sync'

import { parseXmlToCsvRows } from '../../src/XmlCsvStreamParser/index.js'
import { ymlMappings } from './yml-mappings.js'

const PRICE_URL = 'https://dc-electro.ru/bitrix/catalog_export/export_EFo.xml'

const xmlResponse = await fetch(PRICE_URL)

assert.ok(xmlResponse.body)

const xmlReadable = Readable.fromWeb(xmlResponse.body)

// createReadStream(
//   path.join(process.cwd(), '__temp/income/export_EFo.xml')
// )

// const catalogCsvWriteable = createWriteStream(
//   path.join(process.cwd(), '__temp/test-out/export_EFo (catalog).csv')
// )

const CURRENCY_FILE = path.join(
  process.cwd(),
  '__temp/output/export_dc_electro_currency.csv'
)

const CATEGORY_FILE = path.join(
  process.cwd(),
  '__temp/output/export_dc_electro_category.csv'
)

const OFFERS_FILE = path.join(
  process.cwd(),
  '__temp/output/export_dc_electro_offer.csv'
)

const OFFERS_PHOTO_FILE = path.join(
  process.cwd(),
  '__temp/output/export_dc_electro_offer_photo.csv'
)

// async function* rowsFlatten(src: AsyncGenerator<string[][]>) {
//   for await (const rows of src) {
//     for (const row of rows) {
//       yield row
//     }
//   }
// }

// const composeWriteStream = (fileName: string) =>
//   compose(rowsFlatten, stringify(), createWriteStream(fileName))

async function* rowsToCsv(src: AsyncGenerator<string[][]>) {
  for await (const rows of src) {
    yield stringify(rows)
  }
}

const composeWriteStream = (fileName: string) =>
  compose(rowsToCsv, createWriteStream(fileName))

const timeStart = Date.now()

await parseXmlToCsvRows(xmlReadable, [
  // Currency
  {
    mapping: ymlMappings.currency,
    writeable: composeWriteStream(CURRENCY_FILE)
  },

  // Category
  {
    mapping: ymlMappings.category,
    writeable: composeWriteStream(CATEGORY_FILE)
  },

  // Offers
  {
    mapping: ymlMappings.offer,
    writeable: composeWriteStream(OFFERS_FILE)
  },

  // Offers photos
  {
    mapping: ymlMappings.offerPhoto,
    writeable: composeWriteStream(OFFERS_PHOTO_FILE)
  }
])

const duration = (Date.now() - timeStart) / 1000

console.log(`DONE (${duration}s).`)
