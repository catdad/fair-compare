const { app, BrowserWindow } = require('electron');

module.exports = () => {
  for (const window of BrowserWindow.getAllWindows()) {
    if (window.webContents.getTitle() === app.getName()) {
      return window;
    }
  }

  return BrowserWindow.getAllWindows()[0];
};
