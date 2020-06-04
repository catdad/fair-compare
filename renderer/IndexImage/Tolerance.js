const Panzoom = require('@panzoom/panzoom');
const { html, css, useCallback, useState, useEffect, useRef } = require('../tools/ui.js');
const { tolerance } = require('../tools/image-diff.js');

css('./Tolerance.css');

const Toolbar = require('../Toolbar/Toolbar.js');
const Image = require('./Image.js');

const KEY = 'tolerance';

const setVar = (elem, name, value) => elem.style.setProperty(`--${name}`, value);

function Tolerance({ left, right, buttons, cache }) {
  const zoom = useRef(null);
  const view = useRef(null);

  const [threshold, setThreshold] = useState(0.05);

  const applyCache = useCallback(() => {
    const data = cache.get(KEY);
    setVar(view.current, 'width', `${data.width}px`);
    setVar(view.current, 'height', `${data.height}px`);
    setVar(view.current, 'base', `url(${JSON.stringify(left)})`);
    setVar(view.current, 'tol', `url("${data.imageUrl}")`);
  }, [cache.get(KEY)]);

  useEffect(() => {
    let panzoom;
    let destroyed = false;

    if (cache.has(KEY)) {
      return void applyCache();
    }

    tolerance({ left, right, threshold }).then(result => {
      const data = {
        width: result.width,
        height: result.height,
        left: result.leftData,
        right: result.rightData,
        tolerance: result.resultData,
        imageUrl: result.imageUrl,
        threshold
      };

      cache.set(KEY, data);

      if (destroyed) {
        return;
      }

      applyCache();

      const box = view.current.getBoundingClientRect();
      const win = zoom.current.getBoundingClientRect();

      const startScale = Math.min(win.width / box.width, win.height / box.height, 1) * 0.98;
      const startX = -((box.width / 2) - (win.width / 2));
      const startY = -((box.height / 2) - (win.height / 2));

      panzoom = Panzoom(zoom.current, {
        maxScale: 4,
        startScale,
        startX,
        startY
      });

      zoom.current.addEventListener('wheel', panzoom.zoomWithWheel);
    }).catch(err => {
      console.error(err);
    });

    return () => {
      destroyed = true;

      if (panzoom) {
        zoom.current.removeEventListener('whee', panzoom.zoomWithWheel);
        panzoom.destroy();
      }
    };
  }, [cache.get(KEY)]);

  return html`
    <${Toolbar}>${buttons}<//>
    <div class=main>
      <div class="tolerance-zoom" ref=${zoom}>
        <div class="tolerance" ref=${view}></div>
      </div>
    </div>
  `;
}

module.exports = Tolerance;
