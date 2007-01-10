/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTaskEditView(parent, appCtxt, controller, isReadOnly) {

	if (arguments.length == 0) return;

	DwtComposite.call(this, parent, "ZmTaskEditView", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = appCtxt;
	this._controller = controller;

	this._tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));

	// read only flag is mainly used for printing a single contact
	this._isReadOnly = isReadOnly;
	if (!isReadOnly)
		this._changeListener = new AjxListener(this, this._taskChangeListener);
};

ZmTaskEditView.prototype = new DwtComposite;
ZmTaskEditView.prototype.constructor = ZmTaskEditView;


// Consts
ZmTaskEditView.PRIORITY_VALUES = [
	{ v:ZmTask.PRIORITY_LOW,	l:ZmMsg.low },
	{ v:ZmTask.PRIORITY_NORMAL,	l:ZmMsg.normal },
	{ v:ZmTask.PRIORITY_HIGH,	l:ZmMsg.high }];

ZmTaskEditView.STATUS_VALUES = [
	{ v:"TENT",		l:ZmMsg.notStarted },
	{ v:"COMP",		l:ZmMsg.completed },
	{ v:"INPR",		l:ZmMsg.inProgress},
	{ v:"WAITING",	l:ZmMsg.waitingOn },
	{ v:"DEFERRED",	l:ZmMsg.deferred }];


// Public Methods

ZmTaskEditView.prototype.toString =
function() {
	return "ZmTaskEditView";
};

ZmTaskEditView.prototype.set =
function(task) {
	if (!this._htmlInitialized) {
		this._createHtml(task);

		if (!this._isReadOnly) {
			this._addSelectOptions();
			this._addDateCalendars();
			this._installOnKeyUpHandler(this._subjectId);
			this._installOnKeyUpHandler(this._notesId);
		}
	}

	if (this._isReadOnly)
		return;

	if (this._task) {
		this._task.removeChangeListener(this._changeListener);
	}
	task.addChangeListener(this._changeListener);
	this._task = task;

	this._setFields();
	this._isDirty = false;
};

ZmTaskEditView.prototype.getTask =
function(attId) {
	// attempt to submit attachments first!
	if (!attId && this._gotAttachments()) {
		this._submitAttachments();
		return null;
	}

	// create a copy of the appointment so we don't muck w/ the original
	var task = ZmTask.quickClone(this._task);

	task.setName(this._subjectField.getValue());
	task.setFolderId(this._folderSelect.getValue());

	var startDate = AjxDateUtil.simpleParseDateStr(document.getElementById(this._dateStartId).value);
	var endDate = AjxDateUtil.simpleParseDateStr(document.getElementById(this._dateDueId).value);
	task.setAllDayEvent(true);
	task.setStartDate(startDate, true);
	task.setEndDate(endDate, true);

	task.setPercentComplete(this._pCompleteSelect.getValue());
	task.setPriority(this._prioritySelect.getValue());
	task.setStatus(this._statusSelect.getValue());

	// TODO - change to use HTML editor
	var top = new ZmMimePart();
	top.setContentType(ZmMimeTable.TEXT_PLAIN);
	top.setContent(document.getElementById(this._notesId).value);
	task.notesTopPart = top;

	// TODO - attachments

	return task;
};

ZmTaskEditView.prototype.setSize =
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width, height);
	this._sizeChildren(width, height);
};

ZmTaskEditView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._sizeChildren(width, height);
};

ZmTaskEditView.prototype.isValid =
function() {
	var val = AjxStringUtil.trim(document.getElementById(this._subjectId).value);
	if (val.length == 0) {
		throw ZmMsg.errorMissingSubject;
	}

	return true;
};

ZmTaskEditView.prototype.isDirty =
function() {
	return this._isDirty;
};

ZmTaskEditView.prototype.cleanup =
function() {
	// TODO - this may not be necessary if set() handles cleanup
	// this will go away via setFields()
	this._pCompleteSelect.setSelected(0);
	this._prioritySelect.setSelected(1);
};

ZmTaskEditView.prototype.enableInputs =
function(enable) {
	document.getElementById(this._subjectId).disabled = !enable;
	document.getElementById(this._notesId).disabled = !enable;
};

ZmTaskEditView.prototype.getController =
function() {
	return this._controller;
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmTaskEditView.prototype.getSelection =
function() {
	return this._task;
};

ZmTaskEditView.prototype.getSelectionCount =
function() {
	return 1;
};

ZmTaskEditView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.task].join(": ");
};


// Private/protected Methods

