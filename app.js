
var Game = require('./libs/SoccerGame');
var J = require('./libs/JSON');
var {sequelize, Game, Odds, GameType, GameCategory, GameSubCategory} = require('./libs/sequelize');
var request = require('superagent');
require('superagent-proxy')(request);
var chalk = require('chalk');

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

let getUrlByPd = (pd)=>{
    const SERVER = 'https://www.bet365.com';
    return `${SERVER}/SportsBook.API/web?lid=10&zid=0&pd=${encodeURIComponent(pd)}&cid=42&ctid=42`;
}


// 获取全场赛果的 pd, #AS#B1#C1#D13#E#F#O1#
let task1 = (id)=>{
    return new Promise((resolve, reject)=>{
        GameType.findOne({
            where: {
                bet365_id: 'A11313'
            }
        })
        .then((gameType) => {
            console.log(`第一步成功${gameType}`) 
            resolve(gameType)
        })
        .catch((reason)=>{
            //console.log(reason.parent);
            console.log(chalk.red(reason));
            //console.log(reason.sql);
            reject(reason)
        })
    })
}

// 根据比赛玩法，获取比赛的区域分布
// 玩法是全场赛果，得到的比赛分类有，欧洲、英国等
let task2 = (gameType)=>{
    
    let pd = gameType.bet365_pd;
    let api_url = getUrlByPd(pd);

    return new Promise((resolve, reject)=>{
        request.get(api_url).timeout({
            response: 5000
        })
        .proxy('http://127.0.0.1:8888')
        .end((err, res) => {
            // console.log(res.status, res.headers);
            // console.log(res.text);
            // res.body，和res.text有啥区别？
            
            if(!res || err){
                console.log(chalk.red('task2' + JSON.stringify(err)))
                reject(err);
                return;
            }

            let jsons = [];
            if(res && res.text){
                jsons = J.getJSONs(res.text);
            }
            
            // 筛选出, 欧洲、德国、英国等划分区域
            jsons = jsons.filter((item, index, arr)=>{
                return (item.MA == '' && item.IT && item.NA);
            })

            let results = [];
            let count = 0;
            jsons.forEach((item, index, arr)=>{
                
                let obj = {
                    bet365_id: item.IT,
                    category_name: item.NA,
                    bet365_pd: item.PD
                }
                
                obj.father_category = pd;
                results.push(obj);

                GameCategory.findOrCreate({
                    where: {
                        bet365_pd: obj.bet365_pd
                    },
                    defaults: obj
                })
                .spread((gameCategory, created)=>{
                    count ++;
                    //console.log(JSON.stringify(gameCategory));
                    console.log(gameCategory + (created?'创建一个顶级类目':'找到一个顶级类目'))
                    if(count == jsons.length){
                        resolve(results);
                    }
                })
                .catch((reason)=>{
                    count ++;
                    console.log(chalk.red('task,findOrcreate报错,'));
                    console.log(chalk.red(reason))
                    console.log(chalk.red('item:' + JSON.stringify(item)));
                    console.log(chalk.red('obj:' + JSON.stringify(obj)));
                    
                    if(count == jsons.length){
                        resolve(results);
                    }
                })
                
            })

        })
    })
}


// 查询各个赛区的比赛赔率
let task3 = (categoryArr)=>{
    
    return new Promise((resolve, reject)=>{

        let count = 0;
        let results = [];

        categoryArr.forEach((item, index, arr)=>{

            let api_url = getUrlByPd(item.bet365_pd);

            setTimeout(()=>{

                request.get(api_url).timeout({
                    response: 5000
                })
                .proxy('http://127.0.0.1:8888')
                .end((err, res) => {
    
                    if(!res || err){
                        count ++;
                        console.log(chalk.red('task3' + JSON.stringify(err)) + ', pd:' +item.bet365_pd)

                        if(count == categoryArr.length){
                            resolve(results);
                        }
                        // reject(err);
                        return;
                    }

                    let jsons = [];
                    if(res && res.text){
                        jsons = J.getJSONs(res.text);
                    }
                    
                    jsons = jsons.filter((item, index, arr)=>{
                        return (item.PA == '' && item.IT && item.NA);
                    })
    
                    
                    let count_inner = 0;
                    jsons.forEach((subItem, index, arr)=>{
                        
                        let obj = {
                            bet365_id: subItem.IT,
                            category_name: subItem.NA,
                            bet365_pd: subItem.PD
                        }
                        
                        obj.father_category = item.bet365_pd;
                        results.push(obj);

                        setTimeout(()=>{
                            GameSubCategory.findOrCreate({
                                where: {
                                    bet365_pd: obj.bet365_pd
                                },
                                defaults: obj
                            })
                            .spread((gameCategory, created)=>{
                                count_inner ++;
                                console.log(gameCategory + (created?'task3创建成':'task3找到了'))
                                if(count_inner == jsons.length){
                                    count ++;
                                    if(count == categoryArr.length){
                                        resolve(results);
                                    }
                                }
                            })
                            .catch((reason)=>{
                                count ++;
                                console.log(chalk.red(JSON.stringify(obj) + 'task3异常' + reason.original));
                                if(count_inner == jsons.length){
                                    count ++;
                                    if(count == categoryArr.length){
                                        resolve(results);
                                    }
                                }
                            })
                        }, 1500 * index)
                        
                    })
                    
                });


            }, 1500*index)
            
        })
    })
}



