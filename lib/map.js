var fs = require('fs');
var path = require('path');
var md5 = require('md5');
var db = require('./db');
var Class = require('aimee-class');
var Map = module.exports = Class.create();

Map.include({
    __init: function(){
        this.map = {}
    },

    // 以MD5记录文件Map
    add: function(filepath, buffer){
        if(buffer)
            this.map[md5(buffer)] = filepath;
    },

    get: function(url){
        return db.get(url)
    },

    // 写Map到文件
    save: function(url){
        // 设置文件基础信息，db需要这些来查找存储位置
        this.map.filename = url;
        this.map.dirname = path.dirname(url);
        // 存储Map
        db.set(this.map).save();
    }
})
