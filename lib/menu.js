const { Menu } = require('electron');
const pkg = require('../package.json');

const name = 'menu';
const isomorphic = require('./isomorphic.js');
let mainMenu;

function createMenu() {
  const template = [{
    label: process.platform === 'darwin' ? pkg.productName : 'Menu',
    submenu: [
      { role: 'quit' }
    ]
  }, {
    label: 'View',
    submenu: [
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  }, {
    label: 'Developer',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' }
    ]
  }];

  mainMenu = Menu.buildFromTemplate(template);

  return mainMenu;
}

async function openContext(opts) {
  if (!mainMenu) {
    return;
  }

  mainMenu.popup(opts);

  await new Promise(resolve => {
    mainMenu.once('menu-will-close', () => resolve());
  });
}

async function closeContext() {
  if (!mainMenu) {
    return;
  }

  mainMenu.closePopup();
}

const implementation = {
  create: createMenu,
  openContext,
  closeContext
};

module.exports = isomorphic({ name, implementation });
