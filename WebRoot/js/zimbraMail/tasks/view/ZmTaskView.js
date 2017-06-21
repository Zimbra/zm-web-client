/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty task view.
* @constructor
* @class
* Simple read-only view of a task. It looks more or less like a message -
* the notes have their own area at the bottom, and everything else goes into a
* header section at the top.
*
* @author Parag Shah
*
* @param parent		[DwtComposite]	parent widget
* @param posStyle	[constant]		positioning style
* @param controller	[ZmController]	owning controller
*/
ZmTaskView = function(parent, posStyle, controller) {

	var id = ZmId.getViewId(ZmId.VIEW_TASK, null, parent._htmlElId);
	var className = "ZmTaskView";
	ZmCalItemView.call(this, parent, posStyle, controller, id, className);
};

ZmTaskView.prototype = new ZmCalItemView;
ZmTaskView.prototype.constructor = ZmTaskView;
ZmTaskView.prototype.isZmTaskView = true;

// Public methods

ZmTaskView.prototype.toString =
function() {
	return "ZmTaskView";
};

ZmTaskView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, (this._calItem && this._calItem.getName()) || ''].join(": ");
};

ZmTaskView.prototype.close =
function() {
	this._controller._app.popView();
};

ZmTaskView.prototype.setSelectionHdrCbox = function(check) {};

ZmTaskView.prototype._getSubs =
function(calItem) {
	var subject = calItem.getName();
	var location = calItem.location;
	var isException = calItem._orig ? calItem._orig.isException : calItem.isException;
	var startDate = calItem.startDate ? AjxDateFormat.getDateInstance().format(calItem.startDate) : null;
	var dueDate = calItem.endDate ? AjxDateFormat.getDateInstance().format(calItem.endDate) : null;
	var priority = calItem.priority ? ZmCalItem.getLabelForPriority(calItem.priority) : null;
	var status = calItem.status ? ZmCalItem.getLabelForStatus(calItem.status) : null;
	var pComplete = calItem.pComplete;
	var recurStr = calItem.isRecurring() ? calItem.getRecurBlurb() : null;
	var attachStr = this._getAttachString(calItem);
    var alarm = calItem.alarm;
    var remindDate = calItem.remindDate ? AjxDateFormat.getDateInstance().format(calItem.remindDate) : null;
    var remindTime = calItem.remindDate ? AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT).format(calItem.remindDate) : "";

	if (this._objectManager) {
		this._objectManager.setHandlerAttr(ZmObjectManager.DATE,
											ZmObjectManager.ATTR_CURRENT_DATE,
											calItem.startDate);

		subject = this._objectManager.findObjects(subject, true);
		if (location) location = this._objectManager.findObjects(location, true);
		if (startDate) startDate = this._objectManager.findObjects(startDate, true);
		if (dueDate) dueDate = this._objectManager.findObjects(dueDate, true);
	}

	return {
		id: this._htmlElId,
		subject: subject,
		location: location,
		isException: isException,
		startDate: startDate,
		dueDate: dueDate,
		priority: priority,
		status: status,
		pComplete: pComplete,
		recurStr: recurStr,
		attachStr: attachStr,
        remindDate: remindDate,
        remindTime: remindTime,
        alarm: alarm,
		folder: appCtxt.getTree(ZmOrganizer.TASKS).getById(calItem.folderId),
		folderLabel: ZmMsg.folder,
        isTask:true,
        _infoBarId:this._infoBarId,
        task:calItem
	};
};

// Private / protected methods

ZmTaskView.prototype._renderCalItem =
function(calItem) {

   if(this._controller.isReadingPaneOn() && !this._newTab) {
	this._lazyCreateObjectManager();

	var subs = this._getSubs(calItem);
	var editBtnCellId = this._htmlElId + "_editBtnCell";
	this._hdrTableId = this._htmlElId + "_hdrTable";
	this._tagCellId = this._htmlElId + "_tags_task";

	var el = this.getHtmlElement();
	el.innerHTML = AjxTemplate.expand("tasks.Tasks#ReadOnlyView", subs);
	this._setTags();

	// content/body
	var hasHtmlPart = (calItem.notesTopPart && calItem.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && appCtxt.get(ZmSetting.VIEW_AS_HTML))
		? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;

	var bodyPart = calItem.getNotesPart(mode);

    if (!bodyPart && calItem.message){
        bodyPart = calItem.message.getInviteDescriptionContentValue(ZmMimeTable.TEXT_PLAIN);
    }

	if (bodyPart) {
		this._msg = this._msg || this._calItem._currentlyLoaded;
        if (mode === ZmMimeTable.TEXT_PLAIN) {
            bodyPart = AjxStringUtil.convertToHtml(bodyPart);
        }
        this._makeIframeProxy({container: Dwt.byId(this._htmlElId + "_body"), html:bodyPart, isTextMsg:(mode == ZmMimeTable.TEXT_PLAIN)});
	}
   } else {
     ZmCalItemView.prototype._renderCalItem.call(this, calItem);
   }
   Dwt.setLoadedTime("ZmTaskItem");
   calItem.addChangeListener(this._taskChangeListener.bind(this));

};

ZmTaskView.prototype._taskChangeListener =
function(ev){
    if(ev.event == ZmEvent.E_TAGS || ev.type == ZmEvent.S_TAG) {
        this._setTags();
    }
};

ZmTaskView.prototype._getItemCountType = function() {
	return ZmId.ITEM_TASK;
};

/**
 * Set tags for tasks
 * @private
 */
ZmTaskView.prototype._setTags = function() {
	//use the helper to get the tags.
	var tagsHtml = ZmTagsHelper.getTagsHtml(this._calItem, this);
	this._setTagsHtml(tagsHtml);
};

/**
 * Set tags html
 * @param html
 */
ZmTaskView.prototype._setTagsHtml = function(html) {
	var tagCell = Dwt.byId(this._tagCellId);
	if (!tagCell) { return; }
	tagCell.innerHTML = html;
};
