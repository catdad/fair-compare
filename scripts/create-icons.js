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

const createIco = async svg => await toIco([
  await render(svg, 16),
  await render(svg, 24),
  await render(svg, 32),
  await render(svg, 48),
  await render(svg, 64),
  await render(svg, 128),
  await render(svg, 256)
]);

const createIcns = async svg => {
  const icns = new Icns();

  for (const { osType, size } of Icns.supportedIconTypes) {
    const buffer = await render(svg, size);
    icns.append(IcnsImage.fromPNG(buffer, osType));
  }

  return icns.data;
};

timing({
  label: 'create icons',
  func: async () => {
    const svg = await read(path.resolve(root, 'assets/icon.svg'));

    await write(dist('icon.svg'), svg);
    await write(dist('icon.png'), await render(svg, 512));
    await write(dist('icon.ico'), await createIco(svg));
    await write(dist('icon.icns'), await createIcns(svg));
  }
}).catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
