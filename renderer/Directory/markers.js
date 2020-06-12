const MARKERS = {
  same: '🟢',
  similar: '🟡',
  different: '🔴',
  invalid: '🚫',
  error: '‼'
};

module.exports = ({ compare }) => {
  return MARKERS[compare] || '📄';
};
