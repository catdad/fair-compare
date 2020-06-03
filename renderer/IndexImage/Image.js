const { html } = require('../tools/ui.js');

// TODO this svg is not correct, fix it
function Image({ title = 'no file available', filepath = 'data:image/svg+xml;utf8,<svg></svg>', onLoad = () => {} }) {
  return html`
    <div class=file>
      <p>${title}</p>
      <div>
        <img src=${filepath} onLoad=${onLoad} />
      </div>
    </div>
  `;
}

module.exports = Image;
