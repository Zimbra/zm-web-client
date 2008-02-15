/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmConvView = function(parent, controller, dropTgt) {

	ZmDoublePaneView.call(this, parent, "ZmConvView", Dwt.ABSOLUTE_STYLE, ZmController.CONV_VIEW, controller, dropTgt);

	this._changeListener = new AjxListener(this, this._convChangeListener);
	
	// add change listener to tree view to catch empty trash action
	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		folderTree.addChangeListener(new AjxListener(this, this._folderChangeListener));
	}
	
	// Add a change listener to taglist to track tag color changes
	this._tagList = appCtxt.getTagTree();
	if (this._tagList) {
		this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
	}
	
	this._controller = controller;
}

ZmConvView.prototype = new ZmDoublePaneView;
ZmConvView.prototype.constructor = ZmConvView;

ZmConvView._TAG_CLICK = "ZmConvView._TAG_CLICK";
ZmConvView._TAG_ANCHOR = "TA";
ZmConvView._TAGLIST_HEIGHT = 18;


// Public methods

ZmConvView.prototype.toString = 
function() {
	return "ZmConvView";
};

ZmConvView.prototype.addTagClickListener =
function(listener) {
	this.addListener(ZmConvView._TAG_CLICK, listener);
};

ZmConvView.prototype.setItem =
function(conv) {
	if (!(conv instanceof ZmConv)) { return; }
		
	// Remove and re-add listeners for current conversation if it exists
	if (this._conv) {
		this._conv.removeChangeListener(this._changeListener);
	}
	this._conv = conv;
	conv.addChangeListener(this._changeListener);
	
	this._mailListView.set(conv.msgs, ZmItem.F_DATE);
	this._setSubject(conv.subject);
	this._setTags(conv);
	
	// display "hot" message (or newest if no search performed)
	var hot = this._conv.getFirstHotMsg({offset:this._mailListView.getOffset(), limit:this._mailListView.getLimit()});
	this._mailListView.setSelection(hot);
};

ZmConvView.prototype.reset = 
function() {
	this._sashMoved = false;
	ZmDoublePaneView.prototype.reset.call(this);
};

/*
* Handles a change of state in which the view cannot currently be shown. That happens via the
* app view manager when the view is popped, or when it is removed from the hidden stack. The
* view must be pushed again to become visible. Since convs and their msg lists are cached, we
* want to remove their listeners; otherwise we have models that don't correspond to the 
* current conv view calling the view's listeners.
*/
ZmConvView.prototype.deactivate = 
function() {
	if (this._conv.msgs)
		this._conv.msgs.removeAllChangeListeners();
	this._conv.removeAllChangeListeners();
};

ZmConvView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._conv.subject].join(": ");
};

// Private / protected methods

ZmConvView.prototype._resetSize = 
function(newWidth, newHeight) {
	if (newHeight <= 0)
		return;
	
	var summaryHeight = this._summary.getHtmlElement().offsetHeight;
	if (this._isMsgViewVisible()) {
		var sashHeight = this._msgSash.getSize().y;
		if (!this._sashMoved) {
			// calc. height MLV based on num of msgs in conv
			var list = this._mailListView.getList();
			if (list && list.size() > 0) {
				var threshold = Math.min(list.size() + 1, 6);
				var div = document.getElementById(this._mailListView._getItemId(list.get(0)));
				var maxHeight = Dwt.getSize(div).y * threshold;
				this._summaryTotalHeight = summaryHeight + maxHeight + DwtListView.HEADERITEM_HEIGHT;
				this._mailListView.resetHeight(maxHeight + DwtListView.HEADERITEM_HEIGHT);
				var mvHeight = Math.max((newHeight - (this._summaryTotalHeight + sashHeight)), 0);
				this._msgView.setBounds(Dwt.DEFAULT, this._summaryTotalHeight + sashHeight, Dwt.DEFAULT, mvHeight);
				this._msgSash.setLocation(Dwt.DEFAULT, this._summaryTotalHeight);
			}
		} else {
			var mvHeight = Math.max(newHeight - (this._msgView.getLocation().y - sashHeight), 0);
			var minHeight = this._msgView.getMinHeight();
			
			if (mvHeight < minHeight) {
				this._mailListView.resetHeight(newHeight - (summaryHeight + minHeight));
				this._msgView.setBounds(Dwt.DEFAULT, (newHeight - minHeight) + sashHeight, Dwt.DEFAULT, minHeight - sashHeight);
				this._msgSash.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y - sashHeight);
			} else {
				this._msgView.setSize(Dwt.DEFAULT, mvHeight - sashHeight);
			}
		}
	} else {
		this._mailListView.resetHeight(newHeight - summaryHeight);
	}

	if (AjxEnv.isIE && this._subjectDiv)
		Dwt.setSize(this._subjectDiv, newWidth - 95);
	
	this._mailListView._resetColWidth();
};

