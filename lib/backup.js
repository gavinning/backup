var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var $ = require('thenjs');
var Map = require('./map');
var Class = require('aimee-class');
var ProgressBar = require('progress');
var Backup = Class.create();
var map = Map.instance();


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
        console.log('add backup type.')
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
    full: function(fn){
        var arr, bar;
        var backup = this;

        // 查找需要备份的文件，并Map
        this.config.strict ?
            arr = this.findMapStrict():
            arr = this.findMap();

        console.log('    ======> 备份文件数量：', arr.length)
        console.log('    ======> 开始', this.config.name, '备份任务...')


        // 创建备份进度条
        bar = new ProgressBar('    Backuping [:bar] :percent :etas', {
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
                            console.log('    ======>', backup.config.name, '备份完成\n')
                        }
                        map.add(item.dest, buffer)
                        // 执行下一个文件备份
                        next(null, buffer);
                    }
                })
            })
            .then(function(next){
                // TODO: 处理 fn 告诉TM 该任务已完成
                map.done(backup.config)
                fn()
            })
            // 失败信息
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
        return lib.dirAll(
            this.config.source,
            {
                deep: true,
                // filterFile: [],
                // filterFolder: []
                // 设置需要过滤的文件和文件夹
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
