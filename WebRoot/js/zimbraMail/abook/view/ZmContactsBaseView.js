function ZmContactsBaseView(parent, className, view, headerList, dropTgt, posStyle) {

	if (arguments.length == 0) return;
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	ZmListView.call(this, parent, className, posStyle, view, ZmItem.CONTACT, headerList, dropTgt);
};

ZmContactsBaseView.CONTACTLIST_REPLENISH_THRESHOLD = 0;

ZmContactsBaseView.prototype = new ZmListView;
ZmContactsBaseView.prototype.constructor = ZmContactsBaseView;

ZmContactsBaseView.prototype.toString = 
function() {
	return "ZmContactsBaseView";
};

ZmContactsBaseView.prototype.paginate = 
function(contacts, bPageForward) {
	var offset = this.getNewOffset(bPageForward);
	var subVector = contacts.getSubList(offset, this.getLimit());
	ZmListView.prototype.set.call(this, subVector);
	this.setOffset(offset);
	this.setSelection(contacts.getVector().get(offset));
};

ZmContactsBaseView.prototype._setParticipantToolTip = 
function(address) {
	// XXX: OVERLOADED TO SUPPRESS JS ERRORS..
	// XXX: REMOVE WHEN IMPLEMENTED - SEE BASE CLASS ZmListView
};

ZmContactsBaseView.prototype.getLimit = 
function() {
	return this._appCtxt.get(ZmSetting.CONTACTS_PER_PAGE);
};

ZmContactsBaseView.prototype.getReplenishThreshold = 
function() {
	return ZmContactsBaseView.CONTACTLIST_REPLENISH_THRESHOLD;
};

ZmContactsBaseView.prototype.getListView = 
function() {
	return this;
};

ZmContactsBaseView.prototype.getTitle = 
function() {
	return [LmMsg.zimbraTitle, LmMsg.contacts].join(": ");
};

ZmContactsBaseView.prototype._changeListener =
function(ev) {
	ZmListView.prototype._changeListener.call(this, ev);
	if (ev.event == ZmEvent.E_MODIFY) {
		this._modifyContact(ev);
	} else if (ev.event == ZmEvent.E_CREATE) {
		// XXX: this is somewhat inefficient 
		// - needs to be rethought once SearchRequest w/ type attribute is implemented.
		var subVector = ev.source.getSubList(this.getOffset(), this.getLimit());
		ZmListView.prototype.set.call(this, subVector);
		// only relayout if this is cards view
		if (this instanceof ZmContactCardsView)
			this._layout();
		// always select newly add contact if its been added to the current page of contacts
		var newContact = ev._details.items[0];
		if (this.getList().contains(newContact))
			this.setSelection(newContact);
	} 
};

ZmContactsBaseView.prototype._modifyContact = 
function(ev) {
	// if fileAs changed, resort the internal list
	// XXX: this is somewhat inefficient. We should just remove this contact and reinsert
	if (ev.getDetail("fileAsChanged"))
		this.getList().sort(ZmContact.compareByFileAs);
};

ZmContactsBaseView.prototype._setNextSelection = 
function() {
	// set the next appropriate selected item
	if (this._firstSelIndex < 0)
		this._firstSelIndex = 0;
	
	// get first valid item to select
	var item = this._list.get(this._firstSelIndex);
	if (item == null || (item && item.folderId == ZmFolder.ID_TRASH)) {
		// get the first non-trash contact to select
		item = null;
		var list = this._list.getArray();
		for (var i=0; i < list.length; i++) {
			if (list[i].folderId != ZmFolder.ID_TRASH) {
				item = list[i];
				break;
			}
		}
		
		// reset first sel index
		if (item) {
			var div = Dwt.getDomObj(this.getDocument(), this._getItemId(item));
			this._firstSelIndex = div ? this._list.indexOf(AjxCore.objectWithId(div._itemIndex)) : -1;
		}
	}
	
	if (item)
		this.setSelection(item);
};
