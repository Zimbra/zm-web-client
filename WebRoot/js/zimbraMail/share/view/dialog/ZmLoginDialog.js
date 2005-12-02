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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmLoginDialog(parent, zIndex, className) { 

    className = className || "ZmLoginDialog";
    DwtComposite.call(this, parent, className, DwtControl.ABSOLUTE_STYLE);

    this._origClassName = className;
    this._xparentClassName = className + "-Transparent";
    this.setBounds(0, 0, "100%", "100%");
    var htmlElement = this.getHtmlElement();
    htmlElement.style.zIndex = zIndex || Dwt.Z_DIALOG;
    htmlElement.className = className;
    this.setVisible(false);
    var unameId = Dwt.getNextId();
	var pwordId = Dwt.getNextId();
	var okCellId = Dwt.getNextId();
	var errorCellId = Dwt.getNextId();
	var reloginModeId = Dwt.getNextId();
    var form = document.createElement("form");
    form.innerHTML = this._createHtml(unameId, pwordId, okCellId, errorCellId, reloginModeId);
    htmlElement.appendChild(form);
    this._errorCell = document.getElementById(errorCellId);
    
    this._unameField = document.getElementById(unameId);
	Dwt.setHandler(this._unameField, DwtEvent.ONKEYPRESS, ZmLoginDialog._keyPressHdlr);
    this._unameField._parentId = this._htmlElId;
    
    this._pwordField = document.getElementById(pwordId);
    this._pwordField._parentId = this._htmlElId;
	Dwt.setHandler(this._pwordField, DwtEvent.ONKEYPRESS, ZmLoginDialog._keyPressHdlr);
    
    this._reloginModeField = document.getElementById(reloginModeId);
    this.setReloginMode(false);
    
    this._loginButton = new DwtButton(this, null, "DwtButton contrast");
    this._loginButton.setText(ZmMsg.login);
    this._loginButton.setData("me", this);
    this._loginButton.addSelectionListener(new AjxListener(this, this._loginSelListener));
    document.getElementById(okCellId).appendChild(this._loginButton.getHtmlElement());
}

ZmLoginDialog.prototype = new DwtComposite;
ZmLoginDialog.prototype.constructor = ZmLoginDialog;

ZmLoginDialog.prototype.toString = 
function() {
	return "ZmLoginDialog";
}

ZmLoginDialog.prototype.registerCallback =
function(func, obj) {
	this._callback = new AjxCallback(obj, func);
}

ZmLoginDialog.prototype.clearAll =
function() {
	this._unameField.value = this._pwordField.value = "";
	this._pubCompField.checked = false;
}

ZmLoginDialog.prototype.clearPassword =
function() {
	this._pwordField.value = "";
}

ZmLoginDialog.prototype.setError =
function(errorStr) {
	this.setCursor("default");
	var htmlArr = new Array();
	var i = 0;
	if (errorStr && errorStr.length) {
		htmlArr[i++] = "<table align=center class='ZmLoginDialog-ErrorPanel'>";
		htmlArr[i++] = "<tr><td>";
		htmlArr[i++] = AjxImg.getImageHtml("Critical_32");
		htmlArr[i++] = "</td>";
		htmlArr[i++] = "<td class='ZmLoginDialog-ErrorText'>" + errorStr + "</td></tr></table>";
	} else {
		htmlArr[i++] = "&nbsp;";
	}
	this._errorCell.innerHTML = htmlArr.join("");
}

ZmLoginDialog.prototype.setFocus =
function(username, bReloginMode) {
	if (this._unameField.value.length > 0) {
		this._pwordField.focus();
	} else {
		// if we're in relogin mode but cant find a username, 
		// throw exception to force new login
		this._unameField.disabled = false;
		if (bReloginMode) {
			if (username && username.length) {
				this._unameField.value = username;
				this._unameField.disabled = true;
			} else {
				// remove the checkbox, but leave the error message
				this.setReloginMode(false); 
			}
		}
	    this._unameField.focus();
	}
 }

ZmLoginDialog.prototype.setVisible = 
function(visible, transparentBg) {
	DwtComposite.prototype.setVisible.call(this, visible);
	Dwt._ffOverflowHack(this._htmlElId, this.getZIndex(), null, visible);
	if (!visible)
		return;
		
	this.setCursor("default");
	if ((transparentBg == null || !transparentBg) && this._className != this._origClassName) {
		this.getHtmlElement().className = this._origClassName;
		this._className = this._origClassName;
	} else if (transparentBg && this._className != this._xparentClassName) {
		this.getHtmlElement().className = this._xparentClassName;
		this._className = this._xparentClassName;
	}

}

