function LaAccChangePwdDlg(parent,  app) {
	DwtDialog.call(this, parent, null, LaMsg.CHNP_Title);
	this._fieldIds = new Object();
	this._app = app;
	this.setContent(this._contentHtml());
	this.setTabOrder([this._fieldIds[LaAccChangePwdDlg.F_password], this._fieldIds[LaAccChangePwdDlg.F_confirmPassword], 
					  this._fieldIds[LaAccChangePwdDlg.F_liquidPasswordMustChange]]);
	
}

LaAccChangePwdDlg.prototype = new DwtDialog;
LaAccChangePwdDlg.prototype.constructor = LaAccChangePwdDlg;

LaAccChangePwdDlg.F_password = 1;
LaAccChangePwdDlg.F_confirmPassword = 2;
LaAccChangePwdDlg.F_liquidPasswordMustChange = 3;

LaAccChangePwdDlg.prototype.toString = 
function() {
	return "LaAccChangePwdDlg";
}

LaAccChangePwdDlg.prototype.popdown = 
function() {
	DwtDialog.prototype.popdown.call(this);
	if(this._app) {
		this._app.getCurrentController().setEnabled(true);	
		this._app.getAppCtxt().getSearchController().setEnabled(true);
	}
}

LaAccChangePwdDlg.prototype.popup =
function(mustChange) {
	DwtDialog.prototype.popup.call(this);
	var ePassword = Dwt.getDomObj(this.getDocument(), this._fieldIds[LaAccChangePwdDlg.F_password]);
	ePassword.focus();
	if(this._app) {
		this._app.getCurrentController().setEnabled(false);	
		this._app.getAppCtxt().getSearchController().setEnabled(false);
	}
	var eField = Dwt.getDomObj(this.getDocument(), this._fieldIds[LaAccChangePwdDlg.F_liquidPasswordMustChange]);
	if(!eField)
		return true;
		
	if(mustChange && mustChange == "TRUE") 
		eField.checked = true;
	else
		eField.checked = false;
}

LaAccChangePwdDlg.prototype.getPassword = 
function () {
	var ePassword = Dwt.getDomObj(this.getDocument(), this._fieldIds[LaAccChangePwdDlg.F_password]);
	if(ePassword) {
		return ePassword.value;
	}
}

LaAccChangePwdDlg.prototype.getMustChangePassword = 
function () {
	var eField = Dwt.getDomObj(this.getDocument(), this._fieldIds[LaAccChangePwdDlg.F_liquidPasswordMustChange]);
	if(eField) {
		if(eField.checked) {
			return true;
		} else {
			return false;
		}
	} else return false;
}

LaAccChangePwdDlg.prototype.getConfirmPassword = 
function () {
	var eConfPassword = Dwt.getDomObj(this.getDocument(), this._fieldIds[LaAccChangePwdDlg.F_confirmPassword]);
	if(eConfPassword) {
		return eConfPassword.value;
	}

}

LaAccChangePwdDlg.prototype._addEntryRow =
function(field, title, html, idx, type) {
	if (type == null) type = "text";
	var id = Dwt.getNextId();
	this._fieldIds[field] = id;
	html[idx++] = "<tr valign='center'>";
	html[idx++] = "<td width='30%' align='left'>";
	html[idx++] = title;
	html[idx++] = "</td>";
	html[idx++] = "<td width='70%' align='left'><input style='width:100%;' type='"+type+"' id='";	
	html[idx++] = id;
	html[idx++] = "'/>";
	html[idx++] = "</td></tr>";
	return idx;
}

LaAccChangePwdDlg.prototype._addEntryRow2 =
function(field, title, html, idx) {
	var id = Dwt.getNextId();
	this._fieldIds[field] = id;
	html[idx++] = "<tr valign='center'>";
	html[idx++] = "<td colspan='2' align='left'><nobr><input type='checkbox' id='";	
	html[idx++] = id;
	html[idx++] = "'/>&nbsp;";
	html[idx++] = title;
	html[idx++] = "</nobr></td></tr>";
	return idx;
}

LaAccChangePwdDlg.prototype._createPwdHtml =
function(html, idx) {
	html[idx++] = "<table cellpadding='3' cellspacing='2' border='0' width='100%'>";
	idx = this._addEntryRow(LaAccChangePwdDlg.F_password, LaMsg.NAD_Password+":", html, idx, "password");
	idx = this._addEntryRow(LaAccChangePwdDlg.F_confirmPassword, LaMsg.NAD_ConfirmPassword+":", html, idx, "password");
	idx = this._addEntryRow2(LaAccChangePwdDlg.F_liquidPasswordMustChange, LaMsg.NAD_MustChangePwd, html, idx);	
	html[idx++] = "</table>";
	return idx;
}


LaAccChangePwdDlg.prototype._contentHtml = 
function() {
	this._nameFieldId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<div class='LaChngPwdDlg'>";
	idx = this._createPwdHtml(html, idx);
	html[idx++] = "</div>";
	return html.join("");
}

