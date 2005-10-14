/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmSharePropsDialog(appCtxt, shell, className) {
	var xformDef = ZmSharePropsDialog._XFORM_DEF;
	var xmodelDef = ZmSharePropsDialog._XMODEL_DEF;
	className = className || "ZmSharePropsDialog";
	
	// TODO: i18n
	DwtXFormDialog.call(this, xformDef, xmodelDef, shell, className, "Share Properties");
	this._xform.setController(this);
	this._xform.itemChanged = ZmSharePropsDialog.__xformItemChanged;
	
	this._appCtxt = appCtxt;
	this._userPicker = new ZmUserPicker(this._appCtxt, shell);
}
ZmSharePropsDialog.prototype = new DwtXFormDialog;
ZmSharePropsDialog.prototype.constructor = ZmSharePropsDialog;

// Constants

ZmSharePropsDialog.NEW = ZmShareInfo.NEW;
ZmSharePropsDialog.EDIT= ZmShareInfo.EDIT;

ZmSharePropsDialog._MAIL_STANDARD = 'S';
ZmSharePropsDialog._MAIL_QUICK = 'Q';
ZmSharePropsDialog._MAIL_COMPOSE = 'C';

// TODO: i18n
ZmSharePropsDialog._XFORM_DEF = { items: [
	{type:_OUTPUT_, label:"Folder:", ref:"folder_name", width:"100%", 
		relevant:"get('folder_type') != ZmOrganizer.CALENDAR",relevantBehavior:_HIDE_
	},
	{type:_OUTPUT_, label:"Calendar:", ref:"folder_name", width:"100%", 
		relevant:"get('folder_type') == ZmOrganizer.CALENDAR",relevantBehavior:_HIDE_
	},
	{type:_GROUP_, label:"Share with:", width:"100%", numCols:3, useParentTable: false, items:[
			{type:_OUTPUT_, ref:"share_grantee_name", width:"250", relevant:"get('type')!=ZmSharePropsDialog.NEW",relevantBehavior:_HIDE_},
			{type:_GROUP_, //useParentTable: false, 
			relevant:"get('type') == ZmSharePropsDialog.NEW", relevantBehavior:_HIDE_, items:[
				{type:_INPUT_, ref:"share_grantee_name", width:"250"}
				/***
				{type:_BUTTON_, label:"Search...", cssStyle:"margin-left:10px", 
					relevant:"get('type') == ZmSharePropsDialog.NEW", relevantBehavior:_HIDE_,
					onActivate: function() {
						this.getForm().getController()._popupUserPicker();
					}
				}
				/***/
			]}
		]
	},
	{type:_RADIO_GROUPER_, label:"Role:", numCols:3, colSizes:[25,60,'*'], items: [
			{type:_RADIO_, ref:"share_rights", value:ZmShareInfo.ROLE_NONE, label:"<b>"+ZmShareInfo.ROLES[ZmShareInfo.ROLE_NONE]+"</b>"},{type:_OUTPUT_, value:ZmShareInfo.ACTIONS[""]},
			{type:_RADIO_, ref:"share_rights", value:ZmShareInfo.ROLE_VIEWER, label:"<b>"+ZmShareInfo.ROLES[ZmShareInfo.ROLE_VIEWER]+"</b>"},{type:_OUTPUT_, value:ZmShareInfo.ACTIONS["r"]},
			{type:_RADIO_, ref:"share_rights", value:ZmShareInfo.ROLE_MANAGER, label:"<b>"+ZmShareInfo.ROLES[ZmShareInfo.ROLE_MANAGER]+"</b>"},{type:_OUTPUT_, value:ZmShareInfo.ACTIONS["rwidx"]}
		]
	},
	{type:_GROUP_, colSpan:'*', width:"100%", numCols:2, colSizes:[35,'*'], items:[
			{type:_CHECKBOX_, ref:"sendMail", trueValue:true, falseValue:false, label:"Send mail to the recipient about this share"},
			{type:_SPACER_, height:3, relevant:"get('sendMail')"},
			{type:_DWT_SELECT_, ref:"mailType", relevant:"get('sendMail')", label:"", choices: [
				{value: "S", label: "Send standard message"},
				{value: "Q", label: "Add note to standard message"},
				{value: "C", label: "Compose email in new window"}
			]},
			{type:_OUTPUT_, label: "", //width: "250",
				value: "<b>Note:</b> The standard message displays the name of the shared item, the owner, and the permissions allowed on the share.",
				relevant: "get('sendMail') && (get('mailType') == 'S' || get('mailType') == 'Q')", revelantBehavior: _HIDE_
			},
			{type:_TEXTAREA_, ref:"quickReply", relevant:"get('sendMail') && get('mailType') == 'Q'", width:"95%", height:50, label:""}
		]
	}
]};
ZmSharePropsDialog._XMODEL_DEF = { items: [
	{ id: "folder_name", ref: "folder/name", type: _STRING_ },
	{ id: "folder_type", ref: "folder/type", type: _STRING_ },
	{ id: "share_grantee_name", ref: "share/granteeName", type: _STRING_, required: true },
	{ id: "share_rights", ref: "share/perm", type: _STRING_ },
	{ id: "share_showPrivate", ref: "share/showPrivate", type: _ENUM_, choices: [true, false] },
	{ id: "share_sendNotices", ref: "share/sendNotices", type: _ENUM_, choices: [true, false] },
	{ id: "share_proxy", ref: "share/proxy", type: _ENUM_, choices: [true, false] },
	{ id: "sendMail", type: _ENUM_, choices: [true, false] },
	{ id: "mailType", type: _ENUM_, choices: [
		ZmSharePropsDialog._MAIL_STANDARD,
		ZmSharePropsDialog._MAIL_QUICK,
		ZmSharePropsDialog._MAIL_COMPOSE
	] },
	{ id: "quickReply", type: _STRING_ }
]};

