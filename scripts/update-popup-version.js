const fs = require('fs');
const {version} = require('../package.json');

const regex = /(<div class="version">)(\d+\.\d+\.\d+)(<\/div>)/g;
const html = fs.readFileSync('src/popup.html', {encoding: 'utf8'});

fs.writeFileSync(
  'src/popup.html',
  html.replace(regex, `$1${version}$3`),
  {encoding: 'utf8'},
);
