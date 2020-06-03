const path = require('path');
const fs = require('fs-extra');
const FileType = require('file-type');
const fg = require('fast-glob');

const { html, css, useEffect, useState } = require('../tools/ui.js');
const { ipcRenderer } = require('electron');
const Directory = require('../Directory/Directory.js');
const config = require('../../lib/config.js');

css('./IndexDirectory.css');

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

const getDirectoryStructure = async (base) => {
  await assertDirectory(base);

  const files = await fg(['**/*.*'], {
    dot: false,
    cwd: base
  });

  return { base, files: sort(files) };
};

const fileInDir = (dir, file) => {
  if (dir.files.includes(file)) {
    return path.resolve(dir.base, file);
  }
};

function App() {
  const [dir1, setDir1] = useState({ base: null, files: [] });
  const [dir2, setDir2] = useState({ base: null, files: [] });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (dir1.base || dir2.base) {
      return;
    }

    Promise.all([
      config.getProp('directories.left'),
      config.getProp('directories.right'),
    ]).then(([left, right]) => {
      if (dir1.base || dir2.base) {
        return;
      }

      return Promise.all([
        getDirectoryStructure(left),
        getDirectoryStructure(right)
      ]);
    }).then(([left, right]) => {
      if (dir1.base || dir2.base) {
        return;
      }

      setDir1(left);
      setDir2(right);
    }).catch((err) => {
      console.error(err);
    });
  }, [/* execute only once */]);

  const setDir = (side, setter) => async (data) => {
    await config.setProp(`directories.${side}`, data.base);
    setter(data);
  };

  const onOpen = (dir) => async (file) => {
    const left = fileInDir(dir1, file);
    const right = fileInDir(dir2, file);

    // TODO handle errors
    const result = await FileType.fromFile(fileInDir(dir, file));
    const { mime } = result || { mime: 'text/plain' };

    const route = mime.split('/')[0];

    if (!['text', 'image'].includes(route)) {
      // TODO handle this error better

      // eslint-disable-next-line no-console
      console.error(`unsupported diff mime: ${mime}`);
      return;
    }

    const data = {
      title: path.basename(file),
      route
    };

    if (left) {
      data.left = left;
    }

    if (right) {
      data.right = right;
    }

    ipcRenderer.sendToHost('new-tab', data);
  };

  return html`
    <div class=main>
      <${Directory} dir=${dir1} setDir=${setDir('left', setDir1)} selected=${selectedFile} onSelect=${setSelectedFile} onOpen=${onOpen(dir1)} />
      <${Directory} dir=${dir2} setDir=${setDir('right', setDir2)} selected=${selectedFile} onSelect=${setSelectedFile} onOpen=${onOpen(dir2)} />
    </div>
  `;
}

module.exports = App;
