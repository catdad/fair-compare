const { html, css } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const { dialog } = require('electron').remote;

css('./Directory.css');

const Tree = require('./Tree.js');

function List({ dir, selected, onSelect, onOpen }) {
  return html`
    <div class="list">
      ${dir.files.map(file => html`
        <p class=${selected === file ? 'selected' : ''} onclick=${() => onSelect(file)} ondblclick=${() => onOpen(file)}>${file}</p>
      `)}
    </div>`;
}

function Header({ base = 'no directory selected', selectDir }) {
  return html`
    <div class="header">
      <span>${base}</span>
      <button onClick=${selectDir}>Pick Directory</button>
    </div>`;
}

const withDirHelpers = Component => ({ children, base, setDir, ...props }) => {
  const selectDir = () => {
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(({ cancelled, filePaths }) => {
      if (cancelled || !filePaths || filePaths.length === 0) {
        return;
      }

      setDir(filePaths[0]);
    }).catch(err => {
      toast.error(err);
    });
  };

  return html`
    <div class="half">
      <${Header} base=${base} selectDir=${selectDir} />
      <${Component} ...${props}>${children}<//>
    </div>
  `;
};

module.exports = {
  List: withDirHelpers(List),
  Tree: withDirHelpers(Tree)
};
