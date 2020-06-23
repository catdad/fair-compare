const { html, css, useContext, useState } = require('../tools/ui.js');
const fs = require('fs-extra');
const { diffLines } = require('diff');

const { Config, withConfig } = require('../tools/config.js');
const { Toolbar } = require('../Toolbar/Toolbar.js');

css('./IndexText.css');

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
  let leftText, rightText;

  const applyMode = value => () => {
    if (mode === value) {
      return;
    }

    config.set(VIEW, value);
    setMode(value);
  };

  if (left) {
    // TODO don't do this sync
    leftText = fs.readFileSync(left, 'utf-8') || '';
  }

  if (right) {
    // TODO don't do this sync
    rightText = fs.readFileSync(right, 'utf-8') || '';
  }

  const diff = diffLines(leftText, rightText);

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
