path = require('path');

module.exports = function(){
    return task
}

// 处理任务相关信息
function task(config){
    task.get(config);

    // 更新数据本次备份信息
    config.db.version = task.id();
    config.db.versions.push(config.db.version);
    config.time.lastModified = config.time;

    // 更新任务信息列表
    config.list.forEach(function(target){
        // 任务id
        target.id = config.db.version;
        // 任务模式，严格或宽松
        target.strict = target.strict || config.strict;
        // 任务文件夹名
        target.basename = path.basename(target.source);
        // 任务名
        target.name = target.name || target.basename;
        // 任务目标地址
        target.target = path.join(task.dirname(), target.id, target.basename);
        // 任务文件Map列表
        target.map = path.join(task.dirname(), config.MAPFILENAME.replace('.json', '.' + target.basename + '.json'))
        // 任务过滤规则
        target.filter ?
            target.filter = config.filter.concat(target.filter):
            target.filter = config.filter;

        // 检查是否已存在早期备份
        // 已存在则执行增量备份
        // 不存在则执行全量备份
        config.db.versions.length > 1 ?
            target.type = 'add' : target.type = 'full';

    })
    return config
}

task.get = function(config){
    this.config = config;
}

task.id = function(){
    return this.config.time.replace(/:/g, '').replace(' ', '-')
}

// Task路径
task.dirname = function(){
    return path.join(this.config.target, this.config.name);
},

// Task配置文件
task.filename = function(){
    return path.join(this.dirname(), this.config.CONFIGFILENAME || '.backup.json');
}
