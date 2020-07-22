const fs = require('fs-extra');
const path = require('path');
const root = require('rootrequire');
const renderSvg = require('svg-render');
const toIco = require('@catdad/to-ico');
const { Icns, IcnsImage } = require('@fiahfy/icns');

const timing = require('../lib/timing.js')('prep:icons');

const read = fs.readFile;
const write = fs.outputFile;
const dist = file => path.resolve(root, 'out', file);

const render = async (buffer, width = 512) => await renderSvg({ buffer, width });

const createIco = async svg => await toIco(
  await Promise.all([16, 24, 32, 48, 64, 128, 256].map(size => render(svg, size)))
);

const createIcns = async svg => {
  const icns = new Icns();

  for (const { osType, size } of Icns.supportedIconTypes) {
    icns.append(IcnsImage.fromPNG(await render(svg, size), osType));
  }

  return icns.data;
};

timing({
  label: 'create icons',
  func: async () => {
    const svg = await read(path.resolve(root, 'assets/icon.svg'));

    await write(dist('icon.svg'), svg);
    await write(dist('icon-512x512.png'), await render(svg, 512));
    await write(dist('icon-32x32.png'), await render(svg, 32));
    await write(dist('icon.ico'), await createIco(svg));
    await write(dist('icon.icns'), await createIcns(svg));
  }
}).catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
