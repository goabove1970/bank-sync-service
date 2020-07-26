const { exec } = require('child_process');
const remoteHost = '134.122.23.92';
const remoteLogin = 'root';
const appFolder = '/home/bank-manager/';

exec('node -p -e "require(\'./package.json\').version"', (error, version, stderr) => {
  exec('node -p -e "require(\'./package.json\').name"', (error, name, stderr) => {
    const packageName = name.substr(0, name.length - 1);
    const versionStr = version.substr(0, version.length - 1);
    const packageFileName = `${packageName}-${versionStr}.zip`;
    console.log(`Uploading ${packageFileName} to ${remoteHost}:${appFolder}`);
    exec(`scp -rp ${packageFileName} ${remoteLogin}@${remoteHost}:${appFolder}`, (error, name, stderr) => {
      if (error) {
        console.log('Uploading failed: ', error);
      } else {
        console.log('Uploading complete');
      }
    });
  });
});
