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

ZmAttachmentPicker = function(parent) {
	ZmPicker.call(this, parent, ZmPicker.ATTACHMENT);
    this._checkedItems = {};
};

ZmAttachmentPicker.prototype = new ZmPicker;
ZmAttachmentPicker.prototype.constructor = ZmAttachmentPicker;

ZmPicker.CTOR[ZmPicker.ATTACHMENT] = ZmAttachmentPicker;

ZmAttachmentPicker.NONE	= 1;
ZmAttachmentPicker.ANY	= 2;
ZmAttachmentPicker.SPEC	= 3;
ZmAttachmentPicker.FILE	= 4;
ZmAttachmentPicker.RADIO_BUTTONS = [ZmAttachmentPicker.NONE, ZmAttachmentPicker.ANY, ZmAttachmentPicker.SPEC, ZmAttachmentPicker.FILE];
ZmAttachmentPicker.MSG_KEY = new Object();
ZmAttachmentPicker.MSG_KEY[ZmAttachmentPicker.NONE]	= "noAtt";
ZmAttachmentPicker.MSG_KEY[ZmAttachmentPicker.ANY]	= "anyAtt";
ZmAttachmentPicker.MSG_KEY[ZmAttachmentPicker.SPEC]	= "specAtt";
ZmAttachmentPicker.MSG_KEY[ZmAttachmentPicker.FILE]	= "specFile";
ZmAttachmentPicker.RADIO_CHECKED = ZmAttachmentPicker.SPEC;

ZmAttachmentPicker.ATT_KEY = "_att_";

ZmAttachmentPicker.prototype.toString = 
function() {
	return "ZmAttachmentPicker";
};

ZmAttachmentPicker.prototype._newType =
function(tree, atts) {
	var ti = new DwtTreeItem({parent:tree});
	ti.setImage(atts[0].image);
	ti.setData(ZmAttachmentPicker.ATT_KEY, atts[0].desc);
	ti.setText(atts[0].desc);
	var types = new Array();
	for (var i = 0; i < atts.length; i++) {
		types.push(atts[i].type);
	}
	ti.setToolTipContent(types.join("<br />"));
	return ti;
};

ZmAttachmentPicker.prototype._newRadio =
function(radioId) {
	var html = new Array(5);
	var text = ZmMsg[ZmAttachmentPicker.MSG_KEY[radioId]];
	var checked = (radioId == ZmAttachmentPicker.RADIO_CHECKED) ? "checked" : "";
	var id = this._radioId[radioId];
	var i = 0;
	html[i++] = "<tr valign='middle'><td align='left'>";
	html[i++] = "<input type='radio' name='r'";
	html[i++] = checked;
	html[i++] = " id='";
	html[i++] = id;
	html[i++] = "'></td><td align='left'>";
	html[i++] = text;
	html[i++] = "</td></tr>";

	return html.join("");
};

ZmAttachmentPicker.prototype._setupRadio =
function(radioId) {
	var id = this._radioId[radioId];
	var rb = this._radio[radioId] = document.getElementById(id);
	Dwt.setHandler(rb, DwtEvent.ONCLICK, ZmAttachmentPicker._radioChange);
	rb._picker = this;
	rb._radioId = radioId;
};

