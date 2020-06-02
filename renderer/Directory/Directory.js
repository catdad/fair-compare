const { html, css } = require('../tools/ui.js');
const fg = require('fast-glob');
const { dialog } = require('electron').remote;

css('./Directory.css', __dirname);

function getDirectoryStructure(path) {
  return fg(['**/*.*'], {
    dot: false,
    cwd: path
  });
}

function Directory({ dir, setDir, selected, onSelect } = {}) {
  const selectDir = () => {
    let base;

    dialog.showOpenDialog({ properties: ['openDirectory'] }).then(({ cancelled, filePaths }) => {
      base = filePaths && filePaths.length ? filePaths[0] : null;

      if (cancelled || !filePaths || filePaths.length === 0) {
        return [];
      }

      return getDirectoryStructure(filePaths[0]);
    }).then(files => {
      setDir({ base, files });
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
          <p class=${selected === file ? 'selected' : ''} onClick=${() => onSelect(file)}>${file}</p>
        `)}
      </div>
    </div>`;
}

module.exports = Directory;
