const { getCurrentWindow } = require('electron').remote;

const { html, css } = require('../tools/ui.js');
const menu = require('../../lib/menu.js');

css('./Frame.css');

const browser = getCurrentWindow();
const onMinimize = () => void browser.minimize();
const onMaximize = () => void (browser.isMaximized() ? browser.unmaximize() : browser.maximize());
const onClose = () => void browser.close();

module.exports = ({ class: classList, children }) => {
  const onMenu = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    const rect = ev.target.getBoundingClientRect();

    menu.toggleContext({
      x: Math.floor(rect.left),
      y: Math.floor(rect.bottom)
    }).catch(err => {
      console.error('failed to interact with menu', err);
    });
  };

  if (process.platform !== 'win32') {
    return html`<div class=${classList}>${ children }</div>`;
  }

  return html`
    <div class="frame ${classList}">
      <span class=left><button onclick=${onMenu}>Menu</button></span>
      <span class=content>${children}</span>
      <span class=right>
        <button onclick=${onMinimize}>Minimize</button>
        <button onclick=${onMaximize}>Maximize</button>
        <button onclick=${onClose}>Close</button>
      </span>
    </div>
  `;
};
