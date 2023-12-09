// TODO Remove lodash dep
import { groupBy, mapValues } from 'lodash-es'

import {
  XmlCsvMapping,
  XmlCsvMappingInternal,
  XmlCsvMappingInternalColl,
  XmlCsvMappingPredicate,
  XmlCsvMappingPredicateConfig
} from './types.js'

const filters: Record<
  string,
  (config: XmlCsvMappingPredicateConfig) => XmlCsvMappingPredicate
> = {
  equal:
    ({ path, value }) =>
    ctx => {
      return ctx.lastElValue.get(path) === value
    }
}

/**
 * Convert mapping to optimized internal form
 */
export const getInternalCsvMapping = (
  mapping: XmlCsvMapping,
  delimiter: string
): XmlCsvMappingInternal => {
  const collsMappings_tmp1 = mapping.colls.map((coll, index) => {
    const isInsideRowTag =
      mapping.row === coll.valuePath ||
      (coll.valuePath.startsWith(mapping.row) &&
        [delimiter, '['].includes(coll.valuePath.at(mapping.row.length) ?? ''))

    const filter = coll.predicate
      ? filters[coll.predicate.type]?.(coll.predicate)
      : undefined

    const val: XmlCsvMappingInternalColl = {
      index,
      name: coll.name,
      predicate: filter,
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
