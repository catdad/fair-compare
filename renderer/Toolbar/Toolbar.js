const { html, css, setRootVar } = require('../tools/ui.js');

css('./Toolbar.css');

const SIZE = '2rem';

function Toolbar({ children, heightVar = 'toolbar-height' }) {
  setRootVar(heightVar, SIZE);

  return html`<div class="toolbar">
    ${children}
  </div>`;
}

module.exports = Toolbar;
