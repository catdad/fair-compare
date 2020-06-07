const { html, css, useContext, useEffect, useState } = require('../tools/ui.js');

function File({ file, side }) {
  return `<div class="node">${file[side] ? file.name : ''}</div>`;
}

function Directory({ dir, side }) {
  const [open, setOpen] = useState(dir.open);

  const toggleOpen = () => setOpen(!open);

  return html`
    <div class="directory">
      <div class="node" onClick=${toggleOpen}>${dir.name}</div>
      ${ open ? html`<${Tree} tree=${dir.children} side=${side} />` : html`` }
  `;
}

function Tree({ tree, side }) {
  const keys = Object.keys(tree).sort((a, b) => a.localeCompare(b));

  const dirs = keys
    .filter(key => tree[key].type === 'dir')
    .map(key => tree[key])
    .map(dir => html`<${Directory} dir=${dir.children} side=${side} />`);

  const files = keys
    .filter(key => tree[key].type === 'file')
    .map(key => tree[key])
    .map(file => html`<${File} file=${file} side=${side}`);

  return [...dirs, ...files];
}

module.exports = Tree;
