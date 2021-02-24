const EventEmitter = require('events');
const events = new EventEmitter();

const { html, render, css } = require('./tools/ui.js');
const query = require('./tools/query.js');

css('./base.css');

switch (query.route) {
  case 'directory': {
    document.title += ' Directory';
    const IndexDirectory = require('./IndexDirectory/IndexDirectory.js');
    render(html`<${IndexDirectory} events=${events} />`, document.querySelector('#app'));
    break;
  }
  case 'image': {
    document.title += ' Image';
    const IndexImage = require('./IndexImage/IndexImage.js');
    render(html`<${IndexImage} left=${query.left} right=${query.right} />`, document.querySelector('#app'));
    break;
  }
  case 'text': {
    document.title += ' Text';
    const IndexText = require('./IndexText/IndexText.js');
    render(html`<${IndexText} left=${query.left} right=${query.right} />`, document.querySelector('#app'));
    break;
  }
  default: {
    document.title += ' Main';
    const IndexTabs = require('./IndexTabs/IndexTabs.js');
    render(html`<${IndexTabs} events=${events} />`, document.querySelector('#app'));
    break;
  }
}
