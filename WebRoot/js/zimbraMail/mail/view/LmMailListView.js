function LmMailListView(parent, className, posStyle, view, type, headerList, dropTgt) {

	if (arguments.length == 0) return;
	LmListView.call(this, parent, className, posStyle, view, type, headerList, dropTgt);
	
	// create a action menu for the header list
	this._colHeaderActionMenu = new LmPopupMenu(this);
	var actionListener = new LsListener(this, this._colHeaderActionListener);
	for (var i = 0; i < headerList.length; i++) {
		var hCol = headerList[i];
		// lets not allow columns w/ relative width to be removed (for now) - it messes stuff up
		if (hCol._width) {
			var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, null, hCol._name, null, null, DwtMenuItem.CHECK_STYLE);
			mi.setData(LmMailListView.KEY_ID, hCol._id);
			mi.setChecked(true, true);
			this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
		}
	}

	this._folderId = null;
}

LmMailListView.prototype = new LmListView;
LmMailListView.prototype.constructor = LmMailListView;

// Consts
LmMailListView.KEY_ID = "_keyId";

LmMailListView.prototype.toString = 
function() {
	return "LmMailListView";
}

// abstract methods
LmMailListView.prototype.markUIAsRead = function(items, on) {}

LmMailListView.prototype.set =
function(list, sortField) {
	this._folderId = list.search ? list.search.folderId : null;
	LmListView.prototype.set.call(this, list, sortField);
}

LmMailListView.prototype.getTitle =
function() {
	return this._controller._activeSearch ? this._controller._activeSearch.search.getTitle() : null;
}

LmMailListView.prototype._changeListener =
function(ev) {
	var items = ev.getDetail("items");
	if (ev.event == LmEvent.E_FLAGS) { // handle "unread" flag
		DBG.println(LsDebug.DBG2, "LmMailListView: FLAGS");
		var flags = ev.getDetail("flags");
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			for (var j = 0; j < flags.length; j++) {
				var flag = flags[j];
				if (flag == LmItem.FLAG_UNREAD) {
					var on = item[LmItem.FLAG_PROP[flag]];
					this.markUIAsRead([item], !on);
				}
			}
		}
		LmListView.prototype._changeListener.call(this, ev); // handle other flags
	} else if (ev.event == LmEvent.E_CREATE) {
		DBG.println(LsDebug.DBG2, "LmMailListView: CREATE");
		var now = new Date();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			DBG.println(LsDebug.DBG3, "Item to add: " + item.id);
			if (this._list && this._list.contains(item)) // skip if we already have it
				continue;
			// For now, we assume that the new conv/msg is the most recent one. If we're on the
			// first page with date desc order, we insert it at the top. If we're on the last
			// page with date asc order, we insert it at the bottom. Otherwise, we do nothing.
			// TODO: put result of LmMailList._sortIndex() in ev.details
			if ((this.getOffset() == 0) && (!this._sortByString || this._sortByString == LmSearch.DATE_DESC)) {
				// add new item at the beg. of list view's internal list
				this.addItem(item, 0);
	
				// and remove the last one to maintain limit
				if (this.size() > this.getLimit()) {
					this.removeLastItem();
				}
			} else if ((this._controller.getList().hasMore() === false) && (!this._sortByString || this._sortByString == LmSearch.DATE_ASC)) {
				if (this.size() < this.getLimit()) {
					// add new item at the end of list view's internal list
					this.addItem(item);
				} else {
					// XXX: reset pagination buttons?
				}
			}
		}
	} else {
		LmListView.prototype._changeListener.call(this, ev);
	}
}

LmMailListView.prototype._colHeaderActionListener = 
function(ev) {

	var menuItemId = ev.item.getData(LmMailListView.KEY_ID);

	for (var i = 0; i < this._headerList.length; i++) {
		var col = this._headerList[i];
		if (col._id == menuItemId) {
			col._visible = !col._visible;
			break;
		}
	}
	
	this._relayout();
}

LmMailListView.prototype.getLimit = 
function() {
	return this._appCtxt.get(LmSetting.PAGE_SIZE);
}

LmMailListView.prototype.replenish = 
function(list) {
	DwtListView.prototype.replenish.call(this, list);
	this._resetColWidth();
}

// Figure out how many of the participants will fit into a given pixel width.
// We always include the originator, and then as many of the most recent participants
// as possible. If any have been elided (either by the server or because they don't
// fit), there will be an ellipsis after the originator.
//
// The length of a participants string is determined mathematically. Since each letter
// is assumed to be an em in width, the calculated length is significantly longer than
// the actual length. The only way I've found to get the actual length is to create
// invisible divs and measure them, but that's expensive. The calculated length seems to
// run about 50% greater than the actual length, so we use a 30% fudge factor. The text 
// that's tested is bolded, since that's bigger and the conv may be unread.
//
// Returns a list of objects with name and original index.
LmMailListView.prototype._fitParticipants = 
function(participants, participantsElided, width) {
	// fudge factor since we're basing calc on em width; the actual ratio is around 1.5
	width = width * 1.3;
	// only one participant, no need to test width
	if (participants.length == 1) {
		var p = participants[0];
		var name = p.name ? p.name : p.dispName;
		var tmp = {name: LsStringUtil.htmlEncode(name), index: 0};
		return [tmp];
	}
	// create a list of "others" (not the originator)
	var list = new Array();
	for (var i = 0; i < participants.length; i++) {
		var tmp = {name: LsStringUtil.htmlEncode(participants[i].dispName), index: i};
		list.push(tmp);
	}
	var origLen = list.length;
	var originator = list.shift();
	// test originator + others
	// if it's too big, remove the oldest from others
	while (list.length) {
		var test = [originator];
		test = test.concat(list);
		var text;
		var tmp = new Array();
		var w = 0;
		for (var i = 0; i < test.length; i++)
			w = w + (test[i].name.length * DwtUnits.WIDTH_EM); // total width of names
		if ((test.length == origLen) && !participantsElided) {
			w = w + (test.length - 1) * DwtUnits.WIDTH_SEP; // none left out, comma join
			for (var i = 0; i < test.length; i++)
				tmp.push(test[i].name);
			text = tmp.join(", ");
		} else {
			w = w + DwtUnits.WIDTH_ELLIPSIS;				// some left out, add in ellipsis
			w = w + (test.length - 2) * DwtUnits.WIDTH_SEP; // and remaining commas
			for (var i = 0; i < list.length; i++)
				tmp.push(list[i].name);
			text = originator.name + LsStringUtil.ELLIPSIS + tmp.join(", ");
		}
		DBG.println(LsDebug.DBG3, "calc width of [" + text + "] = " + w);
		if (w <= width)
			return test;
		else
			list.shift();
	}
	return [originator];
}

LmMailListView.prototype._getActionMenuForColHeader = 
function() {
	return this._colHeaderActionMenu;
}
