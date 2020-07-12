const { html, useState } = require('../tools/ui.js');
const menu = require('../../lib/menu.js');

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

  return html`
    <div class="frame ${classList}">
      <button onclick=${onMenu}>Menu</button>
      ${children}
    </div>
  `;
};
