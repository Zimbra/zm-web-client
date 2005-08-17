function LaLoginDialog(parent, zIndex, className, isAdmin) { 

    className = className || "LaLoginDialog";
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
	this.hiddenBtnId = Dwt.getNextId();
    var form = doc.createElement("form");
    form.innerHTML = this._createHtml(unameId, pwordId, okCellId, errorCellId);
    htmlElement.appendChild(form);
    this._errorCell = Dwt.getDomObj(doc, errorCellId);
    
   	doc._parentId = this._htmlElId;
   	
   	this._unameField = Dwt.getDomObj(doc, unameId);
    this._unameField._parentId = this._htmlElId;
    this._unameField.onfocus = LaLoginDialog.handleFieldFocus;
    
    this._pwordField = Dwt.getDomObj(doc, pwordId);
    this._pwordField._parentId = this._htmlElId;
    this._pwordField.onfocus = LaLoginDialog.handleFieldFocus;
    
    this._loginButton = new DwtButton(this, "", "LaLoginButton");
    this._loginButton.setText(LaMsg.login);
    this._loginButton.setData("me", this);
    this._loginButton.addSelectionListener(new LsListener(this, this._loginSelListener));
    
    this._okCell = Dwt.getDomObj(doc, okCellId);
	if (!LsEnv.isIE){
		this._hiddenBtn = document.createElement('input');
		this._hiddenBtn.type='submit';
		this._hiddenBtn.style.display="none";
		this._hiddenBtn.id = this.hiddenBtnId;
		this._hiddenBtn._parentId = this._htmlElId;
		this._okCell.appendChild(this._hiddenBtn);

	}    
	this._okCell.appendChild(this._loginButton.getHtmlElement());
//	this.setUpKeyHandlers();
}

LaLoginDialog.prototype = new DwtComposite;
LaLoginDialog.prototype.constructor = LaLoginDialog;

LaLoginDialog.prototype.toString = 
function() {
	return "LaLoginDialog";
}

LaLoginDialog.prototype.setUpKeyHandlers = 
function () {
	var doc = this.getDocument();
	this.handleKeyBoard = true;
  	if (LsEnv.isIE) {
//	  	DBG.println(LsDebug.DBG3, "IE. element ID: " + htmlElement.id);
  		doc.onkeydown = LaLoginDialog._keyPressHdlr;
  		this._unameField.onkeydown = LaLoginDialog._keyPressHdlr;
    	this._pwordField.onkeydown = LaLoginDialog._keyPressHdlr;
	} else {
		window.onkeypress = LaLoginDialog._keyPressHdlr;	
	  	this._unameField.onkeypress = LaLoginDialog._keyPressHdlr;	
    	this._pwordField.onkeypress = LaLoginDialog._keyPressHdlr;
		this._hiddenBtn.onkeypress = LaLoginDialog._keyPressHdlr;		   	
	}
}

LaLoginDialog.prototype.clearKeyHandlers = 
function () {
	this.handleKeyBoard = false;
	var doc = this.getDocument();
  	if (LsEnv.isIE) {
  		doc.onkeydown = null;
  		this._unameField.onkeydown = null;
    	this._pwordField.onkeydown = null;
	} else {
		window.onkeypress = null;	
	  	this._unameField.onkeypress = null;	
    	this._pwordField.onkeypress = null;
		this._hiddenBtn.onkeypress = null;		   	
	}
}


LaLoginDialog.handleFieldFocus = function (ev) {
	var obj = DwtUiEvent.getTarget(ev);
	var doc = obj.document ? obj.document : ((obj.ownerDocument)? obj.ownerDocument : window.document);
	var parent = Dwt.getObjectFromElement(Dwt.getDomObj(doc, obj._parentId));
	parent._loginButton.setActivated(false);	
}



LaLoginDialog.prototype.registerCallback =
function(func, obj) {
	this._callback = new LsCallback(obj, func);
}

LaLoginDialog.prototype.clearAll =
function() {
	this._unameField.value = this._pwordField.value = "";
}

LaLoginDialog.prototype.clearPassword =
function() {
	this._pwordField.value = "";
}

LaLoginDialog.prototype.setError =
function(errorStr) {
	this.setCursor("default");
	var html;
	if (errorStr && errorStr.length) {
		var htmlArr = new Array();
		var i = 0;
		htmlArr[i++] = "<table cellspacing='12' class='" + this._className + "-ErrorPanel'>";
		htmlArr[i++] = "<tr><td class='" + this._className + "-ErrorIcon'>";
		htmlArr[i++] = LsImg.getImageHtml(LaImg.I_CRITICAL);						
		htmlArr[i++] = "</td>";
		htmlArr[i++] = "<td class='" + this._className + "-ErrorText'>" + errorStr + "</td></tr></table>";
		html = htmlArr.join("");
	} else {
		html = "&nbsp;";
	}
	this._errorCell.innerHTML = html;
}

LaLoginDialog.prototype.setFocus =
function(username, bReloginMode) {
	if (this._unameField.value.length > 0) {
		this._pwordField.focus();
	} else {
		// if we're in relogin mode but cant find a username, 
		// throw exception to force new login
		this._unameField.disabled = false;
	    this._unameField.focus();
	}
 }

