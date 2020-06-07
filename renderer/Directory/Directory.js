const { html, css } = require('../tools/ui.js');
const { dialog } = require('electron').remote;

css('./Directory.css');

const Tree = require('./Tree.js');

function ListView({ files, selected, onSelect, onOpen }) {
  return html`
    <div class="list">
      ${files.map(file => html`
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

function Directory({ dir, setDir, selected, onSelect, onOpen, type = 'list', side } = {}) {
  const selectDir = () => {
    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(({ cancelled, filePaths }) => {
      if (cancelled || !filePaths || filePaths.length === 0) {
        return;
      }

      setDir(filePaths[0]);
    }).catch(err => {
      // TODO handle this error better
      console.error(err);
    });
  };

  const view = type === 'list' ?
    html`<${ListView} files=${dir.files} selected=${selected} onSelect=${onSelect} onOpen=${onOpen} />` :
    html`<${Tree} tree=${dir} side=${side} />`;

  return html`
    <div class="half">
      <${Header} base=${dir.base} selectDir=${selectDir} />
      ${view}
    </div>`;
}

module.exports = Directory;
