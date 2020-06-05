const Panzoom = require('@panzoom/panzoom');
const { html, css, useState, useEffect, useRef } = require('../tools/ui.js');
const { tolerance, computeTolerance } = require('../tools/image-diff.js');

css('./Tolerance.css');

const Toolbar = require('../Toolbar/Toolbar.js');

const KEY = 'tolerance';

const setVar = (elem, name, value) => elem.style.setProperty(`--${name}`, value);

const toBackground = url => `url(${JSON.stringify(url)})`;

function Tolerance({ left, right, buttons, cache }) {
  const zoom = useRef(null);
  const view = useRef(null);
  const renderPromise = useRef(null);
  const [background, setBackground] = useState(toBackground(left));

  const [threshold, setThreshold] = useState(0.05);

  const applyCache = () => {
    const data = cache.get(KEY);
    setVar(view.current, 'width', `${data.width}px`);
    setVar(view.current, 'height', `${data.height}px`);
    setVar(view.current, 'background', background);

    view.current.width = data.width;
    view.current.height = data.height;

    const ctx = view.current.getContext('2d');
    ctx.putImageData(new ImageData(data.output, data.width, data.height), 0, 0);

    const box = view.current.getBoundingClientRect();
    const win = zoom.current.getBoundingClientRect();

    const startScale = Math.min(win.width / box.width, win.height / box.height, 1) * 0.98;
    const startX = -((box.width / 2) - (win.width / 2));
    const startY = -((box.height / 2) - (win.height / 2));

    if (zoom.current.__x_panzoom) {
      return zoom.current.__x_panzoom;
    }

    const panzoom = zoom.current.__x_panzoom = Panzoom(zoom.current, {
      maxScale: 4,
      startScale,
      startX,
      startY
    });

    zoom.current.addEventListener('wheel', panzoom.zoomWithWheel);

    panzoom.__x_destroy = () => {
      zoom.current.setAttribute('style', {});
      zoom.current.removeEventListener('wheel', panzoom.zoomWithWheel);
      panzoom.destroy();
    };
  };

  useEffect(() => {
    let destroyed = false;
    const data = cache.get(KEY);

    if (data && data.threshold === threshold) {
      // we have a valid cache, reuse it directly
      return void applyCache();
    }

    renderPromise.current = (
      data && data.leftData && data.rightData ?
        // we have data cached but the threshold changed, so compute just that
        computeTolerance({ ...data, threshold }) :
        // we need new data for everything
        tolerance({ left, right, threshold })
    ).then(result => {
      const data = {
        width: result.width,
        height: result.height,
        leftData: result.leftData,
        rightData: result.rightData,
        output: result.output,
        threshold
      };

      cache.set(KEY, data);

      if (destroyed) {
        return;
      }

      applyCache();
    }).catch(err => {
      console.error('TOLERANCE ERROR:', err);
    });

    return () => {
      destroyed = true;
    };
  }, [left, right, threshold, background]);

  const applyThreshold = ({ target: { value } }) => {
    const setter = '__threshold_setter';
    const final = '__theshold_final';

    if (renderPromise.current) {
      renderPromise.current[final] = value;
    }

    if (renderPromise.current && renderPromise.current[setter] === undefined) {
      renderPromise.current[setter] = () => {
        const finalValue = renderPromise.current[final];
        renderPromise.current = null;

        setThreshold(finalValue);
      };

      renderPromise.current.then(() => renderPromise.current[setter]());
    }
  };

  const toggleBackground = () => {
    if (background === '#000') {
      setBackground(toBackground(left));
    } else {
      setBackground('#000');
    }
  };

  const viewButtons = [...buttons];

  viewButtons.push(html`<span> | </span>`);
  viewButtons.push(html`<input type=range min=0 max=1 value=${threshold} step=0.01 oninput=${applyThreshold} />`);
  viewButtons.push(html`<span>${threshold}</span>`);
  viewButtons.push(html`<span> | </span>`);
  viewButtons.push(html`<button onclick=${toggleBackground}>Toggle Background</button>`);

  return html`
    <${Toolbar}>${viewButtons}<//>
    <div class=main>
      <div class="tolerance-zoom" ref=${zoom}>
        <canvas class="tolerance" ref=${view}></canvas>
      </div>
    </div>
  `;
}

module.exports = Tolerance;
