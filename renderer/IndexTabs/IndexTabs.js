const { html, css, useContext, useState, useEffect, useRef, useCallback, setVar } = require('../tools/ui.js');
const viewBus = new (require('events'))();
const { Config, withConfig } = require('../tools/config.js');
const batchCompare = require('../workers/batch-compare.js');

const Frame = require('./Frame.js');

css('./IndexTabs.css');

function Tabs({ list, onSelect, onClose }) {
  const onCloseClick = tab => ev => {
    ev.preventDefault();
    ev.stopPropagation();

    onClose(tab);
  };

  const onAuxClick = tab => ev => {
    if (ev.button === 1) {
      onCloseClick(tab)(ev);
    }
  };

  return list.map(tab => {
    return html`<span key=${tab.key} class="tab ${tab.selected ? 'selected' : ''}" onclick=${() => onSelect(tab)} onauxclick=${onAuxClick(tab)}>
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
      frame.setAttribute('nodeintegrationinworker', true);

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
  const tabsRef = {};

  const displayTabs = tabs => {
    if (tabsRef.current) {
      setVar(tabsRef.current, 'count', tabs.length);
    }

    setTabs(tabs);
  };

  useEffect(() => {
    const tab = createTab({ title: 'Main', url: `${window.location.href}?route=directory`, view, devTools });
    batchCompare.register(tab.frame);

    displayTabs([tab]);
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

      displayTabs(newTabs);
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

    displayTabs([].concat(tabs));
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

    displayTabs(newTabs);
  }, [tabs, setTabs]);

  return html`
    <${Frame} class="tab-bar">
      <span class=tabs ref=${tabsRef}>
        <${Tabs} list=${tabs} onClose=${closeTab} onSelect=${selectTab} />
      </span>
    <//>
    <div ref=${view}></div>
  `;
}

module.exports = withConfig(App);
