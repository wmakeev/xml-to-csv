import path from 'node:path'

import { XmlSaxParser } from '../../src/XmlSaxParser/index.js'
import { createReadStream } from 'node:fs'

const xmlFile = path.join(process.cwd(), '__temp/income/export_EFo.xml')
// const xmlFile = path.join(process.cwd(), 'test/cases/test.xml')

const parser = new XmlSaxParser({ highWaterMark: 64 * 1024 })

const elMap: Map<string, number> = new Map()

parser.onElem(el => {
  const count = elMap.get(el)

  if (count === undefined) {
    console.log(el)
    elMap.set(el, 1)
  } else {
    elMap.set(el, count + 1)
  }
})

// parser.onValue('yml_catalog.shop.categories.category', (val, el) => {
//   console.log(el, val)
// })

await parser.start()

// stream from a file in the current directory
const readable = createReadStream(xmlFile, {
  highWaterMark: 32 * 1024
})

console.time('Parsing')
for await (const chunk of readable) {
  parser.write(chunk)
}

parser.stop()
console.timeEnd('Parsing')

console.log('\nStatistics:')
for (const [key, value] of elMap.entries()) {
  console.log(key, value)
}
