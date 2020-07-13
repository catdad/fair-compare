const { getCurrentWindow } = require('electron').remote;

const { html, css } = require('../tools/ui.js');
const menu = require('../../lib/menu.js');
const Icon = require('../Icon/Icon.js');

css('./Frame.css');

const browser = getCurrentWindow();
const onMinimize = () => void browser.minimize();
const onMaximize = () => void (browser.isMaximized() ? browser.unmaximize() : browser.maximize());
const onClose = () => void browser.close();

const Button = ({ onclick, children, class: classList }) => {
  const icon = Array.isArray(children) ? children[0] : children;

  return html`<button class="frame-button ${classList}" onclick=${onclick}><${Icon} name=${icon} /></button>`;
};

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
      <span class=left>
        <${Button} onclick=${onMenu}>menu<//>
      </span>
      <span class=content>${children}</span>
      <span class=right>
        <${Button} onclick=${onMinimize}>minimize<//>
        <${Button} onclick=${onMaximize}>filter_none<//>
        <${Button} onclick=${onClose} class="frame-close">close<//>
      </span>
    </div>
  `;
};
