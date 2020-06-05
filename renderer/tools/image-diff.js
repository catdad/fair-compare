/* eslint-disable no-console */

const pixelmatch = require('pixelmatch');

const loadUrl = (img, url) => {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = e => reject(e);
    img.src = url;
  });
};

const loadImage = async (filepath) => {
  const img = new window.Image();
  await loadUrl(img, filepath);
  const { naturalWidth: width, naturalHeight: height } = img;

  return { img, width, height };
};

const readImageData = async (filepath) => {
  console.time(`draw ${filepath}`);
  const { img, width, height } = await loadImage(filepath);
  const { ctx } = getCanvas(width, height);

  ctx.drawImage(img, 0, 0, width, height);
  console.timeEnd(`draw ${filepath}`);

  console.time(`draw-data ${filepath}`);
  const data = ctx.getImageData(0, 0, width, height);
  console.timeEnd(`draw-data ${filepath}`);

  return data;
};

const getCanvas = (width, height) => {
  const canvas = new OffscreenCanvas(width, height);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  return { canvas, ctx };
};

const computeTolerance = async ({ left, right, threshold }) => {
  console.time('read');
  const [leftData, rightData] = await Promise.all([
    readImageData(left),
    readImageData(right)
  ]);
  console.timeEnd('read');

  const { width, height } = leftData;

  console.time('diff-create');
  const { canvas, ctx } = getCanvas(width, height);
  const resultData = ctx.createImageData(width, height);
  console.timeEnd('diff-create');

  console.time('diff');
  const pixels = pixelmatch(leftData.data, rightData.data, resultData.data, width, height, { threshold });
  console.timeEnd('diff');

  console.time('diff-put');
  ctx.putImageData(resultData, 0, 0);
  console.timeEnd('diff-put');

  return { leftData, rightData, pixels, resultData, resultCanvas: canvas, width, height };
};

const tolerance = async ({ left, right, threshold = 0.05, url = true }) => {
  console.time('tolerance');
  const result = await computeTolerance({ left, right, threshold });

  if (url) {
    console.time('diff-url');
    const blob = await result.resultCanvas.convertToBlob({ type: 'image/jpeg', quality: 1 });
    const imageUrl = `data:image/jpeg;base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;
    result.imageUrl = imageUrl;
    console.timeEnd('diff-url');
  }

  console.timeEnd('tolerance');
  return result;
};

const info = async (imageFile) => {
  const { width, height } = await loadImage(imageFile);
  return { width, height };
};

module.exports = { info, tolerance };
