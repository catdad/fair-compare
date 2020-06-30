const { html, css, useContext, useState } = require('../tools/ui.js');
const { withCache } = require('../tools/cache.js');
const { Config, withConfig } = require('../tools/config.js');
const { Events, withEvents } = require('../tools/events.js');
const { ToolbarSeparator } = require('../Toolbar/Toolbar.js');

css('./IndexImage.css');

const Tolerance = require('./Tolerance.js');
const Range = require('./Range.js');
const Blend = require('./Blend.js');
const Side = require('./Side.js');

const MODE = {
  tolerance: 'tolerance',
  range: 'range',
  blend: 'blend',
  side: 'side'
};

const VIEW = 'image-view';

function App({ left, right }) {
  const events = useContext(Events);
  const config = useContext(Config);
  const [mode, setMode] = useState(MODE[config.get(VIEW)] || MODE.tolerance);

  const changeMode = newMode => () => {
    setMode(newMode);
    config.set(VIEW, newMode);
  };

  const buttons = [
    html`<button onClick=${changeMode(MODE.tolerance)}>Tolerance</button>`,
    html`<button onClick=${changeMode(MODE.range)}>Highlight</button>`,
    html`<button onClick=${changeMode(MODE.blend)}>Transparency</button>`,
    html`<button onClick=${changeMode(MODE.side)}>Side by Side</button>`,
    html`<${ToolbarSeparator} />`,
    html`<button onclick=${() => events.emit('panzoom:reset')}>Reset<//>`,
    html`<button onclick=${() => events.emit('panzoom:full')}>1:1<//>`,
  ];

  const renderView = View => html`<${View} buttons=${buttons} left=${left} right=${right} />`;

  switch (mode) {
    case MODE.tolerance:
      return renderView(Tolerance);
    case MODE.range:
      return renderView(Range);
    case MODE.blend:
      return renderView(Blend);
    case MODE.side:
      return renderView(Side);
  }

  return html``;
}

module.exports = withConfig(withCache(withEvents(App)));
