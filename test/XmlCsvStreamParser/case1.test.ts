import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify'
import assert from 'node:assert'
import { createReadStream, createWriteStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  // @ts-expect-error no typings
  compose
} from 'node:stream'
import test from 'node:test'

import { parseXmlToCsvRows } from '../../src/index.js'
import { ymlMappings } from './yml-mappings.js'

test.skip('yml parse only', async () => {
  const xmlReadable = createReadStream(
    path.join(process.cwd(), '__temp/income/export_EFo.xml')
  )

  async function* rowsConsume(src: AsyncGenerator<string[][]>) {
    for await (const it of src) {
      it
      yield 1
    }
  }

  let flushes = 0

  async function rowsConsume2(src: any) {
    for await (const it of src) {
      flushes += it
    }
  }

  const composeWriteStream = (fileName: string) => {
    fileName
    return compose(rowsConsume, rowsConsume2)
  }

  const timeStart = Date.now()

  await parseXmlToCsvRows(xmlReadable, [
    // Currency
    {
      mapping: ymlMappings.currency,
      writeable: composeWriteStream('Currency')
    },

    // Category
    {
      mapping: ymlMappings.category,
      writeable: composeWriteStream('Category')
    },

    // Offers
    {
      mapping: ymlMappings.offer,
      writeable: composeWriteStream('Offers')
    },

    // Offers photos
    {
      mapping: ymlMappings.offerPhoto,
      writeable: composeWriteStream('Offers photos')
    }
  ])

  const duration = (Date.now() - timeStart) / 1000

  console.log(flushes)

  console.log(`DONE (${duration}s).`) // 77.354s
})

test('parseXmlToCsvStreams #case1', async () => {
  const xmlReadable = createReadStream(
    path.join(process.cwd(), 'test/cases/case1.xml')
  )

  const CATEGORY_CSV_FILE = path.join(
    process.cwd(),
    '__temp/output/case1_category.csv'
  )
  const OFFER_CSV_FILE = path.join(
    process.cwd(),
    '__temp/output/case1_offer.csv'
  )

  async function* rowsFlatten(src: AsyncGenerator<string[][]>) {
    for await (const rows of src) {
      for (const row of rows) {
        yield row
      }
    }
  }

  const composeWriteStream = (fileName: string) =>
    compose(rowsFlatten, stringify(), createWriteStream(fileName))

  await parseXmlToCsvRows(xmlReadable, [
    {
      writeable: composeWriteStream(CATEGORY_CSV_FILE),
      mapping: {
        collection: 'yml_catalog/shop/categories',
        row: 'yml_catalog/shop/categories/category',
        colls: [
          {
            name: 'Магазин',
            valuePath: 'yml_catalog/shop/name'
          },
          {
            name: 'Код',
            valuePath: 'yml_catalog/shop/categories/category[id]'
          },
          {
            name: 'Внешний код',
            valuePath: 'yml_catalog/shop/categories/category[id]'
          },
          {
            name: 'Группа (Код)',
            valuePath: 'yml_catalog/shop/categories/category[parentId]'
          },
          {
            name: 'Наименование',
            valuePath: 'yml_catalog/shop/categories/category'
          }
        ]
      }
    },
    {
      writeable: composeWriteStream(OFFER_CSV_FILE),
      mapping: {
        collection: 'yml_catalog/shop/offers',
        row: 'yml_catalog/shop/offers/offer',
        colls: [
          {
            name: 'Магазин',
            valuePath: 'yml_catalog/shop/name'
          },
          {
            name: 'ID',
            valuePath: 'yml_catalog/shop/offers/offer[id]'
          },
          {
            name: 'Код',
            valuePath: 'yml_catalog/shop/offers/offer[id]'
          },
          {
            name: 'Валюта',
            valuePath: 'yml_catalog/shop/offers/offer/currencyId'
          },
          {
            name: 'Категория',
            valuePath: 'yml_catalog/shop/offers/offer/categoryId'
          },
          {
            name: 'ID (param)',
            valuePath: 'yml_catalog/shop/offers/offer/param',
            predicate: {
              type: 'equal',
              path: 'yml_catalog/shop/offers/offer/param[name]',
              value: 'ID'
            }
          },
          {
            name: 'Штрихкод',
            valuePath: 'yml_catalog/shop/offers/offer/param',
            predicate: {
              type: 'equal',
              path: 'yml_catalog/shop/offers/offer/param[name]',
              value: 'Штрихкод'
            }
          },
          {
            name: 'Характеристика#2',
            valuePath: 'yml_catalog/shop/offers/offer/param',
            predicate: {
              type: 'index',
              value: 1
            }
          },
          {
            name: 'Характеристика#1',
            valuePath: 'yml_catalog/shop/offers/offer/param',
            aggregation: {
              type: 'first'
            }
          },
          {
            name: 'Наименования характеристик',
            valuePath: 'yml_catalog/shop/offers/offer/param[name]',
            aggregation: {
              type: 'array',
              delimiter: ' | '
            }
          },
          {
            name: 'Значения характеристик',
            valuePath: 'yml_catalog/shop/offers/offer/param',
            aggregation: {
              type: 'array'
            }
          }
        ]
      }
    }
  ])

  const categoryCsvTxt = await readFile(CATEGORY_CSV_FILE, 'utf8')

  const categoryCsv = parse(categoryCsvTxt)

  assert.deepStrictEqual(
    categoryCsv,
    [
      ['Магазин', 'Код', 'Внешний код', 'Группа (Код)', 'Наименование'],
      ['dc-electro', '1', '1', '', 'Источники света'],
      ['dc-electro', '2', '2', '1', 'Ламыпы галогенные'],
      ['dc-electro', '3', '3', '1', 'Ламыпы накаливания']
    ],
    'should contain correct category csv'
  )

  const offerCsvTxt = await readFile(OFFER_CSV_FILE, 'utf8')

  const offerCsv = parse(offerCsvTxt)

  assert.deepStrictEqual(
    offerCsv,
    [
      [
        'Магазин',
        'ID',
        'Код',
        'Валюта',
        'Категория',
        'ID (param)',
        'Штрихкод',
        'Характеристика#2',
        'Характеристика#1',
        'Наименования характеристик',
        'Значения характеристик'
      ],
      [
        'dc-electro',
        '1',
        '1',
        'RUR',
        '2',
        '1',
        '12345',
        '12345',
        '1',
        'ID | Штрихкод',
        '1,12345'
      ],
      [
        'dc-electro',
        '2',
        '2',
        'RUR',
        '2',
        '2',
        '12346',
        '2',
        '12346',
        'Штрихкод | ID',
        '12346,2'
      ],
      [
        'dc-electro',
        '3',
        '3',
        'RUR',
        '3',
        '2',
        '12347',
        '12347',
        '2',
        'ID | Штрихкод',
        '2,12347'
      ]
    ],
    'should contain correct offer csv'
  )
})
