/* eslint-disable no-console */

const os = require('os');
const is = require('../../lib/is.js');

const isWorker = is.worker;
const count = Math.max(Math.floor(os.cpus().length * 0.75), 1);

if (isWorker) {
  // this is a worker, it will take actions from the primary renderer thread and complete them
  const comlink = require('comlink');

  const fs = require('fs/promises');
  const FileType = require('file-type');

  const imageDiff = require('../tools/image-diff.js');

  const diffImage = async ({ left, right, ...opts }) => {
    const { pixels } = await imageDiff.tolerance({ left, right, ...opts });
    return pixels === -1 ? 'same' : pixels ? 'different' : 'similar';
  };

  const diffText = async ({ left, right }) => {
    const [ leftBuffer, rightBuffer ] = await Promise.all([
      fs.readFile(left),
      fs.readFile(right)
    ]);

    return leftBuffer.equals(rightBuffer) ? 'same' : 'different';
  };

  const compare = async ({ left, right, ...opts }) => {
    const result = await FileType.fromFile(left);
    const { mime } = result || { mime: 'text/plain' };
    const route = mime.split('/')[0];

    return route === 'image' ?
      await diffImage({ left, right, ...opts }) :
      route === 'text' ?
        await diffText({ left, right }) :
        'unknown';
  };

  comlink.expose({ compare });
} else {
  // this is the primary renderer thread, it will create and communicate with the worker
  // and accept actions from the webview threads
  const comlink = require('comlink');
  const promises = new Map();

  const workers = new Array(count).fill(true).map(() => new Worker(__filename));
  const apis = workers.map(worker => comlink.wrap(worker));

  const compare = async (...args) => {
    if (apis.length === 0) {
      await Promise.race([...promises.values()]);
      return await compare(...args);
    }

    const api = apis.pop();
    promises.set(api, api.compare(...args));

    try {
      return await promises.get(api);
    } catch (err) {
      throw err;
    } finally {
      promises.delete(api);
      apis.push(api);
    }
  };

  module.exports = { compare, count };
}
