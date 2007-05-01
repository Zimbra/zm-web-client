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

function ZmListView(parent, className, posStyle, view, type, controller, headerList, dropTgt) {

	if (arguments.length == 0) return;
	DwtListView.call(this, parent, className, posStyle, headerList);

	this.view = view;
	this.type = type;
	this._controller = controller;
	this.setDropTarget(dropTgt);
	this._viewPrefix = ["V", "_", this.view, "_"].join("");

	// create listeners for changes to the list model, folder tree, and tag list
	this._listChangeListener = new AjxListener(this, this._changeListener);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
	var tagList = this._appCtxt.getTagTree();
	if (tagList) {
		tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
	}
	this._appCtxt.getFolderTree().addChangeListener(new AjxListener(this, this._folderChangeListener));

	this._handleEventType = {};
	this._handleEventType[this.type] = true;
	this._disallowSelection = {};
	this._disallowSelection[ZmItem.F_FLAG] = true;
}

ZmListView.prototype = new DwtListView;
ZmListView.prototype.constructor = ZmListView;

ZmListView.prototype.toString = 
function() {
	return "ZmListView";
}

// column widths
ZmListView.COL_WIDTH_ICON 					= 19;
ZmListView.COL_WIDTH_DATE 					= 75;

ZmListView.ITEM_FLAG_CLICKED = DwtListView._LAST_REASON + 1;

ZmListView.prototype.getController =
function() {
	return this._controller;
}

ZmListView.prototype.set =
function(list, sortField) {
	var subList;
	if (list instanceof ZmList) {
		list.addChangeListener(this._listChangeListener);
		subList = list.getSubList(this.getOffset(), this.getLimit());
	} else {
		subList = list;
	}
	DwtListView.prototype.set.call(this, subList, sortField);
}

ZmListView.prototype.setUI = 
function(defaultColumnSort) {
	DwtListView.prototype.setUI.call(this, defaultColumnSort);
	this._resetColWidth();	// reset column width in case scrollbar is set
}

ZmListView.prototype.getLimit = 
function() {
	return this._appCtxt.get(ZmSetting.PAGE_SIZE);
};

ZmListView.prototype._changeListener =
function(ev) {
	
	var item = ev.item || ev.getDetail("items")[0];
	if (ev.handled || !this._handleEventType[item.type] && (this.type != ZmItem.MIXED)) { return; }

	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		DBG.println(AjxDebug.DBG2, "ZmListView: TAG");
		this._setTagImg(item);
	}
	
	if (ev.event == ZmEvent.E_FLAGS) { // handle "flagged" and "has attachment" flags
		DBG.println(AjxDebug.DBG2, "ZmListView: FLAGS");
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			var on = item[ZmItem.FLAG_PROP[flag]];
			if (flag == ZmItem.FLAG_FLAGGED) {
				var img = document.getElementById(this._getFieldId(item, ZmItem.F_FLAG));
				if (img && img.parentNode) {
					AjxImg.setImage(img.parentNode, on ? "FlagRed" : "Blank_16");
				}
			} else if (flag == ZmItem.FLAG_ATTACH) {
				var img = document.getElementById(this._getFieldId(item, ZmItem.F_ATTACHMENT));
				if (img && img.parentNode) {
					AjxImg.setImage(img.parentNode, on ? "Attachment" : "Blank_16");
				}
			}
		}
	}
	
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		DBG.println(AjxDebug.DBG2, "ZmListView: DELETE or MOVE");
        this.removeItem(item, true);
        this._controller._app._checkReplenishListView = this;
		this._controller._resetToolbarOperations();		
	}
}

ZmListView.prototype._checkReplenish =
function() {
	var respCallback = new AjxCallback(this, this._handleResponseCheckReplenish);
	this._controller._checkReplenish(respCallback);
};

ZmListView.prototype._handleResponseCheckReplenish =
function() {
	if (this.size() == 0) {
		this._controller._handleEmptyList(this);
	} else {
		this._controller._resetNavToolBarButtons(this._controller._getViewType());
		this._setNextSelection();
	}
};

