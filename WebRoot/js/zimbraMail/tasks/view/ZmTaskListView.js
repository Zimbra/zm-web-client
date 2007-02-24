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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTaskListView(parent, controller, dropTgt) {
	if (arguments.length == 0) return;

	var headerList = this._getHeaderList(parent);
	ZmListView.call(this, parent, null, Dwt.ABSOLUTE_STYLE, ZmController.TASKLIST_VIEW, ZmItem.TASK, controller, headerList, dropTgt);

	// XXX: temp to turn inline editing on/off
	this._INLINE_EDIT_ENABLED = false;
};

ZmTaskListView.prototype = new ZmListView;
ZmTaskListView.prototype.constructor = ZmTaskListView;


// Consts
ZmTaskListView.COL_WIDTH_STATUS		= 145;

ZmTaskListView.KEY_ID				= "_keyId";


// Public Methods
ZmTaskListView.prototype.toString =
function() {
	return "ZmTaskListView";
};

ZmTaskListView.prototype.setSize =
function(width, height) {
	ZmListView.prototype.setSize.call(this, width, height);
	this._resetColWidth();
};

ZmTaskListView.prototype.setBounds =
function(x, y, width, height) {
	ZmListView.prototype.setBounds.call(this, x, y, width, height);
	this._resetColWidth();
};


// Private Methods

ZmTaskListView.prototype._createItemHtml =
function(task, now, isDndIcon) {
	var div = this._getDiv(task, isDndIcon);

	var htmlArr = [];
	var idx = 0;

	htmlArr[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=";
	htmlArr[idx++] = !isDndIcon ? "100%>" : (this.getSize().x + ">");
	htmlArr[idx++] = "<tr id='";
	htmlArr[idx++] = this._getFieldId(task, ZmItem.F_ITEM_ROW);
	htmlArr[idx++] = "'>";

	for (var i = 0; i < this._headerList.length; i++) {
		if (!this._headerList[i]._visible)
			continue;

		var id = this._headerList[i]._id;
		var width = AjxEnv.isIE || AjxEnv.isSafari
			? (this._headerList[i]._width + 4)
			: this._headerList[i]._width;

		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG]) == 0)
		{
			// Flags
			idx = this._getField(htmlArr, idx, task, ZmItem.F_FLAG, i);
		}
		else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, task, ZmItem.F_TAG, i);
		}
		else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_PRIORITY]) == 0)
		{
			// priority
			idx = this._getTableCell(task, ZmItem.F_PRIORITY, width, htmlArr, idx);
			htmlArr[idx++] = "<center><b>";
			htmlArr[idx++] = ZmCalItem.getLabelForPriority(task.priority, true);
			htmlArr[idx++] = "</b></center></td>";
		}
		else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0)
		{
			// attachment icon
			idx = this._getField(htmlArr, idx, task, ZmItem.F_ATTACHMENT, i);
		}
		else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0)
		{
			// subject
			idx = this._getTableCell(task, ZmItem.F_SUBJECT, width, htmlArr, idx);
			htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(task.getName(), true);
			htmlArr[idx++] = AjxEnv.isSafari ? "</div></td>" : "</td>";
		}
		else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS]) == 0)
		{
			// status
			idx = this._getTableCell(task, ZmItem.F_STATUS, width, htmlArr, idx);
			htmlArr[idx++] = ZmCalItem.getLabelForStatus(task.status);
			htmlArr[idx++] = "</td>";
		}
		else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_PCOMPLETE]) == 0)
		{
			// percent complete
			idx = this._getTableCell(task, ZmItem.F_PCOMPLETE, width, htmlArr, idx);
			htmlArr[idx++] = task.pComplete || 0;
			htmlArr[idx++] = "%</td>";
		}
		else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]) == 0)
		{
			// date
			idx = this._getField(htmlArr, idx, task, ZmItem.F_DATE, i, now);
		}
	}

	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};