ZmTaskEditView.prototype._createHtml =
function(task) {
	this._headerId		= this._htmlElId + "_header";
	this._headerRowId	= this._htmlElId + "_headerRow";
	this._titleId		= this._htmlElId + "_title";
	this._tagsId		= this._htmlElId + "_tags";
	this._contentId		= this._htmlElId + "_content";
	this._subjectId		= this._htmlElId + "_subject";
	this._folderLabelId = this._htmlElId + "_folderLabel";
	this._dateStartId	= this._htmlElId + "_dateStart";
	this._dateDueId		= this._htmlElId + "_dateDue";
	this._notesId		= this._htmlElId + "_notes";
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.tasks.templates.Tasks#TasksEdit", {id:this._htmlElId, task:task});
	this._htmlInitialized = true;
};

ZmTaskEditView.prototype._addSelectOptions =
function() {
	var listener = new AjxListener(this, this._selectListener);

	// add task folder DwtSelect
	this._folderSelect = new DwtSelect(this);
	this._folderSelect.reparentHtmlElement(this._htmlElId + "_folder");
	this._folderSelect.addChangeListener(listener);

	// add percent complete DwtSelect
	this._pCompleteSelect = new DwtSelect(this);
	for (var i = 0; i <= 100; i += 10) {
		this._pCompleteSelect.addOption((i+"%"), i==0, i);
	}
	this._pCompleteSelect.addChangeListener(listener);
	this._pCompleteSelect.reparentHtmlElement(this._htmlElId + "_complete");

	// add priority DwtSelect
	this._prioritySelect = new DwtSelect(this);
	for (var i = 0; i < ZmTaskEditView.PRIORITY_VALUES.length; i++) {
		this._prioritySelect.addOption(ZmTaskEditView.PRIORITY_VALUES[i].l, i==1, ZmTaskEditView.PRIORITY_VALUES[i].v);
	}
	this._prioritySelect.addChangeListener(listener);
	this._prioritySelect.reparentHtmlElement(this._htmlElId + "_priority");

	// add status DwtSelect
	this._statusSelect = new DwtSelect(this);
	for (var i = 0; i < ZmTaskEditView.STATUS_VALUES.length; i++) {
		this._statusSelect.addOption(ZmTaskEditView.STATUS_VALUES[i].l, i==0, ZmTaskEditView.STATUS_VALUES[i].v);
	}
	this._statusSelect.addChangeListener(listener);
	this._statusSelect.reparentHtmlElement(this._htmlElId + "_status");
};

ZmTaskEditView.prototype._addDateCalendars =
function() {
	var dateBtnListener = new AjxListener(this, this._dateButtonListener);
	var dateSelListener = new AjxListener(this, this._dateSelectionListener);

	ZmApptViewHelper.createMiniCalButton(this, (this._htmlElId + "_dateStartBtn"), dateBtnListener, dateSelListener, this._appCtxt);
	ZmApptViewHelper.createMiniCalButton(this, (this._htmlElId + "_dateDueBtn"), dateBtnListener, dateSelListener, this._appCtxt);
};

ZmTaskEditView.prototype._installOnKeyUpHandler =
function(id) {
	var e = document.getElementById(id);
	if (e) {
		// only add onkeyup handlers to input/textarea's
		var tagName = e.tagName.toLowerCase();
		if (tagName == "input" || tagName == "textarea") {
			Dwt.setHandler(e, DwtEvent.ONKEYUP, ZmTaskEditView._onKeyUp);
			Dwt.associateElementWithObject(e, this);
		}
	}
};

ZmTaskEditView.prototype._getDefaultFocusItem =
function() {
	return document.getElementById(this._subjectId);
};

ZmTaskEditView.prototype._getTabGroupMembers =
function() {
	// TODO - add other non-text widgets if possible
	var fields = [];
	fields.push(document.getElementById(this._subjectId));
	fields.push(document.getElementById(this._dateStartId));
	fields.push(document.getElementById(this._dateDueId));
	fields.push(document.getElementById(this._notesId));
	return fields;
};

ZmTaskEditView.prototype._setFields =
function() {
	this._setHeaderColor();
	this._setTitle();
	this._setTags();
	this._setTaskFolders();
	this._populate();
};

ZmTaskEditView.prototype._setHeaderColor =
function() {
	// set the appropriate header color
	var folderId = this._task.folderId;
	var folder = folderId ? this._appCtxt.getTree(ZmOrganizer.TASKS).getById(folderId) : null;
	var color = folder ? folder.color : ZmTaskFolder.DEFAULT_COLOR;
	var bkgdColor = ZmOrganizer.COLOR_TEXT[color] + "Bg";
	var headerRow = document.getElementById(this._headerRowId);
	headerRow.className = "contactHeaderRow " + bkgdColor;
};

