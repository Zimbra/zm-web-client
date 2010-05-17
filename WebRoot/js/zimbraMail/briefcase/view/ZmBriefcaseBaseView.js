/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the briefcase base view.
 * @class
 * This class represents the base view.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @param	{ZmControl}		params.parent		the parent
 * @param	{String}	params.className		the class name
 * @param	{constant}	params.view		the view
 * @param	{ZmBriefcaseController}	params.controller		the controller
 * @param	{DwtDropTarget}		params.dropTgt		the drop target
 * 
 * @extends		ZmListView
 */
ZmBriefcaseBaseView = function(params) {

	if (arguments.length == 0) { return; }
	
	params.posStyle = params.posStyle || DwtControl.ABSOLUTE_STYLE;
	params.type = ZmItem.BRIEFCASE_ITEM;
	params.pageless = (params.pageless !== false);
	ZmListView.call(this, params);
};

ZmBriefcaseBaseView.prototype = new ZmListView;
ZmBriefcaseBaseView.prototype.constructor = ZmBriefcaseBaseView;

/**
 * Gets the title.
 * 
 * @return	{String}	the title
 */
ZmBriefcaseBaseView.prototype.getTitle =
function() {
	//TODO: title is the name of the current folder
	return [ZmMsg.zimbraTitle, this._controller.getApp().getDisplayName()].join(": ");
};

ZmBriefcaseBaseView.prototype._changeListener =
function(ev) {

	if ((ev.type != this.type) && (ZmList.MIXED != this.type)) { return; }

	var items = ev.getDetail("items");

	if (ev.event == ZmEvent.E_CREATE) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (this._list && this._list.contains(item)) { continue; }			// skip if we already have it
			this.addItem(item, 0);
		}
	} else {
		ZmListView.prototype._changeListener.call(this, ev);
	}
};


ZmBriefcaseBaseView.prototype._getToolTip =
function(params) {

	var item = params.item;
	if (item.isFolder) { return null; }

	var prop = [{name:ZmMsg.briefcasePropName, value:item.name}];
	if (item.size) {
		prop.push({name:ZmMsg.briefcasePropSize, value:AjxUtil.formatSize(item.size)});
	}
	if (item.modifyDate) {
		var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
		var dateStr = dateFormatter.format(item.modifyDate);
		prop.push({name:ZmMsg.briefcasePropModified, value:dateStr});
	}

	var subs = {
		fileProperties:	prop,
		tagTooltip:		this._getTagToolTip(item)
	};
	return AjxTemplate.expand("briefcase.Briefcase#Tooltip", subs);
};

ZmBriefcaseBaseView.prototype._getItemCountType =
function() {
	return null;
};

/**
 * Uploads files from drag-and-drop.
 * 
 * @private
 */
ZmBriefcaseBaseView.prototype.uploadFiles =
function() {
    var attachDialog = appCtxt.getUploadDialog();
    var files = this.processUploadFiles();
    attachDialog.uploadFiles(files, document.getElementById("zdnd_form"), {id:this._controller._folderId});
};

/**
 * @private
 */
ZmBriefcaseBaseView.prototype.processUploadFiles =
function() {
	var files = [];
	var ulEle = document.getElementById('zdnd_ul');
    if (ulEle) {
        for (var i = 0; i < ulEle.childNodes.length; i++) {
            var liEle = ulEle.childNodes[i];
            var inputEl = liEle.childNodes[0];
            if (inputEl.name != "_attFile_") continue;
            if (!inputEl.value) continue;
            var file = {
                fullname: inputEl.value,
                name: inputEl.value.replace(/^.*[\\\/:]/, "")
            };
            files.push(file);
         }
   }
   return files;
}

ZmBriefcaseBaseView.prototype.getListView =
function(){
    return this;
};

ZmBriefcaseBaseView.prototype.getTitle =
function(){
    return [ZmMsg.zimbraTitle, ZmMsg.briefcase].join(': ');  
};
