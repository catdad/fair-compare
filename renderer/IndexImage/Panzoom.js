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

    const id = Math.random();

    const win = zoom.current.getBoundingClientRect();
    const box = view.getBoundingClientRect();

    const startScale = Math.min(win.width / box.width, win.height / box.height, 1) * 0.98;
    const startX = -((box.width / 2) - (win.width / 2));
    const startY = -((box.height / 2) - (win.height / 2));

    const instance = zoom.current[KEY] = panzoom(zoom.current, {
      maxScale,
      startScale,
      startX,
      startY,
      ...cache.get(KEY, {})
    });

    const onReset = () => {
      instance.pan(startX, startY);
      instance.zoom(startScale, { animate: true });
    };
    const onFull = () => void instance.zoom(1, { animate: true });

    const onChange = ({ detail }) => {
      events.emit('panzoom:change', { id, ...detail });
    };

    const onSync = detail => {
      if (detail.id === id) {
        return;
      }

      const { x, y } = instance.getPan();
      const scale = instance.getScale();

      if (detail.x !== x || detail.y !== y) {
        instance.pan(detail.x, detail.y);
      }

      if (detail.scale !== scale) {
        instance.zoom(detail.scale);
      }
    };

    events.on('panzoom:reset', onReset);
    events.on('panzoom:full', onFull);
    events.on('panzoom:change', onSync);
    zoom.current.addEventListener('wheel', instance.zoomWithWheel);
    zoom.current.addEventListener('panzoomchange', onChange);

    return () => {
      const { x: startX, y: startY } = instance.getPan();
      const startScale = instance.getScale();

      cache.set(KEY, { startX, startY, startScale });

      zoom.current.setAttribute('style', {});
      zoom.current.removeEventListener('wheel', instance.zoomWithWheel);
      zoom.current.removeEventListener('panzoomchange', onChange);
      instance.destroy();

      events.off('panzoom:reset', onReset);
      events.off('panzoom:full', onFull);
      events.off('panzoom:change', onSync);
    };
  }, [view, events]);

  return html`<div class="panzoom" ref=${zoom}>${children}</div>`;
};