ZmListView.prototype._folderChangeListener = 
function(ev) {
	// make sure this is current list view
	if (this._appCtxt.getCurrentController() != this._controller) { return; }
	// see if it will be handled by app's postNotify()
	if (this._controller._app._checkReplenishListView == this) { return; }

	var organizers = ev.getDetail("organizers");
	var organizer = (organizers && organizers.length) ? organizers[0] : ev.source;

	var id = organizer.id;
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY) {
		if (!fields) { return; }
		if (fields[ZmOrganizer.F_TOTAL]) {
			this._controller._resetNavToolBarButtons(this._controller._getViewType());
		}
	}
};

ZmListView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG) return;

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_COLOR])) {
		var divs = this._getChildren();
		var tag = ev.getDetail("organizers")[0];
		for (var i = 0; i < divs.length; i++) {
			var item = this.getItemFromElement(divs[i]);
			if (item && item.tags && (item.tags.length == 1) && (item.tags[0] == tag.id))
				this._setTagImg(item);
		}
	}
}

// returns all child divs for this list view
ZmListView.prototype._getChildren =
function() {
	return this._parentEl.childNodes;
}

// Common routines for createItemHtml()

ZmListView.prototype._getRowId =
function(item) {
	return this._getFieldId(item, ZmItem.F_ITEM_ROW);
};

