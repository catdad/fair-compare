const { html, css, useEffect, useRef, useState, setVar } = require('../tools/ui.js');
const { info } = require('../tools/image-diff.js');
const Toolbar = require('../Toolbar/Toolbar.js');
const Panzoom = require('./Panzoom.js');

css('./Range.css');

function Range({ left, right, buttons }) {
  const [zoomElem, setZoomElem] = useState(null);
  const view = useRef(null);

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
      console.error(err);
    });

    return () => {
      destroyed = true;
    };
  }, [left, right]);

  return html`
    <${Toolbar}>${buttons}<//>
    <div class=main>
      <${Panzoom} view=${zoomElem}>
        <div class="range" ref=${view}></div>
      <//>
    </div>
  `;
}

module.exports = Range;
