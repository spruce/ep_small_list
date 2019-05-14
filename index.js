var padManager = require('ep_etherpad-lite/node/db/PadManager');
exports.eejsBlock_indexWrapper = function(hook_name, args, cb) {
    args.content += '<div id="small_list"></div><script src="./static/js/jquery.js"></script><script>$(function () { $("#small_list").load("./small_list"); });</script>';
};

exports.registerRoute = function(hook_name, args, cb) {
    args.app.get("/small_list", function(req, res) {
        padManager.listAllPads().then(function(data){
            r = "<ul>";
            for (var i = 0; i < data.padIDs.length; i++) {
                r += '<li><a href="./p/' + data.padIDs[i] + '">' + data.padIDs[i] + '</li>';
            }
            r += "</ul>";
            res.send(r);
        }).catch(function(err){
            r = "<div> Error:" + err + "</div>";
            res.send(r);
        });
    });
};
