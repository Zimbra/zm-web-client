/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */
UT.module("Share");

UT.test("Find Shares Link: get app options", {
	teardown: function(){
		appCtxt.set(ZmSetting.BRIEFCASE_ENABLED, this._briefcaseEnabled);
		appCtxt.set(ZmSetting.TASKS_ENABLED, this._tasksEnabled);
		appCtxt.set(ZmSetting.CONTACTS_ENABLED, this._contactsEnabled);
		appCtxt.set(ZmSetting.MAIL_ENABLED, this._mailEnabled);
	},

	setup: function() {
		//save original values
		this._briefCaseEnabled = appCtxt.get(ZmSetting.BRIEFCASE_ENABLED);
		this._tasksEnabled = appCtxt.get(ZmSetting.TASKS_ENABLED);
		this._contactEnabled = appCtxt.get(ZmSetting.CONTACTS_ENABLED);
		this._mailEnabled = appCtxt.get(ZmSetting.MAIL_ENABLED);
	}},

	function() {
		UT.expect(11);
		var dialog = appCtxt.getShareSearchDialog();
		//expect all apps enabled
		var options = dialog._getAppOptions();
		UT.equal(options.length, 6, "options.length = " + options.length);

		appCtxt._shareSeachDialog = null;
		appCtxt.set(ZmSetting.BRIEFCASE_ENABLED, false);
		dialog = appCtxt.getShareSearchDialog();
		var options = dialog._getAppOptions();
		UT.equal(options.length, 5, "options.length = " + options.length);
		UT.equal(options[1].id, "Mail");
		UT.equal(options[2].id, "Contacts");
		UT.equal(options[3].id, "Calendar");
		UT.equal(options[4].id, "Tasks");

		appCtxt._shareSeachDialog = null;
		appCtxt.set(ZmSetting.TASKS_ENABLED, false);
		appCtxt.set(ZmSetting.CONTACTS_ENABLED, false);
		dialog = appCtxt.getShareSearchDialog();
		var options = dialog._getAppOptions();
		UT.equal(options.length, 3, "options.length = " + options.length);
		UT.equal(options[1].id, "Mail");
		UT.equal(options[2].id, "Calendar");

		appCtxt.shareSearchDialog = null;
		appCtxt.set(ZmSetting.MAIL_ENABLED, false); //only calendar enabled
		dialog = appCtxt.getShareSearchDialog();
		var options = dialog._getAppOptions();
		UT.equal(options.length, 2, "options.length = " + options.length);
		UT.equal(options[1].id, "Calendar");

	}
);