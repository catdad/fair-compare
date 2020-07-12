const { html, css, useEffect, setVar } = require('../tools/ui.js');

css('./Icon.css');

const fs = require('fs');
const path = require('path');
const iconDir = path.dirname(require.resolve('@material-icons/svg/package.json'));

const cache = {};

const loadIcon = (name, varient) => {
  const iconPath = path.resolve(iconDir, 'svg', name, `${varient}.svg`);

  if (cache[iconPath]) {
    return cache[iconPath];
  }

  // TODO make this asynchronous so it doesn't block other stuff?
  cache[iconPath] = fs.readFileSync(iconPath, 'utf-8')
    .replace(/width="\d+"/, '')
    .replace(/height="\d+"/, '');

  return cache[iconPath];
};

module.exports = ({ name, size = 16, varient = 'baseline' }) => {
  const dim = typeof size === 'number' ? `${size}px` : size;
  const svg = loadIcon(name, varient);
  const ref = {};

  useEffect(() => {
    setVar(ref.current, 'size', dim);
  }, []);

  return html`<span ref=${ref} class=icon>${html([svg])}</span>`;
};
