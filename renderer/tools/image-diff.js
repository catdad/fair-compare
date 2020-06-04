/* eslint-disable no-console */

const pixelmatch = require('pixelmatch');

const loadUrl = (img, url) => {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = e => reject(e);
    img.src = url;
  });
};

const readImageData = async (filepath) => {
  console.time('draw');
  const img = new window.Image();
  await loadUrl(img, filepath);
  const { naturalWidth: tw, naturalHeight: th } = img;
  const { ctx } = getCanvas(tw, th);

  ctx.drawImage(img, 0, 0, tw, th);
  console.timeEnd('draw');

  console.time('draw-data');
  const data = ctx.getImageData(0, 0, tw, th);
  console.timeEnd('draw-data');

  return data;
};

const getCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  return { canvas, ctx };
};

const computeTolerance = async (left, right) => {
  console.time('read');
  const [leftData, rightData] = await Promise.all([
    readImageData(left),
    readImageData(right)
  ]);
  console.timeEnd('read');

  console.time('diff-create');
  const { canvas, ctx } = getCanvas(leftData.width, leftData.height);
  const resultData = ctx.createImageData(leftData.width, leftData.height);
  console.timeEnd('diff-create');

  console.time('diff');
  const pixels = pixelmatch(leftData.data, rightData.data, resultData.data, leftData.width, leftData.height, { threshold: 0.05 });
  console.timeEnd('diff');

  console.time('diff-put');
  ctx.putImageData(resultData, 0, 0);
  console.timeEnd('diff-put');

  return { leftData, rightData, pixels, resultData, resultCanvas: canvas };
};

module.exports = async ({ left, right, threshold = 0.05, url = true, pixels = true }) => {
  const result = await computeTolerance(left, right);

  if (url) {
    console.time('diff-url');
    result.imageUrl = result.resultCanvas.toDataURL();
    console.timeEnd('diff-url');
  }

  return result;
};
