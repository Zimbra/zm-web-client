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
	this.setDropTarget(dropTgt);

	this._controller = controller;
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	this._listChangeListener = new AjxListener(this, this._changeListener);

	// XXX: temp to turn inline editing on/off
	this._INLINE_EDIT_ENABLED = false;
};

ZmTaskListView.prototype = new DwtListEditView;
ZmTaskListView.prototype.constructor = ZmTaskListView;


// Consts
ZmTaskListView.CLV_COLWIDTH_ICON	= 19;
ZmTaskListView.CLV_COLWIDTH_DATE	= 75;
ZmTaskListView.CLV_COLWIDTH_STATUS	= 145;

ZmTaskListView.ID_PRIORITY			= "p--";
ZmTaskListView.ID_ATTACHMENT		= "a--";
ZmTaskListView.ID_FLAG				= "f--";
ZmTaskListView.ID_SUBJECT			= "s--";
ZmTaskListView.ID_STATUS			= "t--";
ZmTaskListView.ID_PERCENT_COMPLETE	= "c--";
ZmTaskListView.ID_END_DATE			= "d--";

ZmTaskListView.KEY_ID				= "_keyId";


// Public Methods
ZmTaskListView.prototype.toString =
function() {
	return "ZmTaskListView";
};

ZmTaskListView.prototype.getController =
function() {
	return this._controller;
};

ZmTaskListView.prototype.set =
function(list, sortField) {
	var subList = list;
	if (list instanceof ZmList) {
		list.addChangeListener(this._listChangeListener);
		subList = list.getVector();
	}

	DwtListEditView.prototype.set.call(this, subList, sortField);
};

ZmTaskListView.prototype.setSize =
function(width, height) {
	DwtListEditView.prototype.setSize.call(this, width, height);
	this._resetColWidth();
};

ZmTaskListView.prototype.setBounds =
function(x, y, width, height) {
	DwtListEditView.prototype.setBounds.call(this, x, y, width, height);
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

		if (id.indexOf(ZmTaskListView.ID_PRIORITY) == 0) {
			// priority
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_PRIORITY);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = "><center><b>";
			htmlArr[idx++] = ZmCalItem.getLabelForPriority(task.priority, true);
			htmlArr[idx++] = "</b></center></td>";
		} else if (id.indexOf(ZmTaskListView.ID_ATTACHMENT) == 0) {
			// attachment icon
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_ATTACHMENT);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			var attImageInfo = task.hasAttachments() ? "Attachment" : "Blank_16";
			AjxImg.getImageHtml(attImageInfo);
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_FLAG) == 0) {
			// flag (checkbox)
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_FLAG);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = "&nbsp;";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_SUBJECT) == 0) {
			// subject
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_SUBJECT);
			htmlArr[idx++] = "'>";
			htmlArr[idx++] = AjxEnv.isSafari ? "<div style='overflow:hidden'>" : "";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(task.getName(), true);
			htmlArr[idx++] = AjxEnv.isSafari ? "</div></td>" : "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_STATUS) == 0) {
			// status
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_STATUS);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = ZmCalItem.getLabelForStatus(task.status);
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmTaskListView.ID_PERCENT_COMPLETE) == 0) {
			// percent complete
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_PERCENT_COMPLETE);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			htmlArr[idx++] = task.pComplete || 0;
			htmlArr[idx++] = "%</td>";
		} else if (id.indexOf(ZmTaskListView.ID_END_DATE) == 0) {
			// due date
			htmlArr[idx++] = "<td id='";
			htmlArr[idx++] = this._getFieldId(task, ZmTaskListView.ID_END_DATE);
			htmlArr[idx++] = "' width=";
			htmlArr[idx++] = width;
			htmlArr[idx++] = ">";
			if (task.endDate)
				htmlArr[idx++] = AjxDateUtil.computeDateStr(now, task.endDate);
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
		div.style.padding = "4px"; // HACK. whateva.
	}

	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);

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
				var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, null, hCol._name, null, null, DwtMenuItem.CHECK_STYLE);
				mi.setData(ZmTaskListView.KEY_ID, hCol._id);
				mi.setChecked(true, true);
				this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
			}
		}
	}
	return this._colHeaderActionMenu;
};

