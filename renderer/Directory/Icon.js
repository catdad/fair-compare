const { html } = require('../tools/ui.js');

module.exports = ({ children, title = '' }) => html`<span class=icon title=${title}>${children}<//>`;
