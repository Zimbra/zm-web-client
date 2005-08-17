function LmLoginDialog(parent, zIndex, className, isAdmin) { 

    className = className || "LmLoginDialog";
    DwtComposite.call(this, parent, className, DwtControl.ABSOLUTE_STYLE);

	this._isAdmin = (isAdmin === true);	
	var doc = this.getDocument();
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
    var form = doc.createElement("form");
    form.innerHTML = this._createHtml(unameId, pwordId, okCellId, errorCellId, reloginModeId);
    htmlElement.appendChild(form);
    this._errorCell = Dwt.getDomObj(doc, errorCellId);
    
    this._unameField = Dwt.getDomObj(doc, unameId);
    this._unameField.onkeypress = LmLoginDialog._keyPressHdlr;
    this._unameField._parentId = this._htmlElId;
    
    this._pwordField = Dwt.getDomObj(doc, pwordId);
    this._pwordField._parentId = this._htmlElId;
    this._pwordField.onkeypress = LmLoginDialog._keyPressHdlr;
    
    this._reloginModeField = Dwt.getDomObj(doc, reloginModeId);
    this.setReloginMode(false);
    
    this._loginButton = new DwtButton(this, null, "DwtButton contrast");
    this._loginButton.setText(LmMsg.login);
    this._loginButton.setData("me", this);
    this._loginButton.addSelectionListener(new LsListener(this, this._loginSelListener));
    Dwt.getDomObj(doc, okCellId).appendChild(this._loginButton.getHtmlElement());
}

LmLoginDialog.prototype = new DwtComposite;
LmLoginDialog.prototype.constructor = LmLoginDialog;

LmLoginDialog.prototype.toString = 
function() {
	return "LmLoginDialog";
}

LmLoginDialog.prototype.registerCallback =
function(func, obj) {
	this._callback = new LsCallback(obj, func);
}

LmLoginDialog.prototype.clearAll =
function() {
	this._unameField.value = this._pwordField.value = "";
	this._pubCompField.checked = false;
}

LmLoginDialog.prototype.clearPassword =
function() {
	this._pwordField.value = "";
}

LmLoginDialog.prototype.setError =
function(errorStr) {
	this.setCursor("default");
	var htmlArr = new Array();
	var i = 0;
	if (errorStr && errorStr.length) {
		htmlArr[i++] = "<table align=center class='LmLoginDialog-ErrorPanel'>";
		htmlArr[i++] = "<tr><td>";
		htmlArr[i++] = LsImg.getImageHtml(LmImg.I_CRITICAL);
		htmlArr[i++] = "</td>";
		htmlArr[i++] = "<td class='LmLoginDialog-ErrorText'>" + errorStr + "</td></tr></table>";
	} else {
		htmlArr[i++] = "&nbsp;";
	}
	this._errorCell.innerHTML = htmlArr.join("");
}

LmLoginDialog.prototype.setFocus =
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

LmLoginDialog.prototype.setVisible = 
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
LmLoginDialog.prototype._createHtml = 
function(unameId, pwordId, okCellId, errorCellId, reloginModeId) {
	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td>";
	html[i++] = "<table align=center border=0 cellspacing=0 cellpadding=0 style='width:447px; border: 2px solid; border-color: #C7C7C7 #3E3E3E #3E3E3E #C7C7C7;'>";
	html[i++] = "<tr><td colspan=10 bgcolor='#FFFFFF'><div class='LmLoginDialog-HeaderPanel'></div></td></tr>";
	html[i++] = "<tr><td>";
	html[i++] = "<table border=0 width=100% class='LmLoginDialog-MainPanel'>";
	html[i++] = "<tr><td colspan=3 id='" + errorCellId + "'>&nbsp;</td></tr>";
	html[i++] = "<tr height=40><td width=100 align=right>" + LmMsg.username + ":</td>";
	html[i++] = "<td colspan=2><input type=text tabIndex=1 class='LmLoginDialog-Field' id='" + unameId + "'></td>";
	html[i++] = "</tr><tr height=30>";
	html[i++] = "<td align=right width=100>" + LmMsg.password + ":</td>";
	html[i++] = "<td colspan=2><input type=password tabIndex=2 class='LmLoginDialog-Field' id='" + pwordId + "'></td>";
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

LmLoginDialog.prototype._addChild =
function(child, childHtmlElement) {
    this._children.add(child);
}

LmLoginDialog.prototype.setReloginMode = 
function(bReloginMode, app, obj) {

	var modeId = Dwt.getNextId();
	this._unameField.disabled = bReloginMode;
	
	if (bReloginMode) {
		this._reloginModeField.innerHTML =  "<a id='" + modeId + "' href='javascript:;'>" + LmMsg.loginAsDiff + "</a>";
		var anchor = Dwt.getDomObj(this.getDocument(), modeId);
		anchor.onclick = LmLoginDialog._loginDiffListener;
		anchor._app = app;
		anchor._obj = obj;
		anchor._parent = this;
	} else {
		var html = new Array();
		var i = 0;
		html[i++] = "<table border=0 cellspacing=0 cellpadding=0 width=100%>";
		html[i++] = "<tr><td width=1><input type=checkbox id='" + modeId + "'/></td>";
		html[i++] = "<td valign=middle>" + LmMsg.publicComputer + "</td></tr></table>";
		this._reloginModeField.innerHTML = html.join("");

	    this._pubCompField = Dwt.getDomObj(this.getDocument(), modeId);
	    this._pubCompField._parentId = this._htmlElId;
	}
}

LmLoginDialog.prototype._loginSelListener =
function(selEvt) {
	this.setCursor("wait");
	var username = this._unameField.value;
	if (!(username && username.length)) {
		this.setError(LmMsg.enterUsername);
		return;
	}
	
	/* commenting this out due to default domain name support
	if (!this._isAdmin && !LmEmailAddress.isValid(username)) {
		this.setError(LmMsg.badUsername);
		return;
	}
	*/
	if (this._callback)
		this._callback.run([username, this._pwordField.value, this._pubCompField.checked]);
}

LmLoginDialog._keyPressHdlr =
function(ev) {
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		var obj = DwtUiEvent.getTarget(ev);
		var doc = obj.document ? obj.document : ((obj.ownerDocument)? obj.ownerDocument : window.document);
		var parent = Dwt.getObjectFromElement(Dwt.getDomObj(doc, obj._parentId));
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

LmLoginDialog._loginDiffListener =
function(ev) {
	LmLiquidMail.logOff();
	return;
};
