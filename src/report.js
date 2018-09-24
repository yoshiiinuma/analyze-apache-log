
import util from 'util';
import { Writable } from 'stream';

/**
 * Time - Count
 * 
 *
 *
 **/
export const report = (data, opt) => {
  //console.log(util.inspect(data, false, null, true));
  switch (opt.command) {
    case 'count-req':
      showNumberOfRequests(data, opt); 
      break;
    case 'count-ip':
      if (opt.ip) {
        showRequestUrls(data, opt);
      } else {
        showRequestsPerIP(data, opt);
      }
      break;
    default:
      throw 'Unsupported Command: ' + opt.command;
  }
}

export class StreamReport extends Writable {
  constructor(opt = {}) {
    super({ objectMode: true });
    this.opt = opt;
  }

  _write(obj, encoding, callback) {
    reportStream(obj, this.opt);
    callback();
  }
}

export const reportStream = (r, opt) => {
  switch (opt.command) {
    case 'count-req':
      console.log(r.displayTime + ' ' + r.count);
      break;
    case 'count-ip':
      if (opt.ip) {
        listRequestUrls(r, opt);
      } else {
        listRequestsPerIP(r, opt);
      }
      break;
    default:
      throw 'Unsupported Command: ' + opt.command;
  }
}

export const showNumberOfRequests = (data, opt) => {
  if (opt.top) {
    data.sort((x, y) => {
      return y.count - x.count;
    })
    .filter((e, i) => {
      if (!opt.top) return true;
      if (opt.top > i) return true; 
      return false;
    })
    .map((e) => {
      console.log(e.displayTime + ' ' + e.count);
    });
  } else {
    data.forEach((e) => {
      console.log(e.displayTime + ' ' + e.count);
    });
  }
}

export const showRequestsPerIP = (data, opt) => {
  data.forEach((r) => listRequestPerIP(r, opt));
}

export const listRequestsPerIP = (r, opt) => {
  console.log('---< ' + r.displayTime + ' >---------------------------------------------------------');
  Object.entries(r.ip)
    .sort((x, y) => { return y[1].count - x[1].count})
    .filter((e, i) => {
      if (!opt.top) return true;
      if (opt.top > i) return true; 
      return false;
    })
    .map((e) => {
      const [ip, reqs] = e;
      console.log(ip + ': ' + reqs.count);
    });
}

export const showRequestUrls = (data, opt) => {
  data.forEach((r) => listRequestUrls(r, opt));
}

export const listRequestUrls = (r, opt) => {
  console.log('---< ' + r.displayTime + ' >---------------------------------------------------------');
  const ip = Object.keys(r.ip)[0];
  const obj = r.ip[ip];
  Object.entries(obj.requests)
    .sort((x, y) => { return y[1] - x[1]})
    .filter((e, i) => {
      if (!opt.top) return true;
      if (opt.top > i) return true; 
      return false;
    })
    .map((e) => {
      const [url, count] = e;
      console.log(url + ': ' + count);
    });
}

