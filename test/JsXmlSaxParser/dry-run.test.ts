import path from 'node:path'

import { JsXmlSaxParser } from '../../src/JsXmlSaxParser/index.js'
import { createReadStream } from 'node:fs'

const xmlFile = path.join(process.cwd(), '__temp/income/export_EFo.xml')
// const xmlFile = path.join(process.cwd(), 'test/cases/test.xml')

const parser = new JsXmlSaxParser()

parser.setElemHanlder(() => {})

await parser.start()

// stream from a file in the current directory
const readable = createReadStream(xmlFile, {
  highWaterMark: 512 * 1024,
  encoding: 'utf8'
})

console.time('Parsing')

for await (const chunk of readable) {
  parser.write(chunk)
}

parser.stop()

console.timeEnd('Parsing') // 56s
