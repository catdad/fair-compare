const pixelmatch = require('pixelmatch');
const fs = require('fs-extra');
const timing = require('../../lib/timing.js')('image-diff');

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
  return await timing({
    label: `create-image "${filepath}`,
    func: async () => {
      const buffer = await fs.readFile(filepath);
      const blob = new Blob([buffer.buffer]);
      const img = await timing({
        label: `create-bitmap "${filepath}"`,
        func: async () => await createImageBitmap(blob)
      });

      return img;
    }
  });
};

const readImageData = async (filepath) => {
  const img = await loadImage(filepath);

  const { ctx } = await timing({
    label: `ctx-draw "${filepath}"`,
    func: async () => {
      const { ctx } = getCanvas(img.width, img.height);

      ctx.drawImage(img, 0, 0, img.width, img.height);

      return { ctx };
    }
  });

  const data = await timing({
    label: `ctx-get-data ${filepath}`,
    func: () => ctx.getImageData(0, 0, img.width, img.height)
  });

  await timing({
    label: `close ${filepath}`,
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

      return { leftData, rightData, pixels, output, width, height };
    }
  });
};

const tolerance = async ({ left, right, threshold = 0.05, outputImage = true }) => {
  return await timing({
    label: `tolerance "${left}"`,
    func : async () => {
      const [leftData, rightData] = await timing({
        label: `read-total "${left}"`,
        func: async () => await Promise.all([
          readImageData(left),
          readImageData(right)
        ])
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