// Data

ZmSharePropsDialog.prototype._dialogType = ZmSharePropsDialog.NEW;

ZmSharePropsDialog.prototype._folder;
ZmSharePropsDialog.prototype._shareItem;

ZmSharePropsDialog.prototype._userPicker;

// Public methods

ZmSharePropsDialog.prototype.setDialogType = function(type) {
	this._dialogType = type;
}

ZmSharePropsDialog.prototype.setFolder = function(folder) {
	this._folder = folder;
}

ZmSharePropsDialog.prototype.setShareItem = function(shareItem) { 
	if (shareItem == null) {
		shareItem = {
			granteeName: "",
			perm: ZmShareInfo.ROLE_VIEWER
		};
	}

	var proxyCtor = new Function;
	proxyCtor.prototype = shareItem;
	proxyCtor.constructor = proxyCtor;
	var proxy = new proxyCtor;
	
	var instance = {
		type: this._dialogType,
		folder: this._folder,
		share: proxy,
		sendMail: true,
		mailType: ZmSharePropsDialog._MAIL_STANDARD,
		quickReply: ''		
	};
	
	this._shareItem = shareItem;
	this.setInstance(instance);
}

// Private methods

ZmSharePropsDialog.__xformItemChanged = function(id, value, event) {
	var item = this.getItemById(id);
	if (item.refPath == "sendMail" || item.refPath == "mailType" || item.refPath == "quickReply") {
		// HACK: This is done to avoid marking the form as "dirty"
		item.setInstanceValue(value);
		this.refresh();
	}
	else {
		XForm.prototype.itemChanged.call(this, id, value, event);
	}
}

// Protected methods

ZmSharePropsDialog.prototype._popupUserPicker = function() {
	this._userPicker.popup();
}

ZmSharePropsDialog.prototype._handleOkButton = function(event) {

	// execute grant operation
	var folder = this._folder;
	var instance = this._xform.getInstance();
	var share = instance.share;
	try {
		this._executeGrantAction(folder, share);
	}
	catch (ex) {
		var msg;
		// TODO: i18n
		if (ex instanceof ZmCsfeException) {
			switch (ex.code) {
				case "account.NO_SUCH_ACCOUNT": {
					msg = "Unknown user '"+share.granteeName+"'.\n"+
							"Must specify a valid Zimbra user.";
					break;
				}
				default: msg = ex.msg;
			}
		}
		else {
			msg = "Unknown error: "+ex;
		}
		alert(msg);
		return;
	}

	// hide this dialog
	this.popdown();

	// is there anything to do?
	if (!instance.sendMail) {
		return;
	}

	// generate message
	var textPart = this._generateTextPart(folder, share);
	var htmlPart = this._generateHtmlPart(folder, share);
	var xmlPart = this._generateXmlPart(folder, share);		

	var topPart = new ZmMimePart();
	topPart.setContentType(ZmMimeTable.MULTI_ALT);
	topPart.children.add(textPart);
	topPart.children.add(htmlPart);
	topPart.children.add(xmlPart);

	var msg = new ZmMailMsg(this._appCtxt);
	msg.setAddress(ZmEmailAddress.TO, new ZmEmailAddress(share.granteeName));
	msg.setSubject(this._dialogType == ZmSharePropsDialog.NEW ? "Share Created" : "Share Modified");
	msg.setTopPart(topPart);
	msg.setBodyParts([ textPart.node, htmlPart.node, xmlPart.node ]);


	// compose in new window
	if (instance.mailType == ZmSharePropsDialog._MAIL_COMPOSE) {
		// initialize compose message
		var action = ZmOperation.SHARE;
		var inNewWindow = true;
		var toOverride = null;
		var subjOverride = null;
		var extraBodyText = null;
	
		var mailApp = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP);
		var composeController = mailApp.getComposeController();
		composeController.doAction(action, inNewWindow, msg, toOverride, subjOverride, extraBodyText);
	}
	
	// send email
	else {
		var contactsApp = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var contactList = contactsApp.getContactList();
		msg.send(contactList);
	}
}

