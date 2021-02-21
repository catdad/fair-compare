const path = require('path');
const url = require('url');
const EventEmitter = require('events');
const events = new EventEmitter();

const { app, BrowserWindow, Menu, systemPreferences } = require('electron');

require('./lib/app-id.js')(app);
require('./lib/progress.js');
const log = require('./lib/log.js')('main');
const config = require('./lib/config.js');
const debounce = require('./lib/debounce.js');
const menu = require('./lib/menu.js');
const icon = require('./lib/icon.js');

log.info(`electron node version: ${process.version}`);

let mainWindow;
let stayAlive;

// macOS Mojave light/dark mode changed
const setMacOSTheme = () => {
  if (!(systemPreferences.setAppLevelAppearance && systemPreferences.isDarkMode)) {
    log.info('this system does not support setting app-level appearance');
    return;
  }

  const mode = systemPreferences.isDarkMode() ? 'dark' : 'light';
  log.info(`setting app-level appearance to ${mode}`);
  systemPreferences.setAppLevelAppearance(mode);
};

if (systemPreferences.subscribeNotification) {
  systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', setMacOSTheme);
  setMacOSTheme();
}

function createWindow () {
  Promise.all([
    config.read()
  ]).then(() => {
    Menu.setApplicationMenu(menu.create());

    const windowOptions = {
      width: config.getProp('window.width') || 1000,
      height: config.getProp('window.height') || 800,
      backgroundColor: '#121212',
      darkTheme: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webviewTag: true,
      },
      icon: icon(),
      frame: process.platform === 'win32' ? false : true
    };

    if (process.platform === 'darwin' && config.getProp('experiments.framelessWindow')) {
      windowOptions.titleBarStyle = 'hidden';
    }

    // Create the browser window.
    mainWindow = new BrowserWindow(windowOptions);

    stayAlive = false;

    if (config.getProp('window.maximized')) {
      mainWindow.maximize();
    }

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'public', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.on('resize', debounce(() => {
      if (mainWindow.isMaximized() || mainWindow.isMinimized()) {
        return;
      }

      const size = mainWindow.getSize();

      config.setProp('window.width', size[0]);
      config.setProp('window.height', size[1]);
    }, 500));

    mainWindow.on('maximize', () => {
      config.setProp('window.maximized', true);
    });

    mainWindow.on('unmaximize', () => {
      config.setProp('window.maximized', false);
    });

    mainWindow.webContents.on('devtools-opened', () => {
      config.setProp('devToolsOpen', true);
    });

    mainWindow.webContents.on('devtools-closed', () => {
      config.setProp('devToolsOpen', false);
    });

    if (config.getProp('devToolsOpen')) {
      mainWindow.webContents.openDevTools();
    }

    events.on('reload', () => {
      mainWindow.reload();
    });

    events.on('reset', () => {
      stayAlive = true;

      log.info('reopening main window');
      mainWindow.once('close', () => {
        createWindow();
      });

      mainWindow.close();
      mainWindow = null;
    });
  }).catch((err) => {
    throw err;
  });
}

function onClose() {
  log.info(`${app.getName()} is closing, cleaning up`);
}

app.once('before-quit', onClose);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform === 'darwin' || stayAlive) {
    events.removeAllListeners();
  } else {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
