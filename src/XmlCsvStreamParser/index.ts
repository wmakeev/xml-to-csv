import { stringify } from 'csv-stringify/sync'
import assert from 'node:assert'
import { Readable, Writable } from 'node:stream'

import { getTablesRowsGen } from './getTablesRowsGen.js'
import { XmlCsvMapping } from './types.js'

export * from './types.js'

export async function parseXmlToCsvStreams(
  targets: { writeable: Writable; mapping: XmlCsvMapping }[],
  xmlSource: Readable
) {
  const writeables = targets.map(t => t.writeable)
  const mappings = targets.map(t => t.mapping)

  for await (const tableRowsByIndex of getTablesRowsGen(mappings, xmlSource)) {
    for (
      let writeableIndex = 0, len = tableRowsByIndex.length;
      writeableIndex < len;
      writeableIndex++
    ) {
      const tableRows = tableRowsByIndex[writeableIndex]
      if (tableRows === undefined || tableRows.length === 0) continue

      const rows = []
      let isEnd = false

      for (
        let tableRowIndex = 0, len = tableRows.length;
        tableRowIndex < len;
        tableRowIndex++
      ) {
        const tableRow = tableRows[tableRowIndex]
        if (tableRow === undefined) throw new Error('tableRow === undefined')

        if (tableRow.end) {
          isEnd = true
          break
        } else {
          rows.push(tableRow.row)
        }
      }

      const writeable = writeables[writeableIndex]
      assert.ok(writeable !== undefined)

      const csv = stringify(rows)

      // write csv chunk
      const chunk = Buffer.from(csv, 'utf8')

      if (!writeable.writable) continue

      const shouldDrain = !writeable.write(chunk)

      if (isEnd) {
        writeable.end()
        // TODO remove writeable
        continue
      }

      if (shouldDrain) {
        await new Promise(resolve => {
          writeable.once('drain', resolve)
          // TODO Нужно ли слушать другие события?
        })
      }
    }
  }
}
