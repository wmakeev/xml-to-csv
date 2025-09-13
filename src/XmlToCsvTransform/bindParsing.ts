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
  XmlCsvMappingInternalColumn
} from './types.js'

export const bindParsing = (
  container: { rows: ParsedRowContainer[] },
  parser: XmlSaxParser,
  mapping: XmlCsvMapping
) => {
  const schema: XmlCsvMappingInternal = getInternalCsvMapping(mapping)

  const rowTemplate: Array<string | undefined> = Array(
    schema.columnsNames.length
  ).fill(undefined)

  let row = [...rowTemplate]

  container.rows.push({
    row: [...schema.columnsNames],
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
    let curElemValues = elemValuesMap.get(elPath)

    if (curElemValues === undefined) {
      curElemValues = []
      elemValuesMap.set(elPath, curElemValues)
    }

    curElemValues.push(elValue)

    elemIndexMap.set(elPath, (elemIndexMap.get(elPath) ?? -1) + 1)

    const mappings = schema.columnsMappings[elPath]

    let columns: XmlCsvMappingInternalColumn[] | undefined = undefined

    if (mappings !== undefined) {
      columns = mappings.filter(
        m => (m.predicate?.(ctx, elValue, elPath) ?? true) === true
      )
    }

    // Field value
    if (columns !== undefined) {
      for (const col of columns) {
        if (col === undefined) throw new Error('column === undefined')

        let _val

        if (col.aggregation.type === 'FIRST') {
          _val = curElemValues[0]
        } else if (col.aggregation.type === 'LAST') {
          _val = curElemValues[curElemValues.length - 1]
        } else if (col.aggregation.type === 'ARRAY') {
          // TODO coll.aggregation.allowEmpty
          _val = JSON.stringify(curElemValues)
        } else if (col.aggregation.type === 'JOIN') {
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
