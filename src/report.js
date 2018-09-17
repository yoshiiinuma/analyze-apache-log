
import util from 'util';

/**
 * Time - Count
 * 
 *
 *
 **/
export const report = (data, opt) => {
  //console.log(util.inspect(data, false, null, true));
  //console.log(Object.keys(data));
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

export const showNumberOfRequests = (data, opt) => {
  if (opt.top) {
    Object.entries(data).sort((x, y) => {
      return y[1].count - x[1].count;
    })
    .filter((e, i) => {
      if (!opt.top) return true;
      if (opt.top > i) return true; 
      return false;
    })
    .map((e) => {
      const [time, obj] = e;
      console.log(time + ': ' + obj.count);
    })
  } else {
    for(const [time, tbl] of Object.entries(data)) {
      console.log(time + ' ' + tbl.count);
    }
  }
}

export const showRequestsPerIP = (data, opt) => {
  for(const [time, tbl] of Object.entries(data)) {
    console.log('---< ' + time + ' >---------------------------------------------------------');
    Object.entries(tbl.ip)
      .sort((x, y) => { return y[1].count - x[1].count})
      .filter((e, i) => {
        if (!opt.top) return true;
        if (opt.top > i) return true; 
        return false;
      })
      .map((e) => {
        const [ip, reqs] = e;
        console.log(ip + ': ' + reqs.count);
      })
  }
}

export const showRequestUrls = (data, opt) => {
  for(const [time, tbl] of Object.entries(data)) {
    console.log('---< ' + time + ' >---------------------------------------------------------');
    const ip = Object.keys(tbl.ip)[0];
    const obj = tbl.ip[ip];
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
      })
  }
}

