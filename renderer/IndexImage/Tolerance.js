const { html, useState, useEffect } = require('../tools/ui.js');
const { tolerance } = require('../tools/image-diff.js');

const Image = require('./Image.js');

function Tolerance({ left, right, cache, setCache }) {
  const [data, setData] = useState({ tolerance: null, left: null, right: null, imageUrl: null });

  useEffect(() => {
    if (cache.tolerance) {
      setData(cache.tolerance);
      return;
    }

    tolerance({ left, right }).then(result => {
      const data = {
        left: result.leftData,
        right: result.rightData,
        tolerance: result.resultData,
        imageUrl: result.imageUrl
      };

      setData(data);
      setCache('tolerance', data);
    }).catch(err => {
      console.error(err);
    });
  }, [cache.tolerance]);

  return data.imageUrl ? html`<div class="single img">
    <${Image} title="Tolerance" filepath=${data.imageUrl} />
  </div>` : html`<div>Loading...</div>`;
}

module.exports = Tolerance;
