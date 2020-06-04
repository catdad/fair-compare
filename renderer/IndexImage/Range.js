const { html, css, useEffect, useRef } = require('../tools/ui.js');
const { info } = require('../tools/image-diff.js');

css('./Range.css');

const setVar = (elem, name, value) => elem.style.setProperty(`--${name}`, value);

function Range({ left, right }) {
  const view = useRef(null);

  useEffect(() => {
    info(left).then(({ width, height }) => {
      setVar(view.current, 'width', `${width}px`);
      setVar(view.current, 'height', `${height}px`);

      setVar(view.current, 'left', `url(${JSON.stringify(left)})`);
      setVar(view.current, 'right', `url(${JSON.stringify(right)})`);
    }).catch(err => {
      console.error(err);
    });
  }, [left, right]);

  return html`<div class="range" ref=${view} />`;
}

module.exports = Range;
