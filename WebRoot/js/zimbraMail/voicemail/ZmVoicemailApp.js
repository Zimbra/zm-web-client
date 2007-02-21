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
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("Voicemail");
			return new ZmVoicemailList(this._appCtxt, search);
		}, this)
						});

	ZmOrganizer.registerOrg(ZmOrganizer.VOICEMAIL,
							{app:				ZmApp.VOICEMAIL,
							 nameKey:			"voicemailFolder",
							 defaultFolder:		ZmOrganizer.ID_VOICEMAIL,
							 firstUserId:		256,
							 orgClass:			"ZmVoicemailFolder",
							 orgPackage:		"VoicemailCore",
							 treeController:	"ZmVoicemailTreeController",
							 labelKey:			"voicemail",
							 views:				["voicemail"],
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmVoicemailFolder.sortCompare",
							 deferrable:		false
							});

	ZmApp.registerApp(ZmApp.VOICEMAIL,
							 {mainPkg:				"Voicemail",
							  nameKey:				"voicemail",
							  icon:					"VoicemailApp",
							  qsArg:				"voicemail",
							  chooserTooltipKey:	"goToVoicemail",
							  defaultSearch:		ZmSearchToolBar.FOR_ANY_MI,
							  overviewTrees:		[ZmOrganizer.VOICEMAIL],
							  showZimlets:			true,
							  searchTypes:			[ZmItem.VOICEMAIL],
							  gotoActionCode:		ZmKeyMap.GOTO_VOICEMAIL,
							  chooserSort:			15,
							  defaultSort:			15
							  });
}

// Organizer and item-related constants
ZmEvent.S_VOICEMAIL				= "VOICEMAIL";
ZmItem.VOICEMAIL				= ZmEvent.S_VOICEMAIL;
ZmOrganizer.VOICEMAIL			= ZmEvent.S_VOICEMAIL;

//TODO: Figure out what id to use or should I just use something unique?
ZmOrganizer.ID_VOICEMAIL		= 8675;

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
	var searchResuts = ZmVoicemailList.searchHACK(this._appCtxt, ZmVoicemailFolder.VOICEMAIL);
	voicemailController.show(searchResuts, ZmVoicemailFolder.VOICEMAIL);
	
	if (callback) {
		callback.run();
	}
};

ZmVoicemailApp.prototype.activate =
function(active, view) {
};

ZmVoicemailApp.prototype.getVoicemailController = function() {
	if (!this._voicemailController) {
		this._voicemailController = new ZmVoicemailController(this._appCtxt, this._container, this);
	}
	return this._voicemailController;
};

ZmVoicemailApp.prototype._handleDeletes =
function(ids) {
};

ZmVoicemailApp.prototype._handleCreates =
function(list) {
};

ZmVoicemailApp.prototype._handleModifies =
function(list) {
};

// Fake folder creation...since there's no server support.
ZmVoicemailApp._createTreeHACK =
function(appCtxt) {
	ZmVoicemailApp.treeHACK(appCtxt, ZmOrganizer.VOICEMAIL, "Primary (650) 123-4567");
	ZmVoicemailApp.treeHACK(appCtxt, '2222', "Sally (858) 234-1234");
	ZmVoicemailApp.treeHACK(appCtxt, '4444', "Billy (858) 234-0987");
};

ZmVoicemailApp.treeHACK = 
function(appCtxt, baseId, accountName) {
	var jsonObj = {
		folder: [
            {
              f: "Voicemail",
              id: baseId + '-Voicemail',
              l: '16234',
              n: 1,
              u:2,
              name: 'Voicemail',
              view: 'voicemail'
             },
            {
              f: "Missed Call",
              id: baseId + "-Missed",
              l: '1',
              n: 1,
              name: 'Missed Calls',
              view: 'voicemail'
             },
            {
              f: "Answered Call",
              id: baseId + "-Answered",
              l: '1',
              n: 1,
              name: 'Answered Calls',
              view: 'voicemail'
             },
            {
              f: "Placed Call",
              id: baseId + "-Placed",
              l: '1',
              n: 1,
              name: 'Placed Calls',
              view: 'voicemail'
             },
           ],
          f: "Account",
          id: baseId,
          l: '11',
          name: accountName,
          view: 'voicemail'
	};
	var folderTree = appCtxt.getFolderTree();
	var folder = ZmFolderTree.createFromJs(folderTree.root, jsonObj, folderTree, "folder");
	folderTree.root.children.add(folder);
};

