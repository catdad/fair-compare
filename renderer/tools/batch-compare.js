const path = require('path');
const FileType = require('file-type');

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
  // TODO implement
  return 'unknown';
};

const diffImage = async ({ left, right, ...opts }) => {
  const { pixels } = await imageDiff.tolerance({ left, right, ...opts });

  return pixels ? 'different' : 'similar';
};

const compare = async ({ tree, threshold }) => {
  const leftBase = tree.left.base;
  const rightBase = tree.right.base;

  if (!leftBase || !rightBase) {
    return;
  }

  const allFiles = flatFiles(tree.tree);

  for (let file of allFiles) {
    if (!file.left || !file.right) {
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
};

module.exports = compare;
