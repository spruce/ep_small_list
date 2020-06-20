var padManager = require('ep_etherpad-lite/node/db/PadManager');
var settings = require('ep_etherpad-lite/node/utils/Settings');

const sortmodes = {
    CREATION: 'creation',
    LASTCHANGE: 'lastchange'
}

var sortmode = sortmodes.CREATION;

if (settings.ep_small_list) {
    if (settings.ep_small_list.sortmode) {
      sortmode = settings.ep_small_list.sortmode.trim().toLowerCase() === sortmodes.LASTCHANGE ? sortmodes.LASTCHANGE : sortmodes.CREATION;
      console.log("ep_small_list setting sortmode: " + sortmode);
    }
}

exports.eejsBlock_indexWrapper = function(hook_name, args, cb) {
    args.content += '<div id="small_list"></div><script src="./static/js/jquery.js"></script><script>$(function () { $("#small_list").load("./small_list"); });</script>';
};

exports.registerRoute = function(hook_name, args, cb) {
  args.app.get("/small_list", function(req, res) {
    padManager.listAllPads().then(function(pads) {
      createList(pads).then(function(html){
        res.send(html);
      });
    });
  });
};

async function createList(data){
  let dataCache = [];
  if(data && data.padIDs){
    for (var i = 0; i < data.padIDs.length; i++) {
      let padData = {};
      let padID = data.padIDs[i];

      const pad = await padManager.getPad(padID);
      if (!pad) {
        continue;
      }
      const lastEdit = await pad.getLastEdit();
      padData.lastChange = lastEdit;

      padData.html = '<li><a href="./p/' + padID + '">' + padID + '</li>';
      padData.createIndex = i;

      dataCache.push(padData);
    }
  }

  dataCache.sort(function (a, b) {
    let indicator = 0;
    if(sortmode === sortmodes.CREATION) {
      indicator = a.createIndex - b.createIndex;
    } else {
       // sortmodes.LASTCHANGE
      indicator = a.lastChange - b.lastChange;
    }
    return indicator;
  });

  let r = "<ul>";
  r += dataCache.map(x => x.html).join("");
  r += "</ul>";
  return r;
}
