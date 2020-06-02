const { html, css, useState, useEffect, useRef } = require('../tools/ui.js');
const viewBus = new (require('events'))();

css('./IndexTabs.css');

function Tabs({ list, onSelect }) {
  return list.map(tab => {
    return html`<span key=${tab.key} class="tab ${tab.selected ? 'selected' : ''}" onClick=${() => onSelect(tab)}>
      ${tab.title}
    </span>`;
  });
}

function createTab({ title, url, view, selected = true }) {
  const onMessage = ({ channel, args }) => {
    viewBus.emit(channel, ...args);
  };

  let frame;

  return Object.defineProperties({
    key: Math.random(),
    title,
    frame: (() => {
      frame = document.createElement('webview');
      frame.classList.add('view');
      frame.setAttribute('src', url);
      frame.setAttribute('nodeintegration', true);

      view.current.appendChild(frame);

      frame.addEventListener('ipc-message', onMessage);

      frame.addEventListener('did-finish-load', () => {
        frame.openDevTools();
      });

      return frame;
    })(),
    close: () => {
      frame.removeEventListener('new-tab', onMessage);
      frame.remove();
    },
    selected
  }, {
    selected: {
      get: () => selected,
      set: val => {
        selected = !!val;

        if (selected) {
          delete frame.style.top;
        } else {
          frame.style.top = '200vh';
        }
      }
    }
  });
}

function App() {
  const [tabs, setTabs] = useState([]);
  const view = useRef(null);

  useEffect(() => {
    setTabs([
      createTab({ title: 'Main', url: `${window.location.href}?route=directory`, view }),
    ]);
  }, [/* execute once */]);

  useEffect(() => {
    const onNewTab = ({ title, ...data }) => {
      const query = Object.keys(data).map(key => `${key}=${data[key]}`).join('&');
      const url = `${window.location.href}?${query}`;

      const tab = createTab({ title, url, view });
      const newTabs = [...(tabs.map(t => {
        t.selected = false;
        return t;
      })), tab];

      setTabs(newTabs);
    };

    viewBus.on('new-tab', onNewTab);

    return () => {
      viewBus.off('new-tab', onNewTab);
    };
  }, [tabs]);

  const selectTab = TAB => {
    tabs.forEach(tab => {
      tab.selected = tab === TAB;
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
