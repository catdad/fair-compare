/* eslint-disable no-console */

const pixelmatch = require('pixelmatch');
const fs = require('fs-extra');

const loadImage = async (filepath) => {
  const buffer = await fs.readFile(filepath);
  const blob = new Blob([buffer.buffer]);
  const img = await createImageBitmap(blob);
  const { width, height } = img;

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

  console.time(`close ${filepath}`);
  img.close();
  console.timeEnd(`close ${filepath}`);

  return data;
};

const getCanvas = (width, height) => {
  const canvas = new OffscreenCanvas(width, height);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  return { canvas, ctx };
};

const pixelsAreEqual = (leftData, rightData) => {
  return Buffer.from(leftData.buffer).equals(Buffer.from(rightData.buffer));
};

const computeTolerance = async ({ leftData, rightData, threshold, outputImage = true }) => {
  console.time('tolerance-compute');
  const { width, height } = leftData;

  console.time('diff-create');
  const output = outputImage ? new Uint8ClampedArray(width * height * 4) : null;
  console.timeEnd('diff-create');

  console.time('diff');
  const pixels = pixelsAreEqual(leftData.data, rightData.data) ? -1 : pixelmatch(leftData.data, rightData.data, output, width, height, {
    threshold,
    diffMask: true
  });
  console.timeEnd('diff');

  console.timeEnd('tolerance-compute');
  return { leftData, rightData, pixels, output, width, height };
};

const tolerance = async ({ left, right, threshold = 0.05, outputImage = true }) => {
  console.time('tolerance');
  console.time('read');
  const [leftData, rightData] = await Promise.all([
    readImageData(left),
    readImageData(right)
  ]);
  console.timeEnd('read');

  const result = await computeTolerance({ leftData, rightData, threshold, outputImage });

  console.timeEnd('tolerance');
  return result;
};

const info = async (imageFile) => {
  const { width, height } = await loadImage(imageFile);
  return { width, height };
};

module.exports = { info, tolerance, computeTolerance };