// 查询各个赛区的比赛赔率
let task4 = (categoryArr)=>{

    console.log('task4')
    
    return new Promise((resolve, reject)=>{

        let count = 0;

        categoryArr.forEach((item, index, arr)=>{

            let api_url = getUrlByPd(item.bet365_pd),
            bet365_category_id = item.bet365_id;

            setTimeout(()=>{

                request.get(api_url).timeout({
                    response: 5000
                })
                .proxy('http://127.0.0.1:8888')
                .end((err, res) => {

                    if(!res || err){
                        count++;
                        console.log(chalk.red('task4 err' + err));
                        if(count == categoryArr.length){
                            resolve(categoryArr);
                        }
                    }
        
                    let jsons = [];
                    if(res && res.text){
                        jsons = J.getJSONs(res.text);
                    }
        
                    // 比赛信息
                    let filtered = jsons.filter((item, index, arr)=>{
                        return !!item.FI && item.NA && !/^\d+$/.test(item.NA) && !item.AH;
                    })
        
                    // 赔率信息
                    let filtered_odds = jsons.filter((item, index, arr)=>{
                        return !!item.FI && !item.NA && item.OD && !item.HA;
                    })
        
                    let matches = {};
                    filtered.forEach((item, index, arr)=>{
                        matches[item.FI] = matches[item.FI] || {};
                        //matches[item.FI].id = 1;
                        matches[item.FI].created_time = new Date();
                        matches[item.FI].bet365_id = item.FI;
        
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
                            let beijing_time = new Date(time.getTime() + 15*3600*1000);
                            
                            matches[item.FI].begin_time = beijing_time;
                            // console.log(`BC:${item.BC}, ${year}, ${month}, ${day}, ${hour}, ${minitue}, ${secends}, ${beijing_time}`)
                            // BC:20180816194500, 2018, 8, 16, 19, 45, 0, Fri Aug 17 2018 02:45:00 GMT+0800 (CST)
                        }
                        else if(item.NA == '平局'){
                            matches[item.FI].equal_odds = getOddsById(item.ID, filtered_odds);       // 平局，赔率
                        }
                        else{
                            matches[item.FI].guest_team = item.NA;          // 客队名
                            matches[item.FI].guest_odds = getOddsById(item.ID, filtered_odds);  // 客队胜，赔率
                            matches[item.FI].analyse_url = item.EX || '';         // 两队历史数据
                        }
                        
                    })
    
                    // console.log(filtered)
                    
                    for(let item in matches){

                        let match = matches[item];
                        
                        setTimeout(()=>{

                            // 保存比赛信息
                            Game.findOrCreate({
                                where: {
                                    bet365_id: match.bet365_id
                                }, 
                                defaults: {
                                    host_team: match.host_team, 
                                    guest_team: match.guest_team,
                                    begin_time: match.begin_time,
                                    analyse_url: match.analyse_url,
                                    created_time: match.created_time,
                                    bet365_id: match.bet365_id,
                                    bet365_category_id: bet365_category_id
                                }
                            })
                            .spread((game, created) => {
                                count++;
                                // console.log(game);
                                if(count == categoryArr.length){
                                    resolve(matches);
                                }
                            })
                            .catch((err)=>{
                                count++;
                                if(count == categoryArr.length){
                                    resolve(matches);
                                }
                            });

                            // 保存赔率信息
                            Odds.create({
                                host_odds: match.host_odds,
                                guest_odds: match.guest_odds,
                                equal_odds: match.equal_odds,
                                bet365_id: match.bet365_id,
                                created_time: match.created_time
                            })
                        }, 3500 * index);
                    }
                    
                });
            }, 3500*index);

        })
        
    })
}



task1('A11313').then(task2).then(task3).then(task4).catch((err)=>{
    console.log('final err' + err);
});