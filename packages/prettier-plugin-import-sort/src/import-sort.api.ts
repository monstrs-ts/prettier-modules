/* eslint-disable n/no-sync */

import type { IImport } from 'import-sort-parser'

import { readFileSync } from 'node:fs'
import { join }         from 'node:path'

import { globbySync }   from 'globby'
import { load }         from 'js-yaml'

const loadWorkspaces = (): Array<string> => {
  const exists = new Set<string>()

  try {
    const { packages } = load(
      readFileSync(join(process.cwd(), '/pnpm-workspace.yaml'), 'utf-8')
    ) as { packages?: Array<string> }

    if (packages != null && packages?.length > 0) {
      const folders = globbySync(packages, {
        cwd: process.cwd(),
        onlyDirectories: true,
        absolute: true,
        expandDirectories: {
          files: ['package.json'],
          extensions: ['json'],
        },
      })

      folders.forEach((folder: string) => {
        try {
          const { name }: { name: string } = JSON.parse(
            readFileSync(join(folder, 'package.json'), 'utf-8')
          )

          if (name.startsWith('@')) {
            exists.add(name)
          }
        } catch (error) {} // eslint-disable-line
      })
    }
  } catch (error) {
    console.log(error) // eslint-disable-line
  }

  return Array.from(exists)
}

const workspaces = loadWorkspaces()

export const isWorkspaceModule = (imported: IImport): boolean =>
  workspaces.some((workspace) => imported.moduleName.startsWith(workspace))

export const isNodeModule = (imported: IImport): boolean => imported.moduleName.startsWith('node:')

export const isImportType = (imported: IImport): boolean => imported.type === 'import-type'
