(function(){
	var util = comcast.access.util;

	// we could also wrap ZmToast::popup() -- but we consider the
	// delay a rendering detail better left to the screen reader
	skin.override.append('ZmStatusView.prototype.setStatusMsg', function(params) {
		if (!params.mute) {
			var msg = AjxUtil.isString(params) ? params : params.msg,
				level = AjxUtil.isString(params) ? ZmStatusView.LEVEL_INFO : params.level,
				assertiveness,
				label;

			switch (level) {
				case ZmStatusView.LEVEL_CRITICAL:
					assertiveness = util.SAY_RUDELY;
					label = AjxMsg.criticalMsg;
					break;

				case ZmStatusView.LEVEL_WARNING:
					assertiveness = util.SAY_ASSERTIVELY;
					label = AjxMsg.warningMsg;
					break;

				case ZmStatusView.LEVEL_INFO:
				default:
					assertiveness = util.SAY_POLITELY;
					label = AjxMsg.infoMsg;
					break;
			}
			util.say(label + ': ' + util.stripHTML(msg, true), assertiveness);
		}
	});

})();
