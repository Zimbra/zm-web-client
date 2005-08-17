function LmContactsBaseView(parent, className, view, headerList, dropTgt, posStyle) {

	if (arguments.length == 0) return;
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	LmListView.call(this, parent, className, posStyle, view, LmItem.CONTACT, headerList, dropTgt);
};

LmContactsBaseView.CONTACTLIST_REPLENISH_THRESHOLD = 0;

LmContactsBaseView.prototype = new LmListView;
LmContactsBaseView.prototype.constructor = LmContactsBaseView;

LmContactsBaseView.prototype.toString = 
function() {
	return "LmContactsBaseView";
};

LmContactsBaseView.prototype.paginate = 
function(contacts, bPageForward) {
	var offset = this.getNewOffset(bPageForward);
	var subVector = contacts.getSubList(offset, this.getLimit());
	LmListView.prototype.set.call(this, subVector);
	this.setOffset(offset);
	this.setSelection(contacts.getVector().get(offset));
};

LmContactsBaseView.prototype._setParticipantToolTip = 
function(address) {
	// XXX: OVERLOADED TO SUPPRESS JS ERRORS..
	// XXX: REMOVE WHEN IMPLEMENTED - SEE BASE CLASS LmListView
};

LmContactsBaseView.prototype.getLimit = 
function() {
	return this._appCtxt.get(LmSetting.CONTACTS_PER_PAGE);
};

LmContactsBaseView.prototype.getReplenishThreshold = 
function() {
	return LmContactsBaseView.CONTACTLIST_REPLENISH_THRESHOLD;
};

LmContactsBaseView.prototype.getListView = 
function() {
	return this;
};

LmContactsBaseView.prototype.getTitle = 
function() {
	return [LmMsg.zimbraTitle, LmMsg.contacts].join(": ");
};

LmContactsBaseView.prototype._changeListener =
function(ev) {
	LmListView.prototype._changeListener.call(this, ev);
	if (ev.event == LmEvent.E_MODIFY) {
		this._modifyContact(ev);
	} else if (ev.event == LmEvent.E_CREATE) {
		// XXX: this is somewhat inefficient 
		// - needs to be rethought once SearchRequest w/ type attribute is implemented.
		var subVector = ev.source.getSubList(this.getOffset(), this.getLimit());
		LmListView.prototype.set.call(this, subVector);
		// only relayout if this is cards view
		if (this instanceof LmContactCardsView)
			this._layout();
		// always select newly add contact if its been added to the current page of contacts
		var newContact = ev._details.items[0];
		if (this.getList().contains(newContact))
			this.setSelection(newContact);
	} 
};

LmContactsBaseView.prototype._modifyContact = 
function(ev) {
	// if fileAs changed, resort the internal list
	// XXX: this is somewhat inefficient. We should just remove this contact and reinsert
	if (ev.getDetail("fileAsChanged"))
		this.getList().sort(LmContact.compareByFileAs);
};

LmContactsBaseView.prototype._setNextSelection = 
function() {
	// set the next appropriate selected item
	if (this._firstSelIndex < 0)
		this._firstSelIndex = 0;
	
	// get first valid item to select
	var item = this._list.get(this._firstSelIndex);
	if (item == null || (item && item.folderId == LmFolder.ID_TRASH)) {
		// get the first non-trash contact to select
		item = null;
		var list = this._list.getArray();
		for (var i=0; i < list.length; i++) {
			if (list[i].folderId != LmFolder.ID_TRASH) {
				item = list[i];
				break;
			}
		}
		
		// reset first sel index
		if (item) {
			var div = Dwt.getDomObj(this.getDocument(), this._getItemId(item));
			this._firstSelIndex = div ? this._list.indexOf(LsCore.objectWithId(div._itemIndex)) : -1;
		}
	}
	
	if (item)
		this.setSelection(item);
};
