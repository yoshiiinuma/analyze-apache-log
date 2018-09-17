
import util from 'util';

/**
 * Time - Count
 * 
 *
 *
 **/
export const report = (data, opt) => {
  //console.log(util.inspect(data, false, null, true));
  switch (opt.command) {
    case 'req':
      showNumberOfRequests(data, opt); 
      break;
    case 'ip':
      showRequestsPerIP(data, opt); 
      break;
    default:
      throw 'Unsupported Command: ' + opt.command;
    
  }
  //console.log(Object.keys(data));
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

