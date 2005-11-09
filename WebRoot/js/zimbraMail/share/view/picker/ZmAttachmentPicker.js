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

function ZmAttachmentPicker(parent) {
	ZmPicker.call(this, parent, ZmPicker.ATTACHMENT);
    this._checkedItems = new Object();
};

ZmAttachmentPicker.prototype = new ZmPicker;
ZmAttachmentPicker.prototype.constructor = ZmAttachmentPicker;

ZmPicker.CTOR[ZmPicker.ATTACHMENT] = ZmAttachmentPicker;

ZmAttachmentPicker.NONE	= 1;
ZmAttachmentPicker.ANY	= 2;
ZmAttachmentPicker.SPEC	= 3;
ZmAttachmentPicker.RADIO_BUTTONS = [ZmAttachmentPicker.NONE, ZmAttachmentPicker.ANY, ZmAttachmentPicker.SPEC];
ZmAttachmentPicker.MSG_KEY = new Object();
ZmAttachmentPicker.MSG_KEY[ZmAttachmentPicker.NONE] = "noAtt";
ZmAttachmentPicker.MSG_KEY[ZmAttachmentPicker.ANY] = "anyAtt";
ZmAttachmentPicker.MSG_KEY[ZmAttachmentPicker.SPEC] = "specAtt";
ZmAttachmentPicker.RADIO_CHECKED = ZmAttachmentPicker.ANY;

ZmAttachmentPicker.ATT_KEY = "_att_";

ZmAttachmentPicker.prototype.toString = 
function() {
	return "ZmAttachmentPicker";
};

ZmAttachmentPicker.prototype._newType =
function(tree, atts) {
	var ti = new DwtTreeItem(tree);
	ti.setImage(atts[0].image);
	ti.setData(ZmAttachmentPicker.ATT_KEY, atts[0].desc);
	ti.setText(atts[0].desc);
	var types = new Array();
	for (var i = 0; i < atts.length; i++)
		types.push(atts[i].type);
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
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='left'>";
	html[i++] = "<input type='radio' name='r'" + checked + " id='" + id + "'></td>";
	html[i++] = "<td align='left'>" + text + "</td>";
	html[i++] = "</tr>";

	return html.join("");
};

ZmAttachmentPicker.prototype._setupRadio =
function(radioId, doc) {
	var id = this._radioId[radioId];
	var rb = this._radio[radioId] = Dwt.getDomObj(doc, id);
	Dwt.setHandler(rb, DwtEvent.ONCLICK, ZmAttachmentPicker._radioChange);
	rb._picker = this;
	rb._radioId = radioId;
};

ZmAttachmentPicker.prototype._setupPicker =
function(parent) {

	var picker = new DwtComposite(parent);

    this._radio = new Object();
    this._radioId = new Object();

	for (var i = 0; i < ZmAttachmentPicker.RADIO_BUTTONS.length; i++)
		this._radioId[ZmAttachmentPicker.RADIO_BUTTONS[i]] = Dwt.getNextId();

	var treeId = Dwt.getNextId();
	
	var html = new Array(10);
	var idx = 0;
	html[idx++] = "<table cellpadding='2' cellspacing='0' border='0'>";
	for (var i = 0; i < ZmAttachmentPicker.RADIO_BUTTONS.length; i++)
		html[idx++] = this._newRadio(ZmAttachmentPicker.RADIO_BUTTONS[i], doc);
	html[idx++] = "</table>";
	html[idx++] = "<div id='" + treeId + "'><hr /></div>";
	picker.getHtmlElement().innerHTML = html.join("");

	var doc = this.getDocument();
	for (var i = 0; i < ZmAttachmentPicker.RADIO_BUTTONS.length; i++)
		this._setupRadio(ZmAttachmentPicker.RADIO_BUTTONS[i], doc);
	
    var tti, ti;
	var tree = this._tree = new DwtTree(picker, DwtTree.CHECKEDITEM_STYLE);
	tree.addSelectionListener(new AjxListener(this, this._treeListener));	
	var attachTypeList = new ZmAttachmentTypeList(this.shell.getData(ZmAppCtxt.LABEL));
	var respCallback = new AjxCallback(this, this._handleResponseSetupPicker, [attachTypeList, tree, treeId]);
	attachTypeList.load(respCallback);
};

ZmAttachmentPicker.prototype._handleResponseSetupPicker =
function(args) {
	var attachTypeList	= args[0];
	var tree			= args[1];
	var treeId			= args[2];

	var attachments = attachTypeList.getAttachments();
	this._attsByDesc = new Object();
	var attDesc = new Array();
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
	for (var i = 0; i < attDesc.length; i++)
		this._newType(tree, this._attsByDesc[attDesc[i]]);

	var doc = this.getDocument();
	this._treeDiv = Dwt.getDomObj(doc, treeId);
	this._treeDiv.appendChild(tree.getHtmlElement());
	Dwt.setVisible(this._treeDiv, false);
	
	this._updateQuery();
};

ZmAttachmentPicker._radioChange = 
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;
	Dwt.setVisible(picker._treeDiv, (element._radioId == ZmAttachmentPicker.SPEC));
	picker._updateQuery();
};

ZmAttachmentPicker.prototype._updateQuery = 
function() {
	if (this._radio[ZmAttachmentPicker.ANY].checked) {
		this.setQuery("attachment:any");
	} else if (this._radio[ZmAttachmentPicker.NONE].checked) {
		this.setQuery("attachment:none");	
	} else {
		var types = new Array();
		for (var desc in this._checkedItems) {
			var atts = this._attsByDesc[desc];
			for (var i = 0; i < atts.length; i++)
				types.push('"' + atts[i].type + '"');
		}
		if (types.length) {
			var attStr = types.join(" OR ");
			if (types.length > 1)
				attStr = "(" + attStr + ")";
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
		if (checked)
			this._checkedItems[ti.getData(ZmAttachmentPicker.ATT_KEY)] = true;
		else
			delete this._checkedItems[ti.getData(ZmAttachmentPicker.ATT_KEY)];
		this._updateQuery();
 	}
};
