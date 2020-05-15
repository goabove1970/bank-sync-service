const { exec } = require('child_process');
const zipFolder = require('zip-folder');

exec('node -p -e "require(\'./package.json\').version"', (error, version, stderr) => {
  exec('node -p -e "require(\'./package.json\').name"', (error, name, stderr) => {
    const packageName = name.substr(0, name.length - 1);
    const versionStr = version.substr(0, version.length - 1);
    console.log(`Packing ${packageName} version ${versionStr}`);
    const packageFileName = `${packageName}-${versionStr}.zip`;
    zipFolder('.', packageFileName, function(err) {
      if (err) {
        console.log('Packing failed', err);
      } else {
        console.log('Packing complete');
      }
    });
  });
});