// A table cell for one field of the item
ZmListView.prototype._getField =
function(htmlArr, idx, item, field, colIdx, params) {

	params = params || {};
	var fieldId = params.fieldId || this._getFieldId(item, field);
	var width = params.width || this._getFieldWidth(colIdx);

	if (field == ZmItem.F_TYPE) {
		htmlArr[idx++] = "<td style='width:";
		htmlArr[idx++] = width;
		htmlArr[idx++] = "' class='Icon'>";
		htmlArr[idx++] = AjxImg.getImageHtml(ZmItem.ICON[item.type], null, ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</td>";					
	} else if (field == ZmItem.F_FLAG) {
		var flagImageInfo = item.isFlagged ? "FlagRed" : "Blank_16";
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = " class='Flag'>";
		htmlArr[idx++] = AjxImg.getImageHtml(flagImageInfo, null, ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</td>";
	} else if (field == ZmItem.F_TAG) {
		if (!this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) { return idx; }
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = " class='Tag' id='";
		htmlArr[idx++] = this._getFieldId(item, ZmItem.F_TAG_CELL);
		htmlArr[idx++] = "'>";
		htmlArr[idx++] = this._getTagImgHtml(item, fieldId);
		htmlArr[idx++] = "</td>";
	} else if (field == ZmItem.F_ATTACHMENT) {
		var attImageInfo = item.hasAttach ? "Attachment" : "Blank_16";
		htmlArr[idx++] = "<td width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = " class='Attach'>";
		htmlArr[idx++] = AjxImg.getImageHtml(attImageInfo, null, ["id='", fieldId, "'"].join(""));
		htmlArr[idx++] = "</td>";					
	} else if (field == ZmItem.F_DATE) {
		htmlArr[idx++] = "<td id='";
		htmlArr[idx++] = fieldId;
		htmlArr[idx++] = "' width=";
		htmlArr[idx++] = width;
		htmlArr[idx++] = ">";
		htmlArr[idx++] = AjxDateUtil.computeDateStr(params.now || new Date(), item.date);
		htmlArr[idx++] = "</td>";
	}
	
	return idx;
}

// We use HTML to set the tag image, so that we don't need the blank image if there are no tags.
ZmListView.prototype._getTagImgHtml =
function(item, id) {
	var tagImageInfo = item.getTagImageInfo();
	var idStr = id ? ["id='", id, "'"].join("") : null;
	return AjxImg.getImageHtml(tagImageInfo, null, idStr);
}

// Find the tag cell and reset its HTML depending on the item's tags.
ZmListView.prototype._setTagImg =
function(item) {
	var tagCell = document.getElementById(this._getFieldId(item, ZmItem.F_TAG_CELL));
	if (!tagCell) { return; }
	tagCell.innerHTML = this._getTagImgHtml(item, this._getFieldId(item, ZmItem.F_TAG));
}

/**
 * Parse the DOM ID to figure out what got clicked. Most IDs will look something like 
 * "V_CLV_fg551".
 * Item IDs will look like "V_CLV_551". Participant IDs will look like
 * "V_CLV_pa551_0".
 *
 *     V_CLV		- conv list view (string of caps is from view constant in ZmController)
 *     _   			- separator
 *     fg  			- flag field (two small letters - see constants ZmItem.F_*)
 *     551 			- item ID
 *     _   			- separator
 *     0   			- first participant
 */
ZmListView.prototype._parseId =
function(id) {
	var m = id.match(/^V_(\w+)_([a-z]*)((DWT)?-?\d+)_?(\d*)$/);
	if (m) {
		return {view:m[1], field:m[2], item:m[3], participant:m[5]};
	} else {
		return null;
	}
}

ZmListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) return true;
	
	// check if we're hovering over a column header
	var type = Dwt.getAttr(div, "_type");
	if (type && type == DwtListView.TYPE_HEADER_ITEM) {
		var itemIdx = Dwt.getAttr(div, "_itemIndex");
		var field = DwtListHeaderItem.getHeaderField(this._headerList[itemIdx]._id);
		if (field == ZmItem.F_FLAG) {
			this.setToolTipContent(ZmMsg.flag);
		} else if (field == ZmItem.F_TAG) {
			this.setToolTipContent(ZmMsg.tag);
		} else if (field == ZmItem.F_ATTACHMENT) {
			this.setToolTipContent(ZmMsg.attachment);
		} else if (field == ZmItem.F_SUBJECT) {
			if (this._headerList[itemIdx]._sortable)
				this.setToolTipContent(ZmMsg.sortBySubject);
		} else if (field == ZmItem.F_COUNT) {
			this.setToolTipContent(ZmMsg.convCountTooltip);
		} else if (field == ZmItem.F_DATE) {
			if (this._headerList[itemIdx]._sortable)
				this.setToolTipContent(ZmMsg.sortByReceived);
		} else if (field == ZmItem.F_STATUS) {
			this.setToolTipContent(ZmMsg.messageStatus);
		} else if (field == ZmItem.F_FROM) {
			this.setToolTipContent(ZmMsg.sortByFrom);
		} else {
			this.setToolTipContent(null);
		}
	} else {
		var m = this._parseId(id);
		if (m && m.field) {
			var item = this.getItemFromElement(div);
			if (m.field == ZmItem.F_FLAG) {
				if (!item.isFlagged)
					ev.target.className = "ImgFlagRedDis";
			} else if (m.field == ZmItem.F_TAG) {
				this._setTagToolTip(div);
			} else if (m.field == ZmItem.F_STATUS) {
				this._setStatusToolTip(item);
			} else if (m.field == ZmItem.F_PARTICIPANT) {
				if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && item instanceof ZmContact) {	
					var toolTip = item.getToolTip(item.getAttr(ZmContact.F_email));
					this.setToolTipContent(toolTip);
				} else if (item.participants) {
				    this._setParticipantToolTip(item.participants.get(m.participant));
				}
			} else if (m.field == ZmItem.F_FROM) {
				this._setParticipantToolTip(item.getAddress(AjxEmailAddress.FROM));
			} else if (m.field == ZmItem.F_SUBJECT) {
				if (this._appCtxt.get(ZmSetting.MAIL_ENABLED) && item instanceof ZmMailMsg && item.isInvite() && item.needsRsvp()) {
					this.setToolTipContent(item.getInvite().getToolTip());
				} else {
				    var frag = item.fragment ? item.fragment : ZmMsg.fragmentIsEmpty;
					this.setToolTipContent(AjxStringUtil.htmlEncode(frag));
				}
			} else if (m.field == ZmItem.F_DATE) {
				this._setDateToolTip(item, div);
			} else if (m.field == ZmItem.F_FOLDER) {
				var folder = this._appCtxt.getById(item.folderId);
				if (folder && folder.parent) {
					this.setToolTipContent(folder.getPath());
				}
			} else if (m.field == ZmItem.F_TYPE) {
				this.setToolTipContent(ZmMsg[ZmItem.MSG_KEY[item.type]]);
			} else {
				this.setToolTipContent(null);
			}
		} else {
			this.setToolTipContent(null);
		}
	}
	return true;
}

