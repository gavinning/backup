var color = require('bash-color');
var lib = require('linco.lab').lib;
var ProgressBar = require('progress');

function plan(config){
    // 任务更新算法
    config.list.forEach(function(task){
        // 创建Checking进度条
        var bar = new ProgressBar('  ' + color.cyan('Checking') +'   [:bar] :percent :etas', {
            complete: '=',
            incomplete: '-',
            width: 40,
            total: task.dest.length
        });

        // 全量更新
        if(task.type === 'full'){
            task.diff = task.dest;
            task.same = [];
        }
        // 增量更新
        else{
            task.diff = [];
            task.same = [];
            // 检查Map后的文件
            task.dest.forEach(function(file){
                // 是否已备份
                var dest = config.map.isBackup(file.src);
                !dest ?
                    // 推入diff数组准备执行备份
                    task.diff.push(file):
                    // 推入same数组准备执行硬链接
                    task.same.push({
                        src: dest,
                        dest: file.dest
                    })
                bar.tick();
            })
        }
    })
    return config;
}

module.exports = function(){
    return plan
}
