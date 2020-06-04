const { html, css, useEffect, useState, useRef } = require('../tools/ui.js');
const config = require('../../lib/config.js');
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
  const [mode, setMode] = useState(null);
  const cache = useRef(new Map());

  useEffect(() => {
    config.getProp('image-mode').then(val => {
      setMode(MODE[val] || MODE.tolerance);
    }).catch(err => {
      console.error(err);
    });
  }, []);

  const changeMode = newMode => () => {
    setMode(newMode);
    config.setProp('image-mode', newMode);
  };

  const buttons = [
    html`<button onClick=${changeMode(MODE.tolerance)}>Tolerance</button>`,
    html`<button onClick=${changeMode(MODE.range)}>Range</button>`,
    html`<button onClick=${changeMode(MODE.blend)}>Blend</button>`,
    html`<button onClick=${changeMode(MODE.side)}>Side by Side</button>`,
  ];

  switch (mode) {
    case MODE.tolerance:
      return html`
        <${Tolerance} buttons=${buttons} left=${left} right=${right} cache=${cache.current} />
      `;
    case MODE.range:
      return html`
        <${Range} buttons=${buttons} left=${left} right=${right} cache=${cache.current} />
      `;
    case MODE.blend:
      return html`
        <${Blend} buttons=${buttons} left=${left} right=${right} cache=${cache.current} />
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

  return html``;
}

module.exports = App;
