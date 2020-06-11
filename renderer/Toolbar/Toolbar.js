const { html, css, setRootVar } = require('../tools/ui.js');

css('./Toolbar.css');

const SIZE = '2.4rem';

function Toolbar({ children, heightVar = 'toolbar-height' }) {
  setRootVar(heightVar, SIZE);

  return html`<div class="toolbar">
    ${children}
  </div>`;
}

function ToolbarSeparator() {
  return html`<span class=sep />`;
}

module.exports = { Toolbar, ToolbarSeparator };
