const { html, css, useState } = require('../tools/ui.js');

function File({ file, selected, side }) {
  const classes = `node file ${file.path === selected ? 'selected' : ''} ${file[side] ? '' : 'missing'}`;
  return html`<div class=${classes}>${file[side] ? file.name : '-'}</div>`;
}

function Directory({ dir, side }) {
  const [open, setOpen] = useState(dir.open || true);

  const toggleOpen = () => setOpen(!open);

  return html`
    <div class="directory">
      <div class="name node" onClick=${toggleOpen}>${dir.name}</div>
      ${ open ? html`<${Tree} tree=${dir.children} side=${side} />` : html`` }
    </div>
  `;
}

function Tree({ tree, selected, side }) {
  const keys = Object.keys(tree).sort((a, b) => a.localeCompare(b));

  const dirs = keys
    .map(key => tree[key])
    .filter(item => item.type === 'dir')
    .map(dir => html`<${Directory} dir=${dir} side=${side} />`);

  const files = keys
    .map(key => tree[key])
    .filter(item => item.type === 'file')
    .map(file => html`<${File} file=${file} side=${side} selected=${selected} />`);

  return [...dirs, ...files];
}

module.exports = Tree;
