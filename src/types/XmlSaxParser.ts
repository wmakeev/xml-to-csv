export type XmlSaxParserElemHandler = (elPath: string, level: number) => void

export type XmlSaxParserValueHandler = (
  elPath: string,
  value: string,
  level: number
) => void

export interface XmlSaxParser {
  /**
   * XML paths delimiter.
   *
   * Default: `/`
   */
  getDelimiter(): string

  isStopped(): boolean

  /**
   * Set element handler
   *
   * ```js
   * parser.setElemHanlder((elPath, level) => {
   *   // ...
   * })
   * ```
   */
  setElemHanlder(handler: XmlSaxParserElemHandler): this

  /**
   * Remove element handler
   */
  removeElemHandler(): this

  /**
   * Add element value handler
   *
   * ```js
   * parser.setValueHandler((elPath, val, level) => {
   *   // ...
   * })
   * ```
   */
  setValueHandler(handler: XmlSaxParserValueHandler): this

  /**
   * Remove element value handler
   */
  removeValueHandler(): this

  /**
   * Remove all handlers (element and value handler)
   */
  removeHandlers(): this

  /**
   * Start XML source parsing
   */
  start(): Promise<void>

  /**
   * Write chunk of xml to parse
   *
   * @param chunk Xml content chunk
   */
  write(chunk: string): void

  /** Stop xml parsing */
  stop(): void
}
