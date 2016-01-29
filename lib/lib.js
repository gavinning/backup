var color = require('bash-color');
var lib = module.exports = require('linco.lab').lib;

var map = {
    "0": "  ==>",
    "1": "    ====>",
    "2": "      ======>"
}

lib.extend({

    log: function(){
        var arr;
        arr = [].slice.call(arguments, 0);
        arr.unshift('log');
        log.apply(this, arr);
    },

    error: function(){
        var arr;
        arr = [].slice.call(arguments, 0);
        arr.unshift('error');
        log.apply(this, arr);
    }
})

function log(type, lv, title, colorMsg){
    var arr = [].slice.call(arguments, 4);
    var msg = [];

    map[lv] ? msg.push(color.black(map[lv], true)) : msg.push(color.black(map[0], true));
    title ? msg.push(title) : '';
    if(colorMsg)
        type === 'log' ? msg.push(color.green(colorMsg)) : ''
        type === 'error' ? msg.push(color.red(colorMsg)) : ''
        type === 'warn' ? msg.push(color.yellow(colorMsg)) : ''
    arr.length ? msg.push(arr.join(' ')) : '';

    console.log(msg.join(' '))
}
