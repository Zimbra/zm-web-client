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
	}

    if(ev.event == ZmEvent.E_MODIFY){
        for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (this._list && this._list.contains(item)) {
                this.redrawItem(item);
            }
		}
    }

    ZmListView.prototype._changeListener.call(this, ev);

    if(ev.event == ZmEvent.E_MOVE){
        var folderId = this._controller._folderId || this.folderId || this._folderId;
        var item = items && items.length ? items[0] : items;
        if(item && item.folderId == folderId && this._getRowIndex(item) === null){
            this.addItem(item, 0, true);
            item.handled = true;
        }
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

ZmBriefcaseBaseView.prototype._cloneList =
function(list){
    var newList = new ZmList(list.type, list.search);
    var item;
    for(var i=0; i<list.size(); i++){
        item = list.get(i);
        item.list = newList;
        newList.add(item);
    }
    newList.setHasMore(list.hasMore());
    return newList;
};

ZmBriefcaseBaseView.prototype.appendFolders =
function(srcList){
    var subs = this._folders = this._controller._getSubfolders();
    var subsLen = subs ? subs.length : 0;
    var newList;
    if(subsLen > 0){
        newList = this._cloneList(srcList);
        for(var i=0; i<subsLen; i++){
            newList.add(subs[i], 0);
        }        
    }
    return newList;
};

ZmBriefcaseBaseView.prototype.set =
function(list, sortField){
    this.cleanup();
    this._zmList = list;
    ZmListView.prototype.set.call(this, list, sortField);
};

ZmBriefcaseBaseView.prototype.renameFile =
function(item){
    //TODO: Make rename field singleton across briefcase views
    var fileNameEl = this._getFieldId(item, ZmItem.F_SUBJECT);
    fileNameEl = document.getElementById(fileNameEl);
    var fileNameBounds = Dwt.getBounds(fileNameEl);

    var fileInput = this._enableRenameInput(true, fileNameBounds);
    fileInput.setValue(item.name);
    this._fileItem = item;
};

ZmBriefcaseBaseView.prototype._enableRenameInput =
function(enable, bounds){
    var fileInput = this._getRenameInput();
    if(enable){
        fileInput.setBounds(bounds.x, bounds.y, bounds.width ,  18);
        fileInput.setDisplay(Dwt.DISPLAY_INLINE);
        fileInput.focus();
    }else{
        fileInput.setDisplay(Dwt.DISPLAY_NONE);
        fileInput.setLocation("-10000px", "-10000px");
    }
    return fileInput;
};

ZmBriefcaseBaseView.prototype._getRenameInput =
function(){
    if(!this._renameField){
        this._renameField = new DwtInputField({parent:appCtxt.getShell(), className:"RenameInput DwtInputField", posStyle: Dwt.ABSOLUTE_STYLE});
        this._renameField.setZIndex(Dwt.Z_VIEW + 10); //One layer above the VIEW
        this._renameField.setDisplay(Dwt.DISPLAY_NONE);
        this._renameField.setLocation("-10000px", "-10000px");
        this._renameField.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleKeyUp));
        this.addSelectionListener(new AjxListener(this, this.cleanup));
    }
    return this._renameField;
};

ZmBriefcaseBaseView.prototype._handleKeyUp =
function(ev) {
    var allowDefault = true;
	var key = DwtKeyEvent.getCharCode(ev);
    var item = this._fileItem;
    if(key == DwtKeyEvent.KEY_ENTER){
        var fileName = this._renameField.getValue();
        if(fileName != '' && fileName != item.name){
            if(this._checkDuplicate(fileName)){
                this._redrawItem(item);
                var warning = appCtxt.getMsgDialog();
                warning.setMessage(AjxMessageFormat.format(ZmMsg.itemWithFileNameExits, fileName), DwtMessageDialog.CRITICAL_STYLE, ZmMsg.briefcase);
                warning.popup();
            }else{
                item.rename(fileName, new AjxCallback(this, this.resetRenameFile));
            }
        }else{
            this._redrawItem(item);
        }
        allowDefault = false;
    }else if( key == DwtKeyEvent.KEY_ESCAPE){
        this._redrawItem(item);
        allowDefault = false;
    }
	DwtUiEvent.setBehaviour(ev, true, allowDefault);
};

ZmBriefcaseBaseView.prototype.resetRenameFile =
function(){
    this._enableRenameInput(false);
    this._fileItem = null;
};

ZmBriefcaseBaseView.prototype._redrawItem =
function(item){
    this.resetRenameFile();
    this.redrawItem(item);
};

ZmBriefcaseBaseView.prototype._checkDuplicate =
function(name){

    name = name.toLowerCase();
    var list = this.getList();
    if(list){
        list = list.getArray();
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if(item.name.toLowerCase() == name)
                return true;
        }
    }
    return false;   
};

ZmBriefcaseBaseView.prototype.cleanup =
function(){
    if(this._renameField)
        this.resetRenameFile();
};

