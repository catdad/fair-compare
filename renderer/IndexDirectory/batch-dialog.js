const { html, render, useContext, useState } = require('../tools/ui.js');
const { Config, withConfig, CONFIG } = require('../tools/config.js');

const THRESHOLD = 'tolerance.threshold';

const Dialog = ({ children, onUpdate }) => {
  const config = useContext(Config);
  const [threshold, setThreshold] = useState(config.get(THRESHOLD, 0.05));

  onUpdate(threshold);

  const applyThreshold = ({ target: { value } }) => {
    setThreshold(value);
    onUpdate(threshold);
  };

  return html`
    <div class=dialog>
      <h1>Comparison Rules<//>
      <div>Tolerance Threshold<//>
      <div>
        <input type=range min=0 max=1 value=${threshold} step=0.01 oninput=${applyThreshold} />
        <span>${threshold}</span>
      </div>
      <div class=buttons>${children}</div>
    </div>
  `;
};

module.exports = async () => {
  const modal = document.createElement('div');
  modal.className = 'modal';

  document.body.appendChild(modal);

  return new Promise((resolve, reject) => {
    let threshold;

    const onUpdate = (value) => {
      threshold = value;
    };

    const close = () => {
      modal.remove();
    };

    const onStart = () => {
      close();
      CONFIG.setProp(THRESHOLD, threshold).catch(() => {});
      resolve({ threshold });
    };

    const onCancel = () => {
      close();
      reject(new Error('user cancel'));
    };

    render(html`
      <${withConfig(Dialog)} onUpdate=${onUpdate}>
        <button onClick=${onCancel}>Cancel</button>
        <button onClick=${onStart}>Start</button>
      <//>
    `, modal);
  });
};
