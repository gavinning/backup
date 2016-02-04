var path = require('path');
var db = require('./db');
var lib = require('linco.lab').lib;
var __config = require('../config');

exports.start = function(id, url){
    var list = [];
    var config = require(url);
    config.db = db.get(getURL(config));

    config.list.forEach(function(task){
        list.push({
            target: task.source,
            source: path.join(config.db.dirname, id, path.basename(task.source))
        })
    })

    lib.delete(list[0].target, function(err){
        if(err){
            throw err;
        }
        lib.cp(list[0].source, list[0].target, function(err){
            console.log(id, 'Recovery finished.')
        })
    })
}

// 用于获取配置文件
exports.get = function(url){
    try{
        this.config = require(url).backupTask
    }
    catch(e){
        throw e;
    }
    return this;
}

// 获取数据库文件地址
function getURL(config){
    return path.join(config.target, config.name, __config.backup);
}
