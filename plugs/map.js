var lib = require('linco.lab').lib;

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
    arr.forEach(function(item){
        list.push({
            src: item,
            // Map dest url
            dest: path.join(target, path.relative(source, item))
        })
    })
    return list;
}

module.exports = function(){
    return map
}
