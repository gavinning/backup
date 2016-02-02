var fs = require('fs');
var path = require('path');
var md5 = require('md5');
var db = require('./db');
var Class = require('aimee-class');
var Buffer = require('buffer').Buffer;
var Map = module.exports = Class.create();

Map.include({
    __init: function(url){
        this.url = url;
        this.map = db.get(url);
    },

    // 以MD5记录文件Map
    add: function(buffer, dest){
        this.map[md5(buffer)] = dest;
    },

    get: function(key){
        return key ?
            this.map[key] : this.map;
    },

    isBackup: function(source){
        try{
            var target = this.map[md5(fs.readFileSync(source))];
            return target ? target : false;
        }
        catch(e){
            throw e;
        }
    },

    md5: function(url){
        return md5(fs.readFileSync(url))
    },

    // 写Map到文件
    save: function(){
        this.map.save()
    }
})
