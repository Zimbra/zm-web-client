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

function ZmCalendarApp(appCtxt, container) {
	ZmApp.call(this, ZmZimbraMail.CALENDAR_APP, appCtxt, container);
};

ZmCalendarApp.prototype = new ZmApp;
ZmCalendarApp.prototype.constructor = ZmCalendarApp;

ZmCalendarApp.prototype.toString = 
function() {
	return "ZmCalendarApp";
};

ZmCalendarApp.prototype.launch =
function(callback) {
	var cc = this.getCalController();
	cc.show(cc._defaultView());
	if (callback)
		callback.run();
};

ZmCalendarApp.prototype.activate =
function(active, view, date) {
	var cc = this.getCalController();

	this.showMiniCalendar(active || this._appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL));

	if (active) {
		var isAppView = (view == null || view == ZmController.CAL_VIEW || view == ZmController.CAL_DAY_VIEW ||
						 view == ZmController.CAL_WEEK_VIEW || view == ZmController.CAL_WORK_WEEK_VIEW ||
						 view == ZmController.CAL_MONTH_VIEW || view == ZmController.CAL_SCHEDULE_VIEW);
		if (isAppView) {
			cc.show(view);
			if (date) cc.setDate(date);
		}
	}
};

ZmCalendarApp.prototype.showMiniCalendar =
function(show) {
	var cc = this.getCalController();
	cc.getMiniCalendar(); // make sure tree footer (mini-calendar) has been created
	if (show) {
		this._appCtxt.getAppViewMgr().showTreeFooter(true);
	} else {
		this._appCtxt.getAppViewMgr().showTreeFooter(false);
	}
};

ZmCalendarApp.prototype.getCalController =
function() {
	if (!this._calController)
		this._calController = new ZmCalViewController(this._appCtxt, this._container, this);
	return this._calController;
};

ZmCalendarApp.prototype.getApptComposeController = 
function() {
	if (!this._apptController)
		this._apptController = new ZmApptComposeController(this._appCtxt, this._container, this);
	return this._apptController;
};
