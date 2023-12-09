import assert from 'node:assert'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import { Readable, Writable } from 'node:stream'
import { fetch } from 'undici'

import {
  parseXmlToCsvStreams,
  XmlCsvMapping
} from '../../src/XmlCsvStreamParser/index.js'

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

const currencyCsvWriteable = createWriteStream(
  path.join(process.cwd(), '__temp/output/export_dc_electro_currency.csv')
)

const categoryCsvWriteable = createWriteStream(
  path.join(process.cwd(), '__temp/output/export_dc_electro_category.csv')
)

const offersCsvWriteable = createWriteStream(
  path.join(process.cwd(), '__temp/output/export_dc_electro_offer.csv')
)

const offersPhotoCsvWriteable = createWriteStream(
  path.join(process.cwd(), '__temp/output/export_dc_electro_offer_photo.csv')
)

const currency: { writeable: Writable; mapping: XmlCsvMapping } = {
  writeable: currencyCsvWriteable,
  mapping: {
    collection: 'yml_catalog/shop/currencies',
    row: 'yml_catalog/shop/currencies/currency',
    colls: [
      {
        name: 'Магазин',
        valuePath: 'yml_catalog/shop/name'
      },
      {
        name: 'ID',
        valuePath: 'yml_catalog/shop/currencies/currency[id]'
      },
      {
        name: 'Курс',
        valuePath: 'yml_catalog/shop/currencies/currency[rate]'
      }
    ]
  }
}

const category: { writeable: Writable; mapping: XmlCsvMapping } = {
  writeable: categoryCsvWriteable,
  mapping: {
    collection: 'yml_catalog/shop/categories',
    row: 'yml_catalog/shop/categories/category',
    colls: [
      // {
      //   name: 'Магазин',
      //   valuePath: 'yml_catalog/shop/name'
      // },

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
}

const offer: { writeable: Writable; mapping: XmlCsvMapping } = {
  writeable: offersCsvWriteable,
  mapping: {
    collection: 'yml_catalog/shop/offers',
    row: 'yml_catalog/shop/offers/offer',
    colls: [
      {
        name: 'Код',
        valuePath: 'yml_catalog/shop/offers/offer[id]'
      },

      {
        name: 'Внешний код',
        valuePath: 'yml_catalog/shop/offers/offer[id]'
      },

      {
        name: 'Артикул',
        valuePath: 'yml_catalog/shop/offers/offer/vendorCode'
      },

      {
        name: 'Бренд',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'Производитель'
        }
      },

      {
        name: 'Наименование',
        valuePath: 'yml_catalog/shop/offers/offer/name'
      },

      {
        name: 'Ссылка на сайт',
        valuePath: 'yml_catalog/shop/offers/offer/url'
      },

      {
        name: 'Цена продажи',
        valuePath: 'yml_catalog/shop/offers/offer/price'
      },

      // Не актуально
      // {
      //   name: 'Закупочная цена',
      //   valuePath: 'yml_catalog/shop/offers/offer/purchase_price'
      // },

      // Всегда рубли
      // {
      //   name: 'currencyId',
      //   valuePath: 'yml_catalog/shop/offers/offer/currencyId'
      // },

      {
        name: 'Группа (Код)',
        valuePath: 'yml_catalog/shop/offers/offer/categoryId'
      },

      // Отдельная загрузка
      // {
      //   name: 'Изображения',
      //   valuePath: 'yml_catalog/shop/offers/offer/picture'
      // },

      {
        name: 'Штрихкод (code128)',
        valuePath: 'yml_catalog/shop/offers/offer/barcode'
      },

      {
        name: 'Описание',
        valuePath: 'yml_catalog/shop/offers/offer/description'
      },

      {
        name: 'Баркод WB',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'Баркод WB'
        }
      },

      {
        name: 'Внешний код РС24',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'Внешний код РС24'
        }
      },

      {
        name: 'Код 1-2',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'Код 1-2'
        }
      },

      {
        name: 'Ячейка для склада',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'Ячейка для склада'
        }
      },

      {
        name: 'FBO OZON',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'FBO OZON'
        }
      },

      {
        name: 'FBO WB',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'FBO WB'
        }
      },

      {
        name: 'Код ЭТМ',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'Код ЭТМ'
        }
      },

      {
        name: 'ID',
        valuePath: 'yml_catalog/shop/offers/offer/param',
        predicate: {
          type: 'equal',
          path: 'yml_catalog/shop/offers/offer/param[name]',
          value: 'ID'
        }
      }
    ]
  }
}

const offerPhoto: { writeable: Writable; mapping: XmlCsvMapping } = {
  writeable: offersPhotoCsvWriteable,
  mapping: {
    collection: 'yml_catalog/shop/offers',
    row: 'yml_catalog/shop/offers/offer',
    colls: [
      {
        name: 'Код',
        valuePath: 'yml_catalog/shop/offers/offer[id]'
      },

      {
        name: 'Изображения',
        valuePath: 'yml_catalog/shop/offers/offer/picture'
      }
    ]
  }
}

const timeStart = Date.now()

await parseXmlToCsvStreams(
  [
    // Currency
    currency,

    // Category
    category,

    // Offers
    offer,

    // Offers photos
    offerPhoto
  ],
  xmlReadable
)

const duration = (Date.now() - timeStart) / 1000

console.log(`DONE (${duration}s).`)
