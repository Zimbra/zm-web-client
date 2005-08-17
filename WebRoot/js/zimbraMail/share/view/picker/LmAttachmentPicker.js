function LmAttachmentPicker(parent) {
	LmPicker.call(this, parent, LmPicker.ATTACHMENT);
    this._checkedItems = new Object();
};

LmAttachmentPicker.prototype = new LmPicker;
LmAttachmentPicker.prototype.constructor = LmAttachmentPicker;

LmPicker.CTOR[LmPicker.ATTACHMENT] = LmAttachmentPicker;

LmAttachmentPicker.NONE	= 1;
LmAttachmentPicker.ANY	= 2;
LmAttachmentPicker.SPEC	= 3;
LmAttachmentPicker.RADIO_BUTTONS = [LmAttachmentPicker.NONE, LmAttachmentPicker.ANY, LmAttachmentPicker.SPEC];
LmAttachmentPicker.MSG_KEY = new Object();
LmAttachmentPicker.MSG_KEY[LmAttachmentPicker.NONE] = "noAtt";
LmAttachmentPicker.MSG_KEY[LmAttachmentPicker.ANY] = "anyAtt";
LmAttachmentPicker.MSG_KEY[LmAttachmentPicker.SPEC] = "specAtt";
LmAttachmentPicker.RADIO_CHECKED = LmAttachmentPicker.ANY;

LmAttachmentPicker.ATT_KEY = "_att_";

LmAttachmentPicker.prototype.toString = 
function() {
	return "LmAttachmentPicker";
};

LmAttachmentPicker.prototype._newType =
function(tree, atts) {
	var ti = new DwtTreeItem(tree);
	ti.setImage(atts[0].image);
	ti.setData(LmAttachmentPicker.ATT_KEY, atts[0].desc);
	ti.setText(atts[0].desc);
	var types = new Array();
	for (var i = 0; i < atts.length; i++)
		types.push(atts[i].type);
	ti.setToolTipContent(types.join("<br />"));
	return ti;
};

LmAttachmentPicker.prototype._newRadio =
function(radioId) {
	var html = new Array(5);
	var text = LmMsg[LmAttachmentPicker.MSG_KEY[radioId]];
	var checked = (radioId == LmAttachmentPicker.RADIO_CHECKED) ? "checked" : "";
	var id = this._radioId[radioId];
	var i = 0;
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='left'>";
	html[i++] = "<input type='radio' name='r'" + checked + " id='" + id + "'></td>";
	html[i++] = "<td align='left'>" + text + "</td>";
	html[i++] = "</tr>";

	return html.join("");
};

LmAttachmentPicker.prototype._setupRadio =
function(radioId, doc) {
	var id = this._radioId[radioId];
	var rb = this._radio[radioId] = Dwt.getDomObj(doc, id);
	rb.onclick = LmAttachmentPicker._radioChange;
	rb._picker = this;
	rb._radioId = radioId;
};

LmAttachmentPicker.prototype._setupPicker =
function(parent) {

	var picker = new DwtComposite(parent);

    this._radio = new Object();
    this._radioId = new Object();

	for (var i = 0; i < LmAttachmentPicker.RADIO_BUTTONS.length; i++)
		this._radioId[LmAttachmentPicker.RADIO_BUTTONS[i]] = Dwt.getNextId();

	var treeId = Dwt.getNextId();
	
	var html = new Array(10);
	var idx = 0;
	html[idx++] = "<table cellpadding='2' cellspacing='0' border='0'>";
	for (var i = 0; i < LmAttachmentPicker.RADIO_BUTTONS.length; i++)
		html[idx++] = this._newRadio(LmAttachmentPicker.RADIO_BUTTONS[i], doc);
	html[idx++] = "</table>";
	html[idx++] = "<div id='" + treeId + "'><hr /></div>";
	picker.getHtmlElement().innerHTML = html.join("");

	var doc = this.getDocument();
	for (var i = 0; i < LmAttachmentPicker.RADIO_BUTTONS.length; i++)
		this._setupRadio(LmAttachmentPicker.RADIO_BUTTONS[i], doc);
	
    var tti, ti;
	var tree = this._tree = new DwtTree(picker, DwtTree.CHECKEDITEM_STYLE);
	tree.addSelectionListener(new LsListener(this, this._treeListener));	
	var attachTypeList = new LmAttachmentTypeList(this.shell.getData(LmAppCtxt.LABEL));
	attachTypeList.load();
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

	this._treeDiv = Dwt.getDomObj(doc, treeId);
	this._treeDiv.appendChild(tree.getHtmlElement());
	Dwt.setVisible(this._treeDiv, false);
	
	this._updateQuery();
};

LmAttachmentPicker._radioChange = 
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;
	Dwt.setVisible(picker._treeDiv, (element._radioId == LmAttachmentPicker.SPEC));
	picker._updateQuery();
};

LmAttachmentPicker.prototype._updateQuery = 
function() {
	if (this._radio[LmAttachmentPicker.ANY].checked) {
		this.setQuery("attachment:any");
	} else if (this._radio[LmAttachmentPicker.NONE].checked) {
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

LmAttachmentPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
		if (checked)
			this._checkedItems[ti.getData(LmAttachmentPicker.ATT_KEY)] = true;
		else
			delete this._checkedItems[ti.getData(LmAttachmentPicker.ATT_KEY)];
		this._updateQuery();
 	}
};
