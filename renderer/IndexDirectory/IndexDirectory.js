const path = require('path');
const FileType = require('file-type');

const { html, css, useContext, useEffect, useState } = require('../tools/ui.js');
const { Config, withConfig } = require('../tools/config.js');
const { getDirectoryStructure } = require('../tools/directory-tree.js');
const toast = require('../tools/toast.js');
const { compare } = require('../tools/batch-compare.js');
const dialog = require('./batch-dialog.js');

const { ipcRenderer } = require('electron');
const { List, Tree } = require('../Directory/Directory.js');
const { Toolbar, ToolbarSeparator } = require('../Toolbar/Toolbar.js');

const tabs = require('../../lib/tabs.js');

css('./IndexDirectory.css');

const VIEW = 'directory-view';

const fileInDir = (tree, side, file) => {
  if (file[side]) {
    return path.resolve(tree[side], file.path);
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
    getDirectoryStructure({
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

    const left = side === 'left' ? dir : treeData.left;
    const right = side === 'right' ? dir : treeData.right;

    const newTreeData = await getDirectoryStructure({ left, right });
    setTreeData(newTreeData);
  };

  const onOpen = async (file) => {
    const left = fileInDir(treeData, 'left', file);
    const right = fileInDir(treeData, 'right', file);

    // TODO handle errors
    const result = await FileType.fromFile(left || right);
    const { mime } = result || { mime: 'text/plain' };

    const route = mime.split('/')[0];

    if (!['text', 'image'].includes(route)) {
      // TODO handle this error better

      // eslint-disable-next-line no-console
      console.error(`unsupported diff mime: ${mime}`);
      return;
    }

    const data = {
      title: path.basename(file.path),
      route
    };

    if (left) {
      data.left = left;
    }

    if (right) {
      data.right = right;
    }

    const query = Object.keys(data).map(key => `${key}=${data[key]}`).join('&');
    const url = `${window.location.href}?${query}`;

    await tabs.open({
      title: path.basename(file.path),
      url: url,
      selected: true
    });
  };

  const onSelect = file => {
    setSelectedFile(file.path);
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

      toast.error(`BATCH COMPARE ERROR:\n${err.message || err.toString()}`);
    });
  }

  function render(side) {
    const props = {
      base: treeData[side],
      setDir: setDir(side),
      selected: selectedFile,
      onSelect: onSelect,
      onOpen: onOpen
    };

    return view === 'tree' ?
      html`<${Tree} tree=${treeData.tree} side=${side} ...${props} />` :
      html`<${List} tree=${treeData.tree} side=${side} ...${props} />`;
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
