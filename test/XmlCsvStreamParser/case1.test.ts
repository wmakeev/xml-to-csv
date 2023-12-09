import { parse } from 'csv-parse/sync'
import assert from 'node:assert'
import { createReadStream, createWriteStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

import { parseXmlToCsvStreams } from '../../src/index.js'

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

  const csvWriteable1 = createWriteStream(CATEGORY_CSV_FILE)
  const csvWriteable2 = createWriteStream(OFFER_CSV_FILE)

  await parseXmlToCsvStreams(
    [
      {
        writeable: csvWriteable1,
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
        writeable: csvWriteable2,
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
            }
          ]
        }
      }
    ],
    xmlReadable
  )

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
      ['Магазин', 'ID', 'Код', 'Валюта', 'Категория', 'ID (param)', 'Штрихкод'],
      ['dc-electro', '1', '1', 'RUR', '2', '1', '12345'],
      ['dc-electro', '2', '2', 'RUR', '2', '2', '12346'],
      ['dc-electro', '3', '3', 'RUR', '3', '2', '12347']
    ],
    'should contain correct offer csv'
  )
})