ZmTaskListView.prototype._createTaskHtmlForMixed =
function(item, now, isDndIcon) {
	var	div = this._getDiv(item, isDndIcon);

	var htmlArr = [];
	var idx = 0;

	idx = this._getTable(htmlArr, idx, isDndIcon);
	idx = this._getRow(htmlArr, idx, item);

	for (var i = 0; i < this._headerList.length; i++) {
		var id = this._headerList[i]._id;
		var width = this._getFieldWidth(i);

		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG]) == 0) {
			// Flag
			idx = this._getField(htmlArr, idx, item, ZmItem.F_FLAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, item, ZmItem.F_TAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ICON]) == 0) {
			// Icon
			idx = this._getField(htmlArr, idx, item, ZmItem.F_ITEM_TYPE, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT]) == 0) {
			// Participant
			htmlArr[idx++] = "<td width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = " id='";
			htmlArr[idx++] = this._getFieldId(item, ZmItem.F_PARTICIPANT);
			htmlArr[idx++] = "'>";
			htmlArr[idx++] = "&nbsp;"; // print nothing for participant
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0) {
			// Attachment icon
			idx = this._getField(htmlArr, idx, item, ZmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(item, ZmItem.F_SUBJECT);
			htmlArr[idx++] = "'>";
			htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
			htmlArr[idx++] = item.name ? AjxStringUtil.htmlEncode(item.name, true) : AjxStringUtil.htmlEncode(ZmMsg.noSubject);
			htmlArr[idx++] = AjxEnv.isSafari ? "</div></td>" : "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]) == 0) {
			// Date
			idx = this._getField(htmlArr, idx, item, ZmItem.F_DATE, i, now);
		}

	}
	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};

ZmTaskListView.prototype._getActionMenuForColHeader =
function() {
	if (!this._colHeaderActionMenu) {
		// create a action menu for the header list
		this._colHeaderActionMenu = new ZmPopupMenu(this);
		var actionListener = new AjxListener(this, this._colHeaderActionListener);
		for (var i = 0; i < this._headerList.length; i++) {
			var hCol = this._headerList[i];
			// lets not allow columns w/ relative width to be removed (for now) - it messes stuff up
			if (hCol._width) {
				var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, {text:hCol._name, style:DwtMenuItem.CHECK_STYLE});
				mi.setData(ZmTaskListView.KEY_ID, hCol._id);
				mi.setChecked(true, true);
				this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
			}
		}
	}
	return this._colHeaderActionMenu;
};

ZmTaskListView.prototype._showInlineWidget =
function(cell, show) {
	var inlineId = cell ? Dwt.getAttr(cell, "_inlineId") : null;
	var widget = inlineId ? this._getInlineWidget(inlineId) : null;
	if (!widget) return;

	if (widget instanceof DwtControl) {
		widget.setVisibility(show);
		if (show) {
			Dwt.setHandler(widget.getHtmlElement(), DwtEvent.ONMOUSEOUT, ZmTaskListView._handleWidgetMouseOut);
		}
	} else if (widget.tagName) {
		Dwt.setVisibility(widget, show);
		if (show) {
			Dwt.setHandler(widget, DwtEvent.ONMOUSEOUT, ZmTaskListView._handleWidgetMouseOut);
		}
	}

	if (show) {
		this._setBoundsForActiveWidget(widget, cell, inlineId);
		this._setValueForActiveWidget(widget, cell, inlineId);
	}
};

ZmTaskListView.prototype._getInlineWidget =
function(id) {
	if (!this._INLINE_EDIT_ENABLED)
		return false;

	if (id == ZmTaskListView.ID_SUBJECT)
	{
		if (!this._subjectInput) {
			this._subjectInput = document.createElement("input");
			this._subjectInput.type = "text";
			this._subjectInput.className = "InlineWidget";
			this.shell.getHtmlElement().appendChild(this._subjectInput);
		}
		return this._subjectInput;
	}
	else if (id == ZmTaskListView.ID_PERCENT_COMPLETE)
	{
		if (!this._pCompleteSelect) {
			this._pCompleteSelect = new DwtSelect(this.shell, null, "InlineWidget");
			for (var i = 0; i <= 100; i += 10) {
				this._pCompleteSelect.addOption((i+"%"), i==0, i);
			}
		}
		return this._pCompleteSelect;
	}
	else
	{
		return false;
	}
};