// TODO: Rewrite this using box model rather than tables
ZmLoginDialog.prototype._createHtml = 
function(unameId, pwordId, okCellId, errorCellId, reloginModeId) {
	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td>";
	html[i++] = "<table align=center border=0 cellspacing=0 cellpadding=0 style='width:447px; border: 2px solid; border-color: #C7C7C7 #3E3E3E #3E3E3E #C7C7C7;'>";
	html[i++] = "<tr><td colspan=10 bgcolor='#FFFFFF'><div class='ZmLoginDialog-HeaderPanel'></div></td></tr>";
	html[i++] = "<tr><td>";
	html[i++] = "<table border=0 width=100% class='ZmLoginDialog-MainPanel'>";
	html[i++] = "<tr><td colspan=3 id='" + errorCellId + "'>&nbsp;</td></tr>";
	html[i++] = "<tr height=40><td width=100 align=right>" + ZmMsg.username + ":</td>";
	html[i++] = "<td colspan=2><input type=text tabIndex=1 class='ZmLoginDialog-Field' id='" + unameId + "'></td>";
	html[i++] = "</tr><tr height=30>";
	html[i++] = "<td align=right width=100>" + ZmMsg.password + ":</td>";
	html[i++] = "<td colspan=2><input type=password tabIndex=2 class='ZmLoginDialog-Field' id='" + pwordId + "'></td>";
	html[i++] = "</tr><tr height=40>";
	html[i++] = "<td></td>";
	html[i++] = "<td valign=top><table border=0 width=100%><tr>";
	html[i++] = "<td width=100% id='" + reloginModeId + "'></td>";
	html[i++] = "<td id='" + okCellId + "'></td>";
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr></table>";
	html[i++] = "</td></tr></table>";
	html[i++] = "</td></tr></table>";

	return html.join("");
}

ZmLoginDialog.prototype._addChild =
function(child, childHtmlElement) {
    this._children.add(child);
}

ZmLoginDialog.prototype.setReloginMode = 
function(bReloginMode, app, obj) {

	var modeId = Dwt.getNextId();
	this._unameField.disabled = bReloginMode;
	
	if (bReloginMode) {
		this._reloginModeField.innerHTML =  "<a id='" + modeId + "' href='javascript:;'>" + ZmMsg.loginAsDiff + "</a>";
		var anchor = document.getElementById(modeId);
		Dwt.setHandler(anchor, DwtEvent.ONCLICK, ZmLoginDialog._loginDiffListener);
		anchor._app = app;
		anchor._obj = obj;
		anchor._parent = this;
	} else {
		var html = new Array();
		var i = 0;
		html[i++] = "<table border=0 cellspacing=0 cellpadding=0 width=100%>";
		html[i++] = "<tr><td width=1><input type=checkbox id='" + modeId + "'/></td>";
		html[i++] = "<td valign=middle>" + ZmMsg.publicComputer + "</td></tr></table>";
		this._reloginModeField.innerHTML = html.join("");

	    this._pubCompField = document.getElementById(modeId);
	    this._pubCompField._parentId = this._htmlElId;
	}
}

ZmLoginDialog.prototype._loginSelListener =
function(selEvt) {
	this.setCursor("wait");
	var username = this._unameField.value;
	if (!(username && username.length)) {
		this.setError(ZmMsg.enterUsername);
		return;
	}
	
	if (this._callback)
		this._callback.run([username, this._pwordField.value, this._pubCompField.checked]);
}

ZmLoginDialog._keyPressHdlr =
function(ev) {
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		var obj = DwtUiEvent.getTarget(ev);
		var doc = obj.document ? obj.document : ((obj.ownerDocument)? obj.ownerDocument : window.document);
		var parent = Dwt.getObjectFromElement(document.getElementById(obj._parentId));
		if (obj == parent._unameField) {
			parent._pwordField.focus();
		} else {
			if (parent._callback) {
				parent.setCursor("wait");
				parent._callback.run([parent._unameField.value, parent._pwordField.value, parent._pubCompField.checked]);
			}
		}
		return false;
	}
	return true;
}

ZmLoginDialog._loginDiffListener =
function(ev) {
	ZmZimbraMail.logOff();
	return;
};
