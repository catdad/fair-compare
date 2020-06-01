const path = require('path');

const { h, render } = require('preact');
const htm = require('htm');

const html = htm.bind(h);

const css = (csspath, dirname = '.') => {
  const link = document.createElement('link');

  Object.assign(link, {
    type: 'text/css',
    rel: 'stylesheet',
    href: path.resolve(dirname, csspath)
  });

  document.head.appendChild(link);
};

module.exports = { html, render, css };
