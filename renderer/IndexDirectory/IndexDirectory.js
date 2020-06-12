const path = require('path');
const FileType = require('file-type');

const { html, css, useContext, useEffect, useState } = require('../tools/ui.js');
const { Config, withConfig } = require('../tools/config.js');
const directoryTree = require('../tools/directory-tree.js');
const toast = require('../tools/toast.js');
const { compare } = require('../tools/batch-compare.js');
const dialog = require('./batch-dialog.js');

const { ipcRenderer } = require('electron');
const { List, Tree } = require('../Directory/Directory.js');
const { Toolbar, ToolbarSeparator } = require('../Toolbar/Toolbar.js');

css('./IndexDirectory.css');

const VIEW = 'directory-view';

const fileInDir = (dir, file) => {
  if (dir.files.includes(file)) {
    return path.resolve(dir.base, file);
  }
};

function App() {
  const config = useContext(Config);
  const [treeData, setTreeData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [view, setView] = useState(config.get(VIEW, 'tree'));

  const changeView = (value) => {
    config.set(VIEW, value);
    setView(value);
  };

  useEffect(() => {
    directoryTree({
      left: config.get('directories.left'),
      right: config.get('directories.right')
    }).then(data => {
      setTreeData(data);
    }).catch((err) => {
      toast.error([
        'failed to load directories',
        err.toString()
      ].join('<br/>'));
    });
  }, [/* execute only once */]);

  const setDir = (side) => async (dir) => {
    config.set(`directories.${side}`, dir);

    const left = side === 'left' ? dir : treeData.left.base;
    const right = side === 'right' ? dir : treeData.right.base;

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

  function batch() {
    dialog().then(({ threshold }) => {
      const onUpdate = () => setTreeData({ ...treeData });

      console.time('batch compare');
      return compare({ tree: treeData, onUpdate, threshold }).then(() => {
        console.timeEnd('batch compare');
        onUpdate();
      });
    }).catch(err => {
      if (err && err.message === 'user cancel') {
        return;
      }

      console.error('BATCH COMPARE ERROR', err);
    });
  }

  function render(side) {
    const props = {
      base: treeData[side].base,
      setDir: setDir(side),
      selected: selectedFile,
      onSelect: setSelectedFile,
      onOpen: onOpen(treeData[side])
    };

    return view === 'tree' ?
      html`<${Tree} tree=${treeData.tree} side=${side} ...${props} />` :
      html`<${List} dir=${treeData[side]} ...${props} />`;
  }

  const buttons = [
    html`<button onClick=${() => changeView('tree')}>Tree View</button>`,
    html`<button onClick=${() => changeView('list')}>List View</button>`,
    html`<${ToolbarSeparator} />`,
    html`<button onClick=${() => batch()}>Batch Compare</button>`,
  ];

  if (treeData.progress) {
    const { count, total } = treeData.progress;
    buttons.push(html`<progress max=${total} value=${count} /><span>${Math.floor(count / total * 100)}%</span>`);
  }

  return html`
    <${Toolbar}>${buttons}<//>
    <div class=main>
      ${render('left')}
      ${render('right')}
    </div>
  `;
}

module.exports = withConfig(App);
