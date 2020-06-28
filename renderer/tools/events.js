const EventEmitter = require('events');
const { html, createContext } = require('../tools/ui.js');

const events = new EventEmitter();
const Events = createContext(events);

const withEvents = Component => ({ children, ...props }) => {
  return html`
    <${Events.Provider} value=${events}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

module.exports = { Events, withEvents };
