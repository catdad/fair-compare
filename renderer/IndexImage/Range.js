const Panzoom = require('@panzoom/panzoom');

const { html, css, useEffect, useRef } = require('../tools/ui.js');
const { info } = require('../tools/image-diff.js');

css('./Range.css');

const setVar = (elem, name, value) => elem.style.setProperty(`--${name}`, value);

function Range({ left, right }) {
  const zoom = useRef(null);
  const view = useRef(null);

  useEffect(() => {
    let panzoom;
    let destroyed = false;

    info(left).then(({ width, height }) => {
      if (destroyed) {
        return;
      }

      setVar(view.current, 'width', `${width}px`);
      setVar(view.current, 'height', `${height}px`);

      setVar(view.current, 'left', `url(${JSON.stringify(left)})`);
      setVar(view.current, 'right', `url(${JSON.stringify(right)})`);

      const box = view.current.getBoundingClientRect();
      const win = zoom.current.getBoundingClientRect();

      const startScale = Math.min(win.width / box.width, win.height / box.height, 1) * 0.98;
      const startX = -((box.width / 2) - (win.width / 2));
      const startY = -((box.height / 2) - (win.height / 2));

      panzoom = Panzoom(zoom.current, {
        maxScale: 1,
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
  }, [left, right]);

  return html`<div class="range-zoom" ref=${zoom}>
    <div class="range" ref=${view} />
  </div>`;
}

module.exports = Range;
