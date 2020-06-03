const path = require('path');
const fs = require('fs-extra');
const FileType = require('file-type');

const { html, css, useState } = require('../tools/ui.js');
const { ipcRenderer } = require('electron');
const Directory = require('../Directory/Directory.js');

css('./IndexDirectory.css');

const fileInDir = (dir, file) => {
  if (dir.files.includes(file)) {
    return path.resolve(dir.base, file);
  }
};

function App() {
  const [dir1, setDir1] = useState({ base: null, files: [] });
  const [dir2, setDir2] = useState({ base: null, files: [] });
  const [selectedFile, setSelectedFile] = useState(null);

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
      <${Directory} dir=${dir1} setDir=${setDir1} selected=${selectedFile} onSelect=${setSelectedFile} onOpen=${onOpen(dir1)} />
      <${Directory} dir=${dir2} setDir=${setDir2} selected=${selectedFile} onSelect=${setSelectedFile} onOpen=${onOpen(dir2)} />
    </div>
  `;
}

module.exports = App;
