/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

ZmConvView = function(params) {

	params.className = "ZmConvView";
	params.posStyle = Dwt.ABSOLUTE_STYLE;
	params.mode = ZmId.VIEW_CONV;
	ZmDoublePaneView.call(this, params);

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
	
	this._controller = params.controller;
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
	this.isStale = false;
	this._setSubject(conv.subject);
	this._setTags(conv);
	
	// display "hot" message (or newest if no search performed)
	var offset = this._mailListView.offset;
	var hot = this._conv.getFirstHotMsg({offset:offset, limit:this._mailListView.getLimit(offset)});
	this._mailListView.setSelection(hot);
};

ZmConvView.prototype.reset = 
function() {
	this._sashMoved = false;
	ZmDoublePaneView.prototype.reset.call(this);
};

/**
 * Remove this view's listeners on the conv and its msg list now that the view has been popped.
 */
ZmConvView.prototype.deactivate = 
function() {
	if (this._conv.msgs) {
		this._conv.msgs.removeChangeListener(this._mailListView._listChangeListener);
	}
	this._conv.removeChangeListener(this._changeListener);
};

ZmConvView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._conv.subject].join(": ");
};

// Private / protected methods

ZmConvView.prototype._createMailListView =
function(params) {
	return ZmDoublePaneView.prototype._createMailListView.apply(this, arguments);
};

// override since we need to take summary into consideration
ZmConvView.prototype._resetSize = 
function(newWidth, newHeight, force) {

	if (newWidth <= 0 || newHeight <= 0) { return; }
	if (!force && newWidth == this._lastResetWidth && newHeight == this._lastResetHeight) { return; }

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();

	var summaryHeight = this._summary.getHtmlElement().offsetHeight;
	if (this.isMsgViewVisible()) {
		var sash = this.getSash();
		var sashSize = sash.getSize();
		var sashThickness = readingPaneOnRight ? sashSize.x : sashSize.y;
		if (readingPaneOnRight) {
			var listViewWidth = this._vertSashX || Math.floor(newWidth / 2.5);
			this._mailListView.setLocation(0, summaryHeight);
			this._mailListView.resetSize(listViewWidth, newHeight - summaryHeight);
			sash.setLocation(listViewWidth, 0);
			this._msgView.setBounds(listViewWidth + sashThickness, 0,
									newWidth - (listViewWidth + sashThickness), newHeight);
		} else {
			var listViewHeight = 0, upperHeight, rowsHeight = 0;
			if (this._horizSashY) {
				listViewHeight = this._horizSashY - summaryHeight;
				upperHeight = summaryHeight + listViewHeight;
			} else {
				// set height of MLV based on number of msgs in conv - since that number is usually small,
				// we can give the MV more space
				var list = this._mailListView.getList();
				if (list && list.size() > 0) {
					var threshold = Math.min(list.size() + 1, 6);
					var div = document.getElementById(this._mailListView._getItemId(list.get(0)));
					if (div) {
						var rowsHeight = Dwt.getSize(div).y * threshold;
						listViewHeight = rowsHeight + DwtListView.HEADERITEM_HEIGHT;
						upperHeight = this._minUpperHeight = summaryHeight + listViewHeight;
					}
				}
			}
			if (summaryHeight && listViewHeight && upperHeight) {
				this._mailListView.setLocation(0, summaryHeight);
				this._mailListView.resetSize(newWidth, listViewHeight);
				sash.setLocation(0, upperHeight);
				var mvHeight = Math.max((newHeight - (upperHeight + sashThickness)), 0);
				this._msgView.setBounds(0, upperHeight + sashThickness, newWidth, mvHeight);
			}
		}
	} else {
		this._mailListView.resetSize(newWidth, newHeight - summaryHeight);
	}

	if (AjxEnv.isIE && this._subjectDiv) {
		Dwt.setSize(this._subjectDiv, newWidth - 95);
	}
	
	this._mailListView._resetColWidth();
};

