
import fs from 'fs';
import { LineStream } from 'byline';
import readline from 'readline';

import Summarizer from './summarizer.js';
import Logger from './logger.js';

/**
 * summarize followings per N minutes
 * - count ip
 * - count reqeust
 *
 *
 **/
export const analyzeStream = (file, opts = {}) => {
  const min = (opts.period == undefined)? 1 : parseInt(opts.period);
  const period = min * 60 * 1000;
  const timeEndOffset = minToTimeEndOffset(min);

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
  let summarizer = new Summarizer({ period, timeEndOffset });
  summarizer.on('data', (obj) => console.log(obj))

  return instream.pipe(linestream).pipe(summarizer);
}

export const analyze = (file, opts = {}) => {
  const min = (opts.period == undefined)? 1 : parseInt(opts.period);
  const timeEndOffset = minToTimeEndOffset(min);
  const period = min * 60 * 1000;

  return new Promise((resolve, reject) => {
    let r = {};
    let cur = null;
    let timestamp = null;
    let bucket = null;

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
      timestamp = Date.parse(time.slice(0, 11) + ' ' + time.slice(12, 21));

      if (bucket === null || timestamp >= bucket + period) {
        bucket = timestamp - timestamp % 60000;
        cur = time.slice(0, timeEndOffset);
        r[cur] = { count: 0, ip: {} };
      }
      if (r[cur]['ip'][ip] == undefined) r[cur]['ip'][ip] = { count:0, requests: {} };
      if (r[cur]['ip'][ip]['requests'][req] == undefined) r[cur]['ip'][ip]['requests'][req] = 0;

      r[cur]['count']++;
      r[cur]['ip'][ip]['count']++;
      r[cur]['ip'][ip]['requests'][req]++;
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

