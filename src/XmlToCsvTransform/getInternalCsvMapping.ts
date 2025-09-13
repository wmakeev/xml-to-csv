// TODO Remove lodash dep?
import groupBy from 'lodash.groupby'
import mapValues from 'lodash.mapvalues'

import {
  XmlCsvMapping,
  XmlCsvMappingInternal,
  XmlCsvMappingInternalColumn,
  XmlCsvMappingPredicateRecord
} from './types.js'

const predicates: XmlCsvMappingPredicateRecord = {
  equal:
    ({ path, value }) =>
    ctx => {
      return ctx.elemValues.get(path)?.at(-1) === value
    },

  index:
    ({ path, value }) =>
    (ctx, _, elPath) => {
      return ctx.elemIndex.get(path ?? elPath) === value
    }
}

/**
 * Convert mapping to optimized internal form
 */
export const getInternalCsvMapping = (
  mapping: XmlCsvMapping
): XmlCsvMappingInternal => {
  // TODO Нужно подумать над конфигурацией или подробно описать почему она такая
  // какая есть; Возможно ввести полные и относительные пути, чтобы не дублировать пути.

  const colsMappings_tmp1 = mapping.columns.map((col, index) => {
    const isInsideRowTag =
      mapping.row === col.valuePath ||
      col.valuePath.startsWith(`${mapping.row}/`)

    const predicate = col.predicate
      ? predicates[col.predicate.type]?.(col.predicate as any)
      : undefined

    const aggregation: XmlCsvMappingInternalColumn['aggregation'] =
      col.aggregation?.type === 'JOIN'
        ? {
            type: 'JOIN',
            delimiter: col.aggregation.delimiter ?? ',',
            allowEmpty: col.aggregation.allowEmpty ?? false
          }
        : col.aggregation?.type === 'ARRAY'
          ? { type: 'ARRAY', allowEmpty: col.aggregation.allowEmpty ?? false }
          : (col.aggregation ?? { type: 'LAST' })

    const val: XmlCsvMappingInternalColumn = {
      index,
      name: col.name,
      predicate,
      defaultValue: col.defaultValue ?? '',
      isOutOfRowTag: !isInsideRowTag,
      aggregation
    }

    const entry: [string, XmlCsvMappingInternalColumn] = [col.valuePath, val]

    return entry
  })

  const colsMappings_tmp2 = groupBy(colsMappings_tmp1, ent => ent[0])

  const colsMappings = mapValues(colsMappings_tmp2, arr => arr.map(a => a[1]))

  const result = {
    collection: mapping.collection,
    row: mapping.row,
    columnsMappings: colsMappings,
    columnsNames: mapping.columns.map(c => c.name)
  }

  if (result.collection === result.row) {
    throw new Error(
      `collection tag "${result.collection}" should not to be equal to row tag`
    )
  }

  return result
}
