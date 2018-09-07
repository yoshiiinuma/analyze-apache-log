
import fs from 'fs';
import util from 'util';
import { analyze } from './analyzer.js';

const usage = () => {
  console.log('');
  console.log('USAGE: node analyze-apache-log.js <LOGFILE>');
  console.log('');
};

if (process.argv.length != 3) {
  usage();
  process.exit();
}

const file = process.argv[2];
if (!fs.existsSync(file)) {
  console.log('File Not Found: ' + file + "\n");
  usage();
  process.exit();
}

analyze(file)
  .then((r) => console.log(util.inspect(r, false, null, true)))
  .catch((e) => console.log(e));
