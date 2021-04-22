const { expect } = require('chai');
const waitForThrowable = require('wait-for-throwable');

const { productName } = require('../package.json');
const { start, stop } = require('./lib/app-provider.js');
const config = require('./lib/config-provider.js');

describe('fair-compare', () => {
  const all = async (...promises) => {
    let err;

    await Promise.all(promises.map(p => p.catch(e => {
      err = e;
    })));

    if (err) {
      throw err;
    }
  };

  async function cleanup() {
    const includeLogs = this.currentTest.state === 'failed' || process.env.VERBOSE;

    await all(
      stop(includeLogs),
      config.cleanAll()
    );
  }

  beforeEach(cleanup);
  afterEach(cleanup);

  it('launches with a main view and a directory webview', async () => {
    const configPath = await config.create({});
    const app = await start(configPath);

    await app.utils.waitForElementCount('body', 1);

    await waitForThrowable(async () => {
      const pages = await app.pages();
      const webviews = await app.webviews();

      expect(pages).to.have.lengthOf(1, 'An unexpected number of pages were found');
      expect(webviews).to.have.lengthOf(1, 'An unexpected number of webviews were found');

      const pageTitle = await pages[0].title();

      expect(pageTitle).to.equal(`${productName}`);

      const wvTitle = await webviews[0].title();

      expect(wvTitle).to.equal(`${productName} Directory`);
    }, { total: 4000 });
  });
});