ZmConvView.prototype._initHeader = 
function() {
	this._summary = new DwtComposite(this, "Summary", Dwt.RELATIVE_STYLE);

	var tagDivId = appCtxt.get(ZmSetting.TAGGING_ENABLED) ? (this._htmlElId + "_tagDiv") : null;
	var subs = { id: this._htmlElId, tagDivId: tagDivId };

	this._summary.getHtmlElement().innerHTML = AjxTemplate.expand("mail.Message#MessageListHeader", subs);

	// add the close button
	this._closeButton = new DwtButton({parent:this, className:"DwtToolbarButton"});
	this._closeButton.setImage("Close");
	this._closeButton.setText(ZmMsg.close);
	this._closeButton.reparentHtmlElement(this._htmlElId + "_closeBtnCell");
	this._closeButton.addSelectionListener(new AjxListener(this, this._closeButtonListener));
	
	// save the necessary DOM objects we just created
	this._subjectDiv = document.getElementById(this._htmlElId + "_subjDiv");

	if (tagDivId) {
		this._tagDiv = document.getElementById(tagDivId);
		Dwt.setSize(this._tagDiv, Dwt.DEFAULT, ZmConvView._TAGLIST_HEIGHT);
		Dwt.setVisible(this._tagDiv, false);
	}
};

ZmConvView.prototype._setSubject =
function(subject) {
	this._subjectDiv.innerHTML = subject != null && subject != ""
		? AjxStringUtil.htmlEncode(subject)
		: AjxStringUtil.htmlEncode(ZmMsg.noSubject);
};

ZmConvView.prototype._setTags =
function(conv) {
	if (!appCtxt.get(ZmSetting.TAGGING_ENABLED)) return;

	var numTags = conv.tags.length;
	var origVis = Dwt.getVisible(this._tagDiv);
	var newVis = (numTags > 0);
	if (origVis != newVis) {
		Dwt.setVisible(this._tagDiv, newVis);
		var sz = this.getSize();
		this._resetSize(sz.x, sz.y);
		if (!newVis) {
			this._tagDiv.innerHTML = "";
			return;
		}
	}
	
	if (!numTags) return;
		
	var ta = new Array();	
	for (var j = 0; j < numTags; j++)
		ta[j] = this._tagList.getById(conv.tags[j]);

	if (ta.length == 0)	return;
	ta.sort(ZmTag.sortCompare);

	var html = new Array();
	var i = 0;
	html[i++] = "<table cellspacing=0 cellpadding=0 border=0 width=100%>";
	html[i++] = "<tr><td style='overflow:hidden'>";
	
	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) continue;
		var anchorId = [this._tagDiv.id, ZmConvView._TAG_ANCHOR, tag.id].join("");
		var imageId = [this._tagDiv.id, ZmDoublePaneView._TAG_IMG, tag.id].join("");

		html[i++] = "<a href='javascript:;' onclick='ZmConvView._tagClick(\"";
		html[i++] = this._htmlElId;
		html[i++] = '","';
		html[i++] = tag.id;
		html[i++] = "\"); return false;' id='";
		html[i++] = anchorId;
		html[i++] = "'>";
		html[i++] = "<table style='display:inline; vertical-align:middle;' border=0 cellspacing=0 cellpadding=0><tr><td>";
		html[i++] = AjxImg.getImageHtml(ZmTag.COLOR_ICON[tag.color], null, ["id='", imageId, "'"].join(""));
		html[i++] = "</td></tr></table>";
		html[i++] = AjxStringUtil.htmlEncodeSpace(tag.name);
		html[i++] = "</a>";
	}
	html[i++] = "</td></tr></table>";
	this._tagDiv.innerHTML = html.join("");
};


