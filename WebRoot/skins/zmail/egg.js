skin.__egg_switchImage = function() {
	var el = document.getElementById("ImgAppBanner");
	if (el) Dwt.addClass(el, "ImgEggBanner");
};
skin.__egg_handleActivateApp = function() {
	var handler = appCtxt.getClientCmdHandler();
	if (!handler.execute_zmail) {
		handler.execute_zmail = skin.__egg_switchImage;
	}
	appCtxt.getAppController().removeListener(ZmAppEvent.ACTIVATE, skin.__egg_activateAppListener);
};

if (window.ZmZimbraMail) {
	skin.__egg_activateAppListener = new AjxListener(skin, skin.__egg_handleActivateApp);
	ZmZimbraMail.addListener(ZmAppEvent.ACTIVATE, skin.__egg_activateAppListener);
}