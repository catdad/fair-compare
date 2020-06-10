/* eslint-disable no-console */

//const comlink = require('comlink');
const get = require('lodash/get');

const isParent = get(window, 'process.argv', []).includes('--node-integration-in-worker');

if (isParent) {
  // this is the primary renderer thread, it will create and communicate with the worker
  const fs = require('fs-extra');
  const FileType = require('file-type');

  // TODO move this work to a worker
  const imageDiff = require('../tools/image-diff.js');

  const diffImage = async ({ left, right, ...opts }) => {
    console.log(4);
    const { pixels } = await imageDiff.tolerance({ left, right, ...opts });
    console.log(5, pixels);

    return pixels === -1 ? 'same' : pixels ? 'different' : 'similar';
  };

  const diffText = async ({ left, right }) => {
    const [ leftBuffer, rightBuffer ] = await Promise.all([
      fs.readFile(left),
      fs.readFile(right)
    ]);

    return leftBuffer.equals(rightBuffer) ? 'same' : 'different';
  };

  const compare = async ({ left, right, threshold }) => {
    // TODO why does FileType not work?
    const result = { mime: 'image/thing' }; //await FileType.fromFile(left);
    const { mime } = result || { mime: 'text/plain' };
    const route = mime.split('/')[0];

    return route === 'image' ?
      await diffImage({ left, right, threshold }) :
      route === 'text' ?
        await diffText({ left, right }) :
        'unknown';
  };

  const implementation = { compare };

  const register = frame => {
    frame._onMessage = ({ channel, args }) => {
      if (!implementation[channel]) {
        console.warn('unknown message:', channel, args);
        return;
      }

      const [id, ARGS] = args;

      console.log('MESSAGE', channel, id, ARGS);

      implementation[channel](...ARGS).then(data => {
        console.log('got response', data);
        frame.send(id, { ok: true, data });
      }).catch(err => {
        console.log('got error', err);
        frame.send(id, { ok: false, err: {
          message: err.message,
          stack: err.stack
        } });
      });
    };

    frame.addEventListener('ipc-message', frame._onMessage);
  };

  module.exports = { ...implementation, register };
} else {
  // this is a webview, it will forward all work to the primary thread
  const { ipcRenderer } = require('electron');
  const gid = () => Math.random().toString(36).substr(2);
  const CB_CHANNEL = 'THREADLINK-batch-compare-channel';

  const compare = (...args) => {
    const id = `${CB_CHANNEL}-${gid()}`;

    console.log('COMPARE', args);

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

  module.exports = { compare };
}
