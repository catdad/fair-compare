const Panzoom = require('@panzoom/panzoom');
const { html, css, useEffect, useRef, useState } = require('../tools/ui.js');
const { info } = require('../tools/image-diff.js');
const Toolbar = require('../Toolbar/Toolbar.js');

css('./Blend.css');

const setVar = (elem, name, value) => elem.style.setProperty(`--${name}`, value);

function Blend({ left, right, buttons }) {
  const zoom = useRef(null);
  const view = useRef(null);
  const [opacity, setOpacity] = useState(0.5);

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
  }, [left, right]);

  useEffect(() => {
    setVar(view.current, 'opacity', opacity);
  }, [opacity]);

  const toggleOpacity = () => setOpacity(opacity > 0 ? 0 : 1);
  const applyOpacity = (ev) => {
    setOpacity(ev.target.value);
  };

  const viewButtons = [...buttons];

  viewButtons.push(html`<span> | </span>`);
  viewButtons.push(html`<button onclick=${toggleOpacity}>Toggle</button>`);
  viewButtons.push(html`<input type=range min=0 max=1 value=${opacity} step=0.01 oninput=${applyOpacity} />`);

  return html`
    <${Toolbar}>${viewButtons}<//>
    <div class=main>
      <div class="blend-zoom" ref=${zoom}>
        <div class="blend" ref=${view}></div>
      </div>
    </div>
  `;
}

module.exports = Blend;
