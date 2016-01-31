var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;

// 查找需要备份的文件
function find(config){
    config.list.forEach(function(task){
        task.files = lib.dir(path.join(task.source, '**'), task.filter)
    })
    return config;
}

module.exports = function(){
    return find
}