ZmTaskListView.prototype._setBoundsForActiveWidget =
function(widget, element, id) {
	var bounds = element ? Dwt.getBounds(element) : null;
	if (!bounds) return;

	// fudge factor for selected listview item
	var selection = this.getSelection();
	var taskId = Dwt.getAttr(element, "_taskId");
	if (selection.length > 1 || selection[0].id != taskId)
		bounds.y -= 2;

	if (widget instanceof DwtControl)
	{
		widget.setPosition(DwtControl.ABSOLUTE_STYLE);
		widget.setScrollStyle(Dwt.CLIP);
		widget.setBounds(bounds.x, bounds.y, bounds.width, Dwt.DEFAULT);
	}
	else if (widget.tagName)
	{
		Dwt.setPosition(widget, Dwt.ABSOLUTE_STYLE);
		Dwt.setBounds(widget, bounds.x, bounds.y, bounds.width, Dwt.DEFAULT);
	}

	// DwtSelect sucks.
	if (id == ZmTaskListView.ID_PERCENT_COMPLETE) {
		widget.setSize(Dwt.DEFAULT, "24");
	}
};

ZmTaskListView.prototype._setValueForActiveWidget =
function(widget, element, id) {
	if (id == ZmTaskListView.ID_SUBJECT)
	{
		// XXX: this is $$$ - need to cache!
		widget.value = AjxStringUtil.trim(AjxStringUtil.convertHtml2Text(element));
	}
	else if (id == ZmTaskListView.ID_PERCENT_COMPLETE)
	{
		// TODO
		// activeEl.setValue();
	}
};

ZmTaskListView.prototype._getTableCell =
function(task, id, width, htmlArr, idx) {
	htmlArr[idx++] = "<td style='padding:3px' id='";
	htmlArr[idx++] = this._getFieldId(task, id);

	if (width) {
		htmlArr[idx++] = "' width=";
		htmlArr[idx++] = width;
	}

	htmlArr[idx++] = " _inlineId='";
	htmlArr[idx++] = id;
	htmlArr[idx++] = "'";
	htmlArr[idx++] = " _taskId='";
	htmlArr[idx++] = task.id;
	htmlArr[idx++] = "' onmouseover='ZmTaskListView._handleMouseOver(this, true)'>";

	return idx;
};

ZmTaskListView.prototype._getHeaderList =
function(parent) {
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL);

	var hList = [];

	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG], null, "FlagRed", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.flag));
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_TAG], null, "MiniTag", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_PRIORITY], null, "TaskP3", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.priority));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT], null, "Attachment", ZmListView.COL_WIDTH_ICON, null, null, null, ZmMsg.attachment));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT], ZmMsg.subject, null, null/*, ZmItem.F_SUBJECT*/));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_STATUS], ZmMsg.status, null, ZmTaskListView.COL_WIDTH_STATUS));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_PCOMPLETE], ZmMsg.percentComplete, null, ZmListView.COL_WIDTH_DATE));
	hList.push(new DwtListHeaderItem(ZmListView.FIELD_PREFIX[ZmItem.F_DATE], ZmMsg.dateDue, null, ZmListView.COL_WIDTH_DATE));

	return hList;
};


// Listeners

ZmTaskListView.prototype._changeListener =
function(ev) {
	if ((ev.type != this.type) && (ZmList.MIXED != this.type))
		return;

	var fields = ev.getDetail("fields");
	var items = ev.getDetail("items");

	if (ev.event == ZmEvent.E_MODIFY) {
		// HACK HACK HACK
		// XXX: optimize later - for now refetch list from server
		this._controller._list._redoSearch(this._controller);
	}

	ZmListView.prototype._changeListener.call(this, ev);

	if (ev.event == ZmEvent.E_CREATE ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.E_MOVE)
	{
		this._resetColWidth();
	}
};

ZmTaskListView.prototype._colHeaderActionListener =
function(ev) {
	var menuItemId = ev.item.getData(ZmTaskListView.KEY_ID);

	for (var i = 0; i < this._headerList.length; i++) {
		var col = this._headerList[i];
		if (col._id == menuItemId) {
			col._visible = !col._visible;
			break;
		}
	}

	this._relayout();
};


// Static Methods

ZmTaskListView._handleMouseOver =
function(cell, isMouseOver) {
//DBG.println("ZmTaskListView._handleMouseOver " + cell.id);
	var appCtxt = window.parentController
		? window.parentController._appCtxt
		: window._zimbraMail._appCtxt;

	var tlv = appCtxt.getApp(ZmApp.TASKS).getTaskListController().getCurrentView();
	tlv._showInlineWidget(cell, isMouseOver);
};


ZmTaskListView._handleWidgetMouseOut =
function(ev) {
	if (ev.target.tagName) {
//		DBG.println("ZmTaskListView._handleWidgetMouseOut " + ev.target.tagName);
		Dwt.setVisibility(ev.target, false);
	}
};