var path = require('path');
var sql = require('../lib/db');

// 处理数据库相关信息
function db(config){

    // 尝试获取从文件读取数据
    try{
        config.CONFIGFILENAMEPATH = getUrl(config);
        config.db = sql.get(config.CONFIGFILENAMEPATH);
    }
    // 读取失败则初始化数据
    catch(e){
        config.db = sql.set({
            versions: [],
            time: {
                created: config.time,
                lastModified: config.time
            },
            filename: config.CONFIGFILENAMEPATH,
            dirname: path.dirname(config.CONFIGFILENAMEPATH)
        })
    }
    return config;
}

module.exports = function(){
    return db
}

// 获取数据库文件地址
function getUrl(config){
    return path.join(config.target, config.name, config.CONFIGFILENAME);
}
