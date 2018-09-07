
import fs from 'fs';
import readline from 'readline';

/**
 * summarize followings per N minutes
 * - count ip
 * - count reqeust 
 *
 *
 **/
export const analyze = (file) => {
  let rslt = {};
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    terminal: true
  });

  rl.on('close', () => resolve(rslt));
  rl.on('error', (e) => reject(e));
  rl.on('line', (l) => parse(l, rslt));
  rl.on('line', (l) => {
    const [ip, time, usr, logname, req, cd, ref, agt,
      res_bytes, in_bytes, out_bytes, elapsed] = l.split(' | ');
    console.log(ip, time, req, cd, agt);
  });
}

const parse = (line, r) => {
  const [ip, time, usr, logname, req, cd, ref, agt,
    res_bytes, in_bytes, out_bytes, elapsed] = line.split(' | ');
  console.log(ip, time, req, cd, agt);
}

