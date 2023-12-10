import {
  XmlSaxParser,
  XmlSaxParserElemHandler,
  XmlSaxParserValueHandler
} from '../XmlSaxParser/index.js'
import { getInternalCsvMapping } from './getInternalCsvMapping.js'
import {
  TableRow,
  XmlCsvMapping,
  XmlCsvMappingPredicateContext,
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

  const elemLastValue: Map<string, string> = new Map()
  const elemLastIndex: Map<string, number> = new Map()

  const ctx: XmlCsvMappingPredicateContext = { elemLastValue, elemLastIndex }

  const collectionValueHandler: XmlSaxParserValueHandler = (elPath, value) => {
    // Process value before row complete logic in case where row tag contain text

    //#region Value
    elemLastValue.set(elPath, value)
    elemLastIndex.set(elPath, (elemLastIndex.get(elPath) ?? -1) + 1)

    const mappings = schema.collsMappings[elPath]

    let colls: XmlCsvMappingInternalColl[] | undefined = undefined

    if (mappings !== undefined) {
      colls = mappings.filter(
        m => (m.predicate?.(ctx, value, elPath) ?? true) === true
      )
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
    if (schema.row === elPath) {
      container.rows[index]!.push(
        //
        {
          row,
          end: false
        }
      )
      row = [...rowTemplate]
      elemLastValue.clear()
      elemLastIndex.clear()
    }

    // Table completed
    else if (schema.collection === elPath) {
      container.rows[index]!.push({
        row: null,
        end: true
      })

      console.info(`Completed parsing "${schema.collection}" collection`)

      parser.offValue(collectionValueHandler)
      parser.offElem(rowStartHandler)
    }
  }

  const rowStartHandler: XmlSaxParserElemHandler = elPath => {
    if (schema.row === elPath) {
      row = [...rowTemplate]
    }
  }

  parser.onElem(rowStartHandler)
  parser.onValue(collectionValueHandler)
}
