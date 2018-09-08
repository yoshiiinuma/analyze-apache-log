
import fs from 'fs';
import { LineStream } from 'byline';
import readline from 'readline';

import Logger from './logger.js';

/**
 * summarize followings per N minutes
 * - count ip
 * - count reqeust
 *
 *
 **/
export const analyze = (file, opts = {}) => {
  const min = (opts.period == undefined)? 1 : parseInt(opts.period);
  const timeEnd = minToTimeEndOffset(min);

  console.log(file);

  let instream = fs.createReadStream(file)
    .on('error', (err) => {
      Logger.error('PushManager#push instream');
      Logger.error(err)
    });
  let linestream = new LineStream()
    .on('error', (err) => {
      Logger.error('PushManager#read linestream');
      Logger.error(err)
    });
  return instream.pipe(linestream);
}

export const analyzeOld = (file, opts = {}) => {
  const min = (opts.period == undefined)? 1 : parseInt(opts.period);
  const timeEnd = minToTimeEndOffset(min);

  let instream = fs.createReadStream(file)
    .on('error', (err) => {
      Logger.error('PushManager#push instream');
      Logger.error(err)
    });
  let linestream = new LineStream()
    .on('error', (err) => {
      Logger.error('PushManager#read linestream');
      Logger.error(err)
    });

  return new Promise((resolve, reject) => {
    let r = {};
    let cur = null;

    const rl = readline.createInterface({
      input: fs.createReadStream(file),
      terminal: false
    });

    rl.on('close', () => resolve(r));
    rl.on('error', (e) => reject(e));
    rl.on('line', (l) => {
      let ip, time, usr, name, req, cd, ref, agt, resSize, inSize, outSize, elapsed;

      [ip, time, usr, name, req, cd, ref, agt, resSize,
         inSize, outSize, elapsed] = l.split(' | ');

      time = time.slice(1, 21);

      if (!time.startsWith(cur)) {
        cur = time.slice(0, timeEnd);
        r[cur] = {};
      }
      if (r[cur][ip] == undefined) r[cur][ip] = {};
      if (r[cur][ip][req] == undefined) r[cur][ip][req] = 0;
      r[cur][ip][req]++;
    });
  });
}

const minToTimeEndOffset = (period) => {
  let min = period || 1;
  if (min < 1) min = 1;
  if (min >= 1 && min < 60) return 17;
  if (min >= 60 && min < 1440) return 14;
  return 11;
}

