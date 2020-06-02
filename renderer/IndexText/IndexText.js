const { html, css } = require('../tools/ui.js');
const fs = require('fs-extra');

css('./IndexText.css');

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
      <pre class=file>${leftText || ''}</pre>
      <pre class=file>${rightText || ''}</pre>
    </div>
  `;
}

module.exports = App;
