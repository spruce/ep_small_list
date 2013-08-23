var padManager = require('ep_etherpad-lite/node/db/PadManager');
exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {
    var padstring = "<h3>List of pads</h3>";
    var pads = padManager.listAllPads().padIDs;
    pads = pads.sort();
    padstring += "<ul>";
    pads.forEach(function(item){
        padstring += '<li><a href="p/' + item + '">' + item + '</a></li>';
    });
    padstring += "</ul>";
    args.content += padstring

    return cb();
}
