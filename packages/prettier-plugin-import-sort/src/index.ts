import * as parser       from 'import-sort-parser-typescript2'
import { sortImports }   from 'import-sort'
import typescriptParsers from 'prettier/parser-typescript'

import { style }         from './import-sort.style.js'

const preprocess = (source: string): string => {
  const { code } = sortImports(source, parser, style)

  return code
}

export const parsers = {
  typescript: {
    ...typescriptParsers.parsers.typescript,
    preprocess,
  },
}

export const printers = {}

export default {
  parsers,
  printers,
}
