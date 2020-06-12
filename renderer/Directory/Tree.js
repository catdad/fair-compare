const { html, useState } = require('../tools/ui.js');
const marker = require('./markers.js');
const Icon = require('./Icon.js');

function File({ file, selected, onSelect, onOpen, side }) {
  const classes = `node file ${file.path === selected ? 'selected' : ''} ${file[side] ? '' : 'missing'}`;

  const onclick = () => onSelect(file);
  const ondblclick = () => onOpen(file);
  const icon = marker(file);

  return html`<div key=${file.path} class=${classes} ...${({ onclick, ondblclick })}>${icon} ${file.name}</div>`;
}

function Directory({ dir, side, ...props }) {
  const [open, setOpen] = useState(dir.open);

  const toggleOpen = () => setOpen(!open);
  const openChar = open ? '📂' : '📁';

  return html`
    <div class="name node" onClick=${toggleOpen}><${Icon}>${openChar}<//> ${dir.name}</div>
    <div class="directory">
      ${ open ? html`<${Tree} tree=${dir.children} ...${({ side, ...props })} />` : html`` }
    </div>
  `;
}

function Tree({ tree, side, ...props }) {
  const keys = Object.keys(tree).sort((a, b) => a.localeCompare(b));

  const dirs = keys
    .map(key => tree[key])
    .filter(item => item.type === 'dir')
    .map(dir => html`<${Directory} ...${({ dir, side, ...props })} />`);

  const files = keys
    .map(key => tree[key])
    .filter(item => item.type === 'file')
    .map(file => html`<${File} ...${({ file, side, ...props })} />`);

  return [...dirs, ...files];
}

module.exports = Tree;
