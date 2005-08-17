function LmBasicPicker(parent) {

	LmPicker.call(this, parent, LmPicker.BASIC);
}

LmBasicPicker.prototype = new LmPicker;
LmBasicPicker.prototype.constructor = LmBasicPicker;

LmPicker.CTOR[LmPicker.BASIC] = LmBasicPicker;

LmBasicPicker.prototype.toString = 
function() {
	return "LmBasicPicker";
}

LmBasicPicker.prototype._makeRow =
function(text, id) {
    var size = 20;
    var html = new Array(10);
    var i = 0;
    html[i++] = "<tr valign='middle'>";
    html[i++] = "<td align='right' nowrap>" + text + ":</td>";
    html[i++] = "<td align='left' nowrap><input type='text' nowrap size='" + size + "' id='" + id + "'/></td>";
    html[i++] = "</tr>";

	return html.join("");		
}

// TODO: if we really wanted, we could add a prefs listener to update the "also search" checkboxes
LmBasicPicker.prototype._setupPicker =
function(parent) {
    var picker = new DwtComposite(parent);

    var fromId = Dwt.getNextId();
    var toId = Dwt.getNextId();
    var subjectId = Dwt.getNextId();
    var contentId = Dwt.getNextId();
    var inTrashId = Dwt.getNextId();
    var inSpamId, checked;
    
	var html = new Array(20);
	var i = 0;
	html[i++] = "<table cellpadding='5' cellspacing='0' border='0'>";
	html[i++] = this._makeRow(LmMsg.from, fromId);
	html[i++] = this._makeRow(LmMsg.toCc, toId);
	html[i++] = this._makeRow(LmMsg.subject, subjectId);
	html[i++] = this._makeRow(LmMsg.content, contentId);
	
	if (this._appCtxt.get(LmSetting.SPAM_ENABLED)) {
		inSpamId = Dwt.getNextId();
		checked = this._appCtxt.get(LmSetting.SEARCH_INCLUDES_SPAM) ? " checked" : "";
		html[i++] = "<tr valign='middle'>";
		html[i++] = "<td align='right'><input type='checkbox'" + checked + " id='" + inSpamId + "' /></td>";
		html[i++] = "<td align='left' nowrap>" + LmMsg.includeJunk + "</td>";
		html[i++] = "</tr>";
	}
	checked = this._appCtxt.get(LmSetting.SEARCH_INCLUDES_TRASH) ? " checked" : "";
	html[i++] = "<tr valign='middle'>";
	html[i++] = "<td align='right'><input type='checkbox'" + checked + " id='" + inTrashId + "' /></td>";
	html[i++] = "<td align='left' nowrap>" + LmMsg.includeTrash + "</td>";
	html[i++] = "</tr>";
	html[i++] = "</table>";
	picker.getHtmlElement().innerHTML = html.join("");

	this._from = this._setupField(fromId);
	this._to = this._setupField(toId);
	this._subject= this._setupField(subjectId);
	this._content = this._setupField(contentId);
	if (this._appCtxt.get(LmSetting.SPAM_ENABLED))
		this._inSpam = this._setupSearch(inSpamId);
	this._inTrash = this._setupSearch(inTrashId);
}

LmBasicPicker.prototype.setFrom =
function(from) {
	this._from.value = from;
	this._updateQuery();
}

LmBasicPicker.prototype.setTo =
function(to) {
	this._to.value = to;
	this._updateQuery();
}

LmBasicPicker.prototype.setSubject =
function(subject) {
	this._subject.value = subject;
	this._updateQuery();
}

LmBasicPicker.prototype.setContent =
function(content) {
	this._content.value = content;
	this._updateQuery();
}

LmBasicPicker.prototype._setupField = 
function(id) {
	var f = Dwt.getDomObj(this.getDocument(), id);
	f.onkeyup = LmBasicPicker._onChange;	
	f._picker = this;
	return f;
}

LmBasicPicker.prototype._setupSearch = 
function(id) {
	var f = Dwt.getDomObj(this.getDocument(), id);
	f.onchange = LmBasicPicker._onChange;
	f._picker = this;
	return f;
}

LmBasicPicker._onChange =
function(ev) {
	var element = DwtUiEvent.getTarget(ev);
	var picker = element._picker;

	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		picker.execute();
	    return false;
	} else {
		picker._updateQuery();
		return true;
	}
}

LmBasicPicker.prototype._updateQuery = 
function() {
	var query = new Array();
	var from = LsStringUtil.trim(this._from.value, true);
	if (from.length)
		query.push("from:(" + from + ")");
	var to = LsStringUtil.trim(this._to.value, true);
	if (to.length)
		query.push("(to:(" + to + ")" + " OR cc:(" + to + "))");
	var subject = LsStringUtil.trim(this._subject.value, true);
	if (subject.length)
		query.push("subject:(" + subject + ")");
	var content = LsStringUtil.trim(this._content.value, true);
	if (content.length)
		query.push("content:(" + content + ")");
	var gotInput = (query.length > 0);
	var checkSpam = (this._inSpam && this._inSpam.checked);
	var checkTrash = (this._inTrash && this._inTrash.checked);
	if (checkSpam && checkTrash)
		query.push("is:anywhere");
	else if (checkSpam)
		query.push("is:anywhere not in:trash");
	else if (checkTrash)
		query.push("is:anywhere not in:junk");

	// if just the "search Trash/Spam" checkboxes changed, run the query
	var cbChange = (!gotInput && (this._query != query));
	this.setQuery(query.length ? query.join(" ") : "");
	if (cbChange)
		this.execute();
}
