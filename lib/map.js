var fs = require('fs');
var path = require('path');
var md5 = require('md5');
var db = require('./db');
var Class = require('aimee-class');
var Map = module.exports = Class.create();

Map.include({
    __init: function(url){
        this.url = url;
        this.map = db.get(url);
    },

    // 以MD5记录文件Map
    add: function(filepath, buffer){
        if(buffer)
            this.map[md5(buffer)] = filepath;
    },

    get: function(url){
        return this.map;
    },

    isBackup: function(url){
        var mm = this.md5(url);
        return this.map[mm] ? this.map[mm] : false;
    },

    md5: function(url){
        return md5(fs.readFileSync(url))
    },

    // 写Map到文件
    save: function(){
        this.map.save()
    }
})