ZmListView.prototype._mouseOutAction = 
function(ev, div) {
	DwtListView.prototype._mouseOutAction.call(this, ev, div);

	var id = ev.target.id || div.id;
	if (!id) return true;

	var type = Dwt.getAttr(div, "_type");
	if (type && type == DwtListView.TYPE_LIST_ITEM) {
		var m = this._parseId(id);
		if (m && m.field) {
			var item = this.getItemFromElement(div);
			if (m.field == ZmItem.F_FLAG) {
				if (!item.isFlagged)
					ev.target.className = "ImgBlank_16";
			}
		}
	}

	return true;
}

ZmListView.prototype._doubleClickAction =
function(ev, div) {
	var id = ev.target.id ? ev.target.id : div.id;
	if (!id) return true;

	var m = this._parseId(id);
	if (m && (m.field == ZmItem.F_FLAG)) {
		return false;
	}
	return true;
}

/*
* Add a few properties to the list event for the listener to pick up.
*/
ZmListView.prototype._setListEvent =
function (ev, listEv, clickedEl) {

	DwtListView.prototype._setListEvent.call(this, ev, listEv, clickedEl);

	var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1) ? ev.target.id : clickedEl.id;
	if (!id) return false; // don't notify listeners

	var m = this._parseId(id);
	if (ev.button == DwtMouseEvent.LEFT) {
		this._selEv.field = m ? m.field : null;
	} else if (ev.button == DwtMouseEvent.RIGHT) {
		this._actionEv.field = m ? m.field : null;
		if (m && m.field) {
			if (m.field == ZmItem.F_PARTICIPANT) {
				var item = this.getItemFromElement(clickedEl);
				this._actionEv.detail = item.participants ? item.participants.get(m.participant) : null;
			}
		}
	}
	return true;
};

ZmListView.prototype._allowLeftSelection =
function(clickedEl, ev, button) {
	// We only care about mouse events
	if (!(ev instanceof DwtMouseEvent))
		return true;
		
	var id = (ev.target.id && ev.target.id.indexOf("AjxImg") == -1) ? ev.target.id : clickedEl.id;
	var type = Dwt.getAttr(clickedEl, "_type");
	if (id && type && type == DwtListView.TYPE_LIST_ITEM) {
		var m = this._parseId(id);
		if (m && m.field) {
			return this._allowFieldSelection(m.item, m.field);
		}
	}
	return true;
}

ZmListView.prototype._allowFieldSelection =
function(id, field) {
	return (!this._disallowSelection[field]);
};

ZmListView.prototype._setParticipantToolTip = 
function(address) {
	if (!address) return;
	
	try {
		var toolTip;
		var addr = address.getAddress();
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && addr) {
			var contactApp = ZmAppCtxt.getFromShell(this.shell).getApp(ZmApp.CONTACTS);
			var contacts = AjxDispatcher.run("GetContacts");
			var contact = contacts ? contacts.getContactByEmail(addr) : null;
			if (contact)
				toolTip = contact.getToolTip(addr);
		}
		
		if (!toolTip) {
			var addrstr = address.toString();
			if (addrstr) {
			    toolTip = ["<div style='white-space:nowrap;'><span style='font-weight:bold'", ZmMsg.email, ": </span>", AjxStringUtil.htmlEncode(addrstr), "</div>"].join("");
			}
	    }
	    
	    if (toolTip) {
			this.setToolTipContent(toolTip);
		}
	} catch (ex) {
		this._appCtxt.getAppController()._handleException(ex, contactApp.getContactList, null, false, contactApp);
	}
}

