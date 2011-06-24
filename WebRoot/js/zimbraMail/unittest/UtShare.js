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