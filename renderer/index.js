const { html, render } = require('./tools/ui.js');
const App = require('./App/App.js');

render(html`<${App}/>`, document.querySelector('#app'));
