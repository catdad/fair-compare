const { html, useState, useEffect } = require('../tools/ui.js');
const { tolerance } = require('../tools/image-diff.js');

const Toolbar = require('../Toolbar/Toolbar.js');
const Image = require('./Image.js');

const KEY = 'tolerance';

function Tolerance({ left, right, buttons, cache }) {
  const [data, setData] = useState({ tolerance: null, left: null, right: null, imageUrl: null });
  const [threshold, setThreshold] = useState(0.05);

  useEffect(() => {
    if (cache.has(KEY)) {
      setData(cache.get(KEY));
      return;
    }

    tolerance({ left, right, threshold }).then(result => {
      const data = {
        left: result.leftData,
        right: result.rightData,
        tolerance: result.resultData,
        imageUrl: result.imageUrl,
        threshold
      };

      setData(data);
      cache.set(KEY, data);
    }).catch(err => {
      console.error(err);
    });
  }, [cache.tolerance]);

  return html`
    <${Toolbar}>${buttons}<//>
    <div class=main>
      ${data.imageUrl ? html`
        <div class="single img">
          <${Image} title="Tolerance" filepath=${data.imageUrl} />
        </div>` : html`<div>Loading...</div>`}
    </div>
  `;
}

module.exports = Tolerance;
