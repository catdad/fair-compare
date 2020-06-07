const path = require('path');
const FileType = require('file-type');

const { html, css, useContext, useEffect, useState } = require('../tools/ui.js');
const { Config, withConfig } = require('../tools/config.js');
const directoryTree = require('../tools/directory-tree.js');

const { ipcRenderer } = require('electron');
const { List } = require('../Directory/Directory.js');

css('./IndexDirectory.css');

const fileInDir = (dir, file) => {
  if (dir.files.includes(file)) {
    return path.resolve(dir.base, file);
  }
};

function App() {
  const config = useContext(Config);
  const [treeData, setTreeData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    directoryTree({
      left: config.get('directories.left'),
      right: config.get('directories.right')
    }).then(data => {
      setTreeData(data);
    }).catch((err) => {
      console.error(err);
    });
  }, [/* execute only once */]);

  const setDir = (side) => async (data) => {
    config.setProp(`directories.${side}`, data.base);

    const left = side === 'left' ? data.base : treeData.left.base;
    const right = side === 'right' ? data.base : treeData.right.base;

    const newTreeData = await directoryTree({ left, right });
    setTreeData(newTreeData);
  };

  const onOpen = (dir) => async (file) => {
    const left = fileInDir(treeData.left, file);
    const right = fileInDir(treeData.right, file);

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

  if (!treeData) {
    return html`<div></div>`;
  }

  return html`
    <div class=main>
      <${List} dir=${treeData.left} base=${treeData.left.base} setDir=${setDir('left')} selected=${selectedFile} onSelect=${setSelectedFile} onOpen=${onOpen(treeData.left)} />
      <${List} dir=${treeData.right} base=${treeData.right.base} setDir=${setDir('right')} selected=${selectedFile} onSelect=${setSelectedFile} onOpen=${onOpen(treeData.right)} />
    </div>
  `;
}

module.exports = withConfig(App);
