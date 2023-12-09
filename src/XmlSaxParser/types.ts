export interface XmlSaxParserOptions {
  treeDelimiter?: string
  highWaterMark?: number
  debug?: boolean
}

export type XmlSaxParserElemHandler = (elName: string, level: number) => void

export type XmlSaxParserValueHandler = (
  elName: string,
  value: string,
  level: number
) => void
