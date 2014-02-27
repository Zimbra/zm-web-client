(function(){
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
					assertiveness = A11yUtil.SAY_RUDELY;
					label = AjxMsg.criticalMsg;
					break;

				case ZmStatusView.LEVEL_WARNING:
					assertiveness = A11yUtil.SAY_ASSERTIVELY;
					label = AjxMsg.warningMsg;
					break;

				case ZmStatusView.LEVEL_INFO:
				default:
					assertiveness = A11yUtil.SAY_POLITELY;
					label = AjxMsg.infoMsg;
					break;
			}
			A11yUtil.say(label + ': ' + A11yUtil.stripHTML(msg, true), assertiveness);
		}
	});

})();
