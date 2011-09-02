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

ZmQuickCommand = function(id, itemType, name, description, actions, isActive) {
    this.itemType = itemType;
    this.id = id;
    this.name = name;
    this.description = description;

    this.actions = actions || [];
    this.isActive = isActive;
    this.isActive = (this.isActive !== false);
};

ZmQuickCommand.prototype.toString = function() {return "ZmQuickCommand";};
ZmQuickCommand.prototype.isZmQuickCommand = true;

ZmQuickCommand.prototype.addAction =
function(qcAction) {
    if (qcAction) {
        this.actions.push(qcAction);
    }
};

ZmQuickCommand.prototype.removeAction =
function(qcAction) {
    AjxUtil.arrayRemove(this.actions, qcAction);
};

ZmQuickCommand.prototype.actionsCount =
function() {
    return this.actions.length;
};

ZmQuickCommand.prototype.clone =
function() {
    var actions = [];

    for (var i = 0; i < this.actions.length; i++) {
        var action = this.actions[i];
        action = action.clone();
        actions.push(action);
    }
    
    var quickCommand = new ZmQuickCommand(this.id, this.itemType, this.name, this.description, actions, this.isActive);
    return quickCommand;
};

ZmQuickCommand.prototype.removeAllActions =
function() {
    this.actions = [];
};

ZmQuickCommand.prototype.toJSON =
function() {
    var preJSONObject = this.toPreJSONObject();
    return JSON.stringify(preJSONObject);
};

ZmQuickCommand.prototype.toPreJSONObject =
function() {
    var actions = [];
    var preJSONObject = {id:this.id, itemTypeId:this.itemType.id, name:this.name, description:this.description, isActive:this.isActive, actions:actions};
    var len = this.actions.length;
    for (var i = 0; i < len; i++) {
        var action = this.actions[i];
        actions.push(action.toPreJSONObject());
    }
    return preJSONObject;
};

ZmQuickCommand.prototype.getMaxQuickCommandActionId = function() {
    var maxId = 0;
    var len = this.actions.length;
    for (var i = 0; i < len; i++) {
        var action = this.actions[i];
        if (AjxUtil.isNumber(action.id)) {
            maxId = maxId > action.id ? maxId : action.id;
        }
    }
    return maxId;
};

ZmQuickCommand.prototype.validate = function(errors) {
    errors = errors || [];
    if (!this.name) {
        errors.push(
            AjxMessageFormat.format(ZmMsg.fieldNameIsARequiredField, ZmMsg.quickCommandNameLabel)
        );
    }
    if (!this.actions || !this.actions.length) {errors.push(ZmMsg.minimumOneActionIsRequired);}

    var len = this.actions.length;
    for (var i = 0; i < len; i++) {
        var action = this.actions[i];
        var actionError = action.validate();
        if (actionError.length) {
            errors.push(ZmMsg.invalidActions);
            break;
        }
    }

    return errors;
};

//static members
ZmQuickCommand.getDummyQuickCommand =
function(newId, itemType) {
    if (!newId || !itemType) {return null;}

    var qc = new ZmQuickCommand(newId, itemType, "", "");
    var actionType = itemType.actions[0];

    newId = qc.getMaxQuickCommandActionId() + 1;
    var qcAction = ZmQuickCommandAction.getDummyQuickCommandAction(newId, actionType);
    qc.addAction(qcAction);
    return qc;
};

    //below is a list of objects supported for quick commands.
    //label: the label displayed when configuring a QC
    //id: id of the object which is supported. e.g CONTACT, APPOINTMENT, MESSAGE
    //actions: a collection of actions that can be performed on the object.
ZmQuickCommand[ZmId.ITEM_MSG] = {
    label:ZmMsg.mail,
    id:ZmId.ITEM_MSG,
    actions: [
        ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_TAG],
        ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_FLAG],
        ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_FOLDER]
    ]
};

ZmQuickCommand[ZmId.ITEM_APPOINTMENT] = {
    label:ZmMsg.appointment,
    id:ZmId.ITEM_APPOINTMENT,
    actions:[
        ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_TAG],
        ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_FLAG],
        ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_FOLDER]
    ]
};

ZmQuickCommand[ZmId.ITEM_CONTACT] = {
    label:ZmMsg.contact,
    id:ZmId.ITEM_CONTACT,
    actions: [
        ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_TAG],
        ZmQuickCommandAction[ZmQuickCommandAction.A_NAME_FOLDER]
    ]
};

//itemTypes populated by ZmApps
ZmQuickCommand.itemTypes = [];

ZmQuickCommand.getSupportedItemTypeByItemTypeId =
function(itemTypeId) {
    if (itemTypeId) {
        for (var i = 0, len = ZmQuickCommand.itemTypes.length; i < len; i++) {
            var itemType = ZmQuickCommand.itemTypes[i];
            if (itemType.id == itemTypeId) {
                return itemType;
            }
        }
    }

    return null;
};

ZmQuickCommand.buildFromJSONObject = function(jsonObject) {
    if (!jsonObject) {return null;}

    var actions = [];
    var jsonActions = jsonObject.actions;
    if (jsonActions && jsonActions.length) {
        var len = jsonActions.length;
        for (var i = 0; i < len; i++) {
            var jsonAction = jsonActions[i];

            var action = ZmQuickCommandAction.buildFromJSONObject(jsonAction);
            actions.push(action);
        }
    }

    var itemType = ZmQuickCommand[jsonObject.itemTypeId];
    return new ZmQuickCommand(
            jsonObject.id,
            itemType,
            jsonObject.name,
            jsonObject.description,
            actions,
            jsonObject.isActive
    );
};