/** Note: Caller is responsible to catch exceptions. */
ZmSharePropsDialog.prototype._executeGrantAction = function(folder, share) {
	var organizer = folder;
	var granteeType = "usr";
	var granteeId = share.granteeId;
	var granteeName = share.granteeName;
	var perm = null;
	var inherit = null;

	var newShare = new ZmOrganizerShare(organizer, granteeType, granteeId, granteeName, perm, inherit);
	newShare.setPermissions(share.perm); // this does the FolderActionRequest
}

ZmSharePropsDialog._SHARE_CREATED = "The following share has been created:";
ZmSharePropsDialog._SHARE_MODIFIED = "The following share has been modified:";
ZmSharePropsDialog._TEXT_CONTENT = [
	"",
	"Shared item: {0} {1}",
	"Owner: {2}",
	"",
	"Grantee: {3}",
	"Role: {4} {6}",
	"Allowed actions: {5} {6}"
].join("\n");
ZmSharePropsDialog._HTML_CONTENT = [
	"<p>",
	"<table border='0'>",
	"<tr>","<th align='left'>Shared item:</th>","<td>{0} {1}</td>","</tr>",
	"<tr>","<th align='left'>Owner:</th>","<td>{2}</td>","</tr>",
	"</table>",
	"<p>",
	"<table border='0'>",
	"<tr>","<th align='left'>Grantee:</th>","<td>{3}</td>","</tr>",
	"<tr>","<th align='left'>Role:</th>","<td>{4} {6}</td>","</tr>",
	"<tr>","<th align='left'>Allowed actions:</th>","<td>{5} {6}</td>",
	"</tr>",
	"</table>"
].join("\n");

ZmSharePropsDialog.prototype.__generateContent = function(template, folder, share) {
	var folderType = folder.view 
					? "(" + ZmFolderPropsDialog.TYPE_CHOICES[folder.view] + ")"
					: "";
	var userName = this._appCtxt.getSettings().get(ZmSetting.DISPLAY_NAME);
	var modified = this._dialogType == ZmSharePropsDialog.EDIT ? "[MODIFIED]" : "";

	// REVISIT
	var content = template;
	content = content.replace(/\{0}/g, folder.name);
	content = content.replace(/\{1}/g, folderType);
	content = content.replace(/\{2}/g, userName);
	content = content.replace(/\{3}/g, share.granteeName);
	content = content.replace(/\{4}/g, ZmShareInfo.ROLES[share.perm]);
	content = content.replace(/\{5}/g, ZmShareInfo.ACTIONS[share.perm]);
	content = content.replace(/\{6}/g, modified);
	
	return content;
}

