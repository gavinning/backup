this
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

this
    .get(url)
    .pipe(time())
    .pipe(task())
    .pile(find())
    .pipe(plan())
    .pipe(map())
    .pipe(backup())
    .done()

{
    filename,
    dirname,

    filepath: {
        size: size,
        dest: dest,
        mtime: mtime
    },

    md5: filepath
}
