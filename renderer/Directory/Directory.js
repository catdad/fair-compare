const { html, css } = require('../tools/ui.js');
const { dialog } = require('electron').remote;

css('./Directory.css');

function Directory({ dir, setDir, selected, onSelect, onOpen } = {}) {
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

  return html`
    <div class="directory">
      <div class="header">
        <span>${dir.base || 'no directory selected'}</span>
        <button onClick=${selectDir}>Pick Directory</button>
      </div>
      <div class="list">
        ${dir.files.map(file => html`
          <p class=${selected === file ? 'selected' : ''} onclick=${() => onSelect(file)} ondblclick=${() => onOpen(file)}>${file}</p>
        `)}
      </div>
    </div>`;
}

module.exports = Directory;
