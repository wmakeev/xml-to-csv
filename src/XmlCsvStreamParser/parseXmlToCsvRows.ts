import assert from 'node:assert'
import { Readable, Writable } from 'node:stream'
import { once } from 'node:events'

import { getTablesRowsGen } from './getTablesRowsGen.js'
import { XmlCsvMapping } from './types.js'

export async function parseXmlToCsvRows(
  xmlSource: Readable,
  targets: { writeable: Writable; mapping: XmlCsvMapping }[]
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

      const rows: (string | undefined)[][] = []
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

      if (!writeable.writable) continue

      const shouldDrain = !writeable.write(rows)

      if (isEnd) {
        writeable.end()
        // TODO remove writeable
        continue
      }

      if (shouldDrain) {
        await once(writeable, 'drain')
        // TODO Нужно ли слушать другие события?
      }
    }
  }
}
