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
    add: function(buffer, filepath){
        this.map[md5(buffer)] = filepath;
    },

    /**
     * 返回map数据 or
     * 根据key返回value
     * @param   {String}  key md5 | empty
     * @return  {String}      filepath | map
     * @example this.get() // => map
     * @example this.get('md5string') // => filepath
     */
    get: function(key){
        return key ?
            this.map[key] : this.map;
    },

    /**
     * 检查当前文件路径是否已备份
     * @param   {String}  source  文件路径
     * @return  {Boolean}         true | false
     * @example this.isBackup(./app.js)
     */
    isBackup: function(source){
        try{
            var target = this.map[this.md5(source)];
            return target ? target : false;
        }
        catch(e){
            throw e;
        }
    },

    // 返回文件md5
    md5: function(url){
        return md5(fs.readFileSync(url))
    },

    // 写Map到文件
    save: function(){
        this.map.save()
    }
})
