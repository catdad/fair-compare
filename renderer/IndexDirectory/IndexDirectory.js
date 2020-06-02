const path = require('path');
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

  const onOpen = (file) => {
    const left = fileInDir(dir1, file);
    const right = fileInDir(dir2, file);

    const data = {
      title: path.basename(file),
      route: 'text'
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
      <${Directory} dir=${dir1} setDir=${setDir1} selected=${selectedFile} onSelect=${setSelectedFile} onOpen=${onOpen} />
      <${Directory} dir=${dir2} setDir=${setDir2} selected=${selectedFile} onSelect=${setSelectedFile} onOpen=${onOpen} />
    </div>
  `;
}

module.exports = App;
