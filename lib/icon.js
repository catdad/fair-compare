const path = require('path');
const get = require('lodash/get');

const pkg = require('../package.json');
const is = require('./is.js');

const osMap = {
  win32: 'win',
  darwin: 'mac',
  linux: 'linux'
};

module.exports = () => {
  const os = osMap[process.platform];
  let icon = get(pkg, ['build', os, 'icon']);

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
