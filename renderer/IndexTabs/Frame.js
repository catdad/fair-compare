const { BrowserWindow } = require('electron').remote;

const { html, css, useState } = require('../tools/ui.js');
const menu = require('../../lib/menu.js');

css('./Frame.css');

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

  const onClose = () => {
    BrowserWindow.getFocusedWindow().close();
  };

  if (process.platform !== 'win32') {
    return html`<div class=${classList}>${ children }</div>`;
  }

  return html`
    <div class="frame ${classList}">
      <span class=left><button onclick=${onMenu}>Menu</button></span>
      <span class=content>${children}</span>
      <span class=right>
        <button onclick=${onClose}>Close</button>
      </span>
    </div>
  `;
};