LaLoginDialog.prototype.setVisible = 
function(visible, transparentBg) {
	DwtComposite.prototype.setVisible.call(this, visible);
	Dwt._ffOverflowHack(this._htmlElId, this.getZIndex(), visible);	
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
LaLoginDialog.prototype._createHtml = 
function(unameId, pwordId, okCellId, errorCellId) {
	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 cellspacing=0 cellpadding=0 style='width:100%; height:100%'><tr><td>";
	html[i++] = "<table align=center border=0 cellspacing=0 cellpadding=0><tr><td>";
	html[i++] = "<table border=0 cellspacing=12 class='" + this._className + "-HeaderPanel'><tr height=10><td>&nbsp;</td></tr>";
	html[i++] = "<tr><td><table border=0 height=32><tr><td class='" + this._className + "-HeaderText'>" + LaMsg.loginHeader + "</td></tr>";
	html[i++] = "<tr><td class='" + this._className + "-SubHeaderText'>&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td>";
	html[i++] = "<table border=0 cellspacing=12 class='" + this._className + "-MainPanel'>";
	html[i++] = "<colgroup><col style='width:75px'></col><col style='width:225px'></col></colgroup>";
	html[i++] = "<tr><td colspan=2 id='" + errorCellId + "'>&nbsp;</td></tr><tr><td align=right>" + LaMsg.username + ":</td>";
	html[i++] = "<td><input style=\"width:100%; height:22px\" autocomplete=OFF type=text tabIndex=1 id='" + unameId + "'/></td></tr>";
	html[i++] = "<tr><td align=right>" + LaMsg.password + ":</td><td><input style=\"width:100%; height:22px\" type=password tabIndex=2 id='" + pwordId + "'/></td></tr>";
	html[i++] = "<tr>";
	html[i++] = "<td colspan=2 id='" + okCellId + "' align=right>";
	html[i++] = "</td></tr></table>";
	html[i++] = "</td></tr></table></td></tr></table>";
	
	return html.join("");
}

LaLoginDialog.prototype._addChild =
function(child, childHtmlElement) {
    this._children.add(child);
}

LaLoginDialog.prototype.setReloginMode = 
function(bReloginMode, app, obj) {

	this._unameField.disabled = bReloginMode;
	
	/*if (bReloginMode) {
		this._reloginModeField.innerHTML =  "<a id='" + modeId + "' href='javascript:;'>" + LaMsg.loginAsDiff + "</a>";
		var anchor = Dwt.getDomObj(this.getDocument(), modeId);
		anchor.onclick = LaLoginDialog._loginDiffListener;
		anchor._app = app;
		anchor._obj = obj;
		anchor._parent = this;
	} else {*/

	//}
}

LaLoginDialog.prototype._loginSelListener =
function(selEvt) {
	this.setCursor("wait");
	var username = this._unameField.value;
	if (!(username && username.length)) {
		this.setError(LaMsg.enterUsername);
		return;
	}

	if (this._callback)
		this._callback.run([username, this._pwordField.value]);
}



// -----------------------------------------------------------------
// event handler methods
// -----------------------------------------------------------------

LaLoginDialog._keyPressHdlr =
function(evt) {
	evt = (evt) ? evt : ((event) ? event : null);
	var charCode = DwtKeyEvent.getCharCode(evt);
	var shiftKey = evt.shiftKey;

	var obj = DwtUiEvent.getTarget(evt);
	var doc = obj.document ? obj.document : ((obj.ownerDocument)? obj.ownerDocument : window.document);
	var parent = null;
	if(obj._parentId)
		parent = Dwt.getObjectFromElement(Dwt.getDomObj(doc, obj._parentId));
	else 
		parent = Dwt.getObjectFromElement(Dwt.getDomObj(doc, doc._parentId));
	
	if(!parent || !parent.handleKeyBoard)
		return;
	
	if (charCode == 13 || charCode == 3) {
		if (obj == parent._unameField) {
			parent._pwordField.focus();
		} else {
			if (parent._callback) {
				parent.setCursor("wait");
				parent._callback.run([parent._unameField.value, parent._pwordField.value]);
			}
		}
		return false;
	} else if (charCode == 9) { //TAB
		if (obj == parent._unameField) {
			if(!shiftKey)
				parent._pwordField.focus();
			else {
				parent._loginButton.setActivated(true);
				if (LsEnv.isIE)
	 			    parent._loginButton.getHtmlElement().focus();
				else
					parent._hiddenBtn.focus();
			}
		} else if (obj == parent._pwordField){
			if(!shiftKey) {
				parent._loginButton.setActivated(true);
				if (LsEnv.isIE)
	 			    parent._loginButton.getHtmlElement().focus();
				else
					parent._hiddenBtn.focus();
			} else {
				parent._unameField.focus();
			}
		} else {
			parent._loginButton.setActivated(false);
			if(!shiftKey) {
				parent._unameField.focus();
			} else {
				parent._pwordField.focus();
			}
		} 
		LaLoginDialog.cancelEvent(evt);
		return false; 
	} 
	return true;
}

LaLoginDialog.cancelEvent = function (ev){
	if (ev.stopPropagation){
		ev.stopPropagation();
	}
	if (ev.preventDefault){
		ev.preventDefault();
	}
	ev.cancelBubble = true;
	ev.returnValue = false;
}

LaLoginDialog._loginDiffListener =
function(ev) {
	LaLiquidAdmin.logOff();
	return;
};
