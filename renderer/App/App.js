const { html, css } = require('../tools/ui.js');

css('./App.css', __dirname);

function App() {
  return html`<p>This is the app!!</p>`;
}

module.exports = App;
