const { html, render } = require('./tools/ui.js');
const App = require('./App/App.js');

const tabs = require('./Chrome/tabs.js')({
  tabs: document.querySelector('#tabs'),
  app: document.querySelector('#app')
});

const [app] = tabs.add({ title: 'Main' });

render(html`<${App}/>`, app);
