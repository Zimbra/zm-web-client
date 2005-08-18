function ZmConvView(parent, className, posStyle, controller, dropTgt) {

	className = className ? className : "ZmConvView";
	ZmDoublePaneView.call(this, parent, className, posStyle, ZmController.CONV_VIEW, controller, dropTgt);

	this._changeListener = new AjxListener(this, this._convChangeListener);
	
	// add change listener to tree view to catch empty trash action
	var folderTree = this._appCtxt.getFolderTree();
	folderTree.addChangeListener(new AjxListener(this, this._folderChangeListener));
	
	// Add a change listener to taglist to track tag color changes
	this._tagList = this.shell.getData(ZmAppCtxt.LABEL).getTagList();
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));
	
	this._controller = controller;
}

ZmConvView.prototype = new ZmDoublePaneView;
ZmConvView.prototype.constructor = ZmConvView;

ZmConvView.prototype.toString = 
function() {
	return "ZmConvView";
}

ZmConvView._TAG_CLICK = "ZmConvView._TAG_CLICK";
ZmConvView._TAG_ANCHOR = "TA";
ZmConvView._TAGLIST_HEIGHT = 18;

ZmConvView.prototype.addTagClickListener =
function(listener) {
	this.addListener(ZmConvView._TAG_CLICK, listener);
}

ZmConvView.prototype.setItem =
function(conv) {
	if (!(conv instanceof ZmConv))
		return;
		
	ZmDoublePaneView.prototype.setItem.call(this, conv);
	
	// Remove and re-add listeners for current conversation if it exists
	if (this._conv)
		this._conv.removeChangeListener(this._changeListener);
	this._conv = conv;
	conv.addChangeListener(this._changeListener);
	
	this._msgListView.set(conv.msgs, ZmItem.F_DATE);
	this._setSubject(conv.subject);
	this._setTags(conv);
	
	// display "hot" message (or newest if no search performed)
	var hot = this._conv.getHotMsg(this._msgListView.getOffset(), this._msgListView.getLimit());
	this._msgListView.setSelection(hot);
}

ZmConvView.prototype.reset = 
function() {
	this._sashMoved = false;
	ZmDoublePaneView.prototype.reset.call(this);
}

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
		this._conv.msgs.removeChangeListener(this._msgListView._listChangeListener);
	this._conv.removeChangeListener(this._conv._listChangeListener);
}

ZmConvView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ": ", this._conv.subject].join("");
}

ZmConvView.prototype._resetSize = 
function(newWidth, newHeight) {
	if (newHeight <= 0)
		return;
	
	var summaryHeight = this._summary.getHtmlElement().offsetHeight;
	if (this._isMsgViewVisible()) {
		if (!this._sashMoved) {
			// calc. height MLV based on num of msgs in conv
			var list = this._msgListView.getList();
			if (list && list.size() > 0) {
				var threshold = Math.min(list.size() + 1, 6);
				var div = Dwt.getDomObj(this.getDocument(), this._msgListView._getItemId(list.get(0)));
				var maxHeight = Dwt.getSize(div).y * threshold;
				this._summaryTotalHeight = summaryHeight + maxHeight + DwtListView.HEADERITEM_HEIGHT;
				var sashHeight = this._msgSash.getSize().y;
				this._msgListView.resetHeight(maxHeight + DwtListView.HEADERITEM_HEIGHT);
				var mvHeight = Math.max((newHeight - (this._summaryTotalHeight + 5)), 0);
				this._msgView.setBounds(Dwt.DEFAULT, this._summaryTotalHeight + 5, Dwt.DEFAULT, mvHeight);
				this._msgSash.setLocation(Dwt.DEFAULT, this._summaryTotalHeight);
			}
		} else {
			var mvHeight = Math.max(newHeight - (this._msgView.getLocation().y - 5), 0);
			var minHeight = this._msgView.getMinHeight();
			
			if (mvHeight < minHeight) {
				this._msgListView.resetHeight(newHeight - (summaryHeight + minHeight));
				this._msgView.setBounds(Dwt.DEFAULT, (newHeight - minHeight) + 5, Dwt.DEFAULT, minHeight - 5);
				this._msgSash.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y - 5);
			} else {
				this._msgView.setSize(Dwt.DEFAULT, mvHeight-5);
			}
		}
	} else {
		this._msgListView.resetHeight(newHeight - summaryHeight);
	}
	
	// always set width of the subject bar (bug 1490)
	this._subjectDiv.style.width = newWidth - 10; /* 10px is just a fudge factor IE vs FF quirks */

	this._msgListView._resetColWidth();
}

ZmConvView.prototype._sashCallback =
function(delta) {
	this._sashMoved = true;
	if (delta > 0) {	// moving sash down
		var newMsgViewHeight = this._msgView.getSize().y - delta;
		var minMsgViewHeight = this._msgView.getMinHeight();
		// make sure msg header remains visible
		if (newMsgViewHeight > minMsgViewHeight) {
			this._msgListView.resetHeight(this._msgListView.getSize().y + delta);
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
			this._msgListView.resetHeight(this._msgListView.getSize().y - absDelta);
			this._msgView.setSize(Dwt.DEFAULT, this._msgView.getSize().y + absDelta);
			this._msgView.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y - absDelta);
		} else {
			delta = 0;
		}
	}
	
	if (delta)
		this._msgListView._resetColWidth();
	
	return delta;
}

