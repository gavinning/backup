var path = require('path');
var db = require('../lib/db');
var __config = require('../config');


// 处理数据库相关信息
module.exports = function(){
    return function(config){
        config.__config = __config;
        // 尝试获取从文件读取数据
        config.db = db.get(getURL(config));
        // 检查数据是否正确
        if(!config.db.time){
            config.db.versions = [];
            config.db.time = {
                created: config.time,
                lastModified: config.time
            };
        }
        return config;
    }
}

// 获取数据库文件地址
function getURL(config){
    return path.join(config.target, config.name, __config.backup);
}
