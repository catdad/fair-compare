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

const getDirectoryStructure = async ({ left = '', right = '' }) => {
  await Promise.all([
    left ? assertDirectory(left) : Promise.resolve(),
    right ? assertDirectory(right) : Promise.resolve()
  ]);

  const [leftFiles, rightFiles] = await Promise.all([
    fg(['**/*.*'], {
      dot: false,
      cwd: left
    }),
    fg(['**/*.*'], {
      dot: false,
      cwd: right
    })
  ]);

  return {
    left: { base: left, files: sort(leftFiles) },
    right: { base: right, files: sort(rightFiles) }
  };
};

module.exports = getDirectoryStructure;
