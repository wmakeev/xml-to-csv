import path from 'node:path'

import { XmlSaxParser } from '../../src/XmlSaxParser/index.js'
import { createReadStream } from 'node:fs'

const xmlFile = path.join(process.cwd(), '__temp/income/export_EFo.xml')
// const xmlFile = path.join(process.cwd(), 'test/cases/test.xml')

const parser = new XmlSaxParser({ highWaterMark: 64 * 1024 })

/** @type {Map<string, number>} */
const paramsMap = new Map()

parser.onValue((el, val) => {
  if (el !== 'yml_catalog/shop/offers/offer/param[name]') return

  const count = paramsMap.get(val)

  if (count === undefined) {
    console.log(val)
    paramsMap.set(val, 1)
  } else {
    paramsMap.set(val, count + 1)
  }
})

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
for (const [key, value] of paramsMap.entries()) {
  console.log(key, value)
}
