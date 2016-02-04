#Backup2
备份，时光机，支持定时任务定期备份，第一次全量备份，以后都是增量备份，占用磁盘空间少

### Install
```
npm i backup2 --save
```

### Example
```js
var path = require('path');
var task = require('backup2');
```
**备份 backup**  
```js
task.backup.start(path.join(__dirname, 'task.json'))
```
**定时备份 backup**  
```js
// 默认单位为天，建议2小时以上
// 当前方法定时任务周期不能超过20天，详情请参考帮助文档
// 如果有需求要建立大于20天的定时任务，请参考帮助文档
task.backup.time(1).start(path.join(__dirname, 'task.json'))
```

**恢复 restore**  
```js
// @taskId 每个备份任务都会生成taskId, taskId也是恢复任务的依据
task.restore.start(taskId, path.join(__dirname, 'task.json'))
```


### 配置文件 ``task.json``
```js
{
    // * 任务名称
    "name": "defaultTask",
    // 全局生效的过滤规则，参考 glob 语法
    "filter": [".git/**", ".svn/**"],
    // * 备份的到这里
    "target": "/Users/someone/BACKUP/",
    // * 备份任务列表
    "list": [
        {
            // 单个任务的过滤规则
            "filter": ["*.md"],
            // * 任务目标路径，这个文件夹将会被备份
            "source": "/Users/someone/Documents/test"
        }
    ]
}
```

### More
backup2核心功能是备份，自带定时任务功能本身比较弱，如果需要更专业的定时任务推荐使用下面的方式  
1、可以使用系统级定时任务来做  
2、推荐使用 [node-schedule](https://github.com/node-schedule/node-schedule)
或 [later](https://github.com/bunkat/later)
