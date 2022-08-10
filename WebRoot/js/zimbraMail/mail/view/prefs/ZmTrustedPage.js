/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty shortcuts page.
 * @constructor
 * @class
 * This class represents a page which allows user to modify the trusted addresses/domain list
 * <p>
 * Only a single pref (the user's shortcuts gathered together in a string)
 * is represented.</p>
 *
 * @author Santosh Sutar
 *
 * @param {DwtControl}	parent			the containing widget
 * @param {object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 *
 * @extends		ZmPreferencesPage
 *
 * @private
 */
ZmTrustedPage = function(parent, section, controller, id) {
	ZmPreferencesPage.apply(this, arguments);
};

ZmTrustedPage.prototype = new ZmPreferencesPage;
ZmTrustedPage.prototype.constructor = ZmTrustedPage;

ZmTrustedPage.prototype.toString =
function () {
    return "ZmTrustedPage";
};

ZmTrustedPage.prototype.showMe =
function() {
	ZmPreferencesPage.prototype.showMe.call(this);

	if (!this._initialized) {
		this._initialized = true;
	}
};

ZmTrustedPage.prototype._setupCustom =
function(id, setup, value) {
	if (id == ZmSetting.TRUSTED_ADDR_LIST) {
		this._trustedListControl = new ZmWhiteBlackList(this, id, "TrustedList");
        var trustedList = appCtxt.get(ZmSetting.TRUSTED_ADDR_LIST);

        	if (trustedList) {
                for (var i = 0; i < trustedList.length; i++) {
                    trustedList[i] = AjxStringUtil.htmlEncode(trustedList[i]);
        		}
        	}

        this._trustedListControl.loadFromJson(trustedList);

		return this._trustedListControl;
	}
};

ZmTrustedPage.prototype.addItem =
function(addr) {
    if(addr && this._trustedListControl) {
        this._trustedListControl.loadFromJson([addr]);
    }
};

ZmTrustedPage.prototype.reset =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);

	if (this._trustedListControl) {
		this._trustedListControl.reset();
	}
};

ZmTrustedPage.prototype.isDirty =
function() {
	var isDirty = ZmPreferencesPage.prototype.isDirty.call(this) || this.isTrustedListDirty();
	if (isDirty) {
		AjxDebug.println(AjxDebug.PREFS, "Dirty preferences:\n" + "zimbraPrefMailTrustedSenderList");
	}
	return isDirty;
};

ZmTrustedPage.prototype.isTrustedListDirty =
function() {
	if (this._trustedListControl) {
		return this._trustedListControl.isDirty();
	}
	return false;
};

ZmTrustedPage.prototype.addCommand =
function(batchCmd) {
    if(this._trustedListControl && this._trustedListControl.isDirty()) {
        var i,
            value = this._trustedListControl.getValue(),
            soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount"),
            node,
            respCallback = new AjxCallback(this, this._postSaveBatchCmd, value.join(','));
        for(i=0; i<value.length;i++) {
            node = soapDoc.set("pref", AjxStringUtil.trim(value[i]));
            node.setAttribute("name", "zimbraPrefMailTrustedSenderList");
        }
        batchCmd.addNewRequestParams(soapDoc, respCallback);
    }
};

ZmTrustedPage.prototype._postSaveBatchCmd =
function(value) {
    appCtxt.set(ZmSetting.TRUSTED_ADDR_LIST, value.split(','));
    var settings = appCtxt.getSettings();
    var trustedListSetting = settings.getSetting(ZmSetting.TRUSTED_ADDR_LIST);
    trustedListSetting._notify(ZmEvent.E_MODIFY); 
    if(this._trustedListControl) {
        this._trustedListControl.saveLocal();
    }
};
