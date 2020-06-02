const { html, css, useState, useEffect, useRef } = require('../tools/ui.js');

css('./IndexTabs.css');

function Tabs({ list, onSelect }) {
  return list.map(tab => {
    return html`<span key=${tab.key} class="tab ${tab.selected ? 'selected' : ''}" onClick=${() => onSelect(tab)}>
      ${tab.title}
    </span>`;
  });
}

function createTab({ title, url, view, selected = true }) {
  return {
    title,
    frame: (() => {
      const frame = document.createElement('webview');
      frame.classList.add('view');
      frame.setAttribute('src', url);
      frame.setAttribute('nodeintegration', true);

      view.current.appendChild(frame);

      return frame;
    })(),
    selected
  };
}

function App() {
  const [tabs, setTabs] = useState([]);
  const view = useRef(null);

  useEffect(() => {
    setTabs([
      createTab({ title: 'Main', url: `${window.location.href}?route=directory`, view }),
    ]);
  }, [/* execute once */]);

  const selectTab = TAB => {
    tabs.forEach(tab => {
      if (tab === TAB) {
        tab.selected = true;
        tab.frame.style.top = '200vh';
      } else {
        tab.selected = false;
      }
    });

    setTabs([].concat(tabs));
  };

  return html`
    <div class="tab-bar">
      <${Tabs} list=${tabs} onSelect=${selectTab} />
    </div>
    <div ref=${view}></div>
  `;
}

module.exports = App;
