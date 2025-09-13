import { XmlCsvMapping } from '../../../src/index.js'

export const ymlBindings: Array<{
  active: boolean
  name: string
  url: string
  outFilename: string
  outFormat: string
  mapping: XmlCsvMapping & {
    columns: { _rowNum: number }[] // Array<XmlCsvMapping['columns'][number] & { _rowNum: number }>
  }
}> = [
  {
    active: true,
    name: 'Maytoni',
    url: 'https://mais-upload.maytoni.de/YML/all.yml',
    outFilename: 'maytoni-products',
    outFormat: '.csv',
    mapping: {
      collection: 'yml_catalog/shop/offers',
      row: 'yml_catalog/shop/offers/offer',
      columns: [
        {
          _rowNum: 2,
          name: 'Полное наименование',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Полное наименование'
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 3,
          name: 'Наименование товара',
          valuePath: 'yml_catalog/shop/offers/offer/name',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 4,
          name: 'Артикул',
          valuePath: 'yml_catalog/shop/offers/offer/vendorCode',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 5,
          name: 'Описание',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Описание для каталога'
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 6,
          name: 'Цена продажи',
          valuePath: 'yml_catalog/shop/offers/offer/price',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 7,
          name: 'Штрихкод (EAN13)',
          valuePath: 'yml_catalog/shop/offers/offer/barcode',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 8,
          name: 'Вес',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Вес брутто'
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 9,
          name: 'Объем',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Объем коробки, м3'
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 10,
          name: 'Изображение',
          valuePath: 'yml_catalog/shop/offers/offer/picture',
          predicate: {
            type: 'index',
            value: 0
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 11,
          name: 'Ширина в упаковке, см',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Ширина коробки, мм'
          },
          defaultValue: '',
          aggregation: {
            type: 'FIRST'
          }
        },
        {
          _rowNum: 12,
          name: 'Высота коробки, мм',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Высота коробки, мм'
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 13,
          name: 'Длина коробки, мм',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Длина коробки, мм'
          },
          aggregation: {
            type: 'LAST'
          }
        }
      ]
    }
  },
  {
    active: true,
    name: 'Denkirs (категории)',
    url: 'https://dealer.denkirs.ru/catalog.xml',
    outFilename: 'denkirs-categories',
    outFormat: '.csv',
    mapping: {
      collection: 'yml_catalog/shop/categories',
      row: 'yml_catalog/shop/categories/category',
      columns: [
        {
          _rowNum: 14,
          name: 'Наименование группы',
          valuePath: 'yml_catalog/shop/categories/category',
          aggregation: {
            type: 'LAST'
          }
        }
      ]
    }
  },
  {
    active: true,
    name: 'Denkirs',
    url: 'https://dealer.denkirs.ru/catalog.xml',
    outFilename: 'denkirs-products',
    outFormat: '.csv',
    mapping: {
      collection: 'yml_catalog/shop/offers',
      row: 'yml_catalog/shop/offers/offer',
      columns: [
        {
          _rowNum: 15,
          name: 'Наименование товара',
          valuePath: 'yml_catalog/shop/offers/offer/name',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 16,
          name: 'Артикул',
          valuePath: 'yml_catalog/shop/offers/offer/vendorCode',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 17,
          name: 'Описание',
          valuePath: 'yml_catalog/shop/offers/offer/description',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 18,
          name: 'Штрихкод (EAN13)',
          valuePath: 'yml_catalog/shop/offers/offer/barcode',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 19,
          name: 'Изображение',
          valuePath: 'yml_catalog/shop/offers/offer/picture',
          predicate: {
            type: 'index',
            value: 0
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 20,
          name: 'Вес',
          valuePath: 'yml_catalog/shop/offers/offer/weight',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 21,
          name: 'Объем',
          valuePath: 'yml_catalog/shop/offers/offer/volume',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 22,
          name: 'Ширина в упаковке, см',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Размер коробки (Ш)'
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 23,
          name: 'Высота в упаковке, см',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Размер коробки (В)'
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 24,
          name: 'Длина в упаковке, см',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          predicate: {
            type: 'equal',
            path: 'yml_catalog/shop/offers/offer/param/@name',
            value: 'Размер коробки (Д)'
          },
          aggregation: {
            type: 'LAST'
          }
        }
      ]
    }
  },
  {
    active: true,
    name: 'UNIEL (категории)',
    url: 'http://ext.uniel.shop/yml.xml',
    outFilename: 'uniel-categories',
    outFormat: '.csv',
    mapping: {
      collection: 'yml_catalog/shop/categories',
      row: 'yml_catalog/shop/categories/category',
      columns: [
        {
          _rowNum: 25,
          name: 'Наименование группы',
          valuePath: 'yml_catalog/shop/categories/category',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 26,
          name: 'Внешний код',
          valuePath: 'yml_catalog/shop/categories/category/@id',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 27,
          name: 'Группа (Внешний код)',
          valuePath: 'yml_catalog/shop/categories/category/@parentId',
          aggregation: {
            type: 'LAST'
          }
        }
      ]
    }
  },
  {
    active: true,
    name: 'UNIEL',
    url: 'http://ext.uniel.shop/yml.xml',
    outFilename: 'uniel-products',
    outFormat: '.csv',
    mapping: {
      collection: 'yml_catalog/shop/offers',
      row: 'yml_catalog/shop/offers/offer',
      columns: [
        {
          _rowNum: 28,
          name: 'Наименование товара',
          valuePath: 'yml_catalog/shop/offers/offer/fullname',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 29,
          name: 'Описание',
          valuePath: 'yml_catalog/shop/offers/offer/description',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 30,
          name: 'Группа (Внешний код)',
          valuePath: 'yml_catalog/shop/offers/offer/description/categoryId',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 31,
          name: 'Артикул',
          valuePath: 'yml_catalog/shop/offers/offer/vendorCode',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 32,
          name: 'Вес',
          valuePath: 'yml_catalog/shop/offers/offer/weight',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 33,
          name: 'Изображение',
          valuePath: 'yml_catalog/shop/offers/offer/picture',
          predicate: {
            type: 'index',
            value: 0
          },
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 34,
          name: 'Цена',
          valuePath: 'yml_catalog/shop/offers/offer/price',
          aggregation: {
            type: 'LAST'
          }
        }
      ]
    }
  },
  {
    active: true,
    name: 'TEST',
    url: 'http://ext.uniel.shop/yml.xml',
    outFilename: 'test-products',
    outFormat: '.csv',
    mapping: {
      collection: 'yml_catalog/shop/offers',
      row: 'yml_catalog/shop/offers/offer',
      columns: [
        {
          _rowNum: 35,
          name: 'Наименование',
          valuePath: 'yml_catalog/shop/offers/offer/fullname',
          aggregation: {
            type: 'LAST'
          }
        },
        {
          _rowNum: 36,
          name: 'Изображения',
          valuePath: 'yml_catalog/shop/offers/offer/picture',
          aggregation: {
            type: 'JOIN',
            delimiter: ','
          }
        },
        {
          _rowNum: 37,
          name: 'Параметры (наименования)',
          valuePath: 'yml_catalog/shop/offers/offer/param/@name',
          aggregation: {
            type: 'ARRAY'
          }
        },
        {
          _rowNum: 38,
          name: 'Параметры (значения)',
          valuePath: 'yml_catalog/shop/offers/offer/param',
          aggregation: {
            type: 'ARRAY'
          }
        }
      ]
    }
  }
]
