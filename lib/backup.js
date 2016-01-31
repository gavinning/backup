var fs = require('fs');
var path = require('path');
var color = require('bash-color');
var lib = require('linco.lab').lib;
var $ = require('thenjs');
var md5 = require('md5');
var Map = require('./map');
var Class = require('aimee-class');
var ProgressBar = require('progress');
var Backup = Class.create();

// Backup start
exports.start = function(task, fn){
    var backup;
    // 创建备份Task
    backup = new Backup;
    backup.config = task;

    // 根据备份类型开始备份任务
    backup[task.type](fn);
}

// 备份相关
Backup.include({
    // 增量备份
    add: function(fn){
        var backup = this;
        this.diff(function(err, same, diff){
            if(err){
                fn(err)
            }
            else{
                // 文件修改记录为空，不做任何操作
                if(diff.length === 0){
                    lib.log(1, null, backup.config.name, 'is no change')
                    lib.log(1, null, backup.config.name, 'done\n')
                    fn(null)
                }
                // 文件有修改，做增量备份
                else{
                    // TODO: 1. fs.link
                    // TODO: 2. map.save()
                    $(function(next){
                        backup.link(same, next)
                    })
                    .then(function(next){
                        backup.backup(diff, next)
                    })
                    .then(function(){
                        fn(null)
                    })
                    .fail(function(err){
                        fn(err)
                    })
                }
            }
        })
    },

    link: function(arr, fn){
        $(arr)
            .eachSeries(null, function(next, item){
                // 创建父级文件夹
                lib.mkdir(path.dirname(item.dest))
                fs.linkSync(item.src, item.dest)
                next()
            })
            .then(function(){
                fn(null)
            })
            .fail(function(err){
                fn(err)
            })
    },

    // 检查文件自上次备份之后是否有新的修改
    diff: function(fn){
        var arr, bar, diff = [], same = [];
        var map = Map.instance(this.config.map);
        var mapData = map.get();

        // 查找需要备份的文件，并Map
        this.config.strict ?
            arr = this.findMapStrict():
            arr = this.findMap();

        // 创建Checking进度条
        bar = new ProgressBar('    ' + color.cyan('Checking') +'  [:bar] :percent :etas', {
            complete: '=',
            incomplete: '-',
            width: 40,
            total: arr.length
        });

        $(arr)
            // 串行对比MD5
            .eachSeries(null, function(next, item){
                var list = [], md5string;
                // 显示Checking进度条
                bar.tick();
                // 检查文件
                if(lib.isFile(item.src)){
                    if(md5string = map.isBackup(item.src)){
                        same.push({
                            src: mapData[md5string],
                            dest: item.dest
                        })
                    }
                    else{
                        diff.push(item)
                    }
                    next()
                }
                // 跳过文件夹
                if(lib.isDir(item.src)){
                    next()
                }
            })
            .then(function(next){
                fn(null, same, diff)
            })
            // 失败信息
            .fail(function(error){
                throw error
            })
    },

    /**
     * 全量备份
     * 严格模式下会备份所有文件，只过滤 .DS_Store 和 __MACOSX
     * 非严格模式会过滤以.开头的文件和文件夹，eg: .git/**, .svn/**, .gitignore
     * @example this.full(fn)
     */
    full: function(fn){
        var arr;

        // 查找需要备份的文件，并Map
        this.config.strict ?
            arr = this.findMapStrict():
            arr = this.findMap();

        // 打印文件长度日志
        lib.log(1, 'Number of files:', arr.length);
        // 备份文件
        this.backup(arr, fn);
    },

    // 备份文件
    backup: function(arr, fn){
        var backup = this;
        var map = Map.instance(this.config.map);
        // 创建备份进度条
        var bar = new ProgressBar('    ' + color.cyan('Backuping') +' [:bar] :percent :etas', {
            complete: '=',
            incomplete: '-',
            width: 40,
            total: arr.length
        });

        $(arr)
            // 串行执行备份
            .eachSeries(null, function(next, item){
                // 备份文件到指定地址
                backup.stream(item.src, item.dest, function(err, buffer){
                    if(err){
                        next(err);
                    }
                    else{
                        // 显示备份进度条
                        bar.tick();
                        // 检查备份是否完成
                        if(bar.complete){
                            lib.log(1, null, backup.config.name, 'done\n');
                        }
                        map.add(item.dest, buffer)
                        // 执行下一个文件备份
                        next(null, buffer);
                    }
                })
            })
            .then(function(next){
                map.save()
                fn(null)
            })
            // 失败信息
            .fail(function(error){
                fn(error)
            })
    },

    /**
     * 复制文件
     * @param   {String}   source 源
     * @param   {String}   target 目标
     * @param   {Function} fn     @err, @data
     * @example [example]
     */
    stream: function(source, target, fn){
        var list = [];
        // 复制文件
        if(lib.isFile(source)){
            // 创建父级文件夹
            lib.mkdir(path.dirname(target))
            // 开始复制文件
            fs.createReadStream(source)
                .on('data', function(chunk){
                    list.push(chunk)
                })
                .on('end', function(){
                    fn(null, Buffer.concat(list))
                })
                .on('error', function(err){
                    fn(err)
                })
                // 写入目标文件
                .pipe(fs.createWriteStream(target))
        }
        // 复制文件夹
        if(lib.isDir(source)){
            lib.mkdir(target);
            fn(null);
        }
    },

    /**
     * 查找备份文件列表，非严格模式
     * @return  {Array}  返回查找到的文件及文件夹
     * @example this.find() // => [filepath, filepath...]
     */
    find: function(){
        return lib.dir(path.join(this.config.source, '**'), this.config.filter)
    },

    /**
     * 查找备份文件列表，严格模式
     * @return  {Object}  返回查找到的文件及文件夹
     * @example this.findStrict() // => {files: [], folders: []}
     */
    findStrict: function(){
        return lib.dir(path.join(this.config.source, '**'), {dot: true, filter: this.config.filter})
    },

    /**
     * Map arr
     * @param   {Array}   arr  需要Map的数组
     * @param   {String}  dest 需要连接的路径
     * @return  {Array}        Map的数组
     * @example this.map([1], 'a/b') // => [{src: 1, dest: 'a/b/1'}]
     */
    map: function(arr){
        var list = [];
        var backup = this;
        arr.forEach(function(item){
            list.push({
                src: item,
                // Map dest url
                dest: path.join(backup.config.target, path.relative(backup.config.source, item))
            })
        })
        return list;
    },

    /**
     * Find and Map
     * @return  {Array}  返回Map后的数据
     * @example this.findMap() // => [{src: '/a/b', dest: '/a/c'}]
     */
    findMap: function(){
        return this.map(this.find());
    },

    /**
     * Find and Map 严格模式
     * @return  {Array}  返回Map后的数据
     * @example this.findMapStrict() // => [{src: '/a/b', dest: '/a/c'}]
     */
    findMapStrict: function(){
        var data = this.findStrict();
        return this.map(data.files.concat(data.folders));
    }
})
