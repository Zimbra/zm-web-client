/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmVoicemailApp(appCtxt, container, parentController) {

	ZmApp.call(this, ZmApp.VOICEMAIL, appCtxt, container, parentController);

	AjxDispatcher.registerMethod("GetVoicemailController", "Voicemail", new AjxCallback(this, this.getVoicemailController));

	ZmItem.registerItem(ZmItem.VOICEMAIL,
						{app:			ZmApp.VOICEMAIL,
						 nameKey:		"voicemail",
						 icon:			"Voicemail",
						 soapCmd:		"VoicemailAction",
						 itemClass:		"ZmVoicemail",
						 node:			"v",
						 organizer:		ZmOrganizer.VOICEMAIL,
						 searchType:	"voicemail",
						 stbNameKey:	"searchVoicemails",
						 stbTooltipKey:	"searchForVoicemails",
						 stbIcon:		"SearchVoicemails",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("Voicemail");
			return new ZmVoicemailList(this._appCtxt, search);
		}, this)
						});

	ZmApp.registerApp(ZmApp.VOICEMAIL,
							 {mainPkg:				"Voicemail",
							  nameKey:				"voicemail",
							  icon:					"NoteApp",
							  qsArg:				"voicemail",
							  chooserTooltipKey:	"goToVoicemail",
							  defaultSearch:		ZmItem.PAGE,
							  overviewTrees:		[ZmOrganizer.TAG],
//							  overviewTrees:		[ZmOrganizer.VOICEMAIL, ZmOrganizer.TAG],
							  showZimlets:			true,
							  searchTypes:			[ZmItem.VOICEMAIL],
							  actionCode:			ZmKeyMap.GOTO_VOICEMAIL,
							  chooserSort:			15,
							  defaultSort:			15
							  });
}

// Organizer and item-related constants
ZmEvent.S_VOICEMAIL				= "VOICEMAIL";
ZmItem.VOICEMAIL				= ZmEvent.S_VOICEMAIL;
ZmOrganizer.VOICEMAIL			= ZmEvent.S_VOICEMAIL;

// App-related constants
ZmApp.VOICEMAIL						= "Voicemail";
ZmApp.CLASS[ZmApp.VOICEMAIL]		= "ZmVoicemailApp";
ZmApp.SETTING[ZmApp.VOICEMAIL]		= ZmSetting.VOICEMAIL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.VOICEMAIL]	= 80;
ZmApp.QS_ARG[ZmApp.VOICEMAIL]		= "voicemail";

ZmVoicemailApp.prototype = new ZmApp;
ZmVoicemailApp.prototype.constructor = ZmVoicemailApp;

ZmVoicemailApp.prototype.toString = 
function() {
	return "ZmVoicemailApp";
}

// Public methods

ZmVoicemailApp.prototype.deleteNotify =
function(ids) {
	this._handleDeletes(ids);
};

ZmVoicemailApp.prototype.createNotify =
function(list) {
	this._handleCreates(list);
};

ZmVoicemailApp.prototype.modifyNotify =
function(list) {
	this._handleModifies(list);
};

ZmVoicemailApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require("Voicemail", false, loadCallback, null, true);
};

ZmVoicemailApp.prototype._handleLoadLaunch =
function(callback) {
	var voicemailController = AjxDispatcher.run("GetVoicemailController");
	var searchResuts = ZmVoicemailList.searchHACK(this._appCtxt);
	voicemailController.show(searchResuts);
	if (callback) {
		callback.run();
	}
};

ZmVoicemailApp.prototype.setActive =
function(active) {
	if (active) {
		var voicemailController = AjxDispatcher.run("GetVoicemailController");
		voicemailController.show();
	}
};

ZmVoicemailApp.prototype.getVoicemailController = function() {
	if (!this._voicemailController) {
		this._voicemailController = new ZmVoicemailController(this._appCtxt, this._container, this);
	}
	return this._voicemailController;
};

ZmVoicemailApp.prototype._handleDeletes =
function(ids) {
//	for (var i = 0; i < ids.length; i++) {
//		var cache = this.getVoicemailCache();
//		var page = cache.getPageById(ids[i]);
//		if (page) {
//			DBG.println(AjxDebug.DBG2, "ZmVoicemailApp: handling delete notif for ID " + ids[i]);
//			cache.removePage(page);
//			page.notifyDelete();
//				
//			// re-render, if necessary
//			var voicemailController = AjxDispatcher.run("GetVoicemailController");
//			var shownPage = voicemailController.getPage();
//			if (shownPage && shownPage.id == page.id) {
//				if (shownPage.name == ZmVoicemail.PAGE_INDEX || shownPage.name == page.name) {
//					var pageRef = { folderId: page.folderId, name: ZmVoicemail.PAGE_INDEX };
//					voicemailController.gotoPage(pageRef);
//				}
//			}
//			ids[i] = null;
//		}
//	}
};

