function LmClientCmdHandler(appCtxt) {
	this._appCtxt = appCtxt;
	this._settings = new Object();
}

LmClientCmdHandler.prototype.execute =
function(argv) {
	if (!argv || !argv[0]) return ;
	var arg0 = argv[0].toLowerCase();
	if (arg0 == "debug") {
		if (!argv[1]) return;
		if (argv[1] == "t") {
			var on = DBG._showTiming;
			var newState = on ? "off" : "on";
			alert("Turning debug timing info " + newState);
			DBG.showTiming(!on);
		} else {
			var arg = Number(argv[1]);
			var level = LsDebug.DBG[arg];
			if (level) {
				alert("Setting Debug to level:" + level);
				DBG.setDebugLevel(level);
			} else {
				alert("Invalid debug level");
			}
		}
	}  else if (arg0 == "debug_use_div"){
		if (!argv[1]) {
			alert('enter true or false');
			return;
		}
		var arg = argv[1].toLowerCase();
		if (arg == 'true') {
			DBG.setUseDiv(true);
		} else {
			DBG.setUseDiv(false);
		}
		alert('set use div to ' + ((arg == 'true')? 'true': 'false'));
	} else if (arg0 == "support") {
		if (!argv[1]) return;
		var feature = argv[1].toUpperCase();
		var setting = "LmSetting." + feature + "_ENABLED"
		var id = eval(setting);
		var on = this._appCtxt.get(id);
		if (on == undefined) {
			alert("No such setting: " + setting);
			return;
		}
		var newState = on ? "off" : "on";
		alert("Turning " + feature + " support " + newState);
		this._settings[id] = !on;
		this._appCtxt.getAppController().restart(this._settings);
	}
}
