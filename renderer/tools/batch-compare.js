const path = require('path');
const FileType = require('file-type');
const fs = require('fs-extra');

const imageDiff = require('./image-diff.js');

const flatFiles = (tree) => {
  const files = [];

  for (let entry of Object.values(tree)) {
    if (entry.type === 'file') {
      files.push(entry);
    } else if (entry.type === 'dir' && entry.children) {
      files.push(...flatFiles(entry.children));
    }
  }

  return files;
};

const diffText = async ({ left, right }) => {
  const [ leftBuffer, rightBuffer ] = await Promise.all([
    fs.readFile(left),
    fs.readFile(right)
  ]);

  return leftBuffer.equals(rightBuffer) ? 'same' : 'different';
};

const diffImage = async ({ left, right, ...opts }) => {
  const { pixels } = await imageDiff.tolerance({ left, right, ...opts });

  return pixels ? 'different' : 'similar';
};

const compare = async ({ tree, threshold, onUpdate }) => {
  const leftBase = tree.left.base;
  const rightBase = tree.right.base;

  if (!leftBase || !rightBase) {
    return;
  }

  const allFiles = flatFiles(tree.tree);
  const interval = setInterval(() => {
    onUpdate();
  }, 1000);

  for (let file of allFiles) {
    if (!file.left || !file.right) {
      file.compare = 'invalid';
      continue;
    }

    const left = path.resolve(leftBase, file.path);
    const right = path.resolve(rightBase, file.path);

    const result = await FileType.fromFile(left);
    const { mime } = result || { mime: 'text/plain' };
    const route = mime.split('/')[0];

    file.compare = route === 'image' ?
      await diffImage({ left, right, threshold }) :
      route === 'text' ?
        await diffText({ left, right }) :
        'unknown';
  }

  clearInterval(interval);
};

module.exports = compare;
