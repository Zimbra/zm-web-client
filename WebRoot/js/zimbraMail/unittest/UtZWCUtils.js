/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
/**
 * Created by .
 * User: prajain
 * Date: 6/1/11
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */

UtZWCUtils = function() {};

UtZWCUtils.chooseApp = function(appId) {
    if (!appId) {return false;}

    var appChooser = appCtxt.getAppChooser();
    if (!appChooser) {return false;}

    var appButton = appChooser.getButton(appId);
    if (!appButton) {return false;}

    appButton._emulateSingleClick();
    return true;
};

UtZWCUtils.isCurrentViewByViewIds = function(viewIds) {
    //we return an object with the currentViewId because the currentViewId can be LOADING.
    //unit tests can decide to wait before the test is being declared failed.
    
    var ret = {isCurrentView:false, currentViewId:null};
    if (!viewIds || !viewIds.length) {return ret;}

    ret.currentViewId = appCtxt.getCurrentViewId();
    
    for (var i = 0; i < viewIds.length; i++) {
        var viewId = viewIds[i];
        if (ret.currentViewId == viewId) {
            ret.isCurrentViewId = true;
            break;
        }
    }
    console.log("Expecting View: " + viewIds.toString() + " | Found view: " + ret.currentViewId);
    return ret;
};
//---------------
UtZWCUtils.isMailViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_TRAD, ZmId.VIEW_CONVLIST]);
};

UtZWCUtils.isAddressBookViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_CONTACT_SIMPLE]);
};

UtZWCUtils.isCalendarViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_CAL]);
};

UtZWCUtils.isTaskViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_TASKLIST]);
};

UtZWCUtils.isBriefCaseViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_BRIEFCASE_DETAIL]);
};

UtZWCUtils.isPreferencesViewCurrent = function() {
    return UtZWCUtils.isCurrentViewByViewIds([ZmId.VIEW_PREF]);
};

UtZWCUtils.closeAllComposeViews = function() {
	
	var avm = appCtxt.getAppViewMgr();
	var views = avm.getViewsByType(ZmId.VIEW_COMPOSE, true);
	views = views.concat(avm.getViewsByType(ZmId.VIEW_MAIL_CONFIRM, true));
	if (views && views.length) {
		for (var i = 0; i < views.length; i++) {
			var ctlr = views[i].controller;
			if (ctlr) {
				if (ctlr._cancelListener) {
					ctlr._cancelListener();
				}
				else if (ctlr._closeListener) {
					ctlr._closeListener();
				}
			}
		}
	}
};

UtZWCUtils.getLastView = function(viewType) {
	var avm = appCtxt.getAppViewMgr();
	var list = avm.getViewsByType(viewType, true);
	var view = list && list[list.length - 1];
	return view ? avm.getCurrentView(view.id) : null;
};

UtZWCUtils.getComposeViewCount = function() {
	return appCtxt.getAppViewMgr().getViewsByType(ZmId.VIEW_COMPOSE, true).length;
};

UtZWCUtils.getEmailAddressOfCurrentAccount = function() {
    var activeAccount = appCtxt.getActiveAccount();
    var email;
    if (activeAccount) {
        email = activeAccount.getEmail();
    }
    return email;
};

UtZWCUtils.getRandomString = function(length) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var randomString = '';
	for (var i=0; i<length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomString += chars.substring(rnum,rnum+1);
	}
	return randomString;
}


UtZWCUtils.LOAD_VIEW_SETTIMEOUT = 5000;
UtZWCUtils.MAX_STOP = 10000;