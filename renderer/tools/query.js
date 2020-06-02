module.exports = (function parseQuery(){
  const query = {};
  const temp = (window.location.search || '').substring(1).split('&').filter(q => !!q);

  for (let part of temp) {
    var q = part.split('=');
    query[q.shift()] = q.join('=');
  }

  return query;
})();
