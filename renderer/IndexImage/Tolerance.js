const { html, css, useContext, useEffect, useState, useRef, setVar } = require('../tools/ui.js');
const toast = require('../tools/toast.js');
const { tolerance, computeTolerance } = require('../tools/image-diff.js');
const { Cache } = require('../tools/cache.js');
const { Config } = require('../tools/config.js');

css('./Tolerance.css');

const { Toolbar, ToolbarSeparator } = require('../Toolbar/Toolbar.js');
const Panzoom = require('./Panzoom.js');

const KEY = 'tolerance';
const THRESHOLD = `${KEY}.threshold`;
const BACKGROUND = `${KEY}.background`;

const toBackground = url => `url(${JSON.stringify(url)})`;

function Tolerance({ left, right, buttons }) {
  const getBackground = mode => mode === 'image' ? toBackground(left) : '#000';

  const config = useContext(Config);
  const cache = useContext(Cache);
  const view = useRef(null);
  const renderPromise = useRef(null);
  const [background, setBackground] = useState(config.get(BACKGROUND, 'image'));
  const [zoomElem, setZoomElem] = useState(null);

  const [threshold, setThreshold] = useState(config.get(THRESHOLD, 0.05));

  const applyCache = () => {
    const data = cache.get(KEY);
    setVar(view.current, 'width', `${data.width}px`);
    setVar(view.current, 'height', `${data.height}px`);
    setVar(view.current, 'background', getBackground(background));

    view.current.width = data.width;
    view.current.height = data.height;

    const ctx = view.current.getContext('2d');
    ctx.putImageData(new ImageData(data.output, data.width, data.height), 0, 0);

    if (zoomElem !== view.current) {
      setZoomElem(view.current);
    }
  };

  useEffect(() => {
    let destroyed = false;
    const data = cache.get(KEY);

    if (data && data.threshold === threshold) {
      // we have a valid cache, reuse it directly
      return void applyCache();
    }

    renderPromise.current = (
      data && data.leftData && data.rightData ?
        // we have data cached but the threshold changed, so compute just that
        computeTolerance({ ...data, threshold }) :
        // we need new data for everything
        tolerance({ left, right, threshold })
    ).then(result => {
      const data = {
        width: result.width,
        height: result.height,
        leftData: result.leftData,
        rightData: result.rightData,
        output: result.output,
        threshold
      };

      cache.set(KEY, data);

      if (destroyed) {
        return;
      }

      applyCache();
    }).catch(err => {
      toast.error(`TOLERANCE ERROR:\n${err.message || err.toString()}`);
    });

    return () => {
      destroyed = true;
    };
  }, [left, right, threshold, background]);

  const applyThreshold = ({ target: { value } }) => {
    const set = value => {
      setThreshold(value);
      config.set(THRESHOLD, value);
    };

    const data = cache.get(KEY);

    if (data && data.leftData && data.rightData) {
      return set(value);
    }

    if (renderPromise.current) {
      const setter = '__threshold_setter';
      const final = '__theshold_final';

      renderPromise.current[final] = Number(value);

      if (renderPromise.current[setter] === undefined) {
        renderPromise.current[setter] = () => {
          const finalValue = renderPromise.current[final];
          renderPromise.current = null;

          set(finalValue);
        };

        renderPromise.current.then(() => renderPromise.current[setter]());
      }
    } else {
      set(value);
    }
  };

  const toggleBackground = () => {
    const value = background === 'image' ? 'black' : 'image';
    config.set(BACKGROUND, value);
    setBackground(value);
  };

  const viewButtons = [...buttons];

  viewButtons.push(html`<${ToolbarSeparator} />`);
  viewButtons.push(html`<input type=range min=0 max=1 value=${threshold} step=0.01 oninput=${applyThreshold} />`);
  viewButtons.push(html`<span>${threshold}</span>`);
  viewButtons.push(html`<${ToolbarSeparator} />`);
  viewButtons.push(html`<button onclick=${toggleBackground}>Toggle Background</button>`);

  return html`
    <${Toolbar}>${viewButtons}<//>
    <div class=main>
      <${Panzoom} view=${zoomElem}>
        <canvas class="tolerance" ref=${view}></canvas>
      <//>
    </div>
  `;
}

module.exports = Tolerance;
