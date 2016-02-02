var path = require('path');
var color = require('bash-color');
var lib = require('linco.lab').lib;
var ProgressBar = require('progress');

// Map需要备份的文件
function map(config){
    config.list.forEach(function(task){
        task.dest = Map(task.files, task.source, task.target)
    })
    return config;
}

/**
 * Map arr
 * @param   {Array}   arr    需要Map的数组
 * @param   {String}  source 需要连接的路径
 * @param   {String}  target 需要连接的路径
 * @return  {Array}          Map的数组
 */
function Map(arr, source, target){
    var list = [];
    // 创建Checking进度条
    var bar = new ProgressBar('  ' + color.cyan('FindMaping') +' [:bar] :percent :etas', {
        complete: '=',
        incomplete: '-',
        width: 40,
        total: arr.length
    });
    arr.forEach(function(item){
        // 过滤文件夹
        if(lib.isFile(item)){
            list.push({
                src: item,
                // Map dest url
                dest: path.join(target, path.relative(source, item))
            })
        }
        bar.tick();
    })
    return list;
}

module.exports = function(){
    return map
}
