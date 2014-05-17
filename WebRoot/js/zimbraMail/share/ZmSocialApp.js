/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the social application.
 * @class
 * This class represents the social application.
 *
 * @param	{DwtControl}	container		the container
 *
 * @extends		ZmApp
 */
ZmSocialApp = function(container) {
	ZmApp.call(this, ZmApp.SOCIAL, container);
}

ZmSocialApp.prototype = new ZmApp;
ZmSocialApp.prototype.constructor = ZmSocialApp;

ZmSocialApp.prototype.isZmSocialApp = true;
ZmSocialApp.prototype.toString = function() {	return "ZmSocialApp"; };

//
// Constants
//

ZmApp.SOCIAL                        = ZmId.APP_SOCIAL;
ZmApp.CLASS[ZmApp.SOCIAL]		    = "ZmSocialApp";
ZmApp.SETTING[ZmApp.SOCIAL]		    = ZmSetting.SOCIAL_ENABLED;
ZmApp.UPSELL_SETTING[ZmApp.SOCIAL]	= ZmSetting.SOCIAL_EXTERNAL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.SOCIAL]	    = 100;

ZmSocialApp.prototype._registerApp = function() {
	ZmApp.registerApp(ZmApp.SOCIAL, {
		nameKey:            "communityName",
		icon:               "Globe",
		chooserTooltipKey:  "goToSocial",
		chooserSort:        32,
		defaultSort:        100,
		upsellUrl:			ZmSetting.SOCIAL_EXTERNAL_URL
	});

	// overwrite community name with value from settings, if any
	var appName = appCtxt.get(ZmSetting.SOCIAL_NAME);
	if (appName) {
		ZmMsg[ZmApp.NAME[this._name]] = appName;
	}
};

// User has clicked refresh button
ZmSocialApp.prototype.runRefresh = function() {

	var mainCtlr = appCtxt.getAppController(),
		communityView = mainCtlr._appIframeView[ZmApp.SOCIAL];

	if (communityView) {
		communityView.runRefresh();
	}
};
