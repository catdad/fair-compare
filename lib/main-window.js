const { app, BrowserWindow } = require('electron');

const isMainWindow = (window) => {
  return window.webContents.getTitle() === app.getName();
};

const getMainWindow = () => {
  for (const window of BrowserWindow.getAllWindows()) {
    if (isMainWindow(window)) {
      return window;
    }
  }

  return BrowserWindow.getAllWindows()[0];
};

module.exports = { getMainWindow, isMainWindow };
