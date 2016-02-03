var Class = require('aimee-class');
var color = require('bash-color');
var Linkage = require('./lib/linkage');
var lib = require('./lib/lib');
var plugs = require('./plugs');
var MinTime = (1000 * 60 * 10);
var Backup = Class.create(Linkage);
var app = Backup.instance();

app.start = function(url){
    this
        // 配置文件
        .get(url)
        // 备份版本
        .pipe(plugs.time(this._time))
        // 数据库
        .pipe(plugs.db())
        // 格式化任务
        .pipe(plugs.task())
        // 查找备份文件
        .pipe(plugs.find())
        // Map备份文件
        .pipe(plugs.map())
        // 备份算法
        .pipe(plugs.diff())
        // Do backup
        .dest(plugs.backup(), done)
}

// 定时任务
app.timer = function(time, url){
    this._time = time;
    this.start(url);
    try{
        setInterval(function(){
            app.start(url)
        }, time)
    }
    catch(e){
        console.log(e.message)
    }
}

/**
 * 启动备份任务
 * @param   {String}  url 配置文件路径
 * @example this.start('./task.json')
 */
exports.start = function(url){
    this._time ?
        app.timer(this._time, url) : app.start(url)
}

/**
 * 设定定时任务时间
 * @param   {Number}  time 定时任务时间，默认单位 天
 * @example this.time(1).start(url)
 */
exports.time = function(time){
    time = time || 1;
    time = time * (1000 * 60 * 60 * 24);
    // 最小定时任务为10分钟
    if(time < MinTime){
        console.log(color.red('Error: 定时备份时间必须大于 10 分钟，建议为 2 小时或更高'))
        process.exit(1)
    }
    else{
        this._time = time;
    }
    return this;
}

// 定时任务完成回调
function done(err, config){
    if(err){
        throw err;
    }
    else{
        // 存储备份信息
        config.db.save();
        // 存储备份文件信息
        config.map.save();
        // 备份结束时间
        config.STOP = (new Date()).getTime();
        // 备份耗时
        config.lastTime = config.STOP - config.START + 'ms';
        lib.log(0, 'Finished', config.name, 'after', color.purple(config.lastTime), '\n');
    }
}
