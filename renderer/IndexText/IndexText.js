const { html, css } = require('../tools/ui.js');
const fs = require('fs-extra');
const { diffLines } = require('diff');

css('./IndexText.css');

function FileSide({ title = 'no file available', chunks = [], side }) {
  const lines = chunks.map(({ added, removed, value }) => {
    const classes = side === 'left' ?
      removed ? 'red' : added ? 'hide' : '' :
      added ? 'green' : removed ? 'hide' : '';

    return html`<span class=${classes}>${value}</span>`;
  });

  return html`
    <div class=file>
      <p>${title}</p>
      <pre>${lines}</pre>
    </div>
  `;
}

function App({ left, right }) {
  let leftText, rightText;

  if (left) {
    // TODO don't do this sync
    leftText = fs.readFileSync(left, 'utf-8') || '';
  }

  if (right) {
    // TODO don't do this sync
    rightText = fs.readFileSync(right, 'utf-8') || '';
  }

  const diff = diffLines(leftText, rightText);

  return html`
    <div class=main>
      <${FileSide} title=${left} chunks=${diff} side=left />
      <${FileSide} title=${right} chunks=${diff} side=right />
    </div>
  `;
}

module.exports = App;
