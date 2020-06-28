const panzoom = require('@panzoom/panzoom');
const { html, useContext, useEffect, useRef } = require('../tools/ui.js');
const { Cache } = require('../tools/cache.js');
const { Events } = require('../tools/events.js');

const KEY = '__x_panzoom';
const maxScale = 4;

module.exports = function Panzoom ({ children, view }) {
  const zoom = useRef(null);
  const cache = useContext(Cache);
  const events = useContext(Events);

  useEffect(() => {
    if (!view) {
      return;
    }

    if (zoom.current[KEY]) {
      return;
    }

    const win = zoom.current.getBoundingClientRect();
    const box = view.getBoundingClientRect();

    const startScale = Math.min(win.width / box.width, win.height / box.height, 1) * 0.98;
    const startX = -((box.width / 2) - (win.width / 2));
    const startY = -((box.height / 2) - (win.height / 2));

    const defaultOptions = {
      maxScale,
      startScale,
      startX,
      startY
    };

    const instance = zoom.current[KEY] = panzoom(zoom.current, {
      ...defaultOptions,
      ...cache.get(KEY, {})
    });

    zoom.current.addEventListener('wheel', instance.zoomWithWheel);

    const onReset = () => {
      instance.pan(defaultOptions.startX, defaultOptions.startY);
      instance.zoom(defaultOptions.startScale, { animate: true });
    };
    const onFull = () => void instance.zoom(1, { animate: true });

    events.on('panzoom:reset', onReset);
    events.on('panzoom:full', onFull);

    return () => {
      const { x: startX, y: startY } = instance.getPan();
      const startScale = instance.getScale();

      cache.set(KEY, { startX, startY, startScale });

      zoom.current.setAttribute('style', {});
      zoom.current.removeEventListener('wheel', instance.zoomWithWheel);
      instance.destroy();

      events.off('panzoom:reset', onReset);
      events.off('panzoom:full', onFull);
    };
  }, [view, events]);

  return html`<div class="panzoom" ref=${zoom}>${children}</div>`;
};
