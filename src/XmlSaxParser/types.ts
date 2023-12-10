export interface XmlSaxParserOptions {
  treeDelimiter?: string
  highWaterMark?: number
  debug?: boolean
}

export type XmlSaxParserElemHandler = (elPath: string, level: number) => void

export type XmlSaxParserValueHandler = (
  elPath: string,
  value: string,
  level: number
) => void
