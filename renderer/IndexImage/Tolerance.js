const { html, useState, useEffect } = require('../tools/ui.js');

function Tolerance({ left, right }) {
  const [tolerance, setTolerance] = useState(null);

  useEffect(() => {

  }, []);

  return tolerance ? html`<Image title="Tolerance" filepath=${tolerance} />` : html``;
}

module.exports = Tolerance;
