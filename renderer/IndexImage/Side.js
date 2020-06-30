const { html, css, useEffect, useRef, useState, setVar } = require('../tools/ui.js');
const { info } = require('../tools/image-diff.js');
const toast = require('../tools/toast.js');

const { Toolbar } = require('../Toolbar/Toolbar.js');
const Panzoom = require('./Panzoom.js');

css('./Side.css');

function Side({ buttons, left, right }) {
  const [leftZoom, setLeftZoom] = useState(null);
  const [rightZoom, setRightZoom] = useState(null);
  const leftView = useRef(null);
  const rightView = useRef(null);

  const setup = (file, view, zoomElem, setZoomElem) => {
    let destroyed = false;

    info(file).then(({ width, height }) => {
      if (destroyed) {
        return;
      }

      setVar(view.current, 'width', `${width}px`);
      setVar(view.current, 'height', `${height}px`);

      setVar(view.current, 'background', `url(${JSON.stringify(file)})`);

      if (zoomElem !== view.current) {
        setZoomElem(view.current);
      }
    }).catch(err => {
      toast.error(err);
    });

    return () => {
      destroyed = true;
    };
  };

  useEffect(() => {
    return setup(left, leftView, leftZoom, setLeftZoom);
  }, [left]);

  useEffect(() => {
    return setup(right, rightView, rightZoom, setRightZoom);
  }, [right]);

  return html`
    <${Toolbar}>${buttons}<//>
    <div class=main>
      <div class="side double">
        <${Panzoom} view=${leftZoom}>
          <div class="img" ref=${leftView} />
        <//>
      </div>
      <div class="side double">
        <${Panzoom} view=${rightZoom}>
          <div class="img" ref=${rightView} />
        <//>
      </div>
    </div>
  `;
}

module.exports = Side;
