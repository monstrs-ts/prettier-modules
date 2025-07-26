import { parsers as alignParsers }   from '@monstrs/prettier-plugin-import-align'
import { printers as alignPrinters } from '@monstrs/prettier-plugin-import-align'
import { parsers as splitParsers }   from '@monstrs/prettier-plugin-import-split'

export const parsers = {
  typescript: {
    ...alignParsers.typescript,
    ...splitParsers.typescript,
    astFormat: alignParsers.typescript.astFormat,
  },
}

export const printers = {
  'typescript-align': {
    ...alignPrinters['typescript-align'],
  },
}

export default {
  parsers,
  printers,
}
