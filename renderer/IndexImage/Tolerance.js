const Panzoom = require('@panzoom/panzoom');
const { html, css, useCallback, useState, useEffect, useRef } = require('../tools/ui.js');
const { tolerance, computeToleranceUrl } = require('../tools/image-diff.js');

css('./Tolerance.css');

const Toolbar = require('../Toolbar/Toolbar.js');

const KEY = 'tolerance';

const setVar = (elem, name, value) => elem.style.setProperty(`--${name}`, value);

function Tolerance({ left, right, buttons, cache }) {
  const zoom = useRef(null);
  const view = useRef(null);
  const renderPromise = useRef(null);

  const [threshold, setThreshold] = useState(0.05);

  const applyCache = () => {
    const data = cache.get(KEY);
    setVar(view.current, 'width', `${data.width}px`);
    setVar(view.current, 'height', `${data.height}px`);
    setVar(view.current, 'base', `url(${JSON.stringify(left)})`);
    setVar(view.current, 'tol', `url("${data.imageUrl}")`);

    const box = view.current.getBoundingClientRect();
    const win = zoom.current.getBoundingClientRect();

    const startScale = Math.min(win.width / box.width, win.height / box.height, 1) * 0.98;
    const startX = -((box.width / 2) - (win.width / 2));
    const startY = -((box.height / 2) - (win.height / 2));

    const panzoom = Panzoom(zoom.current, {
      maxScale: 4,
      startScale,
      startX,
      startY
    });

    zoom.current.addEventListener('wheel', panzoom.zoomWithWheel);

    panzoom.__x_destroy = () => {
      zoom.current.removeEventListener('wheel', panzoom.zoomWithWheel);
      panzoom.destroy();
    };

    return panzoom;
  };

  useEffect(() => {
    let panzoom;
    let destroyed = false;
    const data = cache.get(KEY);

    if (data && data.threshold === threshold) {
      // we have a valid cache, reuse it directly
      panzoom = applyCache();
      return;
    }

    renderPromise.current = (
      data && data.leftData && data.rightData ?
        // we have data cached but the threshold changed, so compute just that
        computeToleranceUrl({ ...data, threshold }) :
        // we need new data for everything
        tolerance({ left, right, threshold })
    ).then(result => {
      const data = {
        width: result.width,
        height: result.height,
        leftData: result.leftData,
        rightData: result.rightData,
        imageUrl: result.imageUrl,
        threshold
      };

      cache.set(KEY, data);

      if (destroyed) {
        return;
      }

      panzoom = applyCache();
    }).catch(err => {
      console.error('TOLERANCE ERROR:', err);
    });

    return () => {
      console.log('destroying tolerance');
      destroyed = true;

      if (panzoom) {
        panzoom.__x_destroy();
      }
    };
  }, [left, right, threshold]);

  const applyThreshold = ({ target: { value } }) => {

    const setter = '__threshold_setter';
    const final = '__theshold_final';
    console.log('apply', value, renderPromise.current, renderPromise.current && renderPromise.current[setter] === undefined);

    if (renderPromise.current) {
      console.log('saving new final value');
      renderPromise.current[final] = value;
    }

    if (renderPromise.current && renderPromise.current[setter] === undefined) {
      console.log('saving new setter');

      renderPromise.current[setter] = () => {
        const finalValue = renderPromise.current[final];
        renderPromise.current = null;
        console.log('ACTUALLY SETTING', finalValue);

        setThreshold(finalValue);
      };

      renderPromise.current.then(() => renderPromise.current[setter]());
    }
  };

  const viewButtons = [...buttons];

  viewButtons.push(html`<span> | </span>`);
  viewButtons.push(html`<input type=range min=0 max=1 value=${threshold} step=0.01 oninput=${applyThreshold} />`);

  return html`
    <${Toolbar}>${viewButtons}<//>
    <div class=main>
      <div class="tolerance-zoom" ref=${zoom}>
        <div class="tolerance" ref=${view}></div>
      </div>
    </div>
  `;
}

module.exports = Tolerance;
