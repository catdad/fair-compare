const { html } = require('../tools/ui.js');
const Icon = require('./Icon.js');

const TITLE = {
  same: 'files are binary equal',
  similar: 'files are similar based on rules',
  different: 'files are different based on rules',
  invalid: 'file is only in one directory',
  error: 'an error occured for these files'
};

const MARKERS = {
  same: '🟢',
  similar: '🟡',
  different: '🔴',
  invalid: '⚪',
  error: '💢'
};

module.exports = ({ compare }) => {
  const icon = MARKERS[compare] || '📄';

  return html`<${Icon} title=${TITLE[compare]}>${icon}<//>`;
};
