import { bundleWorkflowCode } from '@temporalio/worker'
import { writeFile } from 'fs/promises'
import path from 'path'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'

async function bundle() {
  const { code } = await bundleWorkflowCode({
    workflowsPath: require.resolve('./onboardings/src/workflows'),
    webpackConfigHook: (config) => {
      if (config.resolve) {
        console.log('HOOKY', config)
        // let tsConfigPaths = new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })
        config.resolve.plugins = [
          ...(config.resolve.plugins ?? []),
          // new TsconfigPathsPlugin({baseUrl: path.dirname((config.entry as string[])[0]),  }) as any,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          new TsconfigPathsPlugin({ configFile: 'tsconfig.json' }),
        ]
      }
      return config
    }
  })
  const codePath = path.join(__dirname, './workflow-bundle.js')

  await writeFile(codePath, code)
  console.log(`Bundle written to ${codePath}`)
}

bundle().catch((err) => {
  console.error(err)
  process.exit(1)
})
