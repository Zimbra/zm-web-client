function LmTradView(parent, className, posStyle, controller, dropTgt) {

	className = className || "LmTradView";
	LmDoublePaneView.call(this, parent, className, posStyle, LmController.TRAD_VIEW, controller, dropTgt);
}

LmTradView.prototype = new LmDoublePaneView;
LmTradView.prototype.constructor = LmTradView;

LmTradView.prototype.toString = 
function() {
	return "LmTradView";
}

LmTradView.prototype.setItem =
function(msgs) {
	LmDoublePaneView.prototype.setItem.call(this, msgs);

	this._msgListView.set(msgs, LmItem.F_DATE);

	// XXX: for now always show the first msg 
	//      (whether user clicked inbox or paginated)
	var list = this._msgListView.getList();
	var selectedItem = list ? list.get(0) : null
	if (selectedItem) {
		this._msgListView.setSelection(selectedItem, false, true);
	}
}

LmTradView.prototype._resetSize = 
function(newWidth, newHeight) {
	if (newHeight <= 0)
		return;
	
	if (this._isMsgViewVisible()) {
		if (!this._sashMoved) {
			var listViewHeight = (newHeight / 2) - DwtListView.HEADERITEM_HEIGHT;
			this._msgListView.resetHeight(listViewHeight);
			this._msgView.setBounds(Dwt.DEFAULT, listViewHeight + 5, Dwt.DEFAULT, newHeight-(listViewHeight+5));
			this._msgSash.setLocation(Dwt.DEFAULT, listViewHeight);
		} else {
			var mvHeight = newHeight - this._msgView.getLocation().y;
			var minHeight = this._msgView.getMinHeight();
			if (mvHeight < minHeight) {
				this._msgListView.resetHeight(newHeight - minHeight);
				this._msgView.setBounds(Dwt.DEFAULT, (newHeight - minHeight) + 5, Dwt.DEFAULT, minHeight - 5);
			} else {
				this._msgView.setSize(Dwt.DEFAULT, mvHeight);
			}
			this._msgSash.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y - 5);
		}
	} else {
		this._msgListView.resetHeight(newHeight);
	}
	this._msgListView._resetColWidth();
}

LmTradView.prototype._sashCallback =
function(delta) {

	if (!this._sashMoved)
		this._sashMoved = true;

	if (delta > 0) {
		var newMsgViewHeight = this._msgView.getSize().y - delta;
		var minMsgViewHeight = this._msgView.getMinHeight();
		if (newMsgViewHeight > minMsgViewHeight) {
			// moving sash down
			this._msgListView.resetHeight(this._msgListView.getSize().y + delta);
			this._msgView.setSize(Dwt.DEFAULT, newMsgViewHeight);
			this._msgView.setLocation(Dwt.DEFAULT, this._msgView.getLocation().y + delta);
		} else {
			delta = 0;
		}
	} else {
		var absDelta = Math.abs(delta);
		
		if (!this._minMLVHeight) {
			var list = this._msgListView.getList();
			if (list && list.size()) {
				var item = list.get(0);
				var div = Dwt.getDomObj(this.getDocument(), this._msgListView._getItemId(item));
				this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT + (Dwt.getSize(div).y * 2);
			} else {
				this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT;
			}
		}
		
		if (this._msgSash.getLocation().y - absDelta > this._minMLVHeight) {
			// moving sash up
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
