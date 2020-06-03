const { html, css } = require('../tools/ui.js');

css('./IndexImage.css');

function Image({ title = 'no file available', filepath = 'data:image/svg+xml;<svg></svg>' }) {
  return html`
    <div class=file>
      <p>${title}</p>
      <div>
        <img src=${filepath} />
      </div>
    </div>
  `;
}

function App({ left, right }) {
  return html`
    <div class=main>
      <${Image} title=${left} filepath=${left} />
      <${Image} title=${right} filepath=${right} />
    </div>
  `;
}

module.exports = App;
