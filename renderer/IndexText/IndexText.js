const { html, css, useContext, useEffect, useState } = require('../tools/ui.js');
const fs = require('fs/promises');
const { diffLines } = require('diff');

const { Config, withConfig } = require('../tools/config.js');
const { Toolbar } = require('../Toolbar/Toolbar.js');
const toast = require('../tools/toast.js');

css('./IndexText.css');

const readFile = async path => {
  if (!path) {
    return '';
  }

  try {
    return await fs.readFile(path, 'utf-8');
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  return '';
};

function FileSide({ title = 'no file available', chunks = [], side }) {
  const lines = chunks.map(({ added, removed, value }) => {
    const classes = side === 'left' ?
      removed ? 'red' : added ? 'hide' : '' :
      added ? 'green' : removed ? 'hide' : '';

    return html`<span class=${classes}>${value}</span>`;
  });

  return html`
    <div class="file half">
      <p>${title}</p>
      <pre>${lines}</pre>
    </div>
  `;
}

function FileInline({ title, chunks }) {
  const lines = chunks.map(({ added, removed, value }) => {
    const classes = removed ? 'red' : added ? 'green' : '';

    return html`<span class=${classes}>${value}</span>`;
  });

  return html`
    <div class="file full">
      <p>${title}</p>
      <pre>${lines}</pre>
    </div>
  `;
}

const MODE = {
  inline: 'inline',
  side: 'side'
};

const VIEW = 'text-view';

function App({ left, right }) {
  const config = useContext(Config);
  const [mode, setMode] = useState(MODE[config.get(VIEW)] || MODE.side);
  const [diff, setDiff] = useState([]);

  useEffect(() => {
    Promise.all([
      readFile(left),
      readFile(right),
    ]).then(([leftText = '', rightText = '']) => {
      setDiff(diffLines(leftText, rightText));
    }).catch(err => {
      toast.error(`Failed to read a file:\n${err.message || err.toString()}`);
    });
  }, [left, right]);

  const applyMode = value => () => {
    if (mode === value) {
      return;
    }

    config.set(VIEW, value);
    setMode(value);
  };

  const view = mode === MODE.side ?
    html`
      <${FileSide} title=${left} chunks=${diff} side=left />
      <${FileSide} title=${right} chunks=${diff} side=right />
    ` : html`
      <${FileInline} title=${`${left} vs. ${right}`} chunks=${diff} />
    `;

  return html`
    <${Toolbar}>
      <button onclick=${applyMode(MODE.side)}>Side by Side</button>
      <button onclick=${applyMode(MODE.inline)}>Inline</button>
    <//>
    <div class=main>${view}</div>
  `;
}

module.exports = withConfig(App);