ZmSharePropsDialog.prototype._generateTextPart = function(folder, share) {
	var content = this._dialogType == ZmSharePropsDialog.NEW
				? ZmSharePropsDialog._SHARE_CREATED : ZmSharePropsDialog._SHARE_MODIFIED;

	content += "\n" + this.__generateContent(ZmSharePropsDialog._TEXT_CONTENT, folder, share);

	var instance = this._xform.getInstance();
	if (instance.mailType == ZmSharePropsDialog._MAIL_COMPOSE ||
		(instance.quickReply && !instance.quickReply.match(/^\s*$/))) {
		content += ZmAppt.NOTES_SEPARATOR
		if (instance.quickReply) {
			content += instance.quickReply;
		}
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_PLAIN);
	mimePart.setContent(content);
	return mimePart;
}
ZmSharePropsDialog.prototype._generateHtmlPart = function(folder, share) {
	var content = this._dialogType == ZmSharePropsDialog.NEW
				? "<h3>"+ZmSharePropsDialog._SHARE_CREATED+"</h3>"
				: "<h3>"+ZmSharePropsDialog._SHARE_MODIFIED+"</h3>";

	content += "\n" + this.__generateContent(ZmSharePropsDialog._HTML_CONTENT, folder, share);

	var instance = this._xform.getInstance();
	if (instance.mailType == ZmSharePropsDialog._MAIL_COMPOSE ||
		(instance.quickReply && !instance.quickReply.match(/^\s*$/))) {
		var quickReply = instance.mailType != ZmSharePropsDialog._MAIL_COMPOSE
						? instance.quickReply : "";
		content += [
			"<p>",
			"<table border='0'>",
			"<tr>","<th align='left'>Notes:</th>","<td>",quickReply,"</td>","</tr>",
			"</table>"
		].join("\n");
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_HTML);
	mimePart.setContent(content);
	return mimePart;
}
ZmSharePropsDialog.prototype._generateXmlPart = function(folder, share) {
	var action = this._dialogType;
	var settings = this._appCtxt.getSettings();
	var grantorId = settings.get(ZmSetting.USERID);
	var grantorName = AjxStringUtil.xmlAttrEncode(settings.get(ZmSetting.DISPLAY_NAME));
	var granteeId = share.granteeId || "";
	var granteeName = AjxStringUtil.xmlAttrEncode(share.granteeName);
	var remoteId = folder.id;
	var remoteName = AjxStringUtil.xmlAttrEncode(folder.name);
	var defaultType = ZmFolderPropsDialog.TYPE_NAMES[folder.type];
	var rights = share.perm;
	
	var content = [
		"<share xmlns='"+ZmShareInfo.URI+"' version='"+ZmShareInfo.VERSION+"' action='"+action+"'>",
		"  <grantor id='"+grantorId+"' name='"+grantorName+"' />",
		"  <grantee id='"+granteeId+"' name='"+granteeName+"' />",
		"  <link id='"+remoteId+"' name='"+remoteName+"' "+
				"view='"+defaultType+"' perm='"+rights+"' />",
		"</share>"
	].join("\n");

	var mimePart = new ZmMimePart(this._appCtxt);
	mimePart.setContentType(ZmMimeTable.XML_ZIMBRA_SHARE);
	mimePart.setContent(content);
	return mimePart;
}

ZmSharePropsDialog.prototype._getSeparatorTemplate = function() {
	return "";
}

//
// ZmUserPicker
//

function ZmUserPicker(appCtxt, shell, className) {
	if (arguments.length == 0) return;
	
	className = className || "ZmUserPicker";
	// TODO: i18n
	DwtDialog.call(this, shell, className, "Select User");

	this._appCtxt = appCtxt;
	
	this._initialize();
}
ZmUserPicker.prototype = new DwtDialog;
ZmUserPicker.prototype.constructor = ZmUserPicker;

// Public methods

ZmUserPicker.prototype.search = 
function(sortBy) {
	/***
	this._controller._schedule(this._doSearch, {contactPicker: this, sortBy: sortBy})
	/***/
	this._doSearch({contactPicker: this, sortBy: sortBy});
	/***/
}

ZmUserPicker.prototype.popup =
function(addrType) {
	// create source list view if necessary
	if (!this._sourceListView) {
		this._sourceListView = this._createListView(this._sourceListId, ZmController.CONTACT_SRC_VIEW);
		this._sourceListView.addSelectionListener(new AjxListener(this, this._sourceListener));
	}
	
	// reset column sorting preference
	this._sourceListView.setSortByAsc(ZmItem.F_PARTICIPANT, true);

	// reset search field
	var searchField = Dwt.getDomObj(this.getDocument(), this._searchFieldId);
	searchField.disabled = false;
	searchField.focus();
	searchField.value = "";
	
	DwtDialog.prototype.popup.call(this);
}

ZmUserPicker.prototype.popdown =
function() {
	// cleanup
	this._sourceListView._resetList();

	if (this._list && this._list.size())
		this._list.clear();

	// disabled search field (hack to fix bleeding cursor)
	var searchField = Dwt.getDomObj(this.getDocument(), this._searchFieldId);
	searchField.disabled = true;
	this._query = null;
	this._contactSource = null;

	DwtDialog.prototype.popdown.call(this);
}

// Protected methods

