import {
  sys as tsSys,
  findConfigFile,
  readConfigFile,
  parseJsonConfigFileContent,
  type ParsedCommandLine,
} from 'typescript'
import path from 'path'

export const getTsconfig = (): ParsedCommandLine => {
// Find tsconfig.json file
  const tsconfigPath = findConfigFile(process.cwd(), (p: string) => tsSys.fileExists(p), 'tsconfig.json')
  if (!tsconfigPath) {
    throw new Error('cannot find tsConfig')
  }
  // Read tsconfig.json file
  const tsconfigFile = readConfigFile(tsconfigPath, (p: string, encoding?: string): (string | undefined) => tsSys.readFile(p, encoding))

  // Resolve extends
  return parseJsonConfigFileContent(
    tsconfigFile.config,
    tsSys,
    path.dirname(tsconfigPath),
  )
}
