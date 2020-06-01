const { html, css, useState } = require('../tools/ui.js');
const Directory = require('../Directory/Directory.js');

css('./App.css', __dirname);

function App() {
  const [dir1, setDir1] = useState({ base: null, files: [] });
  const [dir2, setDir2] = useState({ base: null, files: [] });
  const [selectedFile, setSelectedFile] = useState(null);

  return html`
    <div class=main>
      <${Directory} dir=${dir1} setDir=${setDir1} selected=${selectedFile} />
      <${Directory} dir=${dir2} setDir=${setDir2} selected=${selectedFile} />
    </div>
  `;
}

module.exports = App;
