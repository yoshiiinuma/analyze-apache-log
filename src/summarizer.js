
import { Transform } from 'stream'

class Summarizer extends Transform {
  constructor(opts = {}) {
    super(Object.assign(opts, { objectMode: true }));
    this.opts = opts;
    this.r = null;
    this.timeslot = null;
    this.period = opts.period || 60000;
    this.timeEndOffset = opts.timeEndOffset || 17;
  }

  // Expects line stream
  _transform(line, encoding, callback) {
    const [ip, timeOrig, usr, name, req, cd, ref, agt, resSize,
       inSize, outSize, elapsed] = line.toString().split(' | ');

    if (this.opts.ip && ip !== this.opts.ip) return;

    let time = timeOrig.slice(1, 21);
    let timestamp = Date.parse(time.slice(0, 11) + ' ' + time.slice(12, 21));

    if (this.opts.from && timestamp < this.opts.from) return;
    if (this.opts.to && timestamp >= this.opts.to) return;

    if (this.timeslot === null || timestamp >= this.timeslot + this.period) {
      if (this.r) this.push(this.r);
      this.timeslot = timestamp - timestamp % 60000;
      let displayTime = time.slice(0, this.timeEndOffset);
      this.r = { timestamp, displayTime, count: 0, ip: {} };
    }
    if (this.r['ip'][ip] == undefined) this.r['ip'][ip] = { count:0, requests: {} };
    if (this.r['ip'][ip]['requests'][req] == undefined) this.r['ip'][ip]['requests'][req] = 0;

    this.r['count']++;
    this.r['ip'][ip]['count']++;
    this.r['ip'][ip]['requests'][req]++;

    callback();
  }
}

export default Summarizer;
