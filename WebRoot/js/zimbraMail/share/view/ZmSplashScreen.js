/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmSplashScreen(shell, imageInfo, className) {
 	className = className || "ZSplashScreen";
 	ZmBaseSplashScreen.call(this, shell, imageInfo, className);
}

ZmSplashScreen.prototype = new ZmBaseSplashScreen;
ZmSplashScreen.prototype.constructor = ZmSplashScreen;

ZmSplashScreen.prototype.getHtml = 
function() {
	var params = ZLoginFactory.copyDefaultParams(ZmMsg);
	params.showForm = false;
	params.showLicenseMsg = true;
	params.showLoading = true;
	return ZLoginFactory.getLoginDialogHTML(params);
}
