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

  colls: {
    /** Csv collumn name */
    name: string

    /** XML element contains value */
    valuePath: string

    predicate?: XmlCsvMappingPredicateConfig

    /** Default value in case if XML value is not defined */
    defaultValue?: string
  }[]
}

export interface XmlCsvMappingPredicateContext {
  elemLastValue: Map<string, string>
  elemLastIndex: Map<string, number>
}

export type XmlCsvMappingPredicate = (
  ctx: XmlCsvMappingPredicateContext,
  value: string,
  elPath: string
) => boolean

export type XmlCsvMappingInternalColl = {
  index: number
  name: string
  predicate?: XmlCsvMappingPredicate | undefined
  defaultValue: string
  isOutOfRowTag: boolean
}

export interface XmlCsvMappingInternal {
  /** Maximum csv tables count that should be parsed from xml */
  maxExpectedTablesCount?: number
  collection: string
  row: string
  collsMappings: Record<string, XmlCsvMappingInternalColl[]>
  collsNames: string[]
}

export type TableRow =
  | {
      row: (string | undefined)[]
      end: false
    }
  | {
      row: null
      end: true
    }
