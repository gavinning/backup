exports.start = function(url){
    require('./lib/task').start(require(url))
}

// For test
exports.start('./config')

// =========
/*

var backup = require('backup2');

// eg1
backup.start('./config');


// eg2
backup.watch('./config');


// logs
backup: 备份进程启动
backup: 共两个任务：t1, t2
backup: t1任务开始
backup: 增量备份类型
backup: 对比备份文件开始
backup: 本次备份文件：
a1,
a2,
a3,
a4
backup: 开始备份


process start
two task
task 1 start | type: add
.......................
task 1 end

task 2 start | type: full
.......................
task 2 end

all task is end
 */
