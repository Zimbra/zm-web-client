/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmLoginDialog = function(parent, className) {
	
    className = className || "ZmLoginDialog";
    DwtComposite.call(this, parent, className, DwtControl.ABSOLUTE_STYLE);
    this._origClassName = className;
    this._xparentClassName = className + "-Transparent";
    this.setBounds(0, 0, "100%", "100%");
    var htmlElement = this.getHtmlElement();
    htmlElement.style.zIndex = Dwt.Z_DIALOG + 1; // + 1 to keep appointment reminders underneath login dialog.
    htmlElement.className = className;
    this.setVisible(false);

	var params = ZLoginFactory.copyDefaultParams(ZmMsg);
	params.showPanelBorder = true;
	params.showForm = true;
	params.showUserField = true;
	params.showPasswordField = true;
	params.showLicenseMsg = true;
	params.showRememberMeCheckbox = false;
	params.showLogOff = true;
	params.logOffAction = "ZmLoginDialog._loginDiffListener()";
	params.loginAction = "ZmLoginDialog._loginListener(this)";
	params.showButton = true;

	var html = [];
	var idx = 0;
	html[idx++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td align='center' valign='center'>";
	html[idx++] = ZLoginFactory.getLoginDialogHTML(params);
	html[idx++] = "</td></tr></table>";
	htmlElement.innerHTML = html.join("");

    this.setReloginMode(false);
};

ZmLoginDialog.prototype = new DwtComposite;
ZmLoginDialog.prototype.constructor = ZmLoginDialog;

ZmLoginDialog.prototype.toString = 
function() {
	return "ZmLoginDialog";
};

ZmLoginDialog.prototype.registerCallback =
function(func, obj, args) {
	this._callback = new AjxCallback(obj, func, args);
};

ZmLoginDialog.prototype.clearAll =
function() {
	ZLoginFactory.get(ZLoginFactory.USER_ID).value = "";
	ZLoginFactory.get(ZLoginFactory.PASSWORD_ID).value = "";
};

ZmLoginDialog.prototype.clearPassword =
function() {
	ZLoginFactory.get(ZLoginFactory.PASSWORD_ID).value = "";
};

ZmLoginDialog.prototype.setError =
function(errorStr) {
	if (errorStr && errorStr.length) {
		ZLoginFactory.showErrorMsg(errorStr);
	} else {
		ZLoginFactory.hideErrorMsg();
	}
};

ZmLoginDialog.prototype.setFocus =
function(username, bReloginMode) {
	ZLoginFactory.showUserField(username);
	this.setReloginMode(username && username.length && bReloginMode);
};

ZmLoginDialog.prototype.setVisible = 
function(visible, transparentBg) {
	this.applyCaretHack();
	DwtComposite.prototype.setVisible.call(this, visible);

	// Disable keyboard nav for re-login dialog
	var kbm = appCtxt.getKeyboardMgr();
	if (kbm) {
		if (visible) {
		   	if (kbm.isEnabled()) {
   				kbm.enable(false);
   				this._kbnavDisabled = true;
   			}
		} else {
   		    if (this._kbnavDisabled) {
		    	kbm.enable(true);
		    	this._kbnavDisabled = false;
		    }
		}
	}
   	
	if (!visible) return;
		
	this.setCursor("default");
	if ((transparentBg == null || !transparentBg) && this._className != this._origClassName) {
		this.getHtmlElement().className = this._origClassName;
		this._className = this._origClassName;
	} else if (transparentBg && this._className != this._xparentClassName) {
		this.getHtmlElement().className = this._xparentClassName;
		this._className = this._xparentClassName;
	}

	Dwt.setHandler(this.getHtmlElement(), DwtEvent.ONKEYDOWN, ZLoginFactory.handleKeyPress);
};

ZmLoginDialog.prototype.addChild =
function(child, childHtmlElement) {
    this._children.add(child);
};

ZmLoginDialog.prototype.setReloginMode = 
function(bReloginMode) {
	bReloginMode ? ZLoginFactory.showLogOff() : ZLoginFactory.hideLogOff();
	ZLoginFactory.get(ZLoginFactory.USER_ID).disabled = bReloginMode;
};

ZmLoginDialog.prototype._loginSelListener =
function() {
	this.setCursor("wait");
	var username = ZLoginFactory.get(ZLoginFactory.USER_ID).value;
	if (!(username && username.length)) {
		this.setError(ZmMsg.enterUsername);
		return;
	}
	if (this._callback) {
		var password = ZLoginFactory.get(ZLoginFactory.PASSWORD_ID).value;
		var rememberMe = appCtxt.rememberMe();
		this._callback.run(username, password, rememberMe);		
	}
};

ZmLoginDialog._loginListener =
function(target) {
	// Get the dialog instance.
	var element = target;
	while (element) {
		var object = Dwt.getObjectFromElement(element);
		if (object instanceof ZmLoginDialog) {
			object._loginSelListener();
			break;
		}
		element = element.parentNode;
	}
};

ZmLoginDialog._loginDiffListener =
function(ev) {
	ZmZimbraMail.logOff();
};
