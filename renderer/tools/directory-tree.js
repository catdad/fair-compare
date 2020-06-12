const fs = require('fs-extra');
const fg = require('fast-glob');

const sort = files => [...files].sort((a, b) => a.localeCompare(b));

const assertDirectory = async base => {
  let stat;

  try {
    stat = await fs.stat(base);
  } catch (err) {
    throw new Error(err.code === 'ENOENT' ? `"${base}" does not exist` : `"${base}" cannot be opened`);
  }

  if (!stat.isDirectory()) {
    throw new Error(`"${base}" is not a directory`);
  }
};

const createDirectory = (tree, dir) => {
  const obj = tree[dir] || {
    type: 'dir',
    name: dir,
    children: {},
    expanded: false
  };

  tree[dir] = obj;
  return obj.children;
};

const createFile = (dir, path, name, side) => {
  const file = dir[name] || {
    type: 'file',
    path,
    name,
    left: false,
    right: false,
    selected: false
  };

  file[side] = true;

  dir[name] = file;
};

const buildTree = (tree, files, side) => {
  files.forEach(file => {
    const dirs = file.split('/');
    const name = dirs.pop();

    const dir = dirs.reduce((tree, dir) => createDirectory(tree, dir), tree);

    createFile(dir, file, name, side);
  });
};

const getFiles = cwd => cwd ? fg(['**/*.*'], { cwd }).then(files => sort(files)) : [];

const getDirectoryStructure = async ({ left = '', right = '' }) => {
  await Promise.all([
    left ? assertDirectory(left) : Promise.resolve(),
    right ? assertDirectory(right) : Promise.resolve()
  ]);

  const [leftFiles, rightFiles] = await Promise.all([
    getFiles(left),
    getFiles(right)
  ]);

  const tree = {};

  buildTree(tree, leftFiles, 'left');
  buildTree(tree, rightFiles, 'right');

  return { left, right, tree };
};

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

module.exports = { getDirectoryStructure, flatFiles };
