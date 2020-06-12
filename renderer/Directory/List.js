const { html } = require('../tools/ui.js');
const { flatFiles } = require('../tools/directory-tree.js');
const marker = require('./markers.js');

function List({ tree, side, selected, onSelect, onOpen }) {
  const files = flatFiles(tree);

  const elems = files.map(file => {
    const classes = `file ${file.path === selected ? 'selected' : ''} ${file[side] ? '' : 'missing'}`;

    const onclick = () => onSelect(file);
    const ondblclick = () => onOpen(file);
    const icon = marker(file);

    return html`<p key=${file.path} class=${classes} ...${({ onclick, ondblclick })}>${icon} ${file.path}</p>`;
  });

  return html`<div class="list">${elems}</div>`;
}

module.exports = List;
