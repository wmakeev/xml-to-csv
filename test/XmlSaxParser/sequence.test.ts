import path from 'node:path'
import test from 'node:test'
import { XmlSaxParser } from '../../src/XmlSaxParser/index.js'
import { createReadStream } from 'node:fs'

test('sequence', async () => {
  const xmlFile = path.join(process.cwd(), 'test/cases/case1.xml')

  const parser = new XmlSaxParser({ highWaterMark: 64 * 1024 })

  parser.onElem(el => {
    console.debug(`onElem: ${el}`)
  })

  parser.onValue((el, val) => {
    console.debug(`onValue: ${el} = "${val}"`)
  })

  await parser.start()

  const readable = createReadStream(xmlFile, {
    highWaterMark: 32 * 1024
  })

  for await (const chunk of readable) {
    parser.write(chunk)
  }

  parser.stop()
})
