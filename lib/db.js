var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var JSONFormat = require('json-format');
var Class = require('aimee-class');
var db = module.exports = Class.create();

// 读取数据
db.get = function(url){
    var data;
    data = require(url);
    data.__proto__ = db.prototype;
    return data;
}

// 包装数据
db.set = function(data){
    data.__proto__ = db.prototype;
    return data;
}

// For data
// @example data.save()
db.include({

    // 写入持久化存储
    save: function(fn){
        var dataString, charset;
        charset = 'utf-8';
        lib.mkdir(this.dirname);
        dataString = JSONFormat(this, {type: 'space', size: 2});
        fn ?
            // 异步
            fs.writeFile(this.filename, dataString, charset, fn):
            // 同步
            fs.writeFileSync(this.filename, dataString, charset);
    }
})
