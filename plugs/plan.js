var Map = require('../lib/map');
var lib = require('linco.lab').lib;

function plan(config){
    var src = path.join(config.db.dirname, config.__config.map || '.map.json')
    var map = Map.instance(src)
    // 任务更新算法
    config.list.forEach(function(task){
        var contrast;
        // 全量更新
        if(task.type === 'full'){
            task.diff = task.dest;
            task.same = [];
        }
        // 增量更新
        else{
            contrast = diff(task.dest, map);
            // 需要备份的的文件
            task.diff = contrast.diff;
            // 需要硬链接的文件
            task.same = contrast.same;
        }
        task.map = map.get();
    })
    return config;
}

module.exports = function(){
    return plan
}

// 备份算法
function diff(arr, map){
    var same = [], diff = [];
    arr.forEach(function(file){
        map.isBacup(file) ?
            same.push(file) : diff.push(file)
    })
    return {
        "same": same,
        "diff": diff
    }
}
