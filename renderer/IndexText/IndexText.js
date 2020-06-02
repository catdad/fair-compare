const { html, css } = require('../tools/ui.js');
const fs = require('fs-extra');

css('./IndexText.css');

function File({ title = 'no file available', text = '' }) {
  return html`
    <div class=file>
      <p>${title}</p>
      <pre>${text}</pre>
    </div>
  `;
}

function App({ left, right }) {
  let leftText, rightText;

  if (left) {
    // TODO don't do this sync
    leftText = fs.readFileSync(left, 'utf-8');
  }

  if (right) {
    // TODO don't do this sync
    rightText = fs.readFileSync(right, 'utf-8');
  }

  return html`
    <div class=main>
      <${File} title=${left} text=${leftText} />
      <${File} title=${right} text=${rightText} />
    </div>
  `;
}

module.exports = App;