/**
 * Checks for the creation of a voicemail or a mount point to one, or of a page
 * or document.
 * 
 * @param list	[array]		list of create notifications
 */
ZmVoicemailApp.prototype._handleCreates =
function(list) {
//	for (var i = 0; i < list.length; i++) {
//		var create = list[i];
//		var name = create._name;
//		if (this._appCtxt.cacheGet(create.id)) { continue; }
//
//		if (name == "folder") {
//			var parentId = create.l;
//			var parent;
//			var voicemailTree = this._appCtxt.getTree(ZmOrganizer.VOICEMAIL);
//			if (parentId == ZmOrganizer.ID_ROOT) {
//				if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.VOICEMAIL][0]) {
//					parent = voicemailTree.getById(parentId);
//				}
//			} else {
//				parent = voicemailTree.getById(parentId);
//			}
//			if (parent) {
//				DBG.println(AjxDebug.DBG1, "ZmVoicemailApp: handling CREATE for node: " + name);
//				parent.notifyCreate(create);
//			}
//		} else if (name == "link") {
//			var parentId = create.l;
//			var parent, share;
//			if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.VOICEMAIL][0]) {
//				var voicemailTree = this._appCtxt.getTree(ZmOrganizer.VOICEMAIL);
//				parent = voicemailTree.getById(parentId);
//				share = ZmOrganizer.VOICEMAIL;
//			}
//			if (parent) {
//				DBG.println(AjxDebug.DBG1, "ZmVoicemailApp: handling CREATE for node: " + name);
//				parent.notifyCreate(create, true);
//				// XXX: once bug #4434 is fixed, check if this call is still needed
//				this._appCtxt.getRequestMgr().getFolderPermissions([share]);
//			}
//		} else if (name == "w") {
//			DBG.println(AjxDebug.DBG1, "ZmVoicemailApp: handling CREATE for node: " + name);
//			// REVISIT: use app context item cache
//			var cache = this.getVoicemailCache();
//			var page = new ZmPage(this._appCtxt);
//			page.set(create);
//			cache.putPage(page);
//
//			// re-render current page, if necessary
//			var voicemailController = AjxDispatcher.run("GetVoicemailController");
//			var shownPage = voicemailController.getPage();
//			if (shownPage && shownPage.name == ZmVoicemail.PAGE_INDEX) {
//				voicemailController.gotoPage(shownPage);
//			}
//		} else if (name == "doc") {
//			DBG.println(AjxDebug.DBG1, "ZmVoicemailApp: handling CREATE for node: " + name);
//			// REVISIT: use app context item cache
//			var cache = this.getVoicemailCache();
//			var doc = new ZmDocument(this._appCtxt);
//			doc.set(create);
//			cache.putDocument(doc);
//		}
//	}
};

ZmVoicemailApp.prototype._handleModifies =
function(list) {
//	for (var i = 0; i < list.length; i++) {
//		var mod = list[i];
//		var id = mod.id;
//		if (!id) { continue; }
//		var name = mod._name;
//
//		if (name == "w") {
//			DBG.println(AjxDebug.DBG2, "ZmVoicemailApp: handling modified notif for ID " + id + ", node type = " + name);
//			// REVISIT: Use app context item cache
//			var cache = this.getVoicemailCache();
//			var page = cache.getPageById(id);
//			if (!page) {
//				page = new ZmPage(this._appCtxt);
//				page.set(mod);
//				cache.putPage(page);
//			} else {
//				page.notifyModify(mod);
//				page.set(mod);
//			}
//			
//			// re-render current page, if necessary
//			var voicemailController = AjxDispatcher.run("GetVoicemailController");
//			var shownPage = voicemailController.getPage();
//			if (shownPage && shownPage.folderId == page.folderId) {
//				if (shownPage.name == ZmVoicemail.PAGE_INDEX || shownPage.name == page.name) {
//					voicemailController.gotoPage(shownPage);
//				}
//			}
//			mod._handled = true;
//		} else if (name == "doc") {
//			DBG.println(AjxDebug.DBG2, "ZmVoicemailApp: handling modified notif for ID " + id + ", node type = " + name);
//			// REVISIT: Use app context item cache
//			var cache = this.getVoicemailCache();
//			var doc = cache.getDocumentById(id);
//			if (!doc) {
//				doc = new ZmDocument(this._appCtxt);
//				doc.set(mod);
//				cache.putDocument(doc);
//			}
//			else {
//				doc.notifyModify(mod);
//				doc.set(mod);
//			}
//			mod._handled = true;
//		}
//	}
};
