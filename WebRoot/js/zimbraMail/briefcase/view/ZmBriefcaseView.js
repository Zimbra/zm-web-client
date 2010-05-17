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
 * Creates the briefcase view.
 * @class
 * This class represents the briefcase view.
 * 
 * @param	{ZmControl}		parent		the parent
 * @param	{ZmBriefcaseController}	controller		the controller
 * @param	{DwtDropTarget}		dropTgt		the drop target
 * 
 * @extends		ZmBriefcaseBaseView
 */
ZmBriefcaseView = function(parent, controller, dropTgt) {

	var params = {parent:parent, className:"ZmBriefcaseView",
				  view:ZmId.VIEW_BRIEFCASE, controller:controller,
				  dropTgt:dropTgt};
	ZmBriefcaseBaseView.call(this, params);
	
	this._setMouseEventHdlrs(); // needed by object manager
	this._setAllowSelection();
	
	this.setDropTarget(dropTgt);
};

ZmBriefcaseView.prototype = new ZmBriefcaseBaseView;
ZmBriefcaseView.prototype.constructor = ZmBriefcaseView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmBriefcaseView.prototype.toString =
function() {
	return "ZmBriefcaseView";
};

// Public methods

ZmBriefcaseView.prototype._createItemHtml =
function(item, params) {

    params = params || {};
	params.divClass = "ZmBriefcaseItem";
	var div = this._getDiv(item, params);

	var nameText;
	if (item instanceof ZmBriefcaseItem) {
		var name = item.name;
		if (name.length > 14) {
			name = name.substring(0, 14) + "...";
		}

        var restURL = item.getRestUrl();
        //added for bug: 45150
        if(item.isWebDoc()) {
            restURL = this._controller.getApp().fixCrossDomainReference(restURL);
        }

		nameText = ['<a href="', restURL  + (item.isWebDoc() ? "&preview=1" : ""), '" target="_blank">', name, '</a>'].join('');
	} else {
		nameText = item;
	}

	var html = [], idx = 0;
	var id = this._getFieldId(item, ZmItem.F_NAME);
	html[idx++] = "<div class='ZmThumbnailItem' id='" + id + "'>";
	var className = "Img" + item.getIcon(true) + " ZmThumbnailIcon";
	id = this._getFieldId(item, ZmItem.F_SUBJECT);
	html[idx++] = "<div class='" + className + "' id='" + id + "'></div>";
	html[idx++] = "</div>";
	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width='100%'>";
	html[idx++] = "<tr>";
	html[idx++] = "<td align='left'>";
	html[idx++] = "<div class='ZmThumbnailName'>";
	html[idx++] = "<span>" + nameText + "</span>";
	html[idx++] = "</div></td>";
	html[idx++] = "<td align='right'>";
	idx = this._getImageHtml(html, idx, item.getTagImageInfo(), this._getFieldId(item, ZmItem.F_TAG));
	html[idx++] = "</td></tr></table>";

	div.innerHTML = html.join("");

	return div;
};

ZmBriefcaseView.prototype._itemClicked =
function(clickedEl, ev) {
	
	this._selectedClass = "ZmBriefcaseItemSelected";
	this._kbFocusClass = "ZmBriefcaseItemFocused";
	this._normalClass = "ZmBriefcaseItem";
	this._disabledSelectedClass = "ZmBriefcaseItemDisabledSelect";
	this._rightClickClass = "ZmBriefcaseItemSelected";
	this._styleRe = new RegExp(
        "\\b(" +
        [   this._disabledSelectedClass,
            this._selectedClass,
            this._kbFocusClass,
            this._dndClass,
            this._rightClickClass
        ].join("|") +
        ")\\b", "g"
    );
    
	DwtListView.prototype._itemClicked.call(this, clickedEl, ev);
};

// Protected methods

ZmBriefcaseView.prototype._addRow =
function(row, index) {

	if (!row) { return; }

	// bug fix #1894 - check for childNodes length otherwise IE barfs
	var len = this._parentEl.childNodes.length;

    if (index != null && len > 0 && index != len) {
        var childNodes = this._parentEl.childNodes;
        this._parentEl.insertBefore(row, childNodes[index]);
    } else {
		this._parentEl.appendChild(row);
	}
};

// Grab more items if we're within one row of bottom
ZmBriefcaseView.prototype._getItemsNeeded =
function() {

	if (!(this._controller._list && this._controller._list.hasMore()) || !this._list) { return 0; }
	if (!this._rendered) { return 0; }

	var scrollDiv = this._parentEl;
	var fromBottom = (scrollDiv.scrollHeight - (scrollDiv.scrollTop + scrollDiv.clientHeight));
	return (fromBottom <= this._rowHeight) ? this.getLimit(1) : 0;
};
