var fs = require('fs');
var path = require('path');
var $ = require('thenjs');
var color = require('bash-color');
var lib = require('linco.lab').lib;
var ProgressBar = require('progress');

function backup(config, fn){
    $(config.list)
        .eachSeries(null, function(next, task){
            // 创建Checking进度条
            var bar = new ProgressBar('  ' + color.cyan('Backuping') +'  [:bar] :percent :etas', {
                complete: '=',
                incomplete: '-',
                width: 40,
                total: task.same.length + task.diff.length
            });

            // Do link
            task.same.forEach(function(file){
                lib.mkdir(path.dirname(file.dest));
                fs.linkSync(file.src, file.dest);
                bar.tick();
            })

            // Do copy
            $(task.diff)
                .eachSeries(null, function(cont, file, i){
                    var list = [];

                    if(lib.isDir(file.src)){
                        lib.mkdir(file.dest);
                        cont(null)
                    }
                    if(lib.isFile(file.src)){
                        // 创建父级文件夹
                        lib.mkdir(path.dirname(file.dest))
                        // 开始复制文件
                        fs.createReadStream(file.src)
                            .on('data', function(chunk){
                                list.push(chunk)
                            })
                            .on('end', function(){
                                config.map.add(Buffer.concat(list), file.dest);
                                bar.tick();
                                cont(null);
                            })
                            .on('error', function(err){
                                cont(err)
                            })
                            // 写入目标文件
                            .pipe(fs.createWriteStream(file.dest))

                    }
                })
                .then(function(){
                    next(null)
                })
                .fail(function(err){
                    next(err)
                })
        })
        .then(function(){
            fn(null)
        })
        .fail(function(err){
            fn(err)
        })
}

module.exports = function(){
    return backup
}
