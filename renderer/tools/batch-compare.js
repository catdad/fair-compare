const path = require('path');
const worker = require('../workers/batch-compare.js');

const flatFiles = (tree) => {
  const files = [];

  const keys = Object.keys(tree).sort((a, b) => a.localeCompare(b));

  for (let key of keys) {
    const entry = tree[key];

    if (entry.type === 'file') {
      files.push(entry);
    } else if (entry.type === 'dir' && entry.children) {
      files.push(...flatFiles(entry.children));
    }
  }

  return files;
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

    try {
      file.compare = await worker.compare({ left, right, threshold });
    } catch (err) {
      console.warn('comparison failed', err);
      file.compare = 'error';
    }
  }

  clearInterval(interval);
};

module.exports = { compare };
