const panzoom = require('@panzoom/panzoom');
const { html, useContext, useEffect, useRef } = require('../tools/ui.js');
const Cache = require('./cache.js');

const KEY = '__x_panzoom';
const maxScale = 4;

module.exports = function Panzoom ({ children, view }) {
  const zoom = useRef(null);
  const cache = useContext(Cache);

  useEffect(() => {
    if (!view) {
      return;
    }

    if (zoom.current[KEY]) {
      return;
    }

    const data = cache.get(KEY);

    if (data) {
      zoom.current[KEY] = panzoom(zoom.current, {
        maxScale,
        ...data
      });
    } else {
      const win = zoom.current.getBoundingClientRect();
      const box = view.getBoundingClientRect();

      const startScale = Math.min(win.width / box.width, win.height / box.height, 1) * 0.98;
      const startX = -((box.width / 2) - (win.width / 2));
      const startY = -((box.height / 2) - (win.height / 2));

      zoom.current[KEY] = panzoom(zoom.current, {
        maxScale,
        startScale,
        startX,
        startY
      });
    }

    const instance = zoom.current[KEY];

    zoom.current.addEventListener('wheel', instance.zoomWithWheel);

    return () => {
      const { x: startX, y: startY } = instance.getPan();
      const startScale = instance.getScale();

      cache.set(KEY, { startX, startY, startScale });

      zoom.current.setAttribute('style', {});
      zoom.current.removeEventListener('wheel', instance.zoomWithWheel);
      instance.destroy();
    };
  }, [view]);

  return html`<div class="panzoom" ref=${zoom}>${children}</div>`;
};
