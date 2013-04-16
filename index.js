var padManager = require('ep_etherpad-lite/node/db/PadManager');
exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {

	
	padstring = "";
	
    pads = padManager.listAllPads().padIDs;
    pads = pads.sort();
    pads.forEach(function(item){
    	padstring += '<a href="/p/' + item + '">' + item + '</a><br>';
    });
    args.content += padstring
/*<% pads.forEach(function (pad) { %>
          <div class="pad"><a href="/public/<%= pad.toString() %>"><%= pad.toString() %></a></div>
       <% }) %>*/
  return cb();
}
