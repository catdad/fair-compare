const { html, css, useState } = require('../tools/ui.js');
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
          <${Tolerance} left=${left} right=${right} />
        </div>
      `);
      break;
    default:
      dom.push(html`
        <div class=main>
          <${Image} title=${left} filepath=${left} />
          <${Image} title=${right} filepath=${right} />
        </div>
      `);
  }

  return dom;
}

module.exports = App;
