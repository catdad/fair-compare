const { Menu } = require('electron');
const pkg = require('../package.json');

const name = 'menu';
const isomorphic = require('./isomorphic.js');
let mainMenu;
let menuPromise;

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

  menuPromise = new Promise(resolve => {
    mainMenu.once('menu-will-close', () => resolve());
  });

  await menuPromise;
  menuPromise = null;
}

async function closeContext() {
  if (!mainMenu) {
    return;
  }

  mainMenu.closePopup();
}

async function toggleContext(opts) {
  menuPromise ? await closeContext() : await openContext(opts);
}

const implementation = {
  create: createMenu,
  openContext,
  closeContext,
  toggleContext
};

module.exports = isomorphic({ name, implementation });
