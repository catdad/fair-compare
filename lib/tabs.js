const EventEmitter = require('events');

const is = require('./is.js');
const name = 'tabs';
const { info } = require('./log.js')(name);
const isomorphic = require('./isomorphic.js');

const config = require('./config.js');

const TABS_SIZE = 34;

const implementation = {
  open: () => {},
  focus: () => {},
  close: () => {}
};

const events = new EventEmitter();

const tabs = {};

if (is.main) {
  const { app, BrowserView, BrowserWindow } = require('electron');
  const { getMainWindow, isMainWindow } = require('./main-window.js');

  const update = () => {
    const tabData = Object.values(tabs)
      .map(({ title, url, id, selected }) => ({ title, url, id, selected: !!selected }));

    events.emit('update', tabData);
  };

  const internalFocus = tab => {
    for (const tab of Object.values(tabs)) {
      tab.selected = false;
    }

    tab.selected = true;

    const main = getMainWindow();
    main.setTopBrowserView(tab.tab);
  };

  const focusRemainingTab = tab => {
    const tabsArray = Object.values(tabs);

    const prevTab = tabsArray.find((t, idx) => {
      if (tabsArray[idx + 1] === tab) {
        return true;
      }
    });

    if (prevTab) {
      internalFocus(prevTab);
    } else {
      internalFocus(tabsArray[0]);
    }
  };

  implementation.open = ({ url, title, selected }) => {
    info(`creating new ${selected ? 'selected ' : ''}tab for "${url}"`);

    const id = Math.random().toString(36).slice(2);
    const main = getMainWindow();
    const size = main.getContentBounds();

    const devtools = new BrowserWindow({
      show: false
    });
    devtools.setMenuBarVisibility(false);

    const tab = new BrowserView({
      backgroundColor: '#121212',
      darkTheme: true,
      webPreferences: {
        contextIsolation: false,
        enableRemoteModule: true,
        nodeIntegration: true,
        nodeIntegrationInWorker: true
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
    tab.webContents.setDevToolsWebContents(devtools.webContents);

    if (config.getProp('devToolsOpen')) {
      devtools.showInactive();
      tab.webContents.openDevTools({ mode: 'detach' });
    }


    tabs[id] = { id, title, url, tab, devtools };

    if (selected) {
      internalFocus(tabs[id]);
    }

    update();

    return id;
  };

  implementation.focus = id => {
    const tab = tabs[id];

    if (!id) {
      throw new Error(`tab "${id}" cannot be found`);
    }

    internalFocus(tab);

    update();
  };

  implementation.close = id => {
    const tab = tabs[id];

    if (tab) {

      if (tab.selected) {
        focusRemainingTab(tab);
      }

      delete tabs[id];

      const main = getMainWindow();
      main.removeBrowserView(tab.tab);
      tab.devtools.destroy();
    }

    update();
  };

  const hookBrowserWindow = (window) => {
    const ev = 'did-start-loading';

    const closeAllTabs = () => {
      // TODO we should probably only close BrowserViews associated
      // with the BrowserWindow that changed, but in this app, we
      // only have one window right now, so...
      for (const key in tabs) {
        implementation.close(tabs[key].id);
      }
    };

    window.webContents.on(ev, () => {
      if (!isMainWindow(window)) {
        return;
      }

      closeAllTabs();
    });

    window.on('resize', () => {
      if (!isMainWindow(window)) {
        return;
      }

      const { width, height } = window.getContentBounds();

      for (const { tab } of Object.values(tabs)) {
        tab.setBounds({
          width: width,
          height: height - TABS_SIZE,
          x: 0,
          y: TABS_SIZE
        });
      }
    });

    window.on('close', () => {
      if (!isMainWindow(window)) {
        return;
      }

      closeAllTabs();
    });
  };

  for (const window of BrowserWindow.getAllWindows()) {
    hookBrowserWindow(window);
  }

  app.on('browser-window-created', (ev, window) => hookBrowserWindow(window));
}

module.exports = isomorphic({ name, implementation, events });
