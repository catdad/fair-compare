const fs = require('fs-extra');
const path = require('path');
const root = require('rootrequire');
const renderSvg = require('svg-render');
const pngToIco = require('png-to-ico');
const { convert: icnsConvert } = require('@fiahfy/icns-convert');
const cheerio = require('cheerio');

const timing = require('../lib/timing.js')('prep:icons');

const read = fs.readFile;
const write = fs.outputFile;
const dist = file => path.resolve(root, 'out', file);

const render = async (buffer, width = 512) => await renderSvg({ buffer, width });
const createIco = async svg => await pngToIco(await render(svg, 256));
const createIcns = async svg => await icnsConvert([
  await render(svg, 16),
  await render(svg, 32),
  await render(svg, 48),
  await render(svg, 64),
  await render(svg, 128),
  await render(svg, 256),
  await render(svg, 512),
  await render(svg, 1024)
]);

// this is a bad idea, but canvas can't render the use tags correctly
const preprocess = svg => {
  const $ = cheerio.load(svg.toString(), { xmlMode: true });

  // replace use tags with the a copy of the def item they are using
  $('use').each((i, elem) => {
    const $elem = $(elem);
    const id = $elem.attr('href');
    const shape = $(id).clone();
    shape.removeAttr('id');

    for (let key in $elem.get(0).attribs) {
      if (key === 'href') {
        continue;
      }

      shape.attr(key, $elem.attr(key));
    }

    $elem.replaceWith(shape);
  });

  return Buffer.from($.xml());
};

timing({
  label: 'create icons',
  func: async () => {
    const svg = preprocess(await read(path.resolve(root, 'assets/icon.svg')));

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
