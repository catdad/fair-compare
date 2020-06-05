const panzoom = require('@panzoom/panzoom');
const { html, useEffect, useRef } = require('../tools/ui.js');

const KEY = '__x_panzoom';

module.exports = function Panzoom ({ children, view }) {
  const zoom = useRef(null);

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

    const instance = zoom.current[KEY] = panzoom(zoom.current, {
      maxScale: 4,
      startScale,
      startX,
      startY
    });

    zoom.current.addEventListener('wheel', instance.zoomWithWheel);

    return () => {
      console.log('SHOULD DESTROY');
      return;

      zoom.current.setAttribute('style', {});
      zoom.current.removeEventListener('wheel', instance.zoomWithWheel);
      instance.destroy();
    };
  }, [view]);

  return html`<div class="panzoom" ref=${zoom}>${children}</div>`;
};
