var lib = require('linco.lab').lib;

module.exports = function(timer){
    return function(config){
        config.time = lib.now();
        config.loopTime = timer || 0;
        config.START = (new Date()).getTime();
        lib.log(0, 'Loop task:', config.loopTime ? config.loopTime + '天' : '0');
        return config;
    }
}
