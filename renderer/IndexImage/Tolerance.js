const pixelmatch = require('pixelmatch');

const { html, useState, useEffect } = require('../tools/ui.js');

const Image = require('./Image.js');

const loadUrl = (img, url) => {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = e => reject(e);
    img.src = url;
  });
};

const readImageData = async (filepath) => {
  const img = new window.Image();
  await loadUrl(img, filepath);
  const { naturalWidth: tw, naturalHeight: th } = img;
  const { ctx } = getCanvas(tw, th);

  ctx.drawImage(img, 0, 0, tw, th);

  return ctx.getImageData(0, 0, tw, th);
};

const getCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  return { canvas, ctx };
};

const computeTolerance = async (left, right) => {
  const [leftData, rightData] = await Promise.all([
    readImageData(left),
    readImageData(right)
  ]);

  const { canvas, ctx } = getCanvas(leftData.width, leftData.height);
  const resultData = ctx.createImageData(leftData.width, leftData.height);

  pixelmatch(leftData.data, rightData.data, resultData.data, leftData.width, leftData.height, { threshold: 0.1 });

  ctx.fillRect(0, 0, 100, 100);
  ctx.putImageData(resultData, 0, 0);

  return { leftData, rightData, resultData, imageUrl: canvas.toDataURL() };
};

function Tolerance({ left, right, cache, setCache }) {
  const [data, setData] = useState({ tolerance: null, left: null, right: null, imageUrl: null });

  useEffect(() => {
    if (cache.tolerance) {
      setData(cache.tolerance);
      return;
    }

    console.time('tolerance');
    computeTolerance(left, right).then(result => {
      console.timeEnd('tolerance');

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
