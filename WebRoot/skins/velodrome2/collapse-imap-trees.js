//
// Application launch methods
//

VelodromeSkin.prototype._collapseImapTrees_handlePreStartup = function() {
	appCtxt.set(ZmSetting.COLLAPSE_IMAP_TREES, true);
};

// register app listeners

ZmZimbraMail.addListener(
	ZmAppEvent.PRE_STARTUP, new AjxListener(skin, skin._collapseImapTrees_handlePreStartup)
);
