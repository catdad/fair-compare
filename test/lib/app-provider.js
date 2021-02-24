const path = require('path');

const { expect } = require('chai');
const chalk = require('chalk');
const waitForThrowable = require('wait-for-throwable');
const { launch } = require('puptron');
const root = require('rootrequire');

const pkg = require('../../package.json');
const configVar = `${pkg.name.toUpperCase().replace(/-/g, '_')}_CONFIG_PATH`;

const distExecPath = ({
  win32: path.resolve(root, 'dist/win-unpacked', `${pkg.productName}.exe`),
  linux: path.resolve(root, 'dist/linux-unpacked', pkg.productName),
  // note: this will only work if your app is signed or
  // you have explicitly trusted your app already
  darwin: path.resolve(root, 'dist/mac', `${pkg.productName}.app`)
})[process.platform];

const environment = process.env.TEST_UNPACKED ? 'production' : 'development';

function isInView(containerBB, elBB) {
  return (!(
    elBB.top >= containerBB.bottom ||
    elBB.left >= containerBB.right ||
    elBB.bottom <= containerBB.top ||
    elBB.right <= containerBB.left
  ));
}

const utils = page => ({
  click: async selector => await page.click(selector),
  getRect: async selector => await page.evaluate(s => document.querySelector(s).getBoundingClientRect(), selector),
  getText: async selector => await page.evaluate(s => document.querySelector(s).innerText, selector),
  waitForVisible: async selector => {
    const { getRect } = utils(page);
    const pageRect = await getRect('body');

    await waitForThrowable(async () => {
      const elemRect = await getRect(selector);

      if (!isInView(pageRect, elemRect)) {
        throw new Error(`element "${selector}" is still not visible`);
      }
    });
  },
  waitForElementCount: async (selector, count = 1) => {
    await waitForThrowable(async () => {
      const elements = await page.$$(selector);
      const errStr = `expected ${count} of element "${selector}" but found ${elements.length}`;

      expect(elements.length, errStr).to.equal(count);
    });
  }
});

let _browser;

module.exports = {
  environment,
  start: async (configPath = '') => {
    const launchOptions = {
      cwd: path.resolve(__dirname, '../..'),
      env: {
        [configVar]: configPath
      }
    };

    if (environment === 'production') {
      launchOptions.execPath = distExecPath;
    }

    _browser = await launch(['.'], launchOptions);

    const [page] = await _browser.pages();

    return {
      page,
      browser: _browser,
      utils: utils(page)
    };
  },
  stop: async (printLogs) => {
    if (!_browser) {
      return;
    }

    if (printLogs) {
      const logs = _browser.getLogs().map(str => {
        const clean = str.replace(/^\[[0-9:/.]+INFO:CONSOLE\([0-9]+\)\]\s{0,}/, '');

        return clean === str ? chalk.yellow(str) : chalk.cyan(clean);
      }).join('');

      /* eslint-disable-next-line no-console */
      console.log(logs);
    }

    await _browser.close();
  }
};
