const { html, createContext, useEffect, useState } = require('../tools/ui.js');
const { get, set } = require('lodash');
const CONFIG = require('../../lib/config.js');

const noop = () => {};

const Config = createContext({});

const withConfig = Component => ({ children, ...props }) => {
  const [localConfig, setLocalConfig] = useState({ __loading: true });

  const api = {
    get: (path, fallback) => get(localConfig, path, fallback),
    set: (path, value) => {
      set(localConfig, path, value);
      CONFIG.setProp(path, value).catch(noop);
    }
  };

  useEffect(() => {
    CONFIG.read().then(obj => {
      delete obj.__loading;
      setLocalConfig(obj);
    }).catch(err => {
      console.error('CONFIG FAILED TO LOAD', err);
    });
  }, []);

  if (localConfig.__loading) {
    return html`<div></div>`;
  }

  return html`
    <${Config.Provider} value=${api}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

module.exports = { Config, withConfig };
