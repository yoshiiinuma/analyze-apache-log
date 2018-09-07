
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
  return new Promise((resolve, reject) => {
    let r = {};
    let cur = null;

    const rl = readline.createInterface({
      input: fs.createReadStream(file),
      terminal: false
    });

    rl.on('close', () => resolve(r));
    rl.on('error', (e) => reject(e));
    //rl.on('line', (l) => parse(l, r));
    rl.on('line', (l) => {
      let ip, time, usr, logname, req, cd, ref, agt,
        res_bytes, in_bytes, out_bytes, elapsed;
      [ip, time, usr, logname, req, cd, ref, agt,
        res_bytes, in_bytes, out_bytes, elapsed] = l.split(' | ');
      time = time.slice(1,21);
      //console.log(ip, time, req, cd, agt);
      if (!time.startsWith(cur)) {
        cur = time.slice(0,17);
        //r[cur] = { 'ip': {}, 'req': {} };
        r[cur] = {};
      }
      if (r[cur][ip] == undefined) r[cur][ip] = {};
      if (r[cur][ip][req] == undefined) r[cur][ip][req] = 0;
      r[cur][ip][req]++;
      //if (r[cur]['req'][req] == undefined) r[cur]['req'][req] = 0;
      //r[cur]['req'][req]++;
    });
  });
}

const parse = (line, r) => {
  const [ip, time, usr, logname, req, cd, ref, agt,
    res_bytes, in_bytes, out_bytes, elapsed] = line.split(' | ');
  console.log(ip, time, req, cd, agt);
}

