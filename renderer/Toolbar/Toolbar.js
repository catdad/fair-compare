const { html, css } = require('../tools/ui.js');

css('./Toolbar.css');

const getVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
const setVar = (name, value) => document.documentElement.style.setProperty(`--${name}`, value);

const SIZE = '2rem';

function Toolbar({ children }) {
  setVar('toolbar-height', SIZE);

  return html`<div class="toolbar">
    ${children}
  </div>`;
}

module.exports = Toolbar;
