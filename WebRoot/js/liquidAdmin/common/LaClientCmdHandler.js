function LaClientCmdHandler(appCtxt) {
	this._appCtxt = appCtxt;
	this._settings = new Object();
}

LaClientCmdHandler.DBG = new Object();
LaClientCmdHandler.DBG[0] = LsDebug.DBG_NONE;
LaClientCmdHandler.DBG[1] = LsDebug.DBG1;
LaClientCmdHandler.DBG[2] = LsDebug.DBG2;
LaClientCmdHandler.DBG[3] = LsDebug.DBG3;

LaClientCmdHandler.prototype.execute =
function(argv) {
	if (argv[0] && argv[0].toLowerCase() == "debug") {
		if (!argv[1]) return;
		if (argv[1] == "t") {
			var on = DBG._showTiming;
			var newState = on ? "off" : "on";
			alert("Turning debug timing info " + newState);
			DBG.showTiming(!on);
		} else {
			var arg = Number(argv[1]);
			var level = LaClientCmdHandler.DBG[arg];
			if (level) {
				alert("Setting Debug to level:" + level);
				DBG.setDebugLevel(level);
			} else {
				alert("Invalid debug level");
			}
		}
	} 
}