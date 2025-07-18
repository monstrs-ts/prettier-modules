import typescriptParsers          from 'prettier/parser-typescript'
import type { Node }              from '@babel/types'
import type { ImportDeclaration } from '@babel/types'
import type { Doc }               from 'prettier'
import type { ParserOptions }     from 'prettier'
import type { Plugin }            from 'prettier'
import type { Printer }           from 'prettier'
import type { AST }               from 'prettier'
import type { AstPath }           from 'prettier'

import * as estree                from 'prettier/plugins/estree.js'

const nodeImportSize = (node: ImportDeclaration): number => {
  if (node.specifiers.length === 0) {
    return 0
  }

  const specifier = node.specifiers[node.specifiers.length - 1]

  // @ts-expect-error: Extended node
  const offset = specifier.imported ? 8 : 6

  return specifier.loc!.end.column + offset
}

export const print = (
  path: AstPath<Node>,
  options: ParserOptions<Node>,
  prnt: (path: AstPath<Node>) => Doc
): Doc => {
  const node = path.getNode() as (Node & { alignOffset: number }) | undefined

  const plugin = options.plugins.find((p) => (p as Plugin).printers?.estree) as Plugin

  let result = plugin.printers!.estree.print(path, options, prnt)

  if (node?.type === 'ImportDeclaration') {
    // @ts-expect-error: Invalid type
    result = result.map((part) => {
      if (Array.isArray(part) && part[0] === ' from' && node.alignOffset > 0) {
        const fill = Array.apply(0, Array(node.alignOffset)).fill(' ').join('')

        part[0] = `${fill} from` // eslint-disable-line no-param-reassign
      }

      return part
    })
  }

  return result
}

export const preprocess = async (ast: AST): Promise<AST> => {
  const imports = ast.body.filter(
    (node: Node) =>
      node.type === 'ImportDeclaration' && node.loc && node.loc.end.line === node.loc.start.line
  )

  const importsLengths: Array<number> = imports.map((node: ImportDeclaration): number =>
    nodeImportSize(node))
  const maxAlignLength = imports.length > 0 ? Math.max(...importsLengths) : 0

  ast.body.forEach((node: Node & { alignOffset: number }) => {
    if (
      node.type === 'ImportDeclaration' &&
      node.loc &&
      node.loc.end.line === node.loc.start.line
    ) {
      node.alignOffset = 0 // eslint-disable-line

      const nodeLength = nodeImportSize(node)

      // eslint-disable-next-line
      node.alignOffset = nodeLength < maxAlignLength ? maxAlignLength - nodeLength : 0
    }
  })

  return ast
}

export const parsers = {
  typescript: {
    ...typescriptParsers.parsers.typescript,
    astFormat: 'typescript-align',
  },
}

export const printers: Record<string, Printer> = {
  'typescript-align': {
    // @ts-expect-error Printers are not typed
    ...estree.default.printers.estree,
    preprocess,
    print,
  },
}

export default {
  parsers,
  printers,
}
