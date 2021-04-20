/* eslint-disable no-console */

const os = require('os');
const is = require('../../lib/is.js');
const query = require('../tools/query.js');

const isParent = !query.route;
const isWorker = is.worker;
const count = Math.max(Math.floor(os.cpus().length * 0.75), 1);

if (isWorker) {
  // this is a worker, it will take actions from the primary renderer thread and complete them
  const comlink = require('comlink');

  const fs = require('fs-extra');
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
} else if (isParent) {
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

  const implementation = { compare };

  const register = frame => {
    frame._onMessage = ({ channel, args }) => {
      if (!implementation[channel]) {
        console.warn('unknown message:', channel, args);
        return;
      }

      const [id, ARGS] = args;

      implementation[channel](...ARGS).then(data => {
        frame.send(id, { ok: true, data });
      }).catch(err => {
        frame.send(id, { ok: false, err: {
          message: err.message,
          stack: err.stack
        } });
      });
    };

    frame.addEventListener('ipc-message', frame._onMessage);
  };

  module.exports = { ...implementation, register, count };
} else {
  // this is a webview, it will forward all work to the primary thread
  const { ipcRenderer } = require('electron');
  const gid = () => Math.random().toString(36).substr(2);
  const CB_CHANNEL = 'THREADLINK-batch-compare-channel';

  const compare = (...args) => {
    const id = `${CB_CHANNEL}-${gid()}`;

    return new Promise((resolve, reject) => {
      ipcRenderer.on(id, (info, { err, data }) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
      });

      ipcRenderer.sendToHost('compare', id, args);
    });
  };

  module.exports = { compare, count };
}
