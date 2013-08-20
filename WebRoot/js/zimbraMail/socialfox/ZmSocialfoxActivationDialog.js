/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
 * Creates a dialog for enabling Firefox sidebar
 * @constructor
 * @class
 * @author Rahul Shah
 *
 * @extends	DwtDialog
 */

ZmSocialfoxActivationDialog = function() {

    var params = {
        parent : appCtxt.getShell(),
        className : "ZmSocialfoxActivationDialog",
        id : "ZmSocialfoxActivationDialog",
        title : ZmMsg.socialfoxSidebar
    };
    DwtDialog.call(this, params);

    // set content
    this.setContent(this._contentHtml());

    this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
};

ZmSocialfoxActivationDialog.prototype = new DwtDialog;
ZmSocialfoxActivationDialog.prototype.constructor = ZmSocialfoxActivationDialog;

ZmSocialfoxActivationDialog.prototype.toString =
function() {
    return "ZmSocialfoxActivationDialog";
};

/**
 * Gets the HTML that forms the basic framework of the dialog.
 *
 * @private
 */
ZmSocialfoxActivationDialog.prototype._contentHtml =
function() {
    // identifiers
    var id = this._htmlElId;
    // content html
    return AjxTemplate.expand("prefs.Pages#SocialfoxSettings", id);
};

ZmSocialfoxActivationDialog.prototype._okButtonListener =
function(ev) {
    var loc = location.href;
	var baseurl = loc.substring(0,loc.lastIndexOf('/'));

	var data = {
	  "name": ZmMsg.socialfoxServiceName,
	  "iconURL": baseurl + skin.hints.socialfox.iconURL,
	  "icon32URL": baseurl + skin.hints.socialfox.icon32URL,
	  "icon64URL": baseurl + skin.hints.socialfox.icon64URL,

	  // at least one of these must be defined
	  "workerURL": baseurl + "/js/zimbraMail/socialfox/ZmWorker.js?iconURL=" + skin.hints.socialfox.iconURL + "&mailIconURL=" + skin.hints.socialfox.mailIconURL,
	  "sidebarURL": baseurl+"/public/launchSidebar.jsp",

	  // should be available for display purposes
	  "description": ZmMsg.socialfoxServiceDescription,
	  "author": ZmMsg.socialfoxServiceAuthor,
	  "homepageURL": ZmMsg.socialfoxServiceHomepage,

	  // optional
	  "version": "1.0"
	}
	var event = new CustomEvent("ActivateSocialFeature");
	this._contentEl.setAttribute("data-service", JSON.stringify(data));
	this._contentEl.dispatchEvent(event);
    DwtDialog.prototype._buttonListener.call(this, ev);
};