
import util from 'util';

export const report = (data, opt) => {
  //console.log(util.inspect(data, false, null, true));
  orderByCount(data, opt); 
  //console.log(Object.keys(data));
}

export const orderByCount = (data, opt) => {
  for(const [time, tbl] of Object.entries(data)) {
    console.log('---< ' + time + ' >---------------------------------------------------------');
    Object.entries(tbl)
      .sort((x, y) => { return y[1].count - x[1].count})
      .filter((e, i) => {
        if (!opt.top) return true;
        if (opt.top > i) return true; 
        return false;
      })
      .map((e) => {
        const [ip, reqs] = e;
        console.log(ip + ': ' + reqs['count']);
      })
  }
}

