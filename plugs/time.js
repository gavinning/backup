var lib = require('linco.lab').lib;
var nicetime = require('a-nice-time');

module.exports = function(time){
    return function(config){
        config.time = lib.now();
        config.loopTime = time || 0;
        config.START = (new Date()).getTime();
        lib.log(0, 'Task name:', config.name);
        lib.log(0, 'Loop task:', nicetime.about_this_much(config.loopTime/1000));
        return config;
    }
}
