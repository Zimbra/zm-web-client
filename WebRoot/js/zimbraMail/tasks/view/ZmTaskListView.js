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
	DwtListEditView.call(this, parent, null, Dwt.ABSOLUTE_STYLE, headerList);

	this.view = ZmController.TASKLIST_VIEW;
	this.type = ZmItem.TASK;
	this._controller = controller;
	this.setDropTarget(dropTgt);

	// create listeners for changes to the list model, and to tags
	this._listChangeListener = new AjxListener(this, this._changeListener);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	var tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
	if (tagList)
		tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
};

ZmTaskListView.prototype = new DwtListEditView;
ZmTaskListView.prototype.constructor = ZmTaskListView;


// Consts
ZmTaskListView.CLV_COLWIDTH_ICON =	19;
ZmTaskListView.CLV_COLWIDTH_DATE =	75;
ZmTaskListView.CLV_COLWIDTH_NOTES =	165;

ZmTaskListView.ID_PRIORITY			= "p--";
ZmTaskListView.ID_ATTACHMENT		= "a--";
ZmTaskListView.ID_TAG				= "t--";
ZmTaskListView.ID_FLAG				= "f--";
ZmTaskListView.ID_SUBJECT			= "s--";
ZmTaskListView.ID_PERCENT_COMPLETE	= "c--";
ZmTaskListView.ID_END_DATE			= "d--";
ZmTaskListView.ID_CREATED_DATE		= "r--";
ZmTaskListView.ID_NOTES				= "n--";


// Public Methods
ZmTaskListView.prototype.toString =
function() {
	return "ZmTaskListView";
};

ZmTaskListView.prototype.getController =
function() {
	return this._controller;
};


// Private Methods

ZmTaskListView.prototype._createItemHtml =
function(task, now, isDndIcon) {
	var	div = this._getDiv(task, isDndIcon);

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

		if (id.indexOf(ZmTaskListView.ID_PRIORITY) == 0) {
			// priority
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_PRIORITY);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_ATTACHMENT) == 0) {
			// attachment icon
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_ATTACHMENT);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_TAG) == 0) {
			// tags
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_TAG);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_FLAG) == 0) {
			// flag (checkbox)
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_FLAG);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_SUBJECT) == 0) {
			// subject
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_SUBJECT);
			htmlArr[idx++] = "'>";
			htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(task.getName(), true);
			htmlArr[idx++] = AjxEnv.isSafari ? "</div></td>" : "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_PERCENT_COMPLETE) == 0) {
			// percent complete
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_PERCENT_COMPLETE);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = task._percentComplete;
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_END_DATE) == 0) {
			// end/completion date
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_END_DATE);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = AjxDateUtil.computeDateStr(now, task.startDate);
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_CREATED_DATE) == 0) {
			// created on date
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_CREATED_DATE);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = "TODO";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_NOTES) == 0) {
			// notes
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_NOTES);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = "TODO";
			htmlArr[idx++] = "</td>";
		}
	}

	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};

ZmTaskListView.prototype._getFieldId =
function(item, field) {
	return ["V", this.view, "_", field, item.id].join("");
};

ZmTaskListView.prototype._getDiv =
function(item, isDndIcon, isMatched) {
	var	div = document.createElement("div");

	var base = "Row";
	div[DwtListView._KBFOCUS_CLASS] = "Row-Focus";
	div[DwtListView._STYLE_CLASS] = base;
	div[DwtListView._SELECTED_STYLE_CLASS] = [base, DwtCssStyle.SELECTED].join("-");	// Row-selected
	if (isDndIcon && isMatched) {
		var one = [base, DwtCssStyle.MATCHED, DwtCssStyle.DND].join("-");
		var two = [base, DwtCssStyle.DND].join("-");
		div[DwtListView._STYLE_CLASS] = [one, two].join(" ");							// Row-matched-dnd Row-dnd
	} else if (isMatched) {
		div[DwtListView._STYLE_CLASS] = [base, DwtCssStyle.MATCHED].join("-");		// Row-matched
	} else if (isDndIcon) {
		div[DwtListView._STYLE_CLASS] = [base, DwtCssStyle.DND].join("-");			// Row-dnd
		// bug fix #3654 - yuck
		if (AjxEnv.isMozilla) {
			div.style.overflow = "visible";
		}
	}
	div.className = div[DwtListView._STYLE_CLASS];

	if (isDndIcon) {
		Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
	}

	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);

	return div;
};