ZmTaskEditView.prototype._setTitle =
function(title) {
	var titleDiv =  document.getElementById(this._titleId);
	var fileAs = title || this._task.getName();
	titleDiv.innerHTML = fileAs
		? fileAs
		: this._task.id != -1 ? "&nbsp;" : ZmMsg.newTask;
};

ZmTaskEditView.prototype._setTags =
function() {
	// get sorted list of tags for this msg
	var ta = [];
	for (var i = 0; i < this._task.tags.length; i++)
		ta.push(this._tagList.getById(this._task.tags[i]));
	ta.sort(ZmTag.sortCompare);

	var html = [];
	var i = 0;
	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) continue;
		var icon = ZmTag.COLOR_MINI_ICON[tag.color];
		html[i++] = AjxImg.getImageSpanHtml(icon, null, null, tag.name);
		html[i++] = "&nbsp;";
	}
	document.getElementById(this._tagsId).innerHTML = html.join("");
};

ZmTaskEditView.prototype._setTaskFolders =
function() {
	// get all folders w/ view set to "Appointment" we received from initial refresh block
	var treeData = this._appCtxt.getOverviewController().getTreeData(ZmOrganizer.TASKS);
	if (treeData && treeData.root) {
		this._folderSelect.clearOptions();
		this._taskOrgs = {};
		var children = treeData.root.children.getArray();
		var len = children.length;
		var taskFolder;
		for (var i = 0; i < len; i++) {
			var t = children[i];
			if (t.id == this._task.getFolderId()) {
				taskFolder = t;
				break;
			}
		}
		var enabled = !taskFolder.link;
		for (var i = 0; i < len; i++) {
			var t = children[i];
			this._taskOrgs[t.id] = t.owner;
			if (enabled) {
				// don't show task folder if remote or don't have write perms
				if (t.isFeed()) continue;
				if (t.link && t.shares && t.shares.length > 0 && !t.shares[0].isWrite()) continue;
			}
			this._folderSelect.addOption(t.getName(), false, t.id);
		}

		if (enabled && len > 1) {
			this._folderSelect.enable();
		} else {
			this._folderSelect.disable();
		}
	}

	this._folderSelect.setSelectedValue(this._task.getFolderId());
};

ZmTaskEditView.prototype._populate =
function() {
	document.getElementById(this._subjectId).value = this._task.getName();
	document.getElementById(this._notesId).value = this._task.getNotesPart();
	document.getElementById(this._dateStartId).value = AjxDateUtil.simpleComputeDateStr(this._task.startDate);
	document.getElementById(this._dateDueId).value = AjxDateUtil.simpleComputeDateStr(this._task.endDate);
};

ZmTaskEditView.prototype._sizeChildren =
function(width, height) {
	var content = document.getElementById(this._contentId);
	if (content)
		Dwt.setSize(content, width, (height-45));

	var header = document.getElementById(this._headerId);
	if (header)
		Dwt.setSize(header, width);

	var title = document.getElementById(this._titleId);
	if (title)
		Dwt.setSize(title, "100%");
};

ZmTaskEditView.prototype._gotAttachments =
function() {
	// TODO
	return false;
};

ZmTaskEditView.prototype._submitAttachments =
function() {
	// TODO
};


// Listeners

ZmTaskEditView.prototype._taskChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TASK)
		return;

	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL)
		this._setTags(this._task);
};

ZmTaskEditView.prototype._selectListener =
function(ev) {
	this._isDirty = true;
};

ZmTaskEditView.prototype._dateButtonListener =
function(ev) {
	var dateField = document.getElementById(this._dateDueId);
	var aDate = AjxDateUtil.simpleParseDateStr(dateField.value);

	// if date was input by user and its fubar, reset to today's date
	if (isNaN(aDate) || aDate == null) {
		aDate = new Date();
	}

	// always reset the date to current field's date
	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	cal.setDate(aDate, true);
	ev.item.popup();
};

ZmTaskEditView.prototype._dateSelectionListener =
function(ev) {
	var dateField = document.getElementById(this._dateDueId);
	dateField.value = AjxDateUtil.simpleComputeDateStr(ev.detail);

	this._isDirty = true;
};


// Static Methods

ZmTaskEditView._onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);

	var key = DwtKeyEvent.getCharCode(ev);
	if (ev.metaKey || ev.altKey || ev.ctrlKey || DwtKeyMapMgr.isModifier(key) || key == DwtKeyMapMgr.TAB_KEYCODE)
		return;

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		view._isDirty = true;
		if (e.id.indexOf("_subject") != -1)
			view._setTitle(e.value);
	}

	return true;
};

ZmTaskEditView.getPrintHtml =
function(task, appCtxt) {
	// TODO
	return "TODO";
};
