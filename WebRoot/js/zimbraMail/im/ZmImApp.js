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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmImApp(appCtxt, container) {
	ZmApp.call(this, ZmZimbraMail.IM_APP, appCtxt, container);
	//this._appCtxt.getSettings().addChangeListener(new AjxListener(this, this._settingsChangeListener));
	this._newRosterItemtoastFormatter = new AjxMessageFormat(ZmMsg.imNewRosterItemToast);	
	this._active = false;
};

ZmImApp.prototype = new ZmApp;
ZmImApp.prototype.constructor = ZmImApp;

ZmImApp.prototype.toString = 
function() {
	return "ZmImApp";
};

ZmImApp.prototype.launch =
function(callback) {
    var clc = this.getChatListController();
    clc.show();
	if (callback)
		callback.run();
//    alert("lauunched!");		
};

ZmImApp.prototype.activate =
function(active) {
//    alert("wheee!");
};

ZmImApp.prototype.getChatListController =
function() {
	if (!this._chatListController)
		this._chatListController = new ZmChatListController(this._appCtxt, this._container, this);
	return this._chatListController;
};

ZmImApp.prototype.getChatList =
function() {
	if (!this._chatList)
		this._chatList = new ZmChatList(this._appCtxt);
	return this._chatList;
};

ZmImApp.prototype.getRosterItemList =
function() {
	if (!this._rosterItemList) {
		this._rosterItemList = new ZmRosterItemList(this._appCtxt);
        	//TODO: load dummy data
	}
	return this._rosterItemList;
};

ZmImApp.prototype.getAutoCompleteGroups =
function() {
    return this.getRosterItemList().getAutoCompleteGroups();
};

/**
 * handle async notifications. we might need to queue this with timed action and return
 * immediately, since this is happening as a result of a notify header in a response, and
 * we probably don't want to trigger more requests while handling a response.
 */
ZmImApp.prototype.handleNotification =
function(im) {
    if (im.subscribed) {
        for (var i=0; i < im.subscribed.length; i++) {
            var sub = im.subscribed[i];
            if (sub.to) {
                var list = this.getRosterItemList();
                var item = list.getByAddr(sub.to);
                if (item) {
                    if (sub.groups) item.setGroups(sub.groups); // should optimize
                    if (sub.name && sub.name != item.getName()) item.setName(sub.name);
                    // mod
                } else {
                    // create
                    var item = new ZmRosterItem(sub.to, list, this._appCtxt, sub.name, null, null, sub.groups);
                    list.addItem(item);
                    var toast = this._newRosterItemtoastFormatter.format([item.getName()]);
                    this._appCtxt.setStatusMsg(toast, null, null, null, ZmStatusView.TRANSITION_SLIDE_LEFT);
                }
            } else if (sub.from) {
                // toast, should we user if they want to add user if they aren't in buddy list?
            }
        };    
    }
};