ZmListView.prototype._setTagToolTip = 
function(div) {
	var item = this.getItemFromElement(div);
	var numTags = item.tags.length;
	if (!numTags) return;
	var tagList = this._appCtxt.getTagTree();
	var tags = item.tags;
	var html = new Array();
	var idx = 0;
	for (var i = 0; i < numTags; i++) {
		var tag = tagList.getById(tags[i]);
		html[idx++] = "<table><tr><td>";
		html[idx++] = AjxImg.getImageHtml(ZmTag.COLOR_MINI_ICON[tag.color]);
		html[idx++] = "</td><td valign='middle'>";
		html[idx++] = AjxStringUtil.htmlEncode(tag.name);
		html[idx++] = "</td></tr></table>";
	}
	this.setToolTipContent(html.join(""));
}

ZmListView.prototype._setStatusToolTip = 
function(item) {
	var tooltip = null;
	// check unread first since it has precedence
	if (item.isDraft)
		tooltip = ZmMsg.draft;
	else if (item.isUnread)
		tooltip = ZmMsg.unread;
	else if (item.isReplied)
		tooltip = ZmMsg.replied;
	else if (item.isForwarded)
		tooltip = ZmMsg.forwarded;
	else if (item.isSent)
		tooltip = ZmMsg.sentAt;
	else
		tooltip = ZmMsg.read;
	
	this.setToolTipContent(tooltip);
}

ZmListView.prototype._setDateToolTip = 
function(item, div) {
	if (!div._dateStr) {
		var date;
		var prefix = "";
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && item instanceof ZmContact) {
			date = item.modified;
			prefix = "<b>" + ZmMsg.lastModified + ":</b><br>";
		} else {
			date = item.date;
		}
		if (date) {
			var dateStr = new Array()
			var i = 0;
			dateStr[i++] = prefix;
			var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
			dateStr[i++] = dateFormatter.format(new Date(date));
			var delta = AjxDateUtil.computeDateDelta(date);
			if (delta) {
				dateStr[i++] = "<br><center><span style='white-space:nowrap'>(";
				dateStr[i++] = delta;
				dateStr[i++] = ")</span></center>";
			}
			div._dateStr = dateStr.join("");
		} else {
			div._dateStr = "";
		}
	}

	if (div._dateStr && div._dateStr != "")
		this.setToolTipContent(div._dateStr);
}

ZmListView.prototype._sortColumn = 
function(columnItem, bSortAsc) { 
	// change the sort preference for this view in the settings
	var sortBy = null;
	switch (columnItem._sortable) {
		case ZmItem.F_PARTICIPANT: 
		case ZmItem.F_FROM:
			sortBy = bSortAsc ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC; 
			break;
			
		case ZmItem.F_SUBJECT:
		case ZmItem.F_FRAGMENT:
			sortBy = bSortAsc ? ZmSearch.SUBJ_ASC : ZmSearch.SUBJ_DESC; 
			break;
			
		case ZmItem.F_DATE:
			sortBy = bSortAsc ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC; 
			break;
	}

	if (sortBy) {
		this._sortByString = sortBy;
		this._appCtxt.set(ZmSetting.SORTING_PREF, sortBy, this.view);
	}
}

ZmListView.prototype._setNextSelection = 
function() {
	// set the next appropriate selected item
	if (this._firstSelIndex < 0)
		this._firstSelIndex = 0;
	var item = this._list.get(this._firstSelIndex) || this._list.getLast();
	if (item)
		this.setSelection(item, false);
}
