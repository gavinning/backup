var $ = require('thenjs');
var color = require('bash-color');
var nicetime = require('a-nice-time');
var lib = require('./lib/lib');
var plugs = require('./plugs');
var color = require('bash-color');
var MinTime = (1000 * 60 * 10);
var Class = require('aimee-class');
var Backup = Class.create();

exports.start = function(url){
    var backup = Backup.instance();
    backup.start(url);
    if(this._time){
        setInterval(function(){
            backup.start(this._time, url)
        }, this._time)
    }
}
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

// 定时器
function timer(time){
    setInterval(function(){
        exports.start()
    }, time || 8.64e+7)
}

Backup.include({
    start: function(time, url){
        if(!url){
            url = time;
            time = 0;
        }

        this
            // 配置文件
            .get(url)
            // 备份版本
            .pipe(plugs.time(time))
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
            .done(plugs.backup())
    },

    done: function(handler){
        var config = this.config;
        handler(config, function(err){
            if(err){
                throw err;
            }
            else{
                config.db.save();
                config.map.save();
                config.STOP = (new Date()).getTime();
                config.lastTime = config.STOP - config.START + 'ms';
                lib.log(0, 'Finished', config.name, 'after', color.purple(config.lastTime), '\n');
            }
        })
    },

    // 用于获取配置文件
    get: function(url){
        lib.log(0, 'Create backup task...');
        try{
            this.config = require(url).backupTask
        }
        catch(e){
            throw e;
        }
        lib.log(0, 'Task name:', this.config.name);
        lib.log(0, 'Number of tasks:', this.config.list.length);
        return this;
    },

    // 流处理数据
    pipe: function(handler){
        this.config = handler(this.config);
        return this;
    }
})
