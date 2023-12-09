import { Readable } from 'stream'

import { XmlSaxParser } from '../XmlSaxParser/index.js'
import { bindParsing } from './bindParsing.js'
import { TableRow, XmlCsvMapping } from './types.js'

export async function* getTablesRowsGen(
  mappings: XmlCsvMapping[],
  xmlReadable: Readable
) {
  const container: { rows: TableRow[][] } = {
    rows: [...mappings.map(() => [])]
  }

  const parser = new XmlSaxParser({ highWaterMark: 64 * 1024 })

  for (const [index, mapping] of mappings.entries()) {
    bindParsing(container, parser, index, mapping)
  }

  await parser.start()

  for await (const chunk of xmlReadable) {
    if (parser.isStopped()) break

    parser.write(chunk)

    let hasRows = false
    for (let i = 0, len = container.rows.length; i <= len; i++) {
      if (container.rows.length !== 0) {
        hasRows = true
        break
      }
    }
    if (!hasRows) continue

    yield container.rows
    container.rows = [...mappings.map(() => [])]
  }
}
