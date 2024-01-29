import sax, { SAXParser } from 'sax'
import {
  XmlSaxParser,
  XmlSaxParserElemHandler,
  XmlSaxParserValueHandler
} from '../types/XmlSaxParser.js'

export interface JsXmlSaxParserOptions {
  treeDelimiter?: string
  highWaterMark?: number
  debug?: boolean
}

export class JsXmlSaxParser implements XmlSaxParser {
  #elemHandler: XmlSaxParserElemHandler | null = null

  #valueHandler: XmlSaxParserValueHandler | null = null

  #parser: SAXParser | null = null

  delimiter = '/'

  constructor(public options: JsXmlSaxParserOptions = {}) {
    this.delimiter = options.treeDelimiter ?? this.delimiter
  }

  #hasHandlers() {
    return this.#elemHandler !== null || this.#valueHandler !== null
  }

  getDelimiter(): string {
    return this.delimiter
  }

  isStopped() {
    return this.#parser === null
  }

  setElemHanlder(handler: XmlSaxParserElemHandler) {
    this.#elemHandler = handler
    return this
  }

  removeElemHandler() {
    this.#elemHandler = null

    if (this.#valueHandler === null) {
      this.stop()
    }

    return this
  }

  setValueHandler(handler: XmlSaxParserValueHandler) {
    this.#valueHandler = handler
    return this
  }

  removeValueHandler() {
    if (this.#elemHandler === null) {
      this.stop()
    }

    return this
  }

  removeHandlers(): this {
    this.#valueHandler = null
    this.#elemHandler = null

    this.stop()

    return this
  }

  async start() {
    if (this.isStopped() === false) {
      throw new Error('Can`t start parser - parser is not stopped')
    }

    if (!this.#hasHandlers()) {
      throw new Error('XML Parser handlers not set')
    }

    this.#parser = sax.parser(true)

    const tagsStack: string[] = []

    let curElPath: string = ''

    let curElText: string[] = []

    this.#parser.onattribute = attr => {
      const tagName = `${curElPath}[${attr.name}]`

      this.#elemHandler?.(
        //
        tagName,
        tagsStack.length
      )

      const value = attr.value

      this.#valueHandler?.(
        //
        tagName,
        value,
        tagsStack.length
      )
    }

    this.#parser.onopentagstart = tag => {
      tagsStack.push(tag.name)

      curElPath = tagsStack.join(this.delimiter)
      curElText = []

      this.#elemHandler?.(
        //
        curElPath,
        tagsStack.length
      )
    }

    this.#parser.onclosetag = () => {
      const text = curElText.join('').trim()

      this.#valueHandler?.(
        //
        curElPath,
        text,
        tagsStack.length
      )

      tagsStack.pop()

      curElPath = tagsStack.join(this.delimiter)
      curElText = []
    }

    this.#parser.ontext = text => {
      curElText.push(text)
    }

    this.#parser.oncdata = text => {
      curElText.push(text)
    }

    this.#parser.onerror = function () {
      // TODO Как обработать? Провeрить в тестах с некорректным XML
      // console.debug(`Parser error - ${err.message}`)
    }
  }

  write(chunk: string) {
    if (this.isStopped()) {
      throw new Error('Parser not started')
    }

    this.#parser!.write(chunk)
  }

  stop() {
    if (this.isStopped() === true) {
      console.log('Parser just stoped')
      return
    }

    this.#parser?.close()

    this.#parser = null

    console.log('Parser stopped')
  }
}
