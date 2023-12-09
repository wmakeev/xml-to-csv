import {
  XmlSaxParser,
  XmlSaxParserElemHandler,
  XmlSaxParserValueHandler
} from '../XmlSaxParser/index.js'
import { getInternalCsvMapping } from './getInternalCsvMapping.js'
import {
  TableRow,
  XmlCsvMapping,
  XmlCsvMappingFilterContext,
  XmlCsvMappingInternal,
  XmlCsvMappingInternalColl
} from './types.js'

export const bindParsing = (
  container: { rows: TableRow[][] },
  parser: XmlSaxParser,
  index: number,
  mapping: XmlCsvMapping
) => {
  const schema: XmlCsvMappingInternal = getInternalCsvMapping(
    mapping,
    parser.delimiter
  )

  const rowTemplate: Array<string | undefined> = schema.collsNames.map(
    () => undefined
  )

  let row = [...rowTemplate]

  container.rows[index]!.push({
    row: [...schema.collsNames],
    end: false
  })

  const lastElValue: Map<string, string> = new Map()

  const ctx: XmlCsvMappingFilterContext = { lastElValue }

  const collectionValueHandler: XmlSaxParserValueHandler = (elName, value) => {
    // Process value before row complete logic in case where row tag contain text

    //#region Value
    lastElValue.set(elName, value)

    const mappings = schema.collsMappings[elName]

    let colls: XmlCsvMappingInternalColl[] | undefined = undefined

    if (mappings !== undefined) {
      colls = mappings.filter(m => (m.predicate?.(ctx, value) ?? true) === true)
    }

    // Field value
    if (colls !== undefined) {
      for (let i = 0, len = colls.length; i < len; i++) {
        const coll = colls[i]
        if (coll === undefined) throw new Error('coll === undefined')

        const _val = value === '' ? coll.defaultValue : value

        if (coll.isOutOfRowTag) {
          rowTemplate[coll.index] = _val
        } else {
          row[coll.index] = _val
        }
      }
    }
    //#endregion

    // Row completed
    if (schema.row === elName) {
      container.rows[index]!.push(
        //
        {
          row,
          end: false
        }
      )
      row = [...rowTemplate]
      lastElValue.clear()
    }

    // Table completed
    else if (schema.collection === elName) {
      container.rows[index]!.push({
        row: null,
        end: true
      })

      console.info(`Completed parsing "${schema.collection}" collection`)

      parser.offValue(collectionValueHandler)
      parser.offElem(rowStartHandler)
    }
  }

  const rowStartHandler: XmlSaxParserElemHandler = elName => {
    if (schema.row === elName) {
      row = [...rowTemplate]
    }
  }

  parser.onElem(rowStartHandler)
  parser.onValue(collectionValueHandler)
}
