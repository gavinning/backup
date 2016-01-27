var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var db = require('./db');
var pm = require('thenjs');
var Class = require('aimee-class');
var ProgressBar = require('progress');
var Backup = Class.create();

Backup.include({
    // 增量备份
    add: function(){

    },

    /**
     * 全量备份
     * 严格模式下会备份所有文件，只过滤 .DS_Store 和 __MACOSX
     * 非严格模式会过滤以.开头的文件和文件夹，eg: .git/**, .svn/**, .gitignore
     * @param   {[type]}   strict [description]
     * @param   {Function} fn     [description]
     * @return  {[type]}          [description]
     * @example [example]
     */
    full: function(strict, fn){
        var arr, bar;
        var backup = this;

        // 检查是否执行严格模式备份
        if(lib.isFunction(strict)){
            fn = strict;
            strict = false;
        }

        // 查找需要备份的文件，并Map
        strict ?
            arr = this.findMapStrict():
            arr = this.findMap();

        // 创建备份进度条
        bar = new ProgressBar('  Backuping [:bar] :percent :etas', {
            complete: '=',
            incomplete: '-',
            width: 40,
            total: arr.length
        });

        pm()
            // 串行执行备份
            .eachSeries(arr, function(next, item){
                // 备份文件到指定地址
                backup.stream(item.src, item.dest, function(err, buffer){
                    if(err){
                        next();
                        fn(err);
                    }
                    else{
                        next();
                        fn(null, buffer);
                        bar.tick();
                        // 检查备份是否完成
                        if(bar.complete){
                            console.log('\n  Backup complete\n');
                        }
                    }
                })
            })
            .fail(function(error){
                throw error;
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
                // 监听chunk
                .on('data', function(chunk){
                    list.push(chunk)
                })
                // 监听end事件，执行callback
                .on('end', function(){
                    fn(null, Buffer.concat(list))
                })
                // 监听error事件，执行callback
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

    // 查找备份文件列表，非严格模式
    find: function(){
        return lib.dir(path.join(this.config.source, '**'), this.config.filter)
    },

    // 查找备份文件列表，严格模式
    findStrict: function(){
        return lib.dirAll(
            this.config.source,
            {
                deep: true,
                // filterFile: [],
                // filterFolder: []
                filterFile: ['.DS_Store'],
                filterFolder: ['__MACOSX']
            }
        )
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

    // Find and Map
    findMap: function(){
        return this.map(this.find());
    },

    // Find and Map 严格模式
    findMapStrict: function(){
        var data = this.findStrict();
        return this.map(data.files.concat(data.folders));
    }
})

exports.start = function(config, fn){
    var backup = new Backup;
    backup.config = config;
    backup.full(true, fn);
}
