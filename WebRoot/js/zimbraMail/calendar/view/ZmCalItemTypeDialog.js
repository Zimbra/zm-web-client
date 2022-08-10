/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Simple dialog allowing user to choose between an Instance or Series for an appointment
 * @constructor
 * @class
 *
 * @author Dan Villiom Podlaski Christiansen
 * @param parent			the element that created this view
 * 
 * @extends		DwtOptionDialog
 * 
 * @private
 */
ZmCalItemTypeDialog = function() {
	var params = Dwt.getParams(arguments, ZmCalItemTypeDialog.PARAMS);

	params.options = [
		{
			name: ZmCalItemTypeDialog.INSTANCE
		},
		{
			name: ZmCalItemTypeDialog.SERIES
		}
	];
	DwtOptionDialog.call(this, params);
};

ZmCalItemTypeDialog.PARAMS = ["parent"];

ZmCalItemTypeDialog.prototype = new DwtOptionDialog;
ZmCalItemTypeDialog.prototype.constructor = ZmCalItemTypeDialog;
ZmCalItemTypeDialog.prototype.isZmCalItemTypeDialog = true;

ZmCalItemTypeDialog.prototype.role = 'alertdialog';

ZmCalItemTypeDialog.INSTANCE = 'INSTANCE';
ZmCalItemTypeDialog.SERIES = 'SERIES';

// Public methods

ZmCalItemTypeDialog.prototype.toString =
function() {
	return "ZmCalItemTypeDialog";
};

ZmCalItemTypeDialog.prototype.initialize =
function(calItem, mode, type) {
	this.calItem = calItem;
	this.mode = mode;

	var m;
	if (type == ZmItem.APPT) {
		m = (calItem instanceof Array)
			? ZmMsg.isRecurringApptList
			: AjxMessageFormat.format(ZmMsg.isRecurringAppt, [AjxStringUtil.htmlEncode(calItem.getName())]);
	} else {
		m = AjxMessageFormat.format(ZmMsg.isRecurringTask, [AjxStringUtil.htmlEncode(calItem.getName())]);
	}

	var title, question, seriesMsg, instanceMsg;

	if (mode == ZmCalItem.MODE_EDIT) {
		title = ZmMsg.openRecurringItem;
		question = m + " " + ZmMsg.editApptQuestion;
		instanceMsg = ZmMsg.openInstance;
		seriesMsg = ZmMsg.openSeries;
	} else if (mode == ZmAppt.MODE_DRAG_OR_SASH) {
		title = ZmMsg.modifyRecurringItem;
		question = m + " " + ZmMsg.modifyApptQuestion;
		instanceMsg = ZmMsg.modifyInstance;
		seriesMsg = ZmMsg.modifySeries;
	} else {
		title = ZmMsg.deleteRecurringItem;
		seriesMsg = ZmMsg.deleteSeries;
		if (calItem instanceof Array) {
			question = m + " " + ZmMsg.deleteApptListQuestion;
			instanceMsg = ZmMsg.deleteInstances;
		} else {
			question = m + " " + ZmMsg.deleteApptQuestion;
			instanceMsg = ZmMsg.deleteInstance;
		}
	}

	this.setMessage(question, null, title);

	this.getButton(ZmCalItemTypeDialog.INSTANCE).setText(instanceMsg);
	this.getButton(ZmCalItemTypeDialog.SERIES).setText(seriesMsg);

	this.setSelection(ZmCalItemTypeDialog.INSTANCE);
};

ZmCalItemTypeDialog.prototype.isInstance =
function() {
	return this.getSelection() === ZmCalItemTypeDialog.INSTANCE;
};
