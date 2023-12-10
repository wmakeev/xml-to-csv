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

  // const elemLastValue: Map<string, string> = new Map()
  const elemValuesMap: Map<string, string[]> = new Map()
  const elemIndexMap: Map<string, number> = new Map()

  const ctx: XmlCsvMappingPredicateContext = {
    elemValues: elemValuesMap,
    elemIndex: elemIndexMap
  }

  const collectionValueHandler: XmlSaxParserValueHandler = (
    elPath,
    elValue
  ) => {
    // Process value before row complete logic in case where row tag contain text

    //#region Value
    const curElemValues = (elemValuesMap.get(elPath) ?? []).concat([elValue])

    elemValuesMap.set(elPath, curElemValues)
    elemIndexMap.set(elPath, (elemIndexMap.get(elPath) ?? -1) + 1)

    const mappings = schema.collsMappings[elPath]

    let colls: XmlCsvMappingInternalColl[] | undefined = undefined

    if (mappings !== undefined) {
      colls = mappings.filter(
        m => (m.predicate?.(ctx, elValue, elPath) ?? true) === true
      )
    }

    // Field value
    if (colls !== undefined) {
      for (let i = 0, len = colls.length; i < len; i++) {
        const coll = colls[i]
        if (coll === undefined) throw new Error('coll === undefined')

        let _val

        if (coll.aggregation.type === 'first') {
          _val = curElemValues[0]
        } else if (coll.aggregation.type === 'last') {
          _val = curElemValues[curElemValues.length - 1]
        } else if (coll.aggregation.type === 'array') {
          // TODO coll.aggregation.allowEmpty
          _val = curElemValues.join(coll.aggregation.delimiter)
        }

        if (_val === '') _val = coll.defaultValue

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
      elemValuesMap.clear()
      elemIndexMap.clear()
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
