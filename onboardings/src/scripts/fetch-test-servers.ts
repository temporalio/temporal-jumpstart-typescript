const fs = require('fs');
const download = require('download');

(async () => {
  const windows = 'platform=windows&sdk-name=sdk-java&sdk-version=latest&arch=amd64'
  const mac = 'platform=darwin&sdk-name=sdk-java&sdk-version=latest&arch=arm64'
  await download(`https://temporal.download/temporal-test-server/archive/default?${mac}`,
    'dist', {
      extract: true,
    });
    // this ultimately ends up with a `temporal-test-server` or a `temporal-test-server.exe` inside dist
  //
  // fs.writeFileSync('dist/temporal-test-server',
  //   await download('https://temporal.download/temporal-test-server/archive/default?platform=windows&sdk-name=sdk-java&sdk-version=latest&arch=amd64'), {
  //   });

  //download('unicorn.com/foo.jpg').pipe(fs.createWriteStream('dist/foo.jpg'));

  // await Promise.all([
  //   'unicorn.com/foo.jpg',
  //   'cats.com/dancing.gif'
  // ].map(url => download(url, 'dist')));
})();