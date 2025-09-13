import sax from 'sax'
import path from 'node:path'
import { createReadStream } from 'node:fs'

const xmlFile = path.join(process.cwd(), '__temp/income/export_EFo.xml')

const parser = sax.parser(true)

parser.onattribute = () => {}
parser.onopentagstart = () => {}
parser.onclosetag = () => {}
parser.ontext = () => {}
parser.oncdata = () => {}
parser.onerror = () => {}

// stream from a file in the current directory
const readable = createReadStream(xmlFile, {
  highWaterMark: 512 * 1024,
  encoding: 'utf8'
})

console.time('Parsing')

for await (const chunk of readable) {
  parser.write(chunk)
}
parser.close()

console.timeEnd('Parsing') // 13.5s
