import { ParserOptions } from 'prettier'
import typescriptParsers from 'prettier/parser-typescript'

const parse = async (source: string, options: ParserOptions): Promise<unknown> => {
  const program = typescriptParsers.parsers.typescript.parse(source, options)

  const bodyLength = program.body.length

  const nodes = [...program.body].reverse()

  nodes.forEach((node, nodeIndex: number) => {
    if (node.type === 'ImportDeclaration') {
      if (node.specifiers.length > 1) {
        const index = bodyLength - nodeIndex - 1

        program.body.splice(index, 1)

        node.specifiers.forEach((_: unknown, specifierIndex: number) => {
          program.body.splice(index + specifierIndex, 0, {
            ...node,
            // eslint-disable-next-line @typescript-eslint/no-shadow
            specifiers: node.specifiers.filter((_: unknown, i: number) => specifierIndex === i),
          })
        })
      }
    }
  })

  return program
}

export const parsers = {
  typescript: {
    ...typescriptParsers.parsers.typescript,
    parse,
  },
}

export const printers = {}

export default {
  parsers,
  printers,
}
