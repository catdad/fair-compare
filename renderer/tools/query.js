const get = require('lodash/get');
const global = () => typeof window === 'undefined' ? {} : window;

module.exports = (function parseQuery(){
  const query = {};
  const temp = get(global(), 'location.search', '').substring(1).split('&').filter(q => !!q);

  for (let part of temp) {
    var q = part.split('=');
    query[q.shift()] = decodeURIComponent(q.join('='));
  }

  return query;
})();
