/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
