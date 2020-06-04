const { html } = require('../tools/ui.js');

// TODO this svg is not correct, fix it
function Image({ title = 'no file available', filepath = 'data:image/svg+xml;utf8,<svg></svg>', onLoad = () => {} }) {
  return html`
    <p>${title}</p>
    <div>
      <img src=${filepath} onLoad=${onLoad} />
    </div>
  `;
}

module.exports = Image;
