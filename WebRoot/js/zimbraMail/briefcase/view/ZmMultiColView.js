/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 */

/**
 * Creates the briefcase multi-column view.
 * @class
 * This class represents the briefcase multi-column  view.
 * 
 * @param	{ZmControl}		parent		the parent
 * @param	{ZmBriefcaseController}	controller		the controller
 * @param	{DWtDropTarget}		dropTgt		the drop target
 * 
 * @extends		ZmBriefcaseBaseView
 */
ZmMultiColView = function(parent, controller, dropTgt) {

	DwtComposite.call(this, {parent:parent, className:"ZmMultiColView", posStyle:Dwt.ABSOLUTE_STYLE});

	this._controller = controller;
	this.view = ZmId.VIEW_BRIEFCASE_COLUMN;

	// each column has a TD which contains a DIV which contains a ZmColListView
	this._divIds	= [];	// HTML ID of containing DIV
	this._divs		= [];	// containing DIV
	this._listView	= [];	// ZmColListView
	this._divCache	= [];	// unused column DIVs
	this._ctlrList	= [];	// ZmList associated with a list view

	this._nextIndex		= 0;	// index for new column (also number of columns)
	this._numDivs		= 0;	// total number of column DIVs (including unused)
	this._curListIndex	= 0;	// index of current list column
	this._curListView	= null;	// list view with current focus

	this.addListColumn(dropTgt);
	this._curListView = this._listView[0];

	//override the default style set on DwtControl module
	var el = this.getHtmlElement();
	el.style.overflow = "";
}

ZmMultiColView.prototype = new DwtComposite;
ZmMultiColView.prototype.constructor = ZmMultiColView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmMultiColView.prototype.toString = function() {
	return "ZmMultiColView";
};

// The next few funcs are passed through to the first list view
ZmMultiColView.prototype.getTitle =
function() {
	return this._listView[0].getTitle();
};

ZmMultiColView.prototype.processUploadFiles =
function() {
	return this._listView[0].processUploadFiles();
};

ZmMultiColView.prototype.uploadFiles =
function() {
	return this._listView[0].uploadFiles();
};

/**
 * Gets the list view.
 * 
 * @param	{int}	idx		the index
 * @return	{ZmColListView}		the list view
 */
ZmMultiColView.prototype.getListView =
function(idx) {
	return (idx >= 0)? this._listView[idx] : this._listView[0];
};

/**
 * Adds a column that displays a list of items.
 * 
 * @param	{DwtDropTarget}		dropTgt		the drop target
 * @return	{ZmColListView}	the list view
 */
ZmMultiColView.prototype.addListColumn =
function(dropTgt) {

	var idx = this._nextIndex++;
	var divId = this._divIds[idx] = [this.view, "col", idx].join(DwtId.SEP);

	var el = this.getHtmlElement();
	if (!this._table) {
		this._tableId = Dwt.getNextId();
		el.innerHTML = ['<table cellpadding=0 cellspacing=0 id="',this._tableId,'"><tbody><tr></tr></tbody></table>'].join("");
		this._table = document.getElementById(this._tableId);
		var tbody = this._table.tBodies[0];
		this._row = tbody.rows[0];
	}

	var div = this.getColumnDiv();
	div.id = this._divIds[idx];
	this._divs[idx] = div;

	var lv = this._listView[idx] = new ZmColListView(this, this._controller, dropTgt, idx);
	lv.reparentHtmlElement(this._divIds[idx]);

	// so that scroll event gets handed to list view (div is its parent element and gets the event)
	DwtControl.ALL_BY_ID[divId] = lv;

	return lv;
};

/**
 * Removes the list column.
 * 
 * @param	{int}	idx		the index
 */
ZmMultiColView.prototype.removeListColumn =
function(idx) {
	var div = this._divs[idx];
	if (div && div.parentNode) {
		this._nextIndex--;

		var cell = div.parentNode;
		cell.removeChild(div);

		if (this._row) {
			this._row.deleteCell(cell.cellIndex);
		}

		var lv = this._listView[idx];
		if (lv) {
			lv.dispose();
		}
		delete this._divs[idx];
		delete this._listView[idx];
	}
	return idx;
};

ZmMultiColView.prototype.removeChildColumns =
function(idx) {
	this.clearFolderProps();
	for (var i = idx + 1; i < this._listView.length; i++) {
		this.removeListColumn(i);
	}
};

// Set some props in the controller so that it considers the active column to
// be a regular list view.
ZmMultiColView.prototype.setCurrentListIndex =
function(index) {

	this._curListIndex = index;
	this._curListView = this._listView[index];
	this._controller._listView[this.view] = this._listView[index];
	if (this._ctlrList[index]) {
		this._controller._list = this._ctlrList[index];
	}
};

/**
 * Resets the columns.
 */
ZmMultiColView.prototype.resetColumns =
function() {
	this.removeChildColumns(0);
	this.setCurrentListIndex(0);
};

ZmMultiColView.prototype.expandFolder =
function(folderId) {

	var listView = this.addListColumn();
	this.setCurrentListIndex(listView._colIdx);
	this._noReset = true;
	listView.folderId = folderId;
	this._controller._app.search({folderId:folderId, noClear:true});
};

