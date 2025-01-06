import {URL} from 'node:url'
import os from 'os'
import download from 'download'
import path from 'path'
import fg from 'fast-glob'
import crypto from 'crypto'
import * as process from 'node:process'
import fs from 'fs'
import {mkdirp} from 'mkdirp'
// Downloads `temporal-test-server` (the Java SDK implementation) to a tmp dir for the right platform+architecture
// Default is Mac support.
// Windows can downloaded with `PLATFORM=windows ARCH=amd64 npx tsx src/scripts/fetch-test-server`.
// If `DEST` is provided it'll copy the extracted binary to that location (directory)
(async () => {
  const tmpDir = path.join(os.tmpdir(), crypto.randomUUID())
  const arch = process.env['ARCH'] || os.arch()

  let opts = {
    'platform': process.env['PLATFORM'] ||  os.platform(), // windows, darwin, linux
    'sdk-name': 'sdk-java', // sdk-java only
    'sdk-version': process.env['SDK_VERSION'] || 'latest',
    'arch': arch // arm64 , amd64
  }
  console.log('opts', opts)
  if(opts.platform.toLowerCase().includes('win32')){
    opts.platform = 'windows'
  }
  if(!opts.arch.toLowerCase().includes('arm64')) {
    opts.arch = 'amd64' // we only support amd64 or arch64
  }
  const url = new URL('https://temporal.download/temporal-test-server/archive/default')
  url.search = new URLSearchParams(opts).toString()
  console.log('downloading', url.toString())
  await download(url.toString(),
    tmpDir, {
      extract: true,
    })
  const output= fg.sync(path.join(tmpDir,'*','temporal-test-server*'))
  const bin = output[0].toString()
  console.log('downloaded file to:', bin)
  if(process.env['DEST']) {
    const destDir = path.resolve(process.env['DEST'])
    mkdirp.sync(destDir)
    const dest = path.join(destDir, path.basename(output[0].toString()))
    console.log('moving binary from "', bin, '" to "', dest ,'"')
    fs.renameSync(bin, dest)
  }
})();