ZmTaskListView.prototype._getDnDIcon =
function(dragOp) {
	var dndSelection = this.getDnDSelection();
	if (dndSelection == null)
		return null;

	var icon;
	var div;
	var roundPlusStyle;
	this._dndImg = null;

	if (!(dndSelection instanceof Array) || dndSelection.length == 1) {
		var item = null;
		if (dndSelection instanceof Array) {
			item = dndSelection[0];
		} else {
			item = dndSelection;
		}
		icon = this._createItemHtml(item, new Date(), true);
		icon._origClassName = icon.className;

		roundPlusStyle = "position:absolute; top:18; left:-11;visibility:hidden";
	} else {
		// Create multi one
		icon = document.createElement("div");
		icon.className = "DndIcon";
		Dwt.setPosition(icon, Dwt.ABSOLUTE_STYLE);

		AjxImg.setImage(icon, "DndMultiYes_48");
		this._dndImg = icon;

		div = document.createElement("div");
		Dwt.setPosition(div, Dwt.ABSOLUTE_STYLE);
		div.innerHTML = "<table><tr><td class='DndIconTextLabel'>"
						+ dndSelection.length + "</td></tr></table>";
		icon.appendChild(div);

		roundPlusStyle = "position:absolute;top:30;left:0;visibility:hidden";

		// The size of the Icon is envelopeImg.width + sealImg.width - 20, ditto for height
		Dwt.setBounds(icon, Dwt.LOC_NOWHERE, Dwt.LOC_NOWHERE, 43 + 32 - 16, 36 + 32 - 20);
	}

	var imgHtml = AjxImg.getImageHtml("RoundPlus", roundPlusStyle);
	icon.appendChild(Dwt.parseHtmlFragment(imgHtml));

	this.shell.getHtmlElement().appendChild(icon);

	// If we have multiple items selected, then we have our cool little dnd icon,
	// so position the text in the middle of the seal
	if (div) {
		var sz = Dwt.getSize(div);
		Dwt.setLocation(div, 16 + (32 - sz.x) / 2, 19 + (32 - sz.y) / 2);
	}

	Dwt.setZIndex(icon, Dwt.Z_DND);
	return icon;
}

ZmTaskListView.prototype._setDnDIconState =
function(dropAllowed) {
	// If we are moving multiple items then set borders & icons, else delegate up
	// to DwtControl.prototype._setDnDIconState()
	if (this._dndImg)
		AjxImg.setImage(this._dndImg, dropAllowed ? "DndMultiYes_48" : "DndMultiNo_48");
	else {
		this._dndIcon.className = (dropAllowed) ? this._dndIcon._origClassName + " DropAllowed"
												: this._dndIcon._origClassName + " DropNotAllowed";
	}
}

ZmTaskListView.prototype._getInlineWidget =
function(id) {
	if (!this._INLINE_EDIT_ENABLED)
		return false;

	if (id.indexOf(ZmTaskListView.ID_PRIORITY) != -1) {
		// todo - add DwtSelect
		return false;
	} else if (id.indexOf(ZmTaskListView.ID_ATTACHMENT) != -1) {
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
	} else if (id.indexOf(ZmTaskListView.ID_STATUS) != -1) {
		// todo - add DwtSelect
		return false;
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
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_FLAG, null, "TaskCheckbox", ZmTaskListView.CLV_COLWIDTH_ICON, null, null, null, ZmMsg.done));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_SUBJECT, ZmMsg.subject));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_STATUS, ZmMsg.status, null, ZmTaskListView.CLV_COLWIDTH_STATUS));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_PERCENT_COMPLETE, ZmMsg.percentComplete, null, ZmTaskListView.CLV_COLWIDTH_DATE));
	hList.push(new DwtListHeaderItem(ZmTaskListView.ID_END_DATE, ZmMsg.dateDue, null, ZmTaskListView.CLV_COLWIDTH_DATE));

	return hList;
};


// Listeners

ZmTaskListView.prototype._changeListener =
function(ev) {
	if ((ev.type != this.type) && (ZmList.MIXED != this.type))
		return;

	var fields = ev.getDetail("fields");
	var items = ev.getDetail("items");

	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		for (var i = 0; i < items.length; i++) {
			var row = document.getElementById(this._getItemId(items[i]));
			if (row) {
				this._parentEl.removeChild(row);
				this._selectedItems.remove(row);
			}
			if (this._list) this._list.remove(items[i]);
		}
	} else if (ev.event == ZmEvent.E_MODIFY) {
		// check which field changed
	}

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