ZmConvView.prototype._sashCallback =
function(delta) {

	var readingPaneOnRight = this._controller.isReadingPaneOnRight();

	if (delta > 0) {
		if (readingPaneOnRight) {
			// moving sash right
			this._summary.setSize(this._summary.getSize().x + delta, Dwt.DEFAULT);
			this._mailListView.resetSize(this._mailListView.getSize().x + delta, Dwt.DEFAULT);
			this._msgView.setBounds(this._msgView.getLocation().x + delta, Dwt.DEFAULT,
									this._msgView.getSize().x - delta, Dwt.DEFAULT);
		} else {
			// moving sash down
			var newMsgViewHeight = this._msgView.getSize().y - delta;
			var minMsgViewHeight = this._msgView.getMinHeight();
			// make sure msg header remains visible
			if (newMsgViewHeight > minMsgViewHeight) {
				this._mailListView.resetSize(Dwt.DEFAULT, this._mailListView.getSize().y + delta);
				this._msgView.setSize(Dwt.DEFAULT, newMsgViewHeight);
				this._msgView.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y + delta);
			} else {
				delta = 0;
			}
		}
	} else {
		var absDelta = Math.abs(delta);
		if (readingPaneOnRight) {
			// moving sash left
			this._summary.setSize(this._summary.getSize().x - absDelta, Dwt.DEFAULT);
			this._mailListView.resetSize(this._mailListView.getSize().x - absDelta, Dwt.DEFAULT);
			this._msgView.setBounds(this._msgView.getLocation().x - absDelta, Dwt.DEFAULT,
									this._msgView.getSize().x + absDelta, Dwt.DEFAULT);
		} else {
			// moving sash up
			// make sure summary and MLV remain visible
			if (this._horizSashY - absDelta > this._minUpperHeight) {
				this._mailListView.resetSize(Dwt.DEFAULT, this._mailListView.getSize().y - absDelta);
				this._msgView.setSize(Dwt.DEFAULT, this._msgView.getSize().y + absDelta);
				this._msgView.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y - absDelta);
			} else {
				delta = 0;
			}
		}
	}

	if (delta) {
		this._mailListView._resetColWidth();
		if (readingPaneOnRight) {
			this._vertSashX = this._vertMsgSash.getLocation().x;
		} else {
			this._horizSashY = this._horizMsgSash.getLocation().y;
		}
	}

	return delta;
};

ZmConvView.prototype._initHeader =
function() {
	this._summary = new DwtComposite(this, "Summary", Dwt.RELATIVE_STYLE);

	var tagDivId = appCtxt.get(ZmSetting.TAGGING_ENABLED) ? (this._htmlElId + "_tagDiv") : null;
	var subs = { id: this._htmlElId, tagDivId: tagDivId };

	this._summary.getHtmlElement().innerHTML = AjxTemplate.expand("mail.Message#MessageListHeader", subs);

	// add the close button
	var closeButtonId = this._htmlElId + "_closeBtnCell";
	var closeButton = new DwtButton({parent:this, className:"DwtToolbarButton", parentElement:closeButtonId});
	closeButton.setImage("Close");
	closeButton.setText(ZmMsg.close);
	closeButton.addSelectionListener(new AjxListener(this, this._closeButtonListener));
	
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
		this._resetSize(sz.x, sz.y, true);
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
		html[i++] = AjxImg.getImageHtml(tag.getIconWithColor(), null, ["id='", imageId, "'"].join(""));
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
		
		this._controller._resetNavToolBarButtons(this._controller._getViewType());
		
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
			AjxImg.setImage(img, tag.getIconWithColor());
	}
	
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.MODIFY)
		this._setTags(this._conv);
};

ZmConvView.prototype._closeButtonListener = 
function(ev) {
	this._controller._app.popView();
};

// mimics handling by ZmConvListController.prototype._listSelectionListener
ZmConvView.prototype._staleHandler =
function() {

	var ctlr = this._controller._parentController || AjxDispatcher.run("GetConvListController");
	this._conv._loaded = false;	// force request to be made
	var respCallback = new AjxCallback(ctlr, ctlr._handleResponseListSelectionListener, this._conv);
	AjxDispatcher.run("GetConvController").show(ctlr._activeSearch, this._conv, ctlr, respCallback, true);
};

// Static methods

ZmConvView._tagClick =
function(myId, tagId) {
	var dwtObj = DwtControl.fromElementId(myId);
	dwtObj.notifyListeners(ZmConvView._TAG_CLICK, tagId);
};
