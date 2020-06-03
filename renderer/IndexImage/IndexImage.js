const { html, css, useCallback, useState, useRef } = require('../tools/ui.js');
const Toolbar = require('../Toolbar/Toolbar.js');

css('./IndexImage.css');

const Image = require('./Image.js');
const Tolerance = require('./Tolerance.js');

const MODE = {
  tolerance: 'tolerance',
  range: 'range',
  blend: 'blend',
  side: 'blend'
};

function App({ left, right }) {
  const [mode, setMode] = useState(MODE.tolerance);
  const cache = useRef({});

  const setCache = useCallback((key, value) => {
    cache.current[key] = value;
    console.log('cached', key, value);
  }, [cache.current]);

  const dom = [
    html`<${Toolbar} thing=stuff>
      <button onClick=${() => setMode(MODE.tolerance)}>Tolerance</button>
      <button onClick=${() => setMode(MODE.range)}>Range</button>
      <button onClick=${() => setMode(MODE.blend)}>Blend</button>
      <button onClick=${() => setMode(MODE.side)}>Side by Side</button>
    <//>`
  ];

  switch (mode) {
    case MODE.tolerance:
      dom.push(html`
        <div class=main>
          <${Tolerance} left=${left} right=${right} cache=${cache.current} setCache=${setCache} />
        </div>
      `);
      break;
    default:
      dom.push(html`
        <div class=main>
          <div class="double img"><${Image} title=${left} filepath=${left} /></div>
          <div class="double img"><${Image} title=${right} filepath=${right} /></div>
        </div>
      `);
  }

  return dom;
}

module.exports = App;