ZmAttachmentPicker.prototype._setupPicker =
function(parent) {

	var picker = new DwtComposite(parent);

    this._radio = {};
    this._radioId = {};

	for (var i = 0; i < ZmAttachmentPicker.RADIO_BUTTONS.length; i++) {
		this._radioId[ZmAttachmentPicker.RADIO_BUTTONS[i]] = Dwt.getNextId();
	}

	var treeId = Dwt.getNextId();
	var fileDivId = Dwt.getNextId();
	var fileInputId = Dwt.getNextId();
	
	var html = new Array(10);
	var idx = 0;
	html[idx++] = "<table cellpadding='2' cellspacing='0' border='0'>";
	for (var i = 0; i < ZmAttachmentPicker.RADIO_BUTTONS.length; i++) {
		html[idx++] = this._newRadio(ZmAttachmentPicker.RADIO_BUTTONS[i]);
	}
	html[idx++] = "</table>";
	html[idx++] = "<div style='display:none; padding: 0 5' id='";
	html[idx++] = fileDivId;
	html[idx++] = "'><hr /><table border=0><tr><td width=1%>";
	html[idx++] = ZmMsg.filename;
	html[idx++] = "</td><td>";
	html[idx++] = Dwt.CARET_HACK_BEGIN;
	html[idx++] = "<input type='text' autocomplete='off' nowrap style='width:90%' id='";
	html[idx++] = fileInputId;
	html[idx++] = "'>";
	html[idx++] = Dwt.CARET_HACK_END;
	html[idx++] = "</td></tr></table></div>";
	html[idx++] = "<div id='";
	html[idx++] = treeId;
	html[idx++] = "'><hr /></div>";
	picker.getHtmlElement().innerHTML = html.join("");

	for (var i = 0; i < ZmAttachmentPicker.RADIO_BUTTONS.length; i++) {
		this._setupRadio(ZmAttachmentPicker.RADIO_BUTTONS[i]);
	}

	// set up filename input field
	this._fileNameDiv = document.getElementById(fileDivId);
	this._fileNameInput = document.getElementById(fileInputId);
	Dwt.setHandler(this._fileNameInput, DwtEvent.ONKEYUP, ZmAttachmentPicker._onChange);
	Dwt.associateElementWithObject(this._fileNameInput, this);

	// set up attachment tree widget
	this._tree = new DwtTree({parent:picker, style:DwtTree.CHECKEDITEM_STYLE});
	this._tree.addSelectionListener(new AjxListener(this, this._treeListener));	
	var attachTypeList = new ZmAttachmentTypeList();
	var respCallback = new AjxCallback(this, this._handleResponseSetupPicker, [attachTypeList, this._tree, treeId]);
	attachTypeList.load(respCallback);
};

ZmAttachmentPicker.prototype._handleResponseSetupPicker =
function(attachTypeList, tree, treeId) {
	var attachments = attachTypeList.getAttachments();
	this._attsByDesc = {};
	var attDesc = [];
	var curDesc = null;
	for (var i = 0; i < attachments.length; i++) {
		var desc = attachments[i].desc;
		if (desc != curDesc) {
			this._attsByDesc[desc] = new Array();
			attDesc.push(desc);
		}
		this._attsByDesc[desc].push(attachments[i]);
		curDesc = desc;
	}
	for (var i = 0; i < attDesc.length; i++) {
		this._newType(tree, this._attsByDesc[attDesc[i]]);
	}

	this._treeDiv = document.getElementById(treeId);
	this._treeDiv.appendChild(tree.getHtmlElement());
	Dwt.setVisible(this._treeDiv, ZmAttachmentPicker.RADIO_CHECKED == ZmAttachmentPicker.RADIO_CHECKED);

	this._updateQuery();
};

ZmAttachmentPicker.prototype._updateQuery =
function() {
	if (this._radio[ZmAttachmentPicker.ANY].checked) {
		this.setQuery("attachment:any");
	} else if (this._radio[ZmAttachmentPicker.NONE].checked) {
		this.setQuery("attachment:none");
	} else if (this._radio[ZmAttachmentPicker.FILE].checked) {
		var query = "filename:(" + this._fileNameInput.value + ")";
		this.setQuery(query);
		return; // DONT execute right away
	} else {
		var types = [];
		for (var desc in this._checkedItems) {
			var atts = this._attsByDesc[desc];
			for (var i = 0; i < atts.length; i++) {
				types.push('"' + atts[i].type + '"');
			}
		}
		if (types.length) {
			var attStr = types.join(" OR ");
			if (types.length > 1) {
				attStr = "(" + attStr + ")";
			}
			this.setQuery("attachment:" + attStr);
		} else {
			this.setQuery("");
		}
	}
	this.execute();
};

ZmAttachmentPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
		if (checked) {
			this._checkedItems[ti.getData(ZmAttachmentPicker.ATT_KEY)] = true;
		} else {
			delete this._checkedItems[ti.getData(ZmAttachmentPicker.ATT_KEY)];
		}
		this._updateQuery();
 	}
};

ZmAttachmentPicker._radioChange =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;

	Dwt.setVisible(picker._treeDiv, (element._radioId == ZmAttachmentPicker.SPEC));

	var dispFilename = element._radioId == ZmAttachmentPicker.FILE ? Dwt.DISPLAY_BLOCK : Dwt.DISPLAY_NONE;
	Dwt.setDisplay(picker._fileNameDiv, dispFilename);
	if (element._radioId == ZmAttachmentPicker.FILE) {
		picker._fileNameInput.focus();
		return;
	}

	picker._updateQuery();
};

ZmAttachmentPicker._onChange =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = Dwt.getObjectFromElement(element);

	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3 || charCode == 9) {
		picker.execute();
	    return false;
	} else {
		picker._updateQuery();
		return true;
	}
};
