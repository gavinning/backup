var $ = require('thenjs');
var color = require('bash-color');
var nicetime = require('a-nice-time');
var db = require('./plugs/db');
var task = require('./plugs/task');
var find = require('./plugs/find');
var plan = require('./plugs/plan');
var map = require('./plugs/map');
var time = require('./plugs/time');
var backup = require('./lib/backup');
var lib = require('./lib/lib');
var MinTime = (1000 * 60 * 10);

// 开始备份操作
exports._start = function(url){
    var st, Countdown = 0;

    // 按秒计时
    Countdown = this._delay/1000;

    if(Countdown > 0){
        lib.log(0, null, Countdown)
        st = setInterval(function(){
            Countdown--;
            lib.log(0, null, Countdown)
            if(Countdown === 1){
                clearInterval(st)
            }
        }, 1000)
    }

    // Delay or no
    setTimeout(function(){
        // 记录开始时间
        exports._startTime = new Date().getTime();
        // 启动备份任务
        exports
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
    }, this._delay || 0)


    // 启动定时备份
    if(
        // 检查是否已启动定时备份
        !this._timer &&
        // 检查是否存在定时任务时间
        this._time &&
        // 检查定时任务时间合法性
        lib.isNumber(this._time) &&
        // 检查定时任务时间合法性
        this._time >= MinTime
    ){
        // 标记定时任务启动
        this._timer = true;
        // 启动定时备份任务
        timer(this._time, url)
    }
    return this;
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
exports._done = function(){
    lib.log(0, 'Create backup task...');
    lib.log(0, 'Task id:', this.config.db.version);
    lib.log(0, 'Task name:', this.config.name);
    lib.log(0, 'Loop task:', this._time ? nicetime.about_this_much(this._time/1000) : '0');
    lib.log(0, 'Number of tasks:', this.config.list.length);
    lib.log(0, 'Start processing the task queue...\n');

    // 串行执行Task列表
    $(this.config.list)
        .eachSeries(null, function(next, task, i){
            lib.log(1, 'Start', task.name);
            lib.log(1, 'task', 'No.' + (i+1));
            lib.log(1, 'task type:', task.type === 'add' ? 'Incremental' : 'Full');

            // 单个Task反馈
            backup.start(task, function(err){
                next(err)
            })
        })
        .then(function(next){
            var lastTime;
            // 记录结束时间
            exports._lastTime = new Date().getTime();
            lastTime = exports._lastTime - exports._startTime + 'ms';
            // 存储数据库
            exports.config.db.save();
            lib.log(0, 'Finished', exports.config.name, 'after', color.purple(lastTime), '\n');
        })
        // 失败信息
        .fail(function(error){
            throw error;
        })
}

// 定时备份
exports.time = function(time){
    // 默认单位为1天
    time > 0 ?
        time = time * (1000 * 60 * 60 * 24): time = 0;

    // 最小定时任务为10分钟
    if(time < MinTime){
        console.log(color.red('error: 定时备份时间必须大于' + nicetime(MinTime/1000) + '分钟，建议为2小时或更高'))
        process.exit(1)
    }
    else{
        this._time = time;
    }
    return this;
}

// 延迟第一次任务启动时间
exports.delay = function(time){
    time > 1000 ?
        this._delay = time : this._delay = 5000;
    return this;
}

// 定时器
function timer(time, url){
    setInterval(function(){
        exports.start(url)
    }, time || 8.64e+7)
}

exports.start = function(url){
    this
        // Get config
        .get(url)
        // Get version
        .pipe(time())
        // Get db
        .pipe(db())
        // Parse task
        .pipe(task())
        // Find files
        .pipe(find())
        // Map files
        .pipe(map())
        // Handle plan
        .pipe(plan())
        .done()
}

exports.done = function(){
    console.log(this.config.list[0].diff)
    console.log(this.config.list[0].same)
}

exports.start('./task.json')
// exports.delay(3000).time(2/24).start('./task.json')
