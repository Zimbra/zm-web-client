/**
* Contact app object
* @constructor
* @class
* Description goes here
*
* @author Conrad Damon
* @param appCtxt			The singleton appCtxt object
* @param container			the element that contains everything but the banner (aka _composite)
* @param parentController	Reference to the parent "uber" controller - populated if this is a child window opened by the parent
*/
function LmContactsApp(appCtxt, container, parentController) {
	LmApp.call(this, LmLiquidMail.CONTACTS_APP, appCtxt, container, parentController);
}

LmContactsApp.prototype = new LmApp;
LmContactsApp.prototype.constructor = LmContactsApp;

LmContactsApp.prototype.toString = 
function() {
	return "LmContactsApp";
}

LmContactsApp.prototype.launch =
function() {
	this.getContactListController().show(this.getContactList());
}

LmContactsApp.prototype.setActive =
function(active) {
	if (active)
		this.getContactListController().show();
}

// NOTE: calling method should handle exceptions!
LmContactsApp.prototype.getContactList =
function() {
	if (!this._contactList) {
		try {
			// check if a parent controller exists and ask it for the contact list
			if (this._parentController) {
				this._contactList = this._parentController.getApp(LmLiquidMail.CONTACTS_APP).getContactList();
			} else {
				this._contactList = new LmContactList(this._appCtxt, false);
				this._contactList.load();
			}
		} catch (ex) {
			this._contactList = null;
			throw ex;
		}
	}
	return this._contactList;
}

// NOTE: calling method should handle exceptions!
LmContactsApp.prototype.getGalContactList =
function() {
	if (!this._galContactList) {
		try {
			this._galContactList = new LmContactList(this._appCtxt, true);
			this._galContactList.load();
		} catch (ex) {
			this._galContactList = null;
			throw ex;
		}
	}
	return this._galContactList;
}

LmContactsApp.prototype.getContactListController =
function() {
	if (!this._contactListController)
		this._contactListController = new LmContactListController(this._appCtxt, this._container, this);
	return this._contactListController;
}

LmContactsApp.prototype.getContactController =
function() {
	if (this._contactController == null)
		this._contactController = new LmContactController(this._appCtxt, this._container, this);
	return this._contactController;
}
