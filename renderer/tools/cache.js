const { html, createContext, useRef } = require('../tools/ui.js');

const Cache = createContext(new Map());

module.exports = createContext(new Map());

module.exports.withCache = Component => ({ children, ...props }) => {
  const map = useRef(new Map());

  return html`
    <${Cache.Provider} value=${map}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};
