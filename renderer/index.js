const EventEmitter = require('events');
const events = new EventEmitter();

const { html, render, css } = require('./tools/ui.js');
const query = require('./tools/query.js');

css('./base.css', __dirname);

console.log('INDEX LOADED', query);

switch (query.route) {
  case 'directory': {
    const IndexDirectory = require('./IndexDirectory/IndexDirectory.js');
    render(html`<${IndexDirectory} events=${events} />`, document.querySelector('#app'));
    break;
  }
  case 'image':
  case 'text':
    render(html`<div>Image view not implemented<//>`);
    break;
  default: {
    const IndexTabs = require('./IndexTabs/IndexTabs.js');
    render(html`<${IndexTabs} events=${events} />`, document.querySelector('#app'));
    break;
  }
}