ZmConvView.prototype._initHeader = 
function() {
	this._summary = new DwtComposite(this, "Summary", Dwt.RELATIVE_STYLE);

	var subjDivId = Dwt.getNextId();
	var tagDivId = Dwt.getNextId();
	var doc = this.getDocument();
	this._subjectBar = doc.createElement("div");
	this._subjectBar.className = "SubjectBar";
	var html = new Array(2);
	var idx = 0;
	html[idx++] = "<div class='Subject' id='" + subjDivId + "'>&nbsp;</div>";
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		html[idx++] = "<div class='Tags' id='" + tagDivId + "'>&nbsp;</div>";
	this._subjectBar.innerHTML = html.join("");
	this._summary.getHtmlElement().appendChild(this._subjectBar);

	this._subjectDiv = Dwt.getDomObj(doc, subjDivId);
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._tagDiv = Dwt.getDomObj(doc, tagDivId);
		Dwt.setSize(this._tagDiv, Dwt.DEFAULT, ZmConvView._TAGLIST_HEIGHT);
		Dwt.setVisible(this._tagDiv, false);
	}
}

ZmConvView.prototype._setSubject =
function(subject) {
	this._subjectDiv.innerHTML = subject != null && subject != ""
		? AjxStringUtil.htmlEncode(ZmMsg.subject + ": " + subject)
		: AjxStringUtil.htmlEncode(ZmMsg.subject + ": " + ZmMsg.noSubject);
}

ZmConvView.prototype._setTags =
function(conv) {
	if (!this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) return;

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
		
	var htmlStr = new Array();
	var idx = 0;
	htmlStr[idx++] = "<table cellspacing=0 cellpadding=0><tr><td valign='top' class='LabelTd'>";
	htmlStr[idx++] = ZmMsg.tags;
	htmlStr[idx++] = ":</td><td class='TagTd'>";
	
	var ta = new Array();	
	for (var i = 0; i < numTags; i++) {
		var tag = this._tagList.getById(conv.tags[i]);
		if (tag)
			ta[i] = tag;
		else
			DBG.println(AjxDebug.DBG1, "Could not get tag with ID " + conv.tags[i]);
	}
	if (ta.length == 0)	return;
	ta.sort(ZmTag.sortCompare);

	var tagWidth = ZmTag.COLOR_MINI_ICON[ta[0].color][1];

	for (var i = 0; i < numTags; i++) {
		var txtWidth = Dwt.getHtmlExtent(ta[i].name).x;
		htmlStr[idx++] = "<a href='javascript: void ZmConvView._tagClick(\"";
		htmlStr[idx++] = this._htmlElId;
		htmlStr[idx++] = '","';
		htmlStr[idx++] = ta[i].id;
		htmlStr[idx++] = "\")' id='";
		htmlStr[idx++] = this._tagDiv.id + ZmConvView._TAG_ANCHOR + ta[i].id;
		htmlStr[idx++] = "'>";
		htmlStr[idx++] = "<table style='display:inline;' border=0 cellspacing=0 cellpadding=0 width=";
		htmlStr[idx++] = tagWidth;
		htmlStr[idx++] = "><tr><td width=";
		htmlStr[idx++] = tagWidth;
		htmlStr[idx++] = ">";
		htmlStr[idx++] = AjxImg.getImageHtml(ZmTag.COLOR_MINI_ICON[ta[i].color], null, ["id='", this._tagDiv.id + ZmDoublePaneView._TAG_IMG + ta[i].id, "'"].join(""));
		htmlStr[idx++] = "</td></tr></table>";
		htmlStr[idx++] = AjxStringUtil.htmlEncodeSpace(ta[i].name) + "</a>";
	}
	htmlStr[idx++] = "</td></tr></table>";
	this._tagDiv.innerHTML = htmlStr.join("");
}

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
}

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
		var folderTree = this._appCtxt.getFolderTree();
		for (var i = 0; i < list.length; i++) {
			var folder = folderTree.getById(list[i].folderId);
			if (folder.isInTrash()) {
				this._msgListView.removeItem(list[i]);
				this._conv.msgs.remove(list[i], true);
				i--;
			}
		}
		
		// reset navigation buttons if necessary
		var pageSize = this._appCtxt.get(ZmSetting.PAGE_SIZE);
		this._conv.numMsgs = this._conv.msgs.size();
		if (len > pageSize && this._conv.numMsgs < pageSize) {
			this._controller._resetNavToolBarButtons(this._controller._getViewType());
		}
		
		if (len != this._conv.numMsgs) {
			// allow CLV to update its msg count if its been changed
			var fields = new Object();
			fields[ZmItem.F_COUNT] = true;
			this._conv._listNotify(ZmEvent.E_MODIFY, {fields: fields});
			// reset selection to first msg
			this._msgListView.setSelection(this._conv.msgs.getVector().get(0));
		}
	}
}

ZmConvView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_COLOR])) {
		var img = Dwt.getDomObj(this.getDocument(), this._tagDiv.id +  ZmDoublePaneView._TAG_IMG + ev.source.id);
		if (img)
			AjxImg.setImage(img, ZmTag.COLOR_MINI_ICON[ev.source.color]);
	}
	
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_RENAME || ev.event == ZmEvent.MODIFY)
		this._setTags(this._conv);
}

ZmConvView._tagClick =
function(myId, tagId) {
	var dwtObj = Dwt.getObjectFromElement(Dwt.getDomObj(document, myId));
	dwtObj.notifyListeners(ZmConvView._TAG_CLICK, tagId);
}
