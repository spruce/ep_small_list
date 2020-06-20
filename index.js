var padManager = require('ep_etherpad-lite/node/db/PadManager');
var db = require('ep_etherpad-lite/node/db/DB').db;
var settings = require('ep_etherpad-lite/node/utils/Settings');

const sortmodes = {
    CREATION: 'creation',
    LASTCHANGE: 'lastchange'
}

const orders = {
    NORMAL: 'normal',
    REVERSE: 'reverse'
}


var sortmode = sortmodes.CREATION;
var order = orders.NORMAL;
var limit = 0;

if (settings.ep_small_list) {
    if (settings.ep_small_list.sortmode) {
      sortmode = settings.ep_small_list.sortmode.trim().toLowerCase() === sortmodes.LASTCHANGE ? sortmodes.LASTCHANGE : sortmodes.CREATION;
      console.log("ep_small_list setting sortmode: " + sortmode);
    }
    if (settings.ep_small_list.order) {
      order = settings.ep_small_list.order.trim().toLowerCase() === orders.REVERSE ? orders.REVERSE : orders.NORMAL;
      console.log("ep_small_list setting order: " + order);
    }
    if (settings.ep_small_list.limit) {
      let settingsValue = parseInt(settings.ep_small_list.limit, 10);
      if(Number.isNaN(settingsValue) || !Number.isFinite(settingsValue) ||  settingsValue < 0){
        settingsValue = 0;
      }
      limit = settingsValue;
      console.log("ep_small_list setting limit: " + limit);
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
      let title = padID;

      const pad = await padManager.getPad(padID);
      if (!pad) {
        continue;
      }
      const lastEdit = await pad.getLastEdit();
      padData.lastChange = lastEdit;
      
      // support for ep_set_title_on_pad
      db.get("title:"+padID, function(err, value){
        if(!err && value) {
          title = value;
        }
      });

      padData.html = '<li><a href="./p/' + padID + '">' + title + '</li>';
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
  
  if(order === orders.REVERSE) {
    dataCache.reverse();
  }

  if(limit > 0 && dataCache.length > limit) {
    dataCache.length = limit;
  }

  let r = "<ul>";
  r += dataCache.map(x => x.html).join("");
  r += "</ul>";
  return r;
}
