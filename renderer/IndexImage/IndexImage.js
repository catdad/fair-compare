const { html, css, useContext, useState } = require('../tools/ui.js');
const { withCache } = require('../tools/cache.js');
const { Config, withConfig } = require('../tools/config.js');
const { Toolbar } = require('../Toolbar/Toolbar.js');

css('./IndexImage.css');

const Image = require('./Image.js');
const Tolerance = require('./Tolerance.js');
const Range = require('./Range.js');
const Blend = require('./Blend.js');

const MODE = {
  tolerance: 'tolerance',
  range: 'range',
  blend: 'blend',
  side: 'side'
};

function App({ left, right }) {
  const config = useContext(Config);
  const [mode, setMode] = useState(config.get('image-mode', null));

  const changeMode = newMode => () => {
    setMode(newMode);
    config.set('image-mode', newMode);
  };

  const buttons = [
    html`<button onClick=${changeMode(MODE.tolerance)}>Tolerance</button>`,
    html`<button onClick=${changeMode(MODE.range)}>Range</button>`,
    html`<button onClick=${changeMode(MODE.blend)}>Blend</button>`,
    html`<button onClick=${changeMode(MODE.side)}>Side by Side</button>`,
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
      return html`
        <${Toolbar}>${buttons}<//>
        <div class=main>
          <div class="double img"><${Image} title=${left} filepath=${left} /></div>
          <div class="double img"><${Image} title=${right} filepath=${right} /></div>
        </div>
      `;
  }

  return html``;
}

module.exports = withConfig(withCache(App));
