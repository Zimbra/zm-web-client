/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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
 *
 * @author Prashant Jain
 *
 *
 * @extends
 */

ZmQuickCommandAction = function(id, actionType, actionValue, isActive) {
    this.id = id;
    this.type = actionType;
    this.value = actionValue;
    this.isActive = isActive;
    this.isActive = (this.isActive !== false);
}

ZmQuickCommandAction.prototype.toString = function() {return "ZmQuickCommandAction";};
ZmQuickCommandAction.prototype.isZmQuickCommandAction = true;

ZmQuickCommandAction.prototype.clone =
function() {
    var action = new ZmQuickCommandAction(this.id, this.type, this.value, this.isActive);
    action.isActive = this.isActive;
    return action;
};

ZmQuickCommandAction.prototype.toPreJSONObject =
function() {
    return {id:this.id, typeId:this.type.id, value:this.value, isActive:this.isActive};
};

ZmQuickCommandAction.prototype.validate = function(errors) {
    errors = errors || [];

    if (!this.type || !this.type.id) {
        errors.push(ZmMsg.invalidQuickCommandActionType);
    } else {
        //if there is a value type, a value is expected
        if (this.type.valueType) {
            if (!this.value) {
                errors.push(ZmMsg.invalidQuickCommandActionValue);
            }
        }
    }

    return errors;
};

//static members
ZmQuickCommandAction.getDummyQuickCommandAction =
function(newId, actionType) {
    return new ZmQuickCommandAction(newId, actionType, "");
};


ZmQuickCommandAction.TYPE_SELECT          = "SELECT";
ZmQuickCommandAction.TYPE_FOLDER_PICKER	  = "FOLDER_PICKER";
ZmQuickCommandAction.TYPE_INPUT	          = "INPUT";
ZmQuickCommandAction.TYPE_TAG_PICKER      = "TAG_PICKER";

ZmQuickCommandAction.A_NAME_TAG		= "actionTag";
ZmQuickCommandAction.A_NAME_FLAG	= "actionFlag";
ZmQuickCommandAction.A_NAME_FOLDER	= "actionFileInto";


//define value types
ZmQuickCommandAction.VALUE_TYPE_FORWARD = {param:ZmQuickCommandAction.TYPE_INPUT};
ZmQuickCommandAction.VALUE_TYPE_TAG     = {param:ZmQuickCommandAction.TYPE_TAG_PICKER};
ZmQuickCommandAction.VALUE_TYPE_FLAG    = {
	param   :ZmQuickCommandAction.TYPE_SELECT,
	pOptions:[{label: ZmMsg.read, value: "read"}, {label: ZmMsg.unread, value: "unread"}, {label: ZmMsg.flagged, value: "flagged"}, {label: ZmMsg.unflagged, value: "unflagged"}]
};
ZmQuickCommandAction.VALUE_TYPE_FOLDER  = {param:ZmQuickCommandAction.TYPE_FOLDER_PICKER};


ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_TAG]     = {id:ZmQuickCommandAction.A_NAME_TAG     , label:ZmMsg.tagWith         , valueType:ZmQuickCommandAction.VALUE_TYPE_TAG};
ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_FLAG]    = {id:ZmQuickCommandAction.A_NAME_FLAG    , label:ZmMsg.mark            , valueType:ZmQuickCommandAction.VALUE_TYPE_FLAG};
ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_FOLDER]  = {id:ZmQuickCommandAction.A_NAME_FOLDER  , label:ZmMsg.moveIntoFolder  , valueType:ZmQuickCommandAction.VALUE_TYPE_FOLDER};

ZmQuickCommandAction.getActionTypeByActionTypeId = function(actionTypeId) {
    if (!actionTypeId) {return null;}
    return ZmQuickCommandAction[actionTypeId];
};

ZmQuickCommandAction.buildFromJSONObject = function(jsonObject) {
    if (!jsonObject) {return null;}

    var itemType = ZmQuickCommandAction[jsonObject.typeId];
    return new ZmQuickCommandAction(
            jsonObject.id,
            itemType,
            jsonObject.value,
            jsonObject.isActive
    );
};