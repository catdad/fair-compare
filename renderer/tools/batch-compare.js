const path = require('path');
const { default: Queue } = require('p-queue');
const worker = require('../workers/batch-compare.js');
const progress = require('../../lib/progress.js');

const noop = () => {};
const queue = new Queue({ concurrency: worker.count });

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

  tree.progress = { count: 0, total: allFiles.length };

  progress.init(allFiles.length).catch(noop);

  const tick = () => {
    tree.progress.count += 1;
    progress.tick().catch(noop);
  };

  for (let file of allFiles) {
    if (!file.left || !file.right) {
      file.compare = 'invalid';
      tick();
      continue;
    }

    const left = path.resolve(leftBase, file.path);
    const right = path.resolve(rightBase, file.path);

    queue.add(async () => {
      try {
        file.compare = await worker.compare({ left, right, threshold });
      } catch (err) {
        console.warn('comparison failed', err);
        file.compare = 'error';
      }

      tick();
    });
  }

  // do one initial update immediately to start the progress bars
  onUpdate();

  await queue.onIdle();

  clearInterval(interval);

  delete tree.progress;
  progress.clear().catch(noop);
};

module.exports = { compare };
