const { html, css, useCallback, useState, useRef } = require('../tools/ui.js');
const Toolbar = require('../Toolbar/Toolbar.js');

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
  const [mode, setMode] = useState(MODE.blend);
  const cache = useRef({});

  const setCache = useCallback((key, value) => {
    cache.current[key] = value;
  }, [cache.current]);

  const buttons = [
    html`<button onClick=${() => setMode(MODE.tolerance)}>Tolerance</button>`,
    html`<button onClick=${() => setMode(MODE.range)}>Range</button>`,
    html`<button onClick=${() => setMode(MODE.blend)}>Blend</button>`,
    html`<button onClick=${() => setMode(MODE.side)}>Side by Side</button>`,
  ];

  switch (mode) {
    case MODE.tolerance:
      return html`
        <${Tolerance} buttons=${buttons} left=${left} right=${right} cache=${cache.current} setCache=${setCache} />
      `;
    case MODE.range:
      return html`
        <${Range} buttons=${buttons} left=${left} right=${right} cache=${cache.current} setCache=${setCache} />
      `;
    case MODE.blend:
      return html`
        <${Blend} buttons=${buttons} left=${left} right=${right} cache=${cache.current} setCache=${setCache} />
      `;
    case MODE.side:
      return html`
        <${Toolbar}>${buttons}<//>
        <div class=main>
          <div class="double img"><${Image} title=${left} filepath=${left} /></div>
          <div class="double img"><${Image} title=${right} filepath=${right} /></div>
        </div>
      `;
  }
}

module.exports = App;
