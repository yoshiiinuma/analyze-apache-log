
import fs from 'fs';
import util from 'util';
import { analyze, analyzeStream } from './analyzer.js';
import { reportStream, StreamReport } from './report.js';

const DEFAULT_PERIOD = 1;
const COMMANDS = ['count-req', 'count-ip'];

const usage = () => {
  console.log('');
  console.log('USAGE: node analyze-apache-log.js <COMMAND> <LOGFILE> [OPTION]...');
  console.log('');
  console.log('   COMMAND:');
  console.log('');
  console.log('      count-req:             Counts the number of requests');
  console.log('       count-ip:             Counts the number of requests per IP');
  console.log('');
  console.log('   LOGFILE: Path to the log file to be analyzed');
  console.log('');
  console.log('');
  console.log('   OPTIONS:');
  console.log('');
  console.log('   -p or --period <MINS>:      Period to summarize; DEFAULT ' + DEFAULT_PERIOD + ' mins');
  console.log('   -t or --top <NUM>:          Shows only top NUM records');
  console.log('   --ip <IP>:                  Shows the requested URLs only from the specified IP');
  console.log('   --from <MM/YYYY>[-HH:mm]:   Specifies the start time to filter out time e.g. 1/2/2018-3:4');
  console.log('   --to <MM/DD/YYYY>[-HH:mm]:  Specifies the end time to filter out time e.g. 1/2/2018-3:4');
  console.log('   -D or --DEBUG:              Prints debug messages');
  console.log('   -h or --help:               Shows this usage');
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

const regexDate = /^[01]?\d\/[0123]?\d\/20\d{2}(-([01]?\d|2[0-3]):[0-5]?\d)?$/;

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
    if (arg === '--ip') {
      i++;
      opts.ip = process.argv[i];
    }
    if (arg === '--from') {
      i++;
      const time = process.argv[i];
      if (!time.match(regexDate)) {
        console.log('Invalid Time: ' + time);
        console.log('')
        console.log('  Must be MM/DD/YYYY[-HH:mm]')
        console.log('      e.g. 1/2/2018, 1/2/2018-3:4')
        usage();
        process.exit();
      }
      opts.from = Date.parse(time.replace('-', ' '));
    }
    if (arg === '--to') {
      i++;
      const time = process.argv[i];
      if (!time.match(regexDate)) {
        console.log('Invalid Time: ' + time);
        console.log('')
        console.log('  Must be MM/DD/YYYY[-HH:mm]')
        console.log('      e.g. 1/2/2018, 1/2/2018-3:4')
        usage();
        process.exit();
      }
      opts.to = Date.parse(time.replace('-', ' '));
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


const sreport = new StreamReport(opts);
analyzeStream(file, opts).pipe(sreport);

//analyze(file, opts)
//  .then((r) => report(r, opts))
//  .catch((e) => console.log(e));