ZmTaskListView.prototype._getInlineWidget =
function(id) {
	if (id.indexOf(ZmTaskListView.ID_PRIORITY) != -1) {
		// todo - add DwtSelect
		return false;
	} else if (id.indexOf(ZmTaskListView.ID_ATTACHMENT) != -1) {
		return false;
	} else if (id.indexOf(ZmTaskListView.ID_TAG) != -1) {
		return false;
	} else if (id.indexOf(ZmTaskListView.ID_FLAG) != -1) {
		// todo - add checkbox
		return false;
	} else if (id.indexOf(ZmTaskListView.ID_SUBJECT) != -1) {
		if (!this._subjectInput) {
			this._subjectInput = document.createElement("input");
			this._subjectInput.type = "text";
			this._subjectInput.className = "InlineWidget";
			this.shell.getHtmlElement().appendChild(this._subjectInput);
		}
		return this._subjectInput;
	} else if (id.indexOf(ZmTaskListView.ID_PERCENT_COMPLETE) != -1) {
		if (!this._pCompleteSelect) {
			this._pCompleteSelect = new DwtSelect(this.shell, null, "InlineWidget");
			for (var i = 0; i <= 100; i += 10) {
				this._pCompleteSelect.addOption((i+"%"), i==0, i);
			}
		}
		return this._pCompleteSelect;
	} else if (id.indexOf(ZmTaskListView.ID_END_DATE) != -1) {
		// todo - add DwtCalendar
		return false;
	} else if (id.indexOf(ZmTaskListView.ID_CREATED_DATE) != -1) {
		return false;
	} else if (id.indexOf(ZmTaskListView.ID_NOTES) != -1) {
		return false;
	} else {
		return false;
	}
};

ZmTaskListView.prototype._setBoundsForActiveWidget =
function(element, id) {
	DwtListEditView.prototype._setBoundsForActiveWidget.call(this, element, id);

	// DwtSelect sucks.
	if (id.indexOf(ZmTaskListView.ID_PERCENT_COMPLETE) != -1) {
		this._activeWidget.setSize(Dwt.DEFAULT, "24");
	}
};

ZmTaskListView.prototype._setValueForActiveWidget =
function(activeEl, id) {
	if (id.indexOf(ZmTaskListView.ID_SUBJECT) != -1) {
		var cell = document.getElementById(id);
		if (cell) {
			// XXX: this is $$$ - need to cache!
			activeEl.value = AjxStringUtil.trim(AjxStringUtil.convertHtml2Text(cell));
		} else if (id.indexOf(ZmTaskListView.ID_PERCENT_COMPLETE) != -1) {
			// TODO
			// activeEl.setValue();
		}
	}
};

ZmTaskListView.prototype._setMouseOut =
function() {
	// DwtSelect really sucks.
	if (this._activeWidget instanceof DwtSelect) {
		this._activeWidget.getHtmlElement().onmouseout = AjxCallback.simpleClosure(this._activeWidgetMouseOut, this);
	} else {
		DwtListEditView.prototype._setMouseOut.call(this);
	}
};

ZmTaskListView.prototype._getHeaderList =
function(parent) {
	var shell = (parent instanceof DwtShell) ? parent : parent.shell;
	var appCtxt = shell.getData(ZmAppCtxt.LABEL);

	var hList = [];

	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_PRIORITY, null, "TaskP3", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.status));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_ATTACHMENT, null, "Attachment", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.attachment));
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hList.push(new DwtListHeaderItem(ZmTaskListView.ID_TAG, null, "MiniTag", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.tag));
	}
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_FLAG, null, "TaskCheckbox", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.done));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_SUBJECT, ZmMsg.subject, null, null, ZmItem.F_SUBJECT));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_PERCENT_COMPLETE, ZmMsg.complete, null, ZmTaskListView.CLV_COLWIDTH_DATE, ZmItem.F_COMPLETE));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_END_DATE, ZmMsg.dateDue, null, ZmTaskListView.CLV_COLWIDTH_DATE, ZmItem.F_DATE));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_CREATED_DATE, ZmMsg.createdOn, null, ZmTaskListView.CLV_COLWIDTH_DATE, ZmItem.F_CREATED_ON));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_NOTES, ZmMsg.notes, null, ZmTaskListView.CLV_COLWIDTH_NOTES));

	return hList;
};


// Listeners
ZmTaskListView.prototype._changeListener =
function(ev) {
	if ((ev.type != this.type) && (ZmList.MIXED != this.type))
		return;

	// TODO
};

ZmTaskListView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	// TODO
};
