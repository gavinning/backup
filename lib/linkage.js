var Class = require('aimee-class');
var Linkage = module.exports = Class.create();

Linkage.include({
    // 用于获取配置文件
    get: function(url){
        try{
            this.stream = require(url)
        }
        catch(e){
            throw e;
        }
        return this;
    },

    // 流处理数据
    pipe: function(handler){
        this.stream = handler(this.stream);
        return this;
    },

    // 结果处理
    dest: function(handler, fn){
        handler(this.stream, fn)
    }
})
