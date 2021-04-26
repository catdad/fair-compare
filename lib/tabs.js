const is = require('./is.js');
const name = 'name';
const { info, error } = require('./log.js')(name);
const isomorphic = require('./isomorphic.js');

const TABS_SIZE = 34;

const implementation = {
  open: () => {},
  focus: () => {},
  close: () => {}
};

const tabs = {};

if (is.main) {
  const { BrowserView, BrowserWindow } = require('electron');

  implementation.open = url => {
    info(`creating new tab for "${url}"`);

    const id = Math.random().toString(36).slice(2);
    const [main] = BrowserWindow.getAllWindows();
    const size = main.getBounds();

    const tab = new BrowserView({
      backgroundColor: '#121212',
      darkTheme: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webviewTag: true,
      }
    });
    main.addBrowserView(tab);
    tab.setBounds({
      width: size.width,
      height: size.height - TABS_SIZE,
      x: 0,
      y: TABS_SIZE
    });
    tab.webContents.loadURL(url);

    tab.setAutoResize({
      horizontal: true,
      vertical: true
    })

    tabs[id] = tab;

//    implementation.focus(id);

    return id;
  };

  implementation.focus = id => {
    const tab = tabs[id];

    if (!id) {
      throw new Error(`tab "${id}" cannot be found`);
    }

    const [main] = BrowserWindow.getAllWindows();

    main.setTopBrowserView(tab);
  };

  implementation.close = id => {
    const tab = tabs[id];

    if (!tab) {
      return;
    }

    delete tabs[id];

    const [main] = BrowserWindow.getAllWindows();
    main.removeBrowserView(tab);
  };
}

console.log(implementation);

module.exports = isomorphic({ name, implementation });
