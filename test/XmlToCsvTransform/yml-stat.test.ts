import { createReadStream } from 'node:fs'
import path from 'node:path'
import { Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import test from 'node:test'

import { createXmlToCsvTransformer } from '../../src/index.js'
import { ymlMappings } from './case3/mappings.js'

// Not to test (to estimate large XML parsing time)
test('Large YML offers parsing', async () => {
  let flushes = 0
  let rows = 0

  class ConsumerTransform extends Writable {
    override _write(
      chunk: any,
      _encoding: BufferEncoding,
      callback: (error?: Error | null | undefined) => void
    ): void {
      flushes += 1
      rows += chunk.length
      callback()
    }
  }

  const consumer = new ConsumerTransform({
    objectMode: true,
    highWaterMark: 10000
  })

  const timeStart = Date.now()

  await pipeline(
    // Read source XML
    createReadStream(path.join(process.cwd(), '__temp/income/export_EFo.xml'), {
      // От размера чанка производительность в даннм тесте практически не зависит
      highWaterMark: 512 * 1024,
      encoding: 'utf8'
    }),

    // Create XML to CSV transformer
    createXmlToCsvTransformer(ymlMappings.offer),

    consumer
  )

  const duration = (Date.now() - timeStart) / 1000

  console.log('offers flushes -', flushes) // 619
  console.log('offers rows -', rows) // 389641

  console.log(`offers DONE (${duration}s).`) // 24s
})
