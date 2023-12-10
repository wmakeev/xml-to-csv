import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { Attribute, SAXParser, SaxEventType, Tag, Text } from 'sax-wasm'

export * from './types.js'

import {
  XmlSaxParserElemHandler,
  XmlSaxParserOptions,
  XmlSaxParserValueHandler
} from './types.js'

// const SaxAllEventType = 0b001111111111

// export {
//   Attribute, Position, ProcInst, SaxEventType, Tag, Text
// } from 'sax-wasm'

// https://stackoverflow.com/a/62499498
const require = createRequire(import.meta.url)
const saxWasmPath = require.resolve('sax-wasm/lib/sax-wasm.wasm')

const wasmBuffer = readFileSync(saxWasmPath)

const EventNameByType = {
  [SaxEventType.Attribute]: 'Attribute',
  [SaxEventType.Cdata]: 'Cdata',
  [SaxEventType.CloseTag]: 'CloseTag',
  [SaxEventType.Comment]: 'Comment',
  [SaxEventType.Doctype]: 'Doctype',
  [SaxEventType.OpenTag]: 'OpenTag',
  [SaxEventType.OpenTagStart]: 'OpenTagStart',
  [SaxEventType.ProcessingInstruction]: 'ProcessingInstruction',
  [SaxEventType.SGMLDeclaration]: 'SGMLDeclaration',
  [SaxEventType.Text]: 'Text'
}

const getEventName = (event: SaxEventType) => {
  const eventNum = Number(event)

  if (!(eventNum in EventNameByType)) {
    throw new Error(`Unknown event type - ${eventNum}`)
  }

  const eventName = EventNameByType[eventNum]

  if (eventName == null) {
    throw new Error(`Unknown event type - ${eventNum}`)
  }

  return eventName
}

export class XmlSaxParser {
  #elemHandlers: XmlSaxParserElemHandler[] = []

  #valueHandlers: XmlSaxParserValueHandler[] = []

  #parser: SAXParser | null = null

  // #htmlToText: (str: string) => string

  delimiter = '/'

  constructor(public options: XmlSaxParserOptions = {}) {
    this.delimiter = options.treeDelimiter ?? this.delimiter

    // this.#htmlToText = compile({
    //   // TODO Временно. Надо подумать над этим.
    //   preserveNewlines: false,
    //   longWordSplit: {
    //     forceWrapOnLimit: false
    //   },
    //   wordwrap: false
    // })
  }

  #hasHandlers() {
    return this.#elemHandlers.length !== 0 || this.#valueHandlers.length !== 0
  }

  isStopped() {
    return this.#parser === null
  }

  /**
   * Add element handler
   *
   * ```js
   * parser.onElem((elPath, level) => {
   *   // ...
   * })
   * ```
   */
  onElem(handler: XmlSaxParserElemHandler) {
    if (!this.#elemHandlers.includes(handler)) {
      this.#elemHandlers.push(handler)
    }
    return this
  }

  /**
   * Remove element handler
   */
  offElem(handler: XmlSaxParserElemHandler) {
    this.#elemHandlers = this.#elemHandlers.flatMap(h =>
      h === handler ? [] : h
    )

    if (!this.#hasHandlers()) {
      this.stop()
    }

    return this
  }

  /**
   * Add element value handler
   *
   * ```js
   * parser.onValue((elPath, val, level) => {
   *   // ...
   * })
   * ```
   */
  onValue(handler: XmlSaxParserValueHandler) {
    if (!this.#valueHandlers.includes(handler)) {
      this.#valueHandlers.push(handler)
    }
    return this
  }

  /**
   * Remove element value handler
   */
  offValue(handler: XmlSaxParserValueHandler) {
    this.#valueHandlers = this.#valueHandlers.flatMap(h =>
      h === handler ? [] : h
    )

    if (!this.#hasHandlers()) {
      this.stop()
    }

    return this
  }

  /**
   * Start XML source parsing
   */
  async start() {
    if (!this.#hasHandlers()) {
      throw new Error('Parser handlers not set')
    }

    const parser = new SAXParser(
      SaxEventType.Attribute |
        SaxEventType.OpenTagStart |
        SaxEventType.CloseTag |
        SaxEventType.Text,
      { highWaterMark: this.options.highWaterMark ?? 64 * 1024 }
    )

    const tagsStack: string[] = []

    let curElPath: string = ''

    let curElText: string[] = []

    parser.eventHandler = (event, detail) => {
      // if (this.#debug) {
      //   console.log(
      //     `${getEventName(event)}${detail.name ? ` - ${detail.name}` : ''}`
      //   )
      // }

      switch (event) {
        // OpenTagStart
        case SaxEventType.OpenTagStart: {
          tagsStack.push((detail as Tag).name)

          curElPath = tagsStack.join(this.delimiter)
          curElText = []

          for (let i = 0; i < this.#elemHandlers.length; i++) {
            // @ts-expect-error not null
            this.#elemHandlers[i](
              //
              curElPath,
              tagsStack.length
            )
          }

          break
        }

        // CloseTag
        case SaxEventType.CloseTag: {
          const text = curElText.join('').trim()

          // TODO По хорошему, такую трансфорацию должен делать сам парсер?
          // Или надо разобраться глубже в событиях
          // Это очень дорогая операция (из 120 секунд, на нее уходит около 30 сек)
          // Пример (код товара 16455): LED-драйвер 40Вт для панели SPL-4-40 PF&gt;0.98 без пульсаций
          // text = this.#htmlToText(text)

          for (let i = 0; i < this.#valueHandlers.length; i++) {
            // @ts-expect-error not null
            this.#valueHandlers[i](
              //
              curElPath,

              text,
              tagsStack.length
            )
          }

          tagsStack.pop()

          curElPath = tagsStack.join(this.delimiter)
          curElText = []

          break
        }

        // Attribute
        case SaxEventType.Attribute: {
          const tagName = `${curElPath}[${(detail as Attribute).name}]`

          for (let i = 0; i < this.#elemHandlers.length; i++) {
            // @ts-expect-error not null
            this.#elemHandlers[i](
              //
              tagName,
              tagsStack.length
            )
          }

          const value = (detail as Attribute).value.value

          for (let i = 0; i < this.#valueHandlers.length; i++) {
            // @ts-expect-error not null
            this.#valueHandlers[i](
              //
              tagName,
              value,
              tagsStack.length
            )
          }

          break
        }

        // Text
        case SaxEventType.Text: {
          curElText.push((detail as Text).value)
          break
        }

        default: {
          const eventName = getEventName(event)
          throw new Error(`Unexpected event - ${eventName}`)
        }
      }
    }

    // Instantiate and prepare the wasm for parsing
    // TODO Обязательно нужно выполнять после присоединения eventHandler'а?
    const ready = await parser.prepareWasm(wasmBuffer)

    if (ready === false) {
      throw new Error('Parser initialization error')
    }

    this.#parser = parser
  }

  /**
   * Write chunk of xml to parse
   *
   * @param chunk Xml content chunk
   */
  write(chunk: Uint8Array) {
    if (this.#parser == null) {
      throw new Error('Parser not started')
    }

    this.#parser.write(chunk)
  }

  /** Stop xml parsing */
  stop() {
    if (this.#parser == null) {
      throw new Error('Parser not started')
    }

    this.#parser.end()

    this.#parser = null

    console.log('Parser stopped')
  }
}
