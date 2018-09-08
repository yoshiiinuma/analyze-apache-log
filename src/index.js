
import fs from 'fs';
import util from 'util';
import { analyze, analyzeOld } from './analyzer.js';

const DEFAULT_PERIOD = 1;

const usage = () => {
  console.log('');
  console.log('USAGE: node analyze-apache-log.js <LOGFILE> [OPTION]...');
  console.log('');
  console.log('   LOGFILE: Path to the log file to be analyzed');
  console.log('');
  console.log('   OPTIONS:');
  console.log('   -p or --period <MINS>:   Period to summarize; DEFAULT ' + DEFAULT_PERIOD + ' mins');
  console.log('   -D or --DEBUG:            Prints debug messages');
  console.log('   -h or --help:             Shows this usage');
  console.log('');
};

if (process.argv.length < 3) {
  usage();
  process.exit();
}

let opts = {
  debug: false
};

const file = process.argv[2];
if (!fs.existsSync(file)) {
  console.log('File Not Found: ' + file + "\n");
  usage();
  process.exit();
}

if (process.argv.length > 3) {
  for (let i = 3; i < process.argv.length; i++) {
    let arg = process.argv[i];
    if (arg === '-p' || arg === '--period') {
      i++;
      opts.period = parseInt(process.argv[i]);
    }
    if (arg === '-D' || arg === '--DEBUG') {
      opts.debug = true;
    }
    if (arg === '-h' || arg === '--help') {
      usage();
      process.exit();
    }
  }
}

analyze(file, opts).pipe(process.stdout);

//analyzeOld(file, opts)
//  .then((r) => console.log(util.inspect(r, false, null, true)))
//  .catch((e) => console.log(e));
//
