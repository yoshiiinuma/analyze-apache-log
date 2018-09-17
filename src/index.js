
import fs from 'fs';
import util from 'util';
import { analyze, analyzeStream } from './analyzer.js';
import { report } from './report.js';

const DEFAULT_PERIOD = 1;
const COMMANDS = ['req', 'ip'];

const usage = () => {
  console.log('');
  console.log('USAGE: node analyze-apache-log.js <COMMAND> <LOGFILE> [OPTION]...');
  console.log('');
  console.log('   COMMAND:');
  console.log('       req:                 Show the number of requests');
  console.log('        ip:                 Show IP addresses');
  console.log('');
  console.log('   LOGFILE: Path to the log file to be analyzed');
  console.log('');
  console.log('');
  console.log('   OPTIONS:');
  console.log('   -p or --period <MINS>:   Period to summarize; DEFAULT ' + DEFAULT_PERIOD + ' mins');
  console.log('   -t or --top <NUM>:       Shows only top NUM records');
  console.log('   -D or --DEBUG:           Prints debug messages');
  console.log('   -h or --help:            Shows this usage');
  console.log('');
};

if (process.argv.length < 4) {
  usage();
  process.exit();
}

let opts = {
  debug: false
};

const cmd = process.argv[2];
if (COMMANDS.some((r) => { return r === cmd })) {
  opts.command = cmd;
} else {
  console.log('Command Not Found: ' + cmd + "\n");
  usage();
  process.exit();
}

const file = process.argv[3];
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
    if (arg === '-t' || arg === '--top') {
      i++;
      opts.top = parseInt(process.argv[i]);
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

//analyzeStream(file, opts).pipe(process.stdout);

analyze(file, opts)
  .then((r) => report(r, opts))
  .catch((e) => console.log(e));

