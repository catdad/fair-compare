const { html, render, css, useState } = require('../tools/ui.js');

function Tabs({ list, onSelect }) {
  return list.map(tab => {
    console.log(tab);
    return html`<span key=${tab.key} class="${tab.selected ? 'selected' : ''}">
      ${tab.title}
    </span>`;
  });
}

module.exports = ({ tabs: TAB_ELEM, app: APP_ELEM }) => {
  const tabs = [];

  console.log('rendering in ', TAB_ELEM);

  const apply = () => {
    render(html`<${Tabs} list=${tabs} onSelect=${selectTab} />`, TAB_ELEM);
  };

  const selectTab = TAB => {
    tabs.forEach(tab => {
      if (tab === TAB) {
        APP_ELEM.appendChild(tab);
        tab.selected = true;
      } else {
        tab.selected = false;
        tab.container.remove();
      }
    });
  };

  apply();

  return {
    add: ({ title, background = false }) => {
      const container = document.createElement('div');
      const key = Math.random().toString(36);
      const tab = { container, key, title, selected: !background };

      if (!background) {
        tabs.forEach(tab => {
          tab.selected = false;
          tab.container.remove();
        });

        APP_ELEM.appendChild(container);
      }

      tabs.push(tab);

      apply();

      return [container, key];
    }
  };
};
