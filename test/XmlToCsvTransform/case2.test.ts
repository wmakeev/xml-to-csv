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
import { pipeline } from 'node:stream/promises'
import test from 'node:test'

import { createXmlToCsvTransformer } from '../../src/index.js'

async function* rowsFlatten(src: AsyncGenerator<string[][]>) {
  for await (const rows of src) {
    for (const row of rows) {
      yield row
    }
  }
}

const composeWriteStream = (fileName: string) =>
  compose(rowsFlatten, stringify(), createWriteStream(fileName))

test('createXmlToCsvTransformer #case2', async () => {
  const CASE2_CSV_FILE = path.join(process.cwd(), '__temp/output/case2.csv')

  await pipeline(
    createReadStream(path.join(process.cwd(), 'test/cases/case2.xml'), {
      encoding: 'utf8'
    }),

    createXmlToCsvTransformer({
      collection: 'Корень',
      row: 'Корень/Элемент',
      columns: [
        {
          name: 'Описание',
          valuePath: 'Корень/Элемент/Описание'
        }
      ]
    }),

    composeWriteStream(CASE2_CSV_FILE)
  )

  const categoryCsvTxt = await readFile(CASE2_CSV_FILE, 'utf8')

  const categoryCsv = parse(categoryCsvTxt)

  assert.deepStrictEqual(
    categoryCsv,
    [
      ['Описание'],
      [
        '<p>Материал ЛДСП</p> <p><span>Угловое завершение может быть использовано со шкафами серии оптима комфорт</span><span></span></p> <p><span>Универсальные полки к Шкафу-купе &laquo;Оптима-2200&raquo;,</span><br><span>подходят ко всем шкафам-купе &laquo;Оптима&raquo; высотой 2м 20см, размещение слева или справа</span></p>'
      ],
      [
        '<p><span>Гостиная Авангард&nbsp; &mdash; легкая, но вместе с тем, вместительная композиция в современном стиле.</span></p> <p><span>Поставляется в цвете дуб сонома.</span></p> <p><span>Роликовые направляющие.</span></p> <p><span>Петли без доводчика.</span></p> <p><span>Кромка пластик на видимых элементах.</span></p> <p><span></span></p> <p>Указана цена за комплект стенки с элементами перечисленными ниже.</p>'
      ],
      [
        '<p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;">Допустимая нагрузка: 110 кг (на одну персону).</span></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;">Высота: около 170 мм.</span></p> <p style="font-size: 11.111111640930176px;"></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px; color: #008000;"><strong>Слои в матрасе снаружи внутрь:</strong></span></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;"><strong>1) Ткань стеганная Жаккард.</strong></span></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;">Жаккард. гладкая безворсовая ткань сложного плетения, в состав которой входят как синтетические, так и органические волокна. Своеобразный рельефный рисунок, который получается в результате сложного плетения на плотной ткани, напоминает своего рода гобелен. Жаккардовой тканью часто обтягивают матрасы для того, чтобы продлить срок его службы. К тому же применение особой пропитки специальными веществами позволяет избегать появления статического электричества, обеспечивая удобство и комфорт использования.</span></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;"></span></p> <p style="font-size: 11.111111640930176px;"><strong style="font-size: 13.333333969116211px; line-height: 15.600000381469727px;">2) Пенополиуретан.</strong></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;">Пенополиуретан, известный под торговым названием "поролон" - мягкая полиуретановая пена, состоящая на 90% из воздуха. Благодаря мелкоячеистой структуре поролон обладает хорошими показателями эластичности и воздухопроницаемости. Вместе с тем он не является долговечным (быстро теряет упругость, крошится), а также способен гореть с выделением вредных веществ.</span></p> <p style="font-size: 11.111111640930176px;"></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;"><strong>2) Ватин - Хлопковое полотно.</strong></span></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;">Хлопковое нетканое волокно (ватин), получаемое из натуральных хлопковых волокон, проходит специальную обработку, затем прессуется и прошивается нитками (холстопрошивное) либо пробивается иглами (иглопробивное) для прочности. Используется в матрасах как дополнительный гигиенический слой, обладающий антиаллергенностью, гигроскопичностью, хорошим пропусканием влаги и воздуха, теплосберегающими свойствами.</span></p> <p style="font-size: 11.111111640930176px;"></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;"><strong>3) Изоляционная прослойка из термоволока. </strong></span></p> <p style="font-size: 11.111111640930176px;"></p> <p style="font-size: 11.111111640930176px;"><span style="font-size: small; line-height: 15.600000381469727px;"><strong>4) Пружинный блок Punktoflaex.</strong></span></p> <p style="font-size: 11.111111640930176px;"></p> <p style="font-size: 13px;">Цвет и текстура чехла может отличаться от фото и образца в магазине.<br>Размеры матраса имеют погрешность +-1,5 см.</p>'
      ]
    ],
    'should contain csv'
  )
})
