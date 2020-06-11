const { html, css, useEffect, useRef, useState, setVar } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const { info } = require('../tools/image-diff.js');
const { Toolbar, ToolbarSeparator } = require('../Toolbar/Toolbar.js');
const Panzoom = require('./Panzoom.js');

css('./Blend.css');

function Blend({ left, right, buttons }) {
  const [zoomElem, setZoomElem] = useState(null);
  const view = useRef(null);
  const [opacity, setOpacity] = useState(0.5);

  useEffect(() => {
    let destroyed = false;

    info(left).then(({ width, height }) => {
      if (destroyed) {
        return;
      }

      setVar(view.current, 'width', `${width}px`);
      setVar(view.current, 'height', `${height}px`);

      setVar(view.current, 'left', `url(${JSON.stringify(left)})`);
      setVar(view.current, 'right', `url(${JSON.stringify(right)})`);

      if (zoomElem !== view.current) {
        setZoomElem(view.current);
      }
    }).catch(err => {
      toast.error(err);
    });

    return () => {
      destroyed = true;
    };
  }, [left, right]);

  useEffect(() => {
    setVar(view.current, 'opacity', opacity);
  }, [opacity]);

  const toggleOpacity = () => setOpacity(opacity > 0 ? 0 : 1);
  const applyOpacity = ({ target: { value } }) => setOpacity(value);

  const viewButtons = [...buttons];

  viewButtons.push(html`<${ToolbarSeparator} />`);
  viewButtons.push(html`<button onclick=${toggleOpacity}>Toggle</button>`);
  viewButtons.push(html`<input type=range min=0 max=1 value=${opacity} step=0.01 oninput=${applyOpacity} />`);

  return html`
    <${Toolbar}>${viewButtons}<//>
    <div class=main>
      <${Panzoom} view=${zoomElem}>
        <div class="blend" ref=${view}></div>
      <//>
    </div>
  `;
}

module.exports = Blend;
