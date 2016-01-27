var fs = require('fs');
var path = require('path');
var $ = require('thenjs');
var lib = require('linco.lab').lib;
var db = require('./db');
var backup = require('./backup');
var Class = require('aimee-class');
var Task = Class.create();
// Task配置文件名
var TMFilename = '.backup.json';


// Task启动入口
exports.start = function(tasklist){
    // 串行执行Task列表
    $(tasklist.backupList)
        .eachSeries(null, function(next, item){
            // 建立Task
            var task = new Task;
            task.config = item;
            task.start(function(err, buffer){
                // 开始下一个任务
                next()
            });
        })
        .then(function(next){
            next()
        })
        // 失败信息
        .fail(function(error){
            throw error;
        })
}

// 数据相关
Task.include({
    // Task start
    start: function(fn){
        this.create();
        backup.start(this.task(), fn);
    },

    // 初始化备份数据库
    init: function(){
        var data = {};

        // 获取config基础信息
        data.config = this.config;
        // Task根路径
        data.dirname = path.join(this.config.target, this.config.name);
        // Task配置文件
        data.filename = path.join(data.dirname, TMFilename);
        // 版本列表
        data.versions = [];

        data.time = {};
        data.time.created = lib.now();
        data.time.lastModified = lib.now();

        return data;
    },

    // Task信息
    task: function(){
        if(this.__task){
            return this.__task
        }
        else{
            // Base infomation
            this.__task = {};
            this.__task.id = this.id();
            this.__task.time = lib.now();
            this.__task.dirname = path.join(this.dirname(), this.__task.id);

            // Extend from this.config
            this.__task.filter = this.config.filter;
            this.__task.strict = this.config.strict;
            this.__task.source = this.config.source;
            this.__task.target = path.join(this.__task.dirname, path.basename(this.config.source));

            // 检查备份类型
            lib.isFile(this.filename()) ?
                this.__task.type = 'add':
                this.__task.type = 'full';

            // 返回Task信息
            return this.__task;
        }
    },

    // 创建Task
    create: function(){
        var data = this.db();
        var task = this.task();

        // 更新备份版本号
        data.version = task.id;
        // 版本库记录当前Task版本号
        data.versions.push(data.version);
        // 更新版本修订时间
        data.time.lastModified = task.time;
        // 记录当前Task信息
        data.time[task.id] = task;
        // 存储到数据库
        data.save();
        // 返回最新数据
        return data;
    },

    // Task路径
    dirname: function(){
        return path.join(this.config.target, this.config.name);
    },

    // Task配置文件
    filename: function(){
        return path.join(this.dirname(), TMFilename);
    },

    // TaskId
    id: function(){
        return lib.now().replace(/:/g, '').replace(' ', '-')
    },

    db: function(){
        // 尝试读取数据库
        try{
            return db.get(this.filename())
        }
        // 读取失败则初始化数据库
        catch(e){
            data = this.init()
            return db.set(data)
        }
    }
})
