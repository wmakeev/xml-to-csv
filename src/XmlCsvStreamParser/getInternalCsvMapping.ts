// TODO Remove lodash dep
import { groupBy, mapValues } from 'lodash-es'

import {
  XmlCsvMapping,
  XmlCsvMappingInternal,
  XmlCsvMappingInternalColl,
  XmlCsvMappingPredicateRecord
} from './types.js'

const predicates: XmlCsvMappingPredicateRecord = {
  equal:
    ({ path, value }) =>
    ctx => {
      return ctx.elemLastValue.get(path) === value
    },

  index:
    ({ path, value }) =>
    (ctx, _, elPath) => {
      return ctx.elemLastIndex.get(path ?? elPath) === value
    }
}

/**
 * Convert mapping to optimized internal form
 */
export const getInternalCsvMapping = (
  mapping: XmlCsvMapping,
  delimiter: string
): XmlCsvMappingInternal => {
  // TODO Нужно подумать над конфигурацией или подробно описать почему она такая
  // какая есть; Возможно ввести полные и относительные пути, чтобы не дублировать пути.

  const collsMappings_tmp1 = mapping.colls.map((coll, index) => {
    const isInsideRowTag =
      mapping.row === coll.valuePath ||
      (coll.valuePath.startsWith(mapping.row) &&
        [delimiter, '['].includes(coll.valuePath.at(mapping.row.length) ?? ''))

    const predicate = coll.predicate
      ? predicates[coll.predicate.type]?.(coll.predicate as any)
      : undefined

    const val: XmlCsvMappingInternalColl = {
      index,
      name: coll.name,
      predicate,
      defaultValue: coll.defaultValue ?? '',
      isOutOfRowTag: !isInsideRowTag
    }

    const entry: [string, XmlCsvMappingInternalColl] = [coll.valuePath, val]

    return entry
  })

  const collsMappings_tmp2 = groupBy(collsMappings_tmp1, ent => ent[0])

  const collsMappings = mapValues(collsMappings_tmp2, arr => arr.map(a => a[1]))

  const result = {
    collection: mapping.collection,
    row: mapping.row,
    collsMappings,
    collsNames: mapping.colls.map(c => c.name)
  }

  if (result.collection === result.row) {
    throw new Error(
      `collection tag "${result.collection}" should not to be equal to row tag`
    )
  }

  return result
}
