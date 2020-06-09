const { html, css, useContext, useState, useEffect, useRef, useCallback } = require('../tools/ui.js');
const viewBus = new (require('events'))();
const { Config, withConfig } = require('../tools/config.js');

css('./IndexTabs.css');

function Tabs({ list, onSelect, onClose }) {
  const onCloseClick = tab => ev => {
    ev.preventDefault();
    ev.stopPropagation();

    onClose(tab);
  };
  return list.map(tab => {
    return html`<span key=${tab.key} class="tab ${tab.selected ? 'selected' : ''}" onClick=${() => onSelect(tab)}>
      <span title=${tab.title}>${tab.title}</span>
      <button onclick=${onCloseClick(tab)}>🞩</button>
    </span>`;
  });
}

function createTab({ title, url, view, devTools = false, selected = true }) {
  let frame;

  const onMessage = ({ channel, args }) => {
    viewBus.emit(channel, ...args);
  };

  const onLoadFinish = () => {
    if (devTools && frame) {
      frame.openDevTools();
    }
  };

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

      frame.addEventListener('did-finish-load', onLoadFinish);

      return frame;
    })(),
    close: () => {
      frame.removeEventListener('new-tab', onMessage);
      frame.removeEventListener('did-finish-load', onLoadFinish);
      frame.remove();
    },
    selected
  }, {
    selected: {
      get: () => selected,
      set: val => {
        selected = !!val;

        if (selected) {
          frame.style.top = '';
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
  const config = useContext(Config);
  const devTools = config.get('devToolsOpen', false);

  useEffect(() => {
    setTabs([
      createTab({ title: 'Main', url: `${window.location.href}?route=directory`, view, devTools }),
    ]);
  }, [/* execute once */]);

  useEffect(() => {
    const onNewTab = ({ title, ...data }) => {
      const query = Object.keys(data).map(key => `${key}=${data[key]}`).join('&');
      const url = `${window.location.href}?${query}`;

      const tab = createTab({ title, url, view, devTools });
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

  const selectTab = useCallback(TAB => {
    tabs.forEach(tab => {
      tab.selected = tab === TAB;
    });

    setTabs([].concat(tabs));
  }, [tabs, setTabs]);

  const closeTab = useCallback(TAB => {
    if (TAB === tabs[0]) {
      return;
    }

    const newTabs = tabs.filter((tab, idx) => {
      if (tabs[idx + 1] === TAB) {
        tab.selected = true;
      } else {
        tab.selected = false;
      }

      if (tab === TAB) {
        tab.close();
      }

      return tab !== TAB;
    });

    setTabs(newTabs);
  }, [tabs, setTabs]);

  return html`
    <div class="tab-bar">
      <${Tabs} list=${tabs} onClose=${closeTab} onSelect=${selectTab} />
    </div>
    <div ref=${view}></div>
  `;
}

module.exports = withConfig(App);
