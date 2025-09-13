export type XmlCsvMappingPredicateConfig =
  | {
      type: 'equal'
      path: string
      value: string
    }
  | {
      type: 'index'
      path?: string
      value: number
    }

export type XmlCsvMappingPredicateRecord = {
  [type in XmlCsvMappingPredicateConfig['type']]: (
    predicate: Extract<XmlCsvMappingPredicateConfig, { type: type }>
  ) => XmlCsvMappingPredicate
}

export interface XmlCsvMapping {
  /** XML element contains rows */
  collection: string

  /** XML element contains row */
  row: string

  columns: {
    /** Csv column name */
    name: string

    /** XML element contains value */
    valuePath: string

    predicate?: XmlCsvMappingPredicateConfig

    /** Default value in case if XML value is not defined */
    defaultValue?: string

    /** Should collect values as array */
    aggregation?:
      | { type: 'FIRST' }
      | { type: 'LAST' }
      | { type: 'ARRAY'; allowEmpty?: boolean }
      | { type: 'JOIN'; delimiter?: string; allowEmpty?: boolean }
  }[]
}

export interface XmlCsvMappingPredicateContext {
  elemValues: Map<string, string[]>
  elemIndex: Map<string, number>
}

export type XmlCsvMappingPredicate = (
  ctx: XmlCsvMappingPredicateContext,
  elValue: string,
  elPath: string
) => boolean

export type XmlCsvMappingInternalColumn = {
  index: number
  name: string
  predicate?: XmlCsvMappingPredicate | undefined
  defaultValue: string
  isOutOfRowTag: boolean
  aggregation:
    | { type: 'FIRST' }
    | { type: 'LAST' }
    | { type: 'ARRAY'; allowEmpty: boolean }
    | { type: 'JOIN'; delimiter: string; allowEmpty: boolean }
}

export interface XmlCsvMappingInternal {
  collection: string
  row: string
  columnsMappings: Record<string, XmlCsvMappingInternalColumn[]>
  columnsNames: string[]
}

export type CsvRow = (string | undefined)[]

export type ParsedRowContainer =
  | {
      row: CsvRow
      end: false
    }
  | {
      row: null
      end: true
    }
