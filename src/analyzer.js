
import fs from 'fs';
import { LineStream } from 'byline';
import readline from 'readline';

import Summarizer from './summarizer.js';
import Logger from './logger.js';
import { reportStream, StreamReport } from './report.js';

/**
 * summarize followings per N minutes
 * - count ip
 * - count reqeust
 *
 *
 **/
export const analyzeStream = (file, opt = {}) => {
  const min = (opt.period == undefined)? 1 : parseInt(opt.period);
  const period = min * 60 * 1000;
  const timeEndOffset = minToTimeEndOffset(min);

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
  let summarizer = new Summarizer(Object.assign(opt, { period, timeEndOffset }));
  let report = new StreamReport(opt);

  return instream.pipe(linestream).pipe(summarizer).pipe(report);
}

export const analyze = (file, opt = {}) => {
  const min = (opt.period == undefined)? 1 : parseInt(opt.period);
  const timeEndOffset = minToTimeEndOffset(min);
  const period = min * 60 * 1000;

  return new Promise((resolve, reject) => {
    let results = [];
    let r = null;
    let timeslot = null;

    const rl = readline.createInterface({
      input: fs.createReadStream(file),
      terminal: false
    });

    rl.on('close', () => {
      if (r !== null) results.push(r);
      resolve(results)
    });
    rl.on('error', (e) => reject(e));
    rl.on('line', (line) => {
      const [ip, timeOrig, usr, name, req, cd, ref, agt, resSize,
         inSize, outSize, elapsed] = line.split(' | ');

      if (opt.ip && ip !== opt.ip) return;

      let time = timeOrig.slice(1, 21);
      let timestamp = Date.parse(time.slice(0, 11) + ' ' + time.slice(12, 21));

      if (opt.from && timestamp < opt.from) return;
      if (opt.to && timestamp >= opt.to) return;

      if (timeslot === null || timestamp >= timeslot + period) {
        if (r !== null) results.push(r);
        timeslot = timestamp - timestamp % 60000;
        let displayTime = time.slice(0, timeEndOffset);
        r = { timestamp, displayTime, count: 0, ip: {} };
      }
      if (r['ip'][ip] == undefined) r['ip'][ip] = { count:0, requests: {} };
      if (r['ip'][ip]['requests'][req] == undefined) r['ip'][ip]['requests'][req] = 0;

      r['count']++;
      r['ip'][ip]['count']++;
      r['ip'][ip]['requests'][req]++;
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

