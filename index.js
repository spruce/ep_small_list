var padManager = require('ep_etherpad-lite/node/db/PadManager');
var db = require('ep_etherpad-lite/node/db/DB').db;
var settings = require('ep_etherpad-lite/node/utils/Settings');

const sortmodes = {
    DEFAULT: 'default',
    LASTCHANGE: 'lastchange'
}

const sortorders = {
    NORMAL: 'normal',
    REVERSE: 'reverse'
}


var sortmode = sortmodes.DEFAULT;
var sortorder = sortorders.NORMAL;
var limit = 0;

if (settings.ep_small_list) {
    if (settings.ep_small_list.sortmode) {
      sortmode = settings.ep_small_list.sortmode.trim().toLowerCase() === sortmodes.LASTCHANGE ? sortmodes.LASTCHANGE : sortmodes.DEFAULT;
      console.log("ep_small_list setting sortmode: " + sortmode);
    }
    if (settings.ep_small_list.sortorder) {
      sortorder = settings.ep_small_list.sortorder.trim().toLowerCase() === sortorders.REVERSE ? sortorders.REVERSE : sortorders.NORMAL;
      console.log("ep_small_list setting sortorder: " + sortorder);
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

exports.eejsBlock_indexWrapper = function(hook_name, args) {
    args.content += `
        <div id="small_list"></div>
        <script>
          document.addEventListener('DOMContentLoaded', async function() {
            const container = document.getElementById('small_list');
            if (!container) return;

            try {
              const response = await fetch('./small_list');
              if (!response.ok) {
                throw new Error('HTTP ' + response.status);
              }
              container.innerHTML = await response.text();
            } catch (error) {
              console.error('ep_small_list:', error);
            }
          });
        </script>
    `;
};

exports.registerRoute = function(hook_name, args, cb) {
  args.app.get("/small_list", function(req, res) {
    padManager.listAllPads().then(function(pads) {
      createList(pads).then(function(html){
        res.send(html);
      });
    }).catch(function(err) {
	res.send("<div> Error:" + err + "</div>"); 
    });
  });
  return cb();
};

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

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

      // support custom titles from ep_set_title_on_pad.
      try {
        const storedTitle = await db.get("title:" + padID);
        if (storedTitle) {
          title = storedTitle;
        }
      } catch (err) {
        console.error("ep_small_list: Could not read title for pad", padID, err);
      }

      padData.html = '<li><a href="./p/' +
        encodeURIComponent(padID) + '">' +
        escapeHtml(title) + '</a></li>';
      padData.createIndex = i;

      dataCache.push(padData);
    }
  }

  dataCache.sort(function (a, b) {
    let indicator = 0;
    if(sortmode === sortmodes.DEFAULT) {
      indicator = a.createIndex - b.createIndex;
    } else {
       // sortmodes.LASTCHANGE
      indicator = a.lastChange - b.lastChange;
    }
    return indicator;
  });
  
  if(sortorder === sortorders.REVERSE) {
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
