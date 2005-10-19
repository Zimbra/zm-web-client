/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmSplashScreen(shell, imageInfo, className) {
 	className = className || "ZmSplashScreen";
 	ZmBaseSplashScreen.call(this, shell, imageInfo, className);
}

ZmSplashScreen.prototype = new ZmBaseSplashScreen;
ZmSplashScreen.prototype.constructor = ZmSplashScreen;

ZmSplashScreen.prototype.getDefaultSubstitutions = function (){
	if (ZmSplashScreen._defaultSubstitutions == null) {
		ZmSplashScreen._defaultSubstitutions = {
			url:ZmMsg.splashScreenZimbraUrl,
			shortVersion: "BETA",
			appName: ZmMsg.splashScreenAppName,
			// version is not used 
			// version : "Some version",
			contents: AjxBuffer.concat("<br>", ZmMsg.splashScreenLoading, "<br><br>", AjxImg.getImageHtml("BarberPole_216")),
			license: ZmMsg.splashScreenCopyright	
		}
	}
	return ZmSplashScreen._defaultSubstitutions;
};