// Listeners

ZmConvView.prototype._convChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONV)
		return;
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL) {
		this._setTags(this._conv);
	} else if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmItem.F_ID])) {
		this._controller._convId = this._conv.id;
	}
};

ZmConvView.prototype._folderChangeListener = 
function(ev) {
	if (ev.event == ZmEvent.E_DELETE &&
	    ev.source instanceof ZmFolder && 
		ev.source.id == ZmFolder.ID_TRASH && 
		this._conv.msgs) 
	{
		// user emptied trash folder.. search for any msgs in trash and remove from list view
		var list = this._conv.msgs.getArray();
		var len = list.length; // save original length
		for (var i = 0; i < list.length; i++) {
			var folder = appCtxt.getById(list[i].folderId);
			if (folder.isInTrash()) {
				this._mailListView.removeItem(list[i]);
				this._conv.msgs.remove(list[i], true);
				i--;
			}
		}
		
		// reset navigation buttons if necessary
		var pageSize = appCtxt.get(ZmSetting.PAGE_SIZE);
		this._conv.numMsgs = this._conv.msgs.size();
		if (len > pageSize && this._conv.numMsgs < pageSize) {
			this._controller._resetNavToolBarButtons(this._controller._getViewType());
		}
		
		if (len != this._conv.numMsgs) {
			// allow CLV to update its msg count if its been changed
			var fields = {};
			fields[ZmItem.F_SIZE] = true;
			this._conv.list._notify(ZmEvent.E_MODIFY, {items: [this._conv], fields: fields});
			// reset selection to first msg
			this._mailListView.setSelection(this._conv.msgs.getVector().get(0));
		}
	}
};

ZmConvView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_COLOR])) {
		var tag = ev.getDetail("organizers")[0];
		var img = document.getElementById(this._tagDiv.id +  ZmDoublePaneView._TAG_IMG + tag.id);
		if (img)
			AjxImg.setImage(img, ZmTag.COLOR_ICON[tag.color]);
	}
	
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.MODIFY)
		this._setTags(this._conv);
};

ZmConvView.prototype._closeButtonListener = 
function(ev) {
	this._controller._app.popView();
};


// Callbacks

ZmConvView.prototype._sashCallback =
function(delta) {
	this._sashMoved = true;
	if (delta > 0) {	// moving sash down
		var newMsgViewHeight = this._msgView.getSize().y - delta;
		var minMsgViewHeight = this._msgView.getMinHeight();
		// make sure msg header remains visible
		if (newMsgViewHeight > minMsgViewHeight) {
			this._mailListView.resetHeight(this._mailListView.getSize().y + delta);
			this._msgView.setSize(Dwt.DEFAULT, newMsgViewHeight);
			this._msgView.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y + delta);
		} else {
			// TODO - slam the sash to its min. height
			delta = 0;
		}
	} else {	// moving sash up
		var absDelta = Math.abs(delta);
		// make sure summary and MLV remain visible
		if (this._msgSash.getLocation().y - absDelta > this._summaryTotalHeight) {
			this._mailListView.resetHeight(this._mailListView.getSize().y - absDelta);
			this._msgView.setSize(Dwt.DEFAULT, this._msgView.getSize().y + absDelta);
			this._msgView.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y - absDelta);
		} else {
			delta = 0;
		}
	}
	
	if (delta)
		this._mailListView._resetColWidth();
	
	return delta;
};


// Static methods

ZmConvView._tagClick =
function(myId, tagId) {
	var dwtObj = Dwt.getObjectFromElement(document.getElementById(myId));
	dwtObj.notifyListeners(ZmConvView._TAG_CLICK, tagId);
};
