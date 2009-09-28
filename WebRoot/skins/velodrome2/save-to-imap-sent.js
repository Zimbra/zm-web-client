//
// Application launch methods
//

VelodromeSkin.prototype._saveToImapSent_handlePreStartup = function() {
	appCtxt.set(ZmSetting.SAVE_TO_IMAP_SENT, true);
};

// register app listeners

ZmZimbraMail.addListener(
	ZmAppEvent.PRE_STARTUP, new AjxListener(skin, skin._saveToImapSent_handlePreStartup)
);
