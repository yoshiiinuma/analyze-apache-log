
import { Transform } from 'stream'

class Summarizer extends Transform {
  constructor(options = {}) {
    super(Object.assign(options, { objectMode: true }));
    this.r = null;
    this.bucket = null;
    this.period = options.period || 60000;
    this.timeEndOffset = options.timeEndOffset || 17;
  }

  // Expects line stream
  _transform(line, encoding, callback) {
    let ip, time, usr, name, req, cd, ref, agt, resSize, inSize, outSize, elapsed;

    [ip, time, usr, name, req, cd, ref, agt, resSize,
       inSize, outSize, elapsed] = line.toString().split(' | ');

    time = time.slice(1, 21);
    let timestamp = Date.parse(time.slice(0, 11) + ' ' + time.slice(12, 21));

    if (this.bucket === null || timestamp >= this.bucket + this.period) {
      if (this.r) this.push(this.r);
      this.bucket = timestamp - timestamp % 60000;
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
