import { XmlCsvMapping } from '../../src/index.js'

export const ymlMappings: Record<
  'currency' | 'category' | 'offer' | 'offerPhoto',
  XmlCsvMapping
> = {
  currency: {
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
  },

  category: {
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
  },

  offer: {
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
  },

  offerPhoto: {
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