ZmMultiColView.prototype.set =
function(list) {

	if (!this._curListView._itemsToAdd && !this._noReset) {
		this.resetColumns();
	} else {
		this.removeChildColumns(this._curListIndex);
	}
	this._noReset = false;
	this._curListView.set(list);
	this._ctlrList[this._curListIndex] = list;
	this.setCurrentListIndex(this._curListIndex);
};

ZmMultiColView.prototype.showFileProps =
function(item) {

	this.clearFolderProps();

	var el = this.getHtmlElement();

	var div = this.getColumnDiv();
	div.className = "ZmColListDiv ZmColListDivPad";

	var icon = "Img" + item.getIcon(true);
	var briefcase = appCtxt.getById(item.folderId);
	var path = briefcase ? briefcase.getPath() : "";

	var name = item.name;
	if (name.length > 20) {
		name = name.substring(0,20) + "..";
	}

	var restURL = item.getRestUrl();
    var originalRestURL = item.getRestUrl(false, true);

    //added for bug: 45150
    if(item.isWebDoc()) {
        restURL = this._controller.getApp().fixCrossDomainReference(restURL);
        originalRestURL = this._controller.getApp().fixCrossDomainReference(originalRestURL);
    }
    if(window.isTinyMCE && item.isWebDoc()) {
        restURL = restURL + "&editor=tinymce";//+"&preview=1";

    }

    var fileLink = [ '<a href="', restURL, '" target="_blank">', name, '</a>' ].join("");

	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);

	var prop = [
		{name:ZmMsg.name, value:fileLink},
	];

    if (item.isRealFile() || item.isSlideDoc() || item.isWebDoc()) {
        var actionLink;
        if (item.isSlideDoc()) {
            actionLink = [ '<a href="', originalRestURL, "?fmt=html&run=1", '" target="_blank">', ZmMsg.slides_launchSlideShow, '</a>' ].join("");
        } else if(item.isWebDoc()) {
            actionLink = [ '<a href="', originalRestURL, "?fmt=html" + (window.isTinyMCE ?  "&editor=tinymce" : "") , '" target="_blank">', ZmMsg.edit, '</a>' ].join("");
        } else {
            actionLink = [ '<a href="', originalRestURL, "?disp=a", '" target="_blank">', ZmMsg.saveFile, '</a>' ].join("");
        }
        prop.push({name:ZmMsg.action, value:actionLink});
    }

	prop.push({name:ZmMsg.folder, value:path});
	var mimeInfo = item.contentType ? ZmMimeTable.getInfo(item.contentType) : null;
	if (mimeInfo) {
		prop.push({name:ZmMsg.type, value:mimeInfo.desc});
	}

    prop = prop.concat([
		{name:ZmMsg.size,		value:AjxUtil.formatSize(item.size)},
		{name:ZmMsg.created,	value:dateFormatter.format(item.createDate)},
		{name:ZmMsg.creator,	value:item.creator},
		{name:ZmMsg.modified,	value:dateFormatter.format(item.modifyDate)},
		{name:ZmMsg.modifier,	value:item.modifier}
    ]);

	var imgSrc = restURL.toLowerCase().match(/\.jpg$|\.gif$|\.jpeg$|\.bmp$$/) ? restURL : null;

	var subs = {
		imgSrc:			imgSrc,
		icon:			icon,
		previewId:		Dwt.getNextId(),
		id:				Dwt.getNextId(),
		fileProperties:	prop
	};

    div.innerHTML = AjxTemplate.expand("briefcase.Briefcase#file_properties", subs);

	this._folderPropsDiv = div;
	this._sizeChildren();
	this.scrollToEnd();
};

ZmMultiColView.prototype.clearFolderProps =
function() {
	if (this._folderPropsDiv) {
		this._folderPropsDiv.parentNode.removeChild(this._folderPropsDiv);
		this._folderPropsDiv = null;
	}
};

ZmMultiColView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._sizeChildren(width, height);
};


ZmMultiColView.prototype._sizeChildren =
function() {
	var size = Dwt.getSize(this.getHtmlElement());
	for (var i in this._divs) {
		Dwt.setSize(this._divs[i], Dwt.DEFAULT, size.y);
	}
	for (var i in this._divCache) {
		Dwt.setSize(this._divCache[i],Dwt.DEFAULT, size.y);
	}
	if (this._folderPropsDiv) {
		Dwt.setSize(this._folderPropsDiv, Dwt.DEFAULT, size.y);
	}
};

ZmMultiColView.prototype.scrollToEnd =
function() {
	if (this._divCache.length > 0) { return; }
	var el = this.getHtmlElement();
	el.scrollLeft = el.scrollWidth;
};

ZmMultiColView.prototype.getColumnDiv =
function() {

	if (!this._row) { return; }

	var size = Dwt.getSize(this.getHtmlElement());
	var limit = Math.max(Math.floor(size.x / 250), 4);

	if (this._numDivs < limit) {
		var neededCols = limit - this._numDivs;
		for (var i = 0; i < neededCols; i++) {
			this._divCache.push(this.createDiv());
		}
		return this._divCache.shift();
	} else if (this._divCache.length > 0) {
		return this._divCache.shift();
	} else {
		return this.createDiv();
	}
};

ZmMultiColView.prototype.createDiv =
function() {

	if (!this._row) { return; }

	var cell = this._row.insertCell(this._row.cells.length);
	cell.className = "ZmColListCell";
	var div = document.createElement("div");
	div.className = "ZmColListDiv";
	cell.appendChild(div);
	this._numDivs++;

	return div;
};
