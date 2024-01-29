import { JsXmlSaxParser } from '../JsXmlSaxParser/index.js'
import { XmlSaxParser } from '../types/XmlSaxParser.js'
import { bindParsing } from './bindParsing.js'
import { CsvRow, ParsedRowContainer, XmlCsvMapping } from './types.js'

export const createXmlToCsvTransformer = (mapping: XmlCsvMapping) => {
  const parser: XmlSaxParser = new JsXmlSaxParser()

  return async function* (source: Iterable<string> | AsyncIterable<string>) {
    const outputRowsContainer: { rows: ParsedRowContainer[] } = {
      rows: []
    }

    bindParsing(outputRowsContainer, parser, mapping)

    if (parser.isStopped()) {
      await parser.start()
    }

    for await (const chunk of source) {
      parser.write(chunk)

      // await setImmediate() // Нет необходимости парсинг должен быть синхронной операцией

      if (outputRowsContainer.rows.length > 0) {
        let isParsingComplete = false

        const csvRows: CsvRow[] = []

        for (const rowContainer of outputRowsContainer.rows) {
          if (rowContainer.end === false) {
            csvRows.push(rowContainer.row)
          } else {
            isParsingComplete = true
            break
          }
        }

        yield csvRows

        if (isParsingComplete) {
          return
        }

        outputRowsContainer.rows = []
      }
    }
  }
}