ZmUserPicker.prototype._doSearch = 
function(params) {
	var cp = params.contactPicker;
	var types = AjxVector.fromArray([ZmItem.CONTACT]);
	var search = new ZmSearch(this._appCtxt, cp._query, types, params.sortBy, 0, ZmContactPicker.SEARCHFOR_MAX, cp._contactSource);
	try {
		var searchResult = search.execute();
	} catch (ex) {
		if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED || ex.code == ZmCsfeException.SVC_AUTH_REQUIRED || 
			 ex.code == ZmCsfeException.NO_AUTH_TOKEN) {
			cp.popdown();
		}
		this._handleException(ex, ZmUserPicker.prototype._doSearch, params, false);
	}
	if (!searchResult) return;
	
	if (cp._list && cp._list.size())
		cp._list.clear();
	
	cp._list = searchResult.getResults(ZmItem.CONTACT);
	
	// Take the contacts and create a list of their email addresses (a contact may have more than one)
	var list = new Array();
	var a = cp._list.getArray();
	for (var i = 0; i < a.length; i++) {
		var contact = a[i];
		var emails = contact.getEmails();
		for (var j = 0; j < emails.length; j++) {
			var email = new ZmEmailAddress(emails[j], null, contact.getFullName());
			email.id = Dwt.getNextId();
			list.push(email);
		}
	}
	cp._sourceListView.set(AjxVector.fromArray(list));
	// if there's only one, select it
	if (list.length == 1)
		cp._sourceListView.setSelection(list[0]);
}

ZmUserPicker.prototype._initialize = 
function() {

	var doc = this.getDocument();

	// create static content and append to dialog parent	
	this.setContent(this._contentHtml());
	
	// add search button
	var searchSpan = Dwt.getDomObj(doc, this._listSearchId);
	var searchButton = new DwtButton(this);
	searchButton.setText(ZmMsg.search);
	searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));
	searchSpan.appendChild(searchButton.getHtmlElement());

    // init listeners
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._cancelButtonListener));
	
	var searchField = Dwt.getDomObj(doc, this._searchFieldId);
	Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmUserPicker._keyPressHdlr);
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);
}

ZmUserPicker.prototype._contentHtml = 
function() {
	this._listSearchId = Dwt.getNextId();
	this._sourceListId = Dwt.getNextId();
	this._searchFieldId = Dwt.getNextId();

	var html = new Array();
	var idx = 0;
	
	html[idx++] = "<table border=0 cellpadding=1 cellspacing=1 width=100%>";
	html[idx++] = "<tr><td>";
	// add search input field and search button
	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	html[idx++] = "<td valign=middle>";
	html[idx++] = AjxImg.getImageHtml("Search");
	html[idx++] = "</td>";
	html[idx++] = "<td><input type='text' size=30 nowrap id='" + this._searchFieldId + "'>&nbsp;</td>";
	html[idx++] = "<td id='" + this._listSearchId + "' style='border:solid silver 1px'></td>";
	html[idx++] = "</tr></table>";
	html[idx++] = "</td>";
	html[idx++] = "</tr></table>";
	// start new table for list views
	html[idx++] = "<table cellspacing=0 cellpadding=0 border=0><tr>";
	// source list
	html[idx++] = "<td><div id='" + this._sourceListId + "' class='abPickList'></div></td>";
	html[idx++] = "</tr></table>";

	return html.join("");
}

ZmUserPicker.prototype._createListView = 
function(listViewId, view, bExtendedHeader) {
	var listView = new ZmContactPickerListView(this, view, bExtendedHeader);
	listView.setMultiSelect(false);
	
	var listDiv = document.getElementById(listViewId);
 	listDiv.appendChild(listView.getHtmlElement());
	var size = Dwt.getSize(listDiv);
	listView.setSize(size.x, size.y);
	var defaultSortCol = bExtendedHeader ? null : ZmItem.F_PARTICIPANT;
	listView.setUI(defaultSortCol);
	listView._initialized = true;
	
	return listView;
}

ZmUserPicker.prototype._searchButtonListener = 
function(ev) {
	this._query = AjxStringUtil.trim(Dwt.getDomObj(this.getDocument(), this._searchFieldId).value);
	if (this._query.length) {
		/***
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
			var searchFor = this._selectDiv.getSelectedOption().getValue();
			this._contactSource = (searchFor == ZmContactPicker.SEARCHFOR_CONTACTS) ? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
		} else {
		/***/
			this._contactSource = this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) ? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
		/***
		}
		/***/
		this.search(ZmSearch.NAME_ASC);
	}
}

ZmUserPicker._keyPressHdlr =
function(ev) {
    var stb = DwtUiEvent.getDwtObjFromEvent(ev);
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (stb._keyPressCallback && (charCode == 13 || charCode == 3)) {
		stb._keyPressCallback.run();
	    return false;
	}
	return true;
}

ZmUserPicker.prototype._okButtonListener = function(event) {
	this.popdown();
}

ZmUserPicker.prototype._cancelButtonListener = function(event) {
	this.popdown();
}
