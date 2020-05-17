const { exec } = require('child_process');
const zipFolder = require('zip-folder');

console.log('Building');
exec(`npm run build`, (error, stdout, stderr) => {
  if (error || stderr) {
    console.error('Build script failted, run [npm run build] to see build errors.');
    console.error(error || stderr);
    return;
  }
  console.log('Incrementing minor version...');
  exec(`./scripts/bump-minor.sh`, (error, stdout, stderr) => {
    exec('node -p -e "require(\'./package.json\').version"', (error, version, stderr) => {
      exec('node -p -e "require(\'./package.json\').name"', (error, name, stderr) => {
        const versionStr = version.substr(0, version.length - 1);
        const packageName = name.substr(0, name.length - 1);
        console.log(`Deleting previous ${packageName} versions...`);
        exec(`rm -rf ${packageName}-*.zip`, (error, stdout, stderr) => {
          console.log(`Packing ${packageName} version ${versionStr}`);
          const packageFileName = `${packageName}-${versionStr}.zip`;
          zipFolder('.', packageFileName, function(err) {
            if (err) {
              console.log('Packing failed', err);
            } else {
              console.log('COMPLETE');
            }
          });
        });
      });
    });
  });
});
