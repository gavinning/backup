var $ = require('thenjs');
var db = require('./plugs/db');
var task = require('./plugs/task');
var time = require('./plugs/time');
var backup = require('./lib/backup');

// 开始备份操作
exports.start = function(url){

    this
        // 获取配置文件信息
        .get(url)
        // 处理备份时间信息
        .pipe(time())
        // 处理备份数据库信息
        .pipe(db())
        // 处理备份任务信息
        .pipe(task())
        // 完成备份
        .done()
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

// 流处理数据
exports.pipe = function(handler){
    this.config = handler(this.config);
    return this;
}

// 执行数据备份
exports.done = function(){
    console.log('  ==> 创建备份任务...')
    console.log('  ==> 任务id: ', this.config.db.version)
    console.log('  ==> 任务名称: ', this.config.name)
    console.log('  ==> 任务数量: ', this.config.list.length)
    console.log('  ==> 开始处理任务队列...\n')

    // 串行执行Task列表
    $(this.config.list)
        .eachSeries(null, function(next, task, i){
            console.log('    ======> 当前任务名称：', task.name)
            console.log('    ======> 当前任务序列：', i+1)
            console.log('    ======> 当前任务类型：', task.type === 'add' ? '增量更新' : '全量备份')

            // 单个Task反馈
            backup.start(task, function(err){
                next()
            })
        })
        .then(function(next){
            // 存储数据库
            exports.config.db.save()
            console.log('  ==> 全部任务队列处理完毕...')
            console.log('  ==> 备份任务结束.\n')
        })
        // 失败信息
        .fail(function(error){
            throw error;
        })}

exports.start('./task.json')
