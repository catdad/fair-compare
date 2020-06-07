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

const createFile = (dir, name, side) => {
  const file = dir[name] || {
    type: 'file',
    name: name,
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

    createFile(dir, name, side);
  });
};

const getDirectoryStructure = async ({ left = '', right = '' }) => {
  await Promise.all([
    left ? assertDirectory(left) : Promise.resolve(),
    right ? assertDirectory(right) : Promise.resolve()
  ]);

  const [leftFiles, rightFiles] = await Promise.all([
    fg(['**/*.*'], {
      dot: false,
      cwd: left
    }).then(files => sort(files)),
    fg(['**/*.*'], {
      dot: false,
      cwd: right
    }).then(files => sort(files))
  ]);

  const tree = {};

  buildTree(tree, leftFiles, 'left');
  buildTree(tree, rightFiles, 'right');

  return {
    left: { base: left, files: leftFiles },
    right: { base: right, files: rightFiles },
    tree: tree
  };
};

module.exports = getDirectoryStructure;
