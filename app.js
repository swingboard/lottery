var SERVER = 'https://www.bet365.com';

// 足球, web?lid=10&zid=0&pd=#AS#B1#&cid=42&ctid=42
var API_TYPE = `${SERVER}/SportsBook.API/web?lid=10&zid=0&pd=%23AS%23B1%23&cid=42&ctid=42`;

// 全场赛果, /web?lid=10&zid=0&pd=#AS#B1#C1#D13#E#F#O1#&cid=42&ctid=42
var API_CATEGORY = `${SERVER}/SportsBook.API/web?lid=10&zid=0&pd=%23AS%23B1%23C1%23D13%23E%23F%23O1%23&cid=42&ctid=42`;

// 赔率, /web?lid=10&zid=0&pd=#AC#B1#C1#D13#E37628398#F2#&cid=42&ctid=42
var API_ODDS = `${SERVER}/SportsBook.API/web?lid=10&zid=0&pd=%23AC%23B1%23C1%23D13%23E37628398%23F2%23&cid=42&ctid=42`;

var Game = require('./libs/SoccerGame');
var J = require('./libs/JSON');
var request = require('superagent');
require('superagent-proxy')(request);

let getOddsById = (id, arr)=>{
    let ret = '', i, sep;

    arr.forEach((item, index, arr)=>{
        if(id == item.IT){
            i = item;
            ret = item.OD;
        }
    })

    if(ret.indexOf('/') != -1){
        sep = ret.split('/');
        ret = parseFloat(sep[0])/parseFloat(sep[1]) + 1;
        ret = ret + '';
        i = ret.indexOf('.');
        if(i != -1){
            ret = ret.slice(0, i+3)
        }
        
        ret = parseFloat(ret).toFixed(2);
    }
    
    return ret;
}

request
  .get(API_ODDS)
  .timeout({
    response: 5000
  })
  .proxy('http://127.0.0.1:8888')
  .end((err, res) => {
    //console.log(res.status, res.headers);
    console.log(res.text);
    // res.body，和res.text有啥区别？

    let jsons = J.getJSONs(res.text);
    jsons.map((item)=>{
        // console.log(item);
    })

    let properties = J.getProperties(jsons);
    let filtered = jsons.filter((item, index, arr)=>{
        return !!item.FI && item.NA && !/\d+/.test(item.NA) && !item.AH;
    })

    let filtered_odds = jsons.filter((item, index, arr)=>{
        return !!item.FI && !item.NA && item.OD && !item.HA;
    })

    let matches = {};
    filtered.forEach((item, index, arr)=>{
        matches[item.FI] = matches[item.FI] || {};
        //matches[item.FI].id = 1;
        matches[item.FI].created_time = new Date();

        if(item.BC){
            // 主队名
            matches[item.FI].host_team = item.NA;

            // 主队胜，赔率
            matches[item.FI].host_odds = getOddsById(item.ID, filtered_odds);

            // 比赛开始时间
            matches[item.FI].begin_time = item.BC;          
            
            // 20180810200000
            let time_str = item.BC + '';
            let year = parseInt(time_str.slice(0, 4)),
            month = parseInt(time_str.slice(4, 6)),
            day = parseInt(time_str.slice(6, 8)),
            hour = parseInt(time_str.slice(8, 10)),
            minitue = parseInt(time_str.slice(10, 12)),
            secends = parseInt(time_str.slice(12, 14));
            let time = new Date(year, month-1, day, hour, minitue, secends);
            let beijing_time = new Date(time.getTime() + 7*3600*1000);
            
            matches[item.FI].begin_time = beijing_time;
        }
        else if(item.EX){
            matches[item.FI].guest_team = item.NA;          // 客队名
            matches[item.FI].guest_odds = getOddsById(item.ID, filtered_odds);  // 客队胜，赔率
            matches[item.FI].analyse_url = item.EX;         // 两队历史数据
        }
        else{
            matches[item.FI].equal_odds = getOddsById(item.ID, filtered_odds);       // 平局，赔率
        }
        
    })


    
    let len = 0;
    for(let item in matches){

        let n = new Date;
        n = matches[item].begin_time;
        console.log(n.getFullYear() + '/' + (n.getMonth()+1) + '/' + n.getDate() + ' ' + n.getHours() + ':' + n.getMinutes()+':' + n.getSeconds() + ' ' 
        + matches[item].host_team +'('+matches[item].host_odds+')' + 
        '/' + matches[item].guest_team +'('+matches[item].guest_odds+')' +
        '平局('+matches[item].equal_odds+')');

        len ++;
    }
    console.log(len);
  });


