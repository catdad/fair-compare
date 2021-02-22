const { expect } = require('chai');

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

  it('launches', async () => {
    const configPath = await config.create({});
    const app = await start(configPath);

    await app.utils.waitForElementCount('body', 1);
  });
});
