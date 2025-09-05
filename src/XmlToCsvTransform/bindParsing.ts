import {
  XmlSaxParser,
  XmlSaxParserElemHandler,
  XmlSaxParserValueHandler
} from '../types/XmlSaxParser.js'
import { getInternalCsvMapping } from './getInternalCsvMapping.js'
import {
  ParsedRowContainer,
  XmlCsvMapping,
  XmlCsvMappingPredicateContext,
  XmlCsvMappingInternal,
  XmlCsvMappingInternalCol
} from './types.js'

export const bindParsing = (
  container: { rows: ParsedRowContainer[] },
  parser: XmlSaxParser,
  mapping: XmlCsvMapping
) => {
  const schema: XmlCsvMappingInternal = getInternalCsvMapping(
    mapping,
    parser.getDelimiter()
  )

  const rowTemplate: Array<string | undefined> = schema.colsNames.map(
    () => undefined
  )

  let row = [...rowTemplate]

  container.rows.push({
    row: [...schema.colsNames],
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

    const mappings = schema.colsMappings[elPath]

    let cols: XmlCsvMappingInternalCol[] | undefined = undefined

    if (mappings !== undefined) {
      cols = mappings.filter(
        m => (m.predicate?.(ctx, elValue, elPath) ?? true) === true
      )
    }

    // Field value
    if (cols !== undefined) {
      for (let i = 0, len = cols.length; i < len; i++) {
        const col = cols[i]
        if (col === undefined) throw new Error('coll === undefined')

        let _val

        if (col.aggregation.type === 'first') {
          _val = curElemValues[0]
        } else if (col.aggregation.type === 'last') {
          _val = curElemValues[curElemValues.length - 1]
        } else if (col.aggregation.type === 'array') {
          // TODO coll.aggregation.allowEmpty
          _val = curElemValues.join(col.aggregation.delimiter)
        }

        if (_val === '') _val = col.defaultValue

        if (col.isOutOfRowTag) {
          rowTemplate[col.index] = _val
        } else {
          row[col.index] = _val
        }
      }
    }
    //#endregion

    // Row completed
    if (schema.row === elPath) {
      container.rows.push(
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
      container.rows.push({
        row: null,
        end: true
      })

      console.info(`Completed parsing "${schema.collection}" collection`)

      parser.removeHandlers()
    }
  }

  const rowStartHandler: XmlSaxParserElemHandler = elPath => {
    if (schema.row === elPath) {
      row = [...rowTemplate]
    }
  }

  parser.setElemHandler(rowStartHandler)
  parser.setValueHandler(collectionValueHandler)
}
