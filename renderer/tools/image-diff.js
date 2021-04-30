const pixelmatch = require('pixelmatch');
const fs = require('fs/promises');
const timing = require('../../lib/timing.js')('image-diff');

const Jimp = require('jimp');

const pixelsAreEqual = (leftData, rightData) => {
  return Buffer.from(leftData.buffer).equals(Buffer.from(rightData.buffer));
};

const getCanvas = (width, height) => {
  const canvas = new OffscreenCanvas(width, height);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  return { canvas, ctx };
};

const loadImage = async (filepath) => {
  const buffer = await fs.readFile(filepath);
  const blob = new Blob([buffer.buffer]);
  const img = await createImageBitmap(blob);

  return img;
};

const readImageData = async (filepath, FORCE_WIDTH, FORCE_HEIGHT) => {
  const img = await timing({
    label: `read-image "${filepath}"`,
    func: async () => await loadImage(filepath)
  });

  const { ctx } = await timing({
    label: `ctx-draw "${filepath}"`,
    func: async () => {
      const { ctx } = getCanvas(FORCE_WIDTH || img.width, FORCE_HEIGHT || img.height);

      ctx.drawImage(img, 0, 0, img.width, img.height);

      return { ctx };
    }
  });

  const data = await timing({
    label: `ctx-get-data "${filepath}"`,
    func: () => ctx.getImageData(0, 0, FORCE_WIDTH || img.width, FORCE_HEIGHT || img.height)
  });

  await timing({
    label: `close "${filepath}"`,
    func: () => img.close()
  });

  return data;
};

const computeTolerance = async ({ leftData, rightData, threshold, outputImage = true, left }) => {
  return await timing({
    label: `tolerance-compute "${left}"`,
    func: async () => {
      const { width, height } = leftData;
      const output = outputImage ? new Uint8ClampedArray(width * height * 4) : null;

      const pixels = await timing({
        label: `diff "${left}"`,
        func: () => pixelsAreEqual(leftData.data, rightData.data) ? -1 : pixelmatch(leftData.data, rightData.data, output, width, height, {
          threshold,
          diffMask: true
        })
      });

      if (outputImage) {
        return { leftData, rightData, pixels, output, width, height };
      }

      return { pixels, width, height };
    }
  });
};

const readImagesCanvas = async ({ left, right }) => {
  const leftData = await readImageData(left);
  const rightData = await readImageData(right, leftData.width, leftData.height);

  return { leftData, rightData };
};

const readImagesJimp = async ({ left, right }) => {
  const leftImg = await Jimp.read(left);
  const rightImg = await Jimp.read(right);

  if (leftImg.bitmap.width !== rightImg.bitmap.width || leftImg.bitmap.height !== rightImg.bitmap.height) {
    const width = Math.min(leftImg.bitmap.width, rightImg.bitmap.width);
    const height = Math.min(leftImg.bitmap.height, rightImg.bitmap.height);

    leftImg.crop(0, 0, width, height);
    rightImg.crop(0, 0, width, height);
  }

  return {
    leftData: leftImg.bitmap,
    rightData: rightImg.bitmap
  };

  // TODO we actually can return proper ImageData, but it is slower
  //return {
  //  leftData: new ImageData(Uint8ClampedArray.from(leftImg.bitmap.data), leftImg.bitmap.width, leftImg.bitmap.height),
  //  rightData: new ImageData(Uint8ClampedArray.from(rightImg.bitmap.data), rightImg.bitmap.width, rightImg.bitmap.height)
  //};
};

const tolerance = async ({ left, right, threshold = 0.05, outputImage = true, canvas = true }) => {
  return await timing({
    label: `tolerance "${left}"`,
    func : async () => {
      const { leftData, rightData } = await timing({
        label: `read-total "${left}"`,
        func: async () => canvas ? await readImagesCanvas({ left, right }) : await readImagesJimp({ left, right })
      });

      return await computeTolerance({ leftData, rightData, threshold, outputImage, left });
    }
  });
};

const info = async (imageFile) => {
  const { width, height } = await loadImage(imageFile);
  return { width, height };
};

module.exports = { info, tolerance, computeTolerance };
