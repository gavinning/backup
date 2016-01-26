var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var JSONFormat = require('json-format');
var Class = require('aimee-class');
var db = module.exports = Class.create();

db.get = function(config){
    var now, data;
    try{
        data = require(path.join(config.target, 'package.json'));
        data.__proto__ = db.prototype;
        return data;
    }
    // 创建初始备份数据
    catch(e){
        now = lib.now();
        lib.mkdir(config.target);
        return {
            source: config.source,
            target: config.target,
            db: path.join(config.target, 'package.json'),
            time: {
                created: now,
                lastModified: now
            },
            logs: {},
            versions: [],
            __proto__: db.prototype
        }
    }
}

db.include({
    // 更新数据
    update: function(version, time, msg){
        this.version = version;
        this.versions.push(this.version);
        this.time[this.version] = time || lib.now();
        this.logs[this.version] = {
            user: process.env.USER,
            msg: msg || 'auto msg'
        }
        return this;
    },
    
    // 写入持久化存储
    save: function(){
        fs.writeFile(
            this.db,
            JSONFormat(this, {type: 'space', size: 2}),
            function(err){
                err ?
                    console.log('error:', err.message):
                    console.log('data is saved.')
            }
        )
    }
})
