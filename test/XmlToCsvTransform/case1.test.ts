import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify'
import assert from 'node:assert'
import { createReadStream, createWriteStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  // @ts-expect-error no typings for compose
  compose
} from 'node:stream'
import { pipeline } from 'node:stream/promises'
import test from 'node:test'

import { XmlCsvMapping, createXmlToCsvTransformer } from '../../src/index.js'

async function* rowsFlatten(src: AsyncGenerator<string[][]>) {
  for await (const rows of src) {
    for (const row of rows) {
      yield row
    }
  }
}

test('case1 (category)', async () => {
  const RESULT_CSV_FILE = path.join(
    process.cwd(),
    '__temp/output/case1_category.csv'
  )

  const XML_TO_CSV_MAPPING: XmlCsvMapping = {
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

  await pipeline(
    // Read source XML
    createReadStream(path.join(process.cwd(), 'test/cases/case1.xml'), {
      highWaterMark: 64 * 1024,
      encoding: 'utf8'
    }),

    // Create XML to CSV transformer
    createXmlToCsvTransformer(XML_TO_CSV_MAPPING),

    // Post transforms
    // Group transforms by compose to one - pipeline typings is hardcoded to specified arg list length
    compose(rowsFlatten, stringify()),

    createWriteStream(RESULT_CSV_FILE)
  )

  const resultCsvTxt = await readFile(RESULT_CSV_FILE, 'utf8')

  const csvRows = parse(resultCsvTxt)

  assert.deepStrictEqual(
    csvRows,
    [
      ['Магазин', 'Код', 'Внешний код', 'Группа (Код)', 'Наименование'],
      ['dc-electro', '1', '1', '', 'Источники света'],
      ['dc-electro', '2', '2', '1', 'Ламыпы галогенные'],
      ['dc-electro', '3', '3', '1', 'Ламыпы накаливания']
    ],
    'should contain correct category csv'
  )
})

test('case1 (offers)', async () => {
  const RESULT_CSV_FILE = path.join(
    process.cwd(),
    '__temp/output/case1_offer.csv'
  )

  const XML_TO_CSV_MAPPING: XmlCsvMapping = {
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

  await pipeline(
    // Read source XML
    createReadStream(path.join(process.cwd(), 'test/cases/case1.xml'), {
      highWaterMark: 64 * 1024,
      encoding: 'utf8'
    }),

    // Create XML to CSV transformer
    createXmlToCsvTransformer(XML_TO_CSV_MAPPING),

    // Post transforms
    // Group transforms by compose to one - pipeline typings is hardcoded to specified arg list length
    compose(rowsFlatten, stringify()),

    createWriteStream(RESULT_CSV_FILE)
  )

  const resultCsvTxt = await readFile(RESULT_CSV_FILE, 'utf8')

  const csvRows = parse(resultCsvTxt)

  assert.deepStrictEqual(
    csvRows,
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
    'should contain correct category csv'
  )
})
