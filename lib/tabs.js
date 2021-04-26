const EventEmitter = require('events');

const is = require('./is.js');
const name = 'tabs';
const { info, error } = require('./log.js')(name);
const isomorphic = require('./isomorphic.js');

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

  const update = () => {
    const tabData = Object.values(tabs).map(({ title, url, id }) => ({ title, url, id }));
    events.emit('update', tabData);
  };

  implementation.open = ({ url, title }) => {
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
      width: size.width / 2,
      height: size.height - TABS_SIZE,
      x: 0,
      y: TABS_SIZE
    });
    tab.webContents.loadURL(url);

    tab.setAutoResize({
      horizontal: true,
      vertical: true
    });

    tabs[id] = { id, title, url, tab };

//    implementation.focus(id);

    update();

    return id;
  };

  implementation.focus = id => {
    const tab = tabs[id];

    if (!id) {
      throw new Error(`tab "${id}" cannot be found`);
    }

    const [main] = BrowserWindow.getAllWindows();

    main.setTopBrowserView(tab);

    update();
  };

  implementation.close = id => {
    const tab = tabs[id];

    if (tab) {
      delete tabs[id];

      const [main] = BrowserWindow.getAllWindows();
      main.removeBrowserView(tab);
    }

    update();
  };

  const hookBrowserWindow = (window) => {
    const ev = 'did-start-loading';

    window.webContents.on(ev, () => {
      // TODO we should probably only close BrowserViews associated
      // with the BrowserWindow that changed, but in this app, we
      // only have one window right now, so...
      for (const key in tabs) {
        implementation.close(tabs[key].id);
      }
    });
  };

  for (const window of BrowserWindow.getAllWindows()) {
    hookBrowserWindow(window);
  }

  app.on('browser-window-created', (ev, window) => hookBrowserWindow(window));
}

module.exports = isomorphic({ name, implementation, events });
