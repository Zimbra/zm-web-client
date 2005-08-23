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

function ZmBalloonDialog(parent, className, view) {
	var clsName = className? className: "ZmBalloonDialog";
	this._view = view;
	//DwtDialog.call(this, parent, clsName, null, null, null, null, DwtDialog.MODELESS);
	DwtDialog.call(this, parent, clsName);

	this._cListener = new AjxListener(this, this._controlListener);
	// useful stuff
	//this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	//this.setTabOrder([this._nameFieldId]);
	//this.addEnterListener(this._enterListener);
}

ZmBalloonDialog.prototype = new DwtDialog;
ZmBalloonDialog.prototype.constructor = ZmBalloonDialog;

ZmBalloonDialog.prototype.toString = 
function() {
	return "ZmBalloonDialog";
};

ZmBalloonDialog.prototype.popup =
function(loc) {
	if (loc) {
		loc.y = loc.y - this.getH() + 15;
	}
	DwtDialog.prototype.popup.call(this, loc);
	var frame = document.getElementById(this._frameId);
	frame.style.zIndex = this.getZIndex() - 2;
	this.getHtmlElement().style.height = this.getH() + "px";

	this._view.addControlListener(this._cListener);
	//DBG.println("html = " + AjxStringUtil.htmlEncodeSpace(this.getHtmlElement().outerHTML));
};

ZmBalloonDialog.prototype.popdown =
function (){
	DwtDialog.prototype.popdown.call(this);
	this._view._apptForm.removeListener("YO", this._cListener);
	this._view.reset();
};

ZmBalloonDialog.prototype._controlListener = function (event) {
	if (event && event.size) {
		var currHeight = this.getH();
		var bcDiv = document.getElementById(this._balloonContentsId);
		var formHeight = event.size.y;
		var bDiv = document.getElementById(this._buttonsDivId);
		pTop = parseInt(DwtCssStyle.getProperty(bcDiv, "padding-top"));
		pBot = parseInt(DwtCssStyle.getProperty(bcDiv, "padding-bottom"));
		var newHeight = formHeight + Dwt.getSize(bDiv).y + pTop + pBot;
		if (newHeight != currHeight) {
			this.getHtmlElement().style.height = newHeight;
		}
	}
};
ZmBalloonDialog.htmlTemplate = 
"<div class=balloonFrame id='$0'>\
		<table id='$1' class=balloonFrameTable>\
			<tr><td height=1><div class=balloonTL></div></td>\
				<td width=100%		><div class=balloonTM></div></td>\
				<td height=1><div class=balloonTR></div></td>\
			</tr>\
			<tr><td height=100%		><div class=balloonML></div></td>\
				<td					><div class=balloonMM></div></td>\
				<td					><div class=balloonMR></div></td>\
			</tr>\
			<tr><td height=1		><div class=balloonBL></div></td>\
				<td					><div class=balloonBM></div></td>\
				<td					><div class=balloonBR></div></td>\
			</tr>\
		</table>\
	</div>";

/**
 * Override the creation method in DwtDialog
 */

ZmBalloonDialog.prototype._createHtml = 
function() {
	DwtBaseDialog.prototype._createHtml.call(this);
	var div = document.createElement('div');
	div.className = "balloonContents";
	div.id = this._balloonContentsId = Dwt.getNextId();
	div.style.zIndex = this.getZIndex() + 2;
	var contentDiv = this._getContentDiv();
	contentDiv.id = this._contentId = Dwt.getNextId();
	var viewEl = this._view.getHtmlElement();
	if (viewEl) {
		if (viewEl.parentNode) {
			viewEl.parentNode.removeChild(viewEl);
		}
		// make sure our positioning is relative, and not absolute
		if (viewEl.style.position == 'absolute'){
			viewEl._oldPosition = viewEl.style.position;
			viewEl.style.position = 'static';
		}
		div.appendChild(viewEl);
		var bDiv = document.createElement('div');
		bDiv.id = this._buttonsDivId = Dwt.getNextId();
		bDiv.className = "buttonsDiv";
		var html = new Array();
		var idx = 0 ;
		idx = this._addButtonsHtml(html,idx);
		bDiv.innerHTML = html.join("");
		//div.appendChild(bDiv);
		viewEl.appendChild(bDiv);

		contentDiv.appendChild(div);
	}
	this._frameId = Dwt.getNextId();
	var handleId = this._htmlElId + "_handle";
	var framerHtml = AjxStringUtil.resolve(ZmBalloonDialog.htmlTemplate,
										  [this._frameId,
										   handleId]);
	div = Dwt.parseHtmlFragment(framerHtml);
	contentDiv.appendChild(div);
	//DBG.println(AjxStringUtil.htmlEncodeSpace(this.getHtmlElement().innerHTML));
};


ZmBalloonDialog.prototype._getSeparatorTemplate =
function () {
	return "";
};

ZmBalloonDialog.prototype._getButtonsContainerStartTemplate =
function () {
	return "<table cellspacing='0' cellpadding='0' border='0' width=100%>\
              <tr>";
};

ZmBalloonDialog.prototype._getButtonsAlignStartTemplate =
function () {
	return "<td align='$0'><table cellspacing='2' cellpadding='0' border='0'><tr>";
};

ZmBalloonDialog.prototype.getAlignmentForButton =
function (id) {
	var align = null;
	switch (id) {
	case DwtDialog.OK_BUTTON:
		align = DwtDialog.ALIGN_CENTER;
		break;
	case DwtDialog.CANCEL_BUTTON:
		align = DwtDialog.ALIGN_CENTER;
		break;
	default:
		align = DwtDialog.ALIGN[id];
		break;
	}
	return align;
};


ZmBalloonDialog.prototype._okButtonListener =
function(ev) {
};

ZmBalloonDialog.prototype._getInputFields = 
function() {
};

ZmBalloonDialog.prototype._enterListener =
function (ev){
};

ZmBalloonDialog.prototype.focus =
function(){
};
