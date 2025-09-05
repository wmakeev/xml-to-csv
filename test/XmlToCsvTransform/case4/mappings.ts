import { XmlCsvMapping } from '../../../src/index.js'

export const ymlMappings: Record<'offer', XmlCsvMapping> = {
  offer: {
    collection: 'yml_catalog/shop/offers',
    row: 'yml_catalog/shop/offers/offer',
    cols: [
      {
        name: 'ID поставщика',
        valuePath: 'yml_catalog/shop/offers/offer[id]'
      },
      {
        name: 'Доступен',
        valuePath: 'yml_catalog/shop/offers/offer[available]'
      },
      {
        name: 'Бренд',
        valuePath: 'yml_catalog/shop/offers/offer/vendor'
      },
      {
        name: 'Артикул',
        valuePath: 'yml_catalog/shop/offers/offer/vendorCode'
      },
      {
        name: 'Наименование',
        valuePath: 'yml_catalog/shop/offers/offer/model'
      },
      {
        name: 'Цена',
        valuePath: 'yml_catalog/shop/offers/offer/price'
      },
      {
        name: 'Цена старая',
        valuePath: 'yml_catalog/shop/offers/offer/oldprice'
      },
      {
        name: 'Валюта',
        valuePath: 'yml_catalog/shop/offers/offer/currencyId'
      },
      {
        name: 'Остаток',
        valuePath: 'yml_catalog/shop/offers/offer/outlets/outlet[instock]'
      },
      {
        name: 'Изображение',
        valuePath: 'yml_catalog/shop/offers/offer/picture'
      },
      {
        name: 'Ссылка',
        valuePath: 'yml_catalog/shop/offers/offer/url'
      },
      {
        name: 'Описание',
        valuePath: 'yml_catalog/shop/offers/offer/description'
      },
      {
        name: 'Дата каталога',
        valuePath: 'yml_catalog[date]'
      }
    ]
  }
}
