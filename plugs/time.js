var lib = require('linco.lab').lib;

function time(config){
    config.time = lib.now();
    return config;
}

module.exports = function(){
    return time
}
