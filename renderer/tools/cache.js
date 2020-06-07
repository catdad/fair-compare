const { html, createContext, useRef } = require('../tools/ui.js');

const Cache = createContext(new Map());

const withCache = Component => ({ children, ...props }) => {
  const map = useRef(new Map());

  return html`
    <${Cache.Provider} value=${map.current}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

module.exports = { Cache, withCache };
