const path = require('path');
const cs = require('callsites');

const { h, render } = require('preact');
const { useEffect, useRef, useState } = require('preact/hooks');

const htm = require('htm');

const html = htm.bind(h);

const css = (csspath, dirname) => {
  const callerFile = cs()[1].getFileName();
  const callerDir = path.dirname(callerFile);

  const link = document.createElement('link');

  Object.assign(link, {
    type: 'text/css',
    rel: 'stylesheet',
    href: path.resolve(dirname || callerDir, csspath)
  });

  document.head.appendChild(link);
};

module.exports = { html, render, css, useState, useEffect, useRef };
