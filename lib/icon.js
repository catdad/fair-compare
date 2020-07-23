const path = require('path');
const is = require('./is.js');

const osMap = {
  win32: 'win',
  darwin: 'mac',
  linux: 'linux'
};

const iconMap = {
  win: 'out/icon.ico',
  linux: 'out/32x32.png',
  mac: 'out/icon.icns'
};

module.exports = () => {
  const os = osMap[process.platform];
  let icon = os ? path.resolve(__dirname, '..', iconMap[os]) : undefined;

  if (icon) {
    icon = path.resolve(__dirname, '..', icon);
  }

  if (icon && is.prod) {
    icon = icon.replace('app.asar', 'app.asar.unpacked');
  }

  if (os === 'win' && !is.prod) {
    return icon;
  }

  if (os === 'linux') {
    return icon;
  }
